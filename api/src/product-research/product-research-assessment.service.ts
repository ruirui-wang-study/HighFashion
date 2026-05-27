import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { AiConfigService } from "../ai/ai-config.service";
import { PrismaService } from "../common/prisma.service";
import { BulkCandidateActionDto } from "./dto/bulk-candidate-action.dto";
import type { CreateScoringRuleDto } from "./dto/create-scoring-rule.dto";
import type { ScoreManualAdjustmentDto } from "./dto/score-manual-adjustment.dto";
import {
  calculateCandidateScore,
  candidateStatusFromAssessment,
  defaultScoringWeights,
  evaluateCandidateRisk,
} from "./product-research.engine";
import { mapAiConfigToProductResearch } from "./product-research-ai-config";
import { mapCandidateDetail, mapRiskReviewItem } from "./product-research.mapper";
import { ProductResearchRuntimeService } from "./product-research-runtime.service";
import {
  type AdminActor,
  candidateDetailInclude,
  ensureCandidateExists,
  parseWeights,
  PRODUCT_RESEARCH_LOCKED_STATUSES,
  PRODUCT_RESEARCH_SCORE_HISTORY_LIMIT,
  runWithConcurrency,
} from "./product-research.shared";

@Injectable()
export class ProductResearchAssessmentService {
  private readonly logger = new Logger(ProductResearchAssessmentService.name);
  private readonly backgroundQueue: string[] = [];
  private readonly backgroundQueued = new Set<string>();
  private backgroundRunning = 0;
  private readonly backgroundConcurrency = 3;

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiConfigService: AiConfigService,
    private readonly runtime: ProductResearchRuntimeService,
  ) {}

  async listScoringRules() {
    return this.prisma.scoringRule.findMany({
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    });
  }

  async createScoringRule(payload: CreateScoringRuleDto, actor?: AdminActor) {
    const version = payload.version.trim();
    return this.prisma.$transaction(async (tx) => {
      if (payload.isActive) {
        await tx.scoringRule.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
      }

      const created = await tx.scoringRule.create({
        data: {
          version,
          weights: payload.weights as Prisma.InputJsonValue,
          isActive: Boolean(payload.isActive),
          createdById: actor?.adminId ?? null,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: actor?.adminId ?? null,
          action: "PRODUCT_RESEARCH_SCORING_RULE_CREATED",
          resource: "product_research_scoring_rule",
          resourceId: created.id,
          details: {
            version,
            isActive: created.isActive,
            actorEmail: actor?.adminEmail ?? null,
          },
        },
      });

      return created;
    });
  }

  async listRiskReview() {
    const candidates = await this.prisma.productCandidate.findMany({
      where: {
        OR: [
          { status: "HIGH_RISK_REVIEW" },
          { riskFlags: { some: { severity: { in: ["HIGH", "BLOCKING"] }, resolvedAt: null } } },
        ],
      },
      include: {
        riskFlags: {
          where: { resolvedAt: null },
          orderBy: { createdAt: "desc" },
        },
        scores: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        suppliers: {
          select: { supplierId: true },
        },
      },
      orderBy: [{ updatedAt: "desc" }],
    });
    return candidates
      .map((candidate) => mapRiskReviewItem(candidate))
      .filter((candidate) => candidate.openRiskFlags.length > 0 || candidate.status === "HIGH_RISK_REVIEW");
  }

  async activateScoringRule(id: string, actor?: AdminActor, options?: { recalculateExisting?: boolean }) {
    const rule = await this.prisma.scoringRule.findUnique({ where: { id } });
    if (!rule) {
      throw new NotFoundException({ code: "SCORING_RULE_NOT_FOUND", message: "Scoring rule not found" });
    }

    const recalculateExisting = options?.recalculateExisting !== false;

    await this.prisma.$transaction(async (tx) => {
      await tx.scoringRule.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
      await tx.scoringRule.update({
        where: { id },
        data: { isActive: true },
      });
      await tx.auditLog.create({
        data: {
          actorId: actor?.adminId ?? null,
          action: "PRODUCT_RESEARCH_SCORING_RULE_ACTIVATED",
          resource: "product_research_scoring_rule",
          resourceId: id,
          details: {
            version: rule.version,
            recalculateExisting,
            actorEmail: actor?.adminEmail ?? null,
          },
        },
      });
    });

    const activatedRule = await this.prisma.scoringRule.findUniqueOrThrow({ where: { id } });
    if (!recalculateExisting) {
      return { rule: activatedRule, recalculated: 0, background: false };
    }

    const candidates = await this.prisma.productCandidate.findMany({
      select: { id: true },
    });
    const ids = candidates.map((candidate) => candidate.id);
    const queued = this.enqueueCandidateAssessments(ids, actor, "scoring-rule-activation");
    return { rule: activatedRule, recalculated: queued, background: true };
  }

  async recalculateCandidate(id: string, actor?: AdminActor) {
    await ensureCandidateExists(this.prisma, id);
    await this.refreshCandidateAssessment(id, actor);
    return this.getCandidateDetail(id);
  }

  async bulkRecalculateCandidates(payload: BulkCandidateActionDto, actor?: AdminActor) {
    const ids = [...new Set((payload.ids ?? []).filter((value) => typeof value === "string" && value.trim()))];
    if (!ids.length) {
      throw new BadRequestException({ code: "PRODUCT_RESEARCH_BULK_EMPTY", message: "At least one candidate id is required" });
    }

    const queued = this.enqueueCandidateAssessments(ids, actor, "bulk-recalculate");

    await this.prisma.auditLog.create({
      data: {
        actorId: actor?.adminId ?? null,
        action: "PRODUCT_RESEARCH_CANDIDATES_RECALCULATED",
        resource: "product_research_candidate",
        resourceId: ids[0],
        details: {
          ids,
          reason: payload.reason?.trim() || null,
          actorEmail: actor?.adminEmail ?? null,
        },
      },
    });

    return { recalculated: queued, background: true };
  }

  async resolveRiskFlag(candidateId: string, flagId: string, actor?: AdminActor, note?: string) {
    await ensureCandidateExists(this.prisma, candidateId);
    const flag = await this.prisma.productResearchRiskFlag.findFirst({
      where: { id: flagId, candidateId },
    });
    if (!flag) {
      throw new NotFoundException({ code: "PRODUCT_RESEARCH_RISK_FLAG_NOT_FOUND", message: "Risk flag not found" });
    }
    if (flag.resolvedAt) {
      return this.getCandidateDetail(candidateId);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.productResearchRiskFlag.update({
        where: { id: flagId },
        data: {
          resolvedAt: new Date(),
          resolvedById: actor?.adminId ?? null,
          resolutionNote: note?.trim() || null,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: actor?.adminId ?? null,
          action: "PRODUCT_RESEARCH_RISK_FLAG_RESOLVED",
          resource: "product_research_candidate",
          resourceId: candidateId,
          details: {
            flagId,
            riskType: flag.riskType,
            severity: flag.severity,
            note: note?.trim() || null,
            actorEmail: actor?.adminEmail ?? null,
          },
        },
      });
    });

    const candidate = await this.prisma.productCandidate.findUniqueOrThrow({
      where: { id: candidateId },
      select: { status: true },
    });
    if (!PRODUCT_RESEARCH_LOCKED_STATUSES.has(candidate.status)) {
      await this.refreshCandidateAssessment(candidateId, actor);
    }

    return this.getCandidateDetail(candidateId);
  }

  async manualAdjustScore(id: string, payload: ScoreManualAdjustmentDto, actor?: AdminActor) {
    const candidate = await this.prisma.productCandidate.findUnique({
      where: { id },
      select: { id: true, riskScore: true },
    });
    if (!candidate) {
      throw new NotFoundException({ code: "PRODUCT_RESEARCH_CANDIDATE_NOT_FOUND", message: "Candidate not found" });
    }
    if (payload.finalScore == null || Number.isNaN(payload.finalScore)) {
      throw new BadRequestException({ code: "PRODUCT_RESEARCH_FINAL_SCORE_REQUIRED", message: "Manual score adjustment requires finalScore" });
    }

    const latestScore = await this.prisma.productCandidateScore.findFirst({
      where: { candidateId: id },
      orderBy: { createdAt: "desc" },
    });
    const riskScore = candidate.riskScore ?? latestScore?.riskScore ?? 0;
    const finalScore = payload.finalScore;

    return this.prisma.$transaction(async (tx) => {
      const score = await tx.productCandidateScore.create({
        data: {
          candidateId: id,
          marketDemandScore: latestScore?.marketDemandScore ?? 0,
          trendSeasonalityScore: latestScore?.trendSeasonalityScore ?? 0,
          competitionGapScore: latestScore?.competitionGapScore ?? 0,
          marginPotentialScore: latestScore?.marginPotentialScore ?? 0,
          logisticsFitScore: latestScore?.logisticsFitScore ?? 0,
          brandabilityScore: latestScore?.brandabilityScore ?? 0,
          supplierQualityScore: latestScore?.supplierQualityScore ?? 0,
          riskScore,
          riskInverseScore: Math.max(0, 100 - riskScore),
          testabilityScore: latestScore?.testabilityScore ?? 0,
          finalScore,
          scoringVersion: `manual-${Date.now()}`,
          scoreReasonJson: {
            mode: "manual_adjustment",
            actorEmail: actor?.adminEmail ?? null,
            basedOnScoreId: latestScore?.id ?? null,
          },
          isManualAdjusted: true,
          manualAdjustmentReason: payload.reason?.trim() || null,
        },
      });

      await this.pruneCandidateScoreHistory(tx, id);

      await tx.productCandidate.update({
        where: { id },
        data: {
          finalScore,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: actor?.adminId ?? null,
          action: "PRODUCT_RESEARCH_SCORE_MANUALLY_ADJUSTED",
          resource: "product_research_candidate",
          resourceId: id,
          details: {
            finalScore,
            reason: payload.reason?.trim() || null,
            actorEmail: actor?.adminEmail ?? null,
          },
        },
      });

      return score;
    });
  }

  async refreshCandidateAssessments(candidateIds: string[], actor?: AdminActor, concurrency = 5) {
    const ids = [...new Set(candidateIds.filter((value) => value.trim()))];
    await runWithConcurrency(ids, concurrency, async (candidateId) => {
      await this.refreshCandidateAssessment(candidateId, actor);
    });
  }

  getAssessmentRuntime() {
    return {
      queueLength: this.backgroundQueue.length,
      queuedUnique: this.backgroundQueued.size,
      running: this.backgroundRunning,
      concurrency: this.backgroundConcurrency,
    };
  }

  enqueueCandidateAssessments(candidateIds: string[], actor?: AdminActor, reason = "manual") {
    const ids = [...new Set(candidateIds.filter((value) => value.trim()))];
    let queued = 0;
    for (const id of ids) {
      if (this.backgroundQueued.has(id)) continue;
      this.backgroundQueued.add(id);
      this.backgroundQueue.push(id);
      queued += 1;
    }
    if (queued > 0) {
      setImmediate(() => {
        void this.drainBackgroundQueue(actor, reason);
      });
    }
    return queued;
  }

  private async drainBackgroundQueue(actor?: AdminActor, reason = "manual") {
    while (this.backgroundRunning < this.backgroundConcurrency && this.backgroundQueue.length > 0) {
      const candidateId = this.backgroundQueue.shift();
      if (!candidateId) continue;
      this.backgroundRunning += 1;
      void this.runBackgroundAssessment(candidateId, actor, reason);
    }
  }

  private async runBackgroundAssessment(candidateId: string, actor?: AdminActor, reason = "manual") {
    try {
      await this.refreshCandidateAssessment(candidateId, actor);
    } catch (error) {
      this.logger.error(
        `Background assessment failed for ${candidateId} (${reason})`,
        error instanceof Error ? error.stack : undefined,
      );
    } finally {
      this.backgroundQueued.delete(candidateId);
      this.backgroundRunning = Math.max(0, this.backgroundRunning - 1);
      setImmediate(() => {
        void this.drainBackgroundQueue(actor, reason);
      });
    }
  }

  async refreshCandidateAssessment(candidateId: string, actor?: AdminActor) {
    const aiConfig = mapAiConfigToProductResearch(await this.aiConfigService.resolve());
    const candidate = await this.prisma.productCandidate.findUnique({
      where: { id: candidateId },
      include: {
        suppliers: {
          include: {
            supplier: true,
          },
        },
      },
    });
    if (!candidate) {
      throw new NotFoundException({ code: "PRODUCT_RESEARCH_CANDIDATE_NOT_FOUND", message: "Candidate not found" });
    }

    const signals = await this.runtime.collectSignals({
      candidate: {
        productName: candidate.productName,
        category: candidate.category,
        targetMarket: candidate.targetMarket,
        targetAudience: candidate.targetAudience,
        useCase: candidate.useCase,
        description: candidate.description,
        notes: candidate.notes,
        alibabaKeywords: candidate.alibabaKeywords,
      },
    });
    const supplierInputs = candidate.suppliers.map((entry) => ({
      verifiedSupplier: entry.supplier.verifiedSupplier,
      tradeAssurance: entry.supplier.tradeAssurance,
      responseRate: entry.supplier.responseRate,
      moq: entry.quotedMoq ?? entry.supplier.moq,
      samplePriceCents: entry.supplier.samplePriceCents,
      unitPriceCents: entry.quotedUnitPriceCents ?? entry.supplier.unitPriceCents,
      customLogoMoq: entry.supplier.customLogoMoq,
      customPackagingMoq: entry.supplier.customPackagingMoq,
      leadTimeDays: entry.quotedLeadTimeDays ?? entry.supplier.leadTimeDays,
      shippingToUSCents: entry.supplier.shippingToUSCents,
      shippingToUKCents: entry.supplier.shippingToUKCents,
      certifications: entry.supplier.certifications,
    }));
    const risk = evaluateCandidateRisk(
      {
        productName: candidate.productName,
        chineseName: candidate.chineseName,
        category: candidate.category,
        targetMarket: candidate.targetMarket,
        targetAudience: candidate.targetAudience,
        useCase: candidate.useCase,
        description: candidate.description,
        notes: candidate.notes,
        alibabaKeywords: candidate.alibabaKeywords,
        sourceUrl: candidate.sourceUrl,
      },
      supplierInputs,
    );
    const activeRule = await this.prisma.scoringRule.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    const weights = parseWeights(activeRule?.weights);
    const score = calculateCandidateScore({
      candidate: {
        productName: candidate.productName,
        chineseName: candidate.chineseName,
        category: candidate.category,
        targetMarket: candidate.targetMarket,
        targetAudience: candidate.targetAudience,
        useCase: candidate.useCase,
        description: candidate.description,
        notes: candidate.notes,
        alibabaKeywords: candidate.alibabaKeywords,
        sourceUrl: candidate.sourceUrl,
      },
      suppliers: supplierInputs,
      signals,
      riskScore: risk.riskScore,
      weights: weights ?? undefined,
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.productResearchSignal.deleteMany({ where: { candidateId } });
      if (signals.length > 0) {
        await tx.productResearchSignal.createMany({
          data: signals.map((signal) => ({
            candidateId,
            source: signal.source as never,
            metricName: signal.metricName,
            metricValue: signal.metricValue,
            rawData: signal.rawData ?? Prisma.JsonNull,
            collectedAt: new Date(),
          })),
        });
      }

      const resolvedFlags = await tx.productResearchRiskFlag.findMany({
        where: { candidateId, resolvedAt: { not: null } },
        select: { riskType: true },
      });
      const resolvedRiskTypes = new Set(resolvedFlags.map((flag) => flag.riskType));

      await tx.productResearchRiskFlag.deleteMany({ where: { candidateId, resolvedAt: null } });
      const openFlags = risk.flags.filter((flag) => !resolvedRiskTypes.has(flag.riskType));
      if (openFlags.length > 0) {
        await tx.productResearchRiskFlag.createMany({
          data: openFlags.map((flag) => ({
            candidateId,
            riskType: flag.riskType,
            severity: flag.severity as never,
            message: flag.message,
          })),
        });
      }

      await tx.productCandidateScore.create({
        data: {
          candidateId,
          ...score.dimensions,
          scoringVersion: activeRule?.version ?? "default-v1",
          scoreReasonJson: {
            provider: aiConfig.apiKeyConfigured ? aiConfig.provider : "local-fallback",
            configuredProvider: aiConfig.provider,
            configuredBaseUrl: aiConfig.baseUrl,
            configuredModels: {
              candidateGeneration: aiConfig.candidateModel,
              scoring: aiConfig.scoringModel,
              copy: aiConfig.copyModel,
              fast: aiConfig.fastModel,
            },
            weights: weights ?? defaultScoringWeights,
            signals: signals.map((signal) => ({ source: signal.source, metricName: signal.metricName, metricValue: signal.metricValue })),
            risks: risk.flags,
          },
        },
      });

      await this.pruneCandidateScoreHistory(tx, candidateId);

      const candidateUpdate: Prisma.ProductCandidateUpdateInput = {
        finalScore: score.dimensions.finalScore,
        riskScore: risk.riskScore,
      };
      if (!PRODUCT_RESEARCH_LOCKED_STATUSES.has(candidate.status)) {
        candidateUpdate.recommendedAction = score.recommendedAction;
        candidateUpdate.status = candidateStatusFromAssessment(score.recommendedAction, risk.riskScore);
      }

      await tx.productCandidate.update({
        where: { id: candidateId },
        data: candidateUpdate,
      });

      await tx.auditLog.create({
        data: {
          actorId: actor?.adminId ?? null,
          action: "PRODUCT_RESEARCH_CANDIDATE_RECALCULATED",
          resource: "product_research_candidate",
          resourceId: candidateId,
          details: {
            finalScore: score.dimensions.finalScore,
            riskScore: risk.riskScore,
            recommendedAction: score.recommendedAction,
            scoringVersion: activeRule?.version ?? "default-v1",
            actorEmail: actor?.adminEmail ?? null,
          },
        },
      });
    });
  }

  private async pruneCandidateScoreHistory(tx: Prisma.TransactionClient, candidateId: string) {
    const staleScores = await tx.productCandidateScore.findMany({
      where: { candidateId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
      skip: PRODUCT_RESEARCH_SCORE_HISTORY_LIMIT,
    });
    if (staleScores.length === 0) {
      return;
    }
    await tx.productCandidateScore.deleteMany({
      where: { id: { in: staleScores.map((score) => score.id) } },
    });
  }

  private async getCandidateDetail(id: string) {
    const candidate = await this.prisma.productCandidate.findUnique({
      where: { id },
      include: candidateDetailInclude,
    });
    if (!candidate) {
      throw new NotFoundException({ code: "PRODUCT_RESEARCH_CANDIDATE_NOT_FOUND", message: "Candidate not found" });
    }
    return mapCandidateDetail(candidate);
  }
}
