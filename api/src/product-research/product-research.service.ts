import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma.service";
import { AlibabaLinkImportCommitDto, AlibabaLinkImportPreviewDto } from "./dto/alibaba-import.dto";
import type { AiImportCommitDto, AiImportPreviewDto } from "./dto/ai-import.dto";
import { BulkCandidateActionDto } from "./dto/bulk-candidate-action.dto";
import type { CandidateQueryDto } from "./dto/candidate-query.dto";
import type { CsvImportCommitDto, CsvImportPreviewDto } from "./dto/csv-import.dto";
import type { CreateCandidateDto } from "./dto/create-candidate.dto";
import type { CreateScoringRuleDto } from "./dto/create-scoring-rule.dto";
import type { DecisionCreateDto } from "./dto/decision-create.dto";
import type { ScoreManualAdjustmentDto } from "./dto/score-manual-adjustment.dto";
import type { SupplierQuoteImportCommitDto, SupplierQuoteImportPreviewDto } from "./dto/supplier-quote-import.dto";
import type { SupplierQuoteUpdateDto } from "./dto/supplier-quote-update.dto";
import type { TestLaunchUpsertDto } from "./dto/test-launch-upsert.dto";
import {
  calculateCandidateScore,
  calculateTestScore,
  calculateValidatedScore,
  candidateStatusFromAssessment,
  defaultScoringWeights,
  evaluateCandidateRisk,
} from "./product-research.engine";
import { resolveProductResearchAiConfig } from "./product-research-ai-config";
import { mapCandidateDetail, mapCandidateListItem } from "./product-research.mapper";
import type { CandidateImportDraft } from "./product-research.provider";
import { ProductResearchRuntimeService } from "./product-research-runtime.service";

type AdminActor = {
  adminId: string;
  adminEmail: string;
};

const candidateDetailInclude = {
  scores: {
    orderBy: { createdAt: "desc" },
  },
  suppliers: {
    include: {
      supplier: true,
    },
  },
  signals: {
    orderBy: [{ collectedAt: "desc" }],
  },
  riskFlags: {
    orderBy: { createdAt: "desc" },
  },
  testLaunches: {
    orderBy: { createdAt: "desc" },
  },
  decisions: {
    orderBy: { createdAt: "desc" },
  },
} satisfies Prisma.ProductCandidateInclude;

@Injectable()
export class ProductResearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly runtime: ProductResearchRuntimeService,
  ) {}

  async getDashboard() {
    const aiConfig = await resolveProductResearchAiConfig(this.prisma, this.config);
    const [totalCandidates, approvedCandidates, runningTests, highRiskCandidateRows, recentImports, recentDecisions, statusCounts, averageScores] = await Promise.all([
      this.prisma.productCandidate.count(),
      this.prisma.productCandidate.count({ where: { status: "APPROVED" } }),
      this.prisma.productTestLaunch.count({ where: { status: "RUNNING" } }),
      this.prisma.productResearchRiskFlag.findMany({
        where: { severity: { in: ["HIGH", "BLOCKING"] } },
        distinct: ["candidateId"],
        select: { candidateId: true },
      }),
      this.prisma.productResearchImportBatch.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      this.prisma.productResearchDecision.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      this.prisma.productCandidate.groupBy({
        by: ["status", "recommendedAction"],
        _count: true,
      }),
      this.prisma.productCandidate.aggregate({
        _avg: {
          finalScore: true,
          validatedScore: true,
        },
      }),
    ]);

    const statusBreakdown = statusCounts.reduce<Record<string, number>>((accumulator, row) => {
      accumulator[row.status] = (accumulator[row.status] ?? 0) + row._count;
      return accumulator;
    }, {});
    const recommendedActionBreakdown = statusCounts.reduce<Record<string, number>>((accumulator, row) => {
      accumulator[row.recommendedAction] = (accumulator[row.recommendedAction] ?? 0) + row._count;
      return accumulator;
    }, {});

    return {
      summary: {
        totalCandidates,
        highRiskCandidates: highRiskCandidateRows.length,
        approvedCandidates,
        runningTests,
        averageFinalScore: round2(averageScores._avg.finalScore),
        averageValidatedScore: round2(averageScores._avg.validatedScore),
        providerStatus: {
          activeAiProvider: aiConfig.provider,
          activeAiBaseUrl: aiConfig.baseUrl,
          activeAiModels: {
            candidateGeneration: aiConfig.candidateModel,
            scoring: aiConfig.scoringModel,
            copy: aiConfig.copyModel,
            fast: aiConfig.fastModel,
          },
          aiApiKeyConfigured: aiConfig.apiKeyConfigured,
          aiApiKeySource: aiConfig.apiKeySource,
          openAiConfigured: Boolean(this.config.get<string>("OPENAI_API_KEY")),
          deepSeekConfigured: Boolean(this.config.get<string>("DEEPSEEK_API_KEY")),
          mimoConfigured: Boolean(this.config.get<string>("MIMO_API_KEY")),
          googleTrendsConfigured: Boolean(this.config.get<string>("GOOGLE_TRENDS_API_KEY") || this.config.get<string>("GOOGLE_TRENDS_PROJECT_ID")),
          gscConfigured: Boolean(this.config.get<string>("GSC_SITE_URL") && this.config.get<string>("GSC_CLIENT_EMAIL") && this.config.get<string>("GSC_PRIVATE_KEY")),
          ga4Configured: Boolean(this.config.get<string>("GA4_PROPERTY_ID") && this.config.get<string>("GA4_CLIENT_EMAIL") && this.config.get<string>("GA4_PRIVATE_KEY")),
        },
      },
      statusBreakdown,
      recommendedActionBreakdown,
      recentImports,
      recentDecisions,
    };
  }

  async listCandidates(query: CandidateQueryDto) {
    const where: Prisma.ProductCandidateWhereInput = {};
    if (query.search) {
      where.OR = [
        { productName: { contains: query.search, mode: "insensitive" } },
        { chineseName: { contains: query.search, mode: "insensitive" } },
        { alibabaKeywords: { contains: query.search, mode: "insensitive" } },
      ];
    }
    if (query.status) where.status = query.status as never;
    if (query.source) where.source = query.source as never;
    if (query.category) where.category = { equals: query.category, mode: "insensitive" };
    if (query.targetMarket) where.targetMarket = { equals: query.targetMarket, mode: "insensitive" };
    if (query.recommendedAction) where.recommendedAction = query.recommendedAction as never;
    if (query.riskSeverity) {
      where.riskFlags = {
        some: {
          severity: query.riskSeverity as never,
        },
      };
    }

    const candidates = await this.prisma.productCandidate.findMany({
      where,
      include: {
        scores: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        riskFlags: true,
        suppliers: {
          select: {
            supplierId: true,
          },
        },
      },
      orderBy: resolveCandidateSort(query.sort),
    });

    return candidates.map((candidate) => mapCandidateListItem(candidate));
  }

  async createCandidate(payload: CreateCandidateDto, actor?: AdminActor) {
    const seed = this.normalizeManualCandidatePayload(payload);
    const created = await this.createCandidateRecord(seed, actor);
    await this.refreshCandidateAssessment(created.id, actor);
    return this.getCandidateDetail(created.id);
  }

  async getCandidateDetail(id: string) {
    const candidate = await this.prisma.productCandidate.findUnique({
      where: { id },
      include: candidateDetailInclude,
    });
    if (!candidate) {
      throw new NotFoundException({ code: "PRODUCT_RESEARCH_CANDIDATE_NOT_FOUND", message: "Candidate not found" });
    }
    return mapCandidateDetail(candidate);
  }

  async previewAiImport(payload: AiImportPreviewDto) {
    const count = payload.count ?? 10;
    const items = await this.runtime.generateCandidates({
      brandDirection: payload.brandDirection,
      targetMarket: payload.targetMarket,
      excludedCategories: payload.excludedCategories,
      count,
    });

    const duplicates = await this.findDuplicatePreviewMatches(items);
    const previewItems = items.map((item, index) => ({
      ...item,
      duplicateHints: duplicates.filter((entry) => entry.index === index).map((entry) => entry.existingId),
      riskWarnings: evaluateCandidateRisk(item).flags.map((flag) => `${flag.severity}: ${flag.message}`),
    }));

    return {
      items: previewItems,
      requestedCount: count,
      duplicates,
      riskWarnings: previewItems.flatMap((item, index) => item.riskWarnings?.map((warning) => ({ index, warning })) ?? []),
    };
  }

  async commitAiImport(payload: AiImportCommitDto, actor?: AdminActor) {
    const previewItems = Array.isArray(payload.previewItems) ? payload.previewItems : [];
    const indexes = new Set((payload.selectedIndexes ?? []).filter((value) => Number.isInteger(value) && value >= 0));
    const selected = previewItems.filter((_, index) => indexes.has(index)).map(normalizePreviewItem);
    if (selected.length === 0) {
      throw new BadRequestException({ code: "PRODUCT_RESEARCH_IMPORT_EMPTY_SELECTION", message: "No preview rows selected" });
    }

    const batch = await this.prisma.productResearchImportBatch.create({
      data: {
        source: "AI",
        fileName: "ai-generated-preview",
        totalRows: previewItems.length,
        createdById: actor?.adminId ?? null,
      },
    });

    const result = await this.commitCandidateImportBatch({
      batchId: batch.id,
      rows: selected,
      importSource: "AI_GENERATED",
      actor,
      duplicateAction: "skip",
    });

    return result;
  }

  async previewCsvImport(payload: CsvImportPreviewDto) {
    const rows = Array.isArray(payload.rows) ? payload.rows : [];
    const normalized = rows.map((row, index) => normalizeCandidateCsvRow(row, index));
    const invalidRows = normalized.filter((row) => row.errors.length > 0).map((row) => ({ index: row.index, errors: row.errors, row: row.original }));
    const validItems = normalized.filter((row) => row.errors.length === 0).map((row) => row.draft);
    const duplicates = await this.findDuplicatePreviewMatches(validItems);

    return {
      fileName: payload.fileName ?? null,
      previewRows: validItems,
      duplicates,
      invalidRows,
    };
  }

  async commitCsvImport(payload: CsvImportCommitDto, actor?: AdminActor) {
    const rows = Array.isArray(payload.rows) ? payload.rows : [];
    const normalized = rows.map((row, index) => normalizeCandidateCsvRow(row, index));
    const invalidRows = normalized.filter((row) => row.errors.length > 0);
    if (invalidRows.length > 0) {
      throw new BadRequestException({ code: "PRODUCT_RESEARCH_IMPORT_INVALID_ROWS", message: "CSV import includes invalid rows" });
    }

    const batch = await this.prisma.productResearchImportBatch.create({
      data: {
        source: "CSV",
        fileName: payload.batchId ?? "candidate-csv",
        totalRows: rows.length,
        createdById: actor?.adminId ?? null,
      },
    });

    return this.commitCandidateImportBatch({
      batchId: batch.id,
      rows: normalized.map((row) => row.draft),
      importSource: "CSV",
      actor,
      duplicateAction: payload.action ?? "skip",
    });
  }

  async previewSupplierQuoteImport(payload: SupplierQuoteImportPreviewDto) {
    const rows = Array.isArray(payload.rows) ? payload.rows : [];
    const normalized = rows.map((row, index) => normalizeSupplierQuoteRow(row, index));
    const invalidRows = normalized.filter((row) => row.errors.length > 0).map((row) => ({ index: row.index, errors: row.errors, row: row.original }));
    const duplicates = normalized
      .filter((row) => row.errors.length === 0 && row.supplierUrl)
      .map((row) => ({
        index: row.index,
        supplierUrl: row.supplierUrl,
      }));

    return {
      fileName: payload.fileName ?? null,
      previewRows: normalized.filter((row) => row.errors.length === 0).map((row) => row.preview),
      duplicates,
      invalidRows,
    };
  }

  async commitSupplierQuoteImport(payload: SupplierQuoteImportCommitDto, actor?: AdminActor) {
    const rows = Array.isArray(payload.rows) ? payload.rows : [];
    const normalized = rows.map((row, index) => normalizeSupplierQuoteRow(row, index));
    const invalidRows = normalized.filter((row) => row.errors.length > 0);
    if (invalidRows.length > 0) {
      throw new BadRequestException({ code: "PRODUCT_RESEARCH_SUPPLIER_IMPORT_INVALID_ROWS", message: "Supplier import includes invalid rows" });
    }

    const batch = await this.prisma.productResearchImportBatch.create({
      data: {
        source: "SUPPLIER_QUOTE",
        fileName: payload.batchId ?? "supplier-quote-csv",
        totalRows: rows.length,
        createdById: actor?.adminId ?? null,
      },
    });

    let createdCount = 0;
    let duplicateCount = 0;
    let skippedCount = 0;

    for (const row of normalized) {
      const existingSupplier = row.supplierUrl
        ? await this.prisma.supplier.findFirst({
            where: {
              url: { equals: row.supplierUrl, mode: "insensitive" },
            },
          })
        : null;

      if (existingSupplier && payload.action === "skip") {
        duplicateCount += 1;
        skippedCount += 1;
        continue;
      }

      const supplier = existingSupplier
        ? await this.prisma.supplier.update({
            where: { id: existingSupplier.id },
            data: row.supplierData,
          })
        : await this.prisma.supplier.create({
            data: row.supplierData,
          });

      const candidate = await this.findCandidateByName(row.productName);
      if (candidate) {
        await this.prisma.productCandidateSupplier.upsert({
          where: {
            candidateId_supplierId: {
              candidateId: candidate.id,
              supplierId: supplier.id,
            },
          },
          create: {
            candidateId: candidate.id,
            supplierId: supplier.id,
            quotedUnitPriceCents: row.quoteData.quotedUnitPriceCents,
            quotedMoq: row.quoteData.quotedMoq,
            quotedLeadTimeDays: row.quoteData.quotedLeadTimeDays,
            notes: row.quoteData.notes,
          },
          update: row.quoteData,
        });
        await this.refreshCandidateAssessment(candidate.id, actor);
      }

      createdCount += 1;
      if (existingSupplier) duplicateCount += 1;
    }

    await this.prisma.productResearchImportBatch.update({
      where: { id: batch.id },
      data: {
        createdCount,
        skippedCount,
        duplicateCount,
        invalidCount: 0,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: actor?.adminId ?? null,
        action: "PRODUCT_RESEARCH_SUPPLIER_QUOTES_IMPORTED",
        resource: "product_research_import_batch",
        resourceId: batch.id,
        details: {
          createdCount,
          duplicateCount,
          skippedCount,
          actorEmail: actor?.adminEmail ?? null,
        },
      },
    });

    return {
      batchId: batch.id,
      importedCount: createdCount,
      duplicateCount,
      skippedCount,
    };
  }

  async previewAlibabaLinks(payload: AlibabaLinkImportPreviewDto) {
    const links = normalizeLinkList(payload.links);
    const previewItems = await this.runtime.enrichAlibabaLinks({ links, notes: payload.notes ?? null });
    const duplicates = await this.findDuplicatePreviewMatches(previewItems);

    return {
      links,
      notes: payload.notes ?? null,
      previewItems: previewItems.map((item, index) => ({
        ...item,
        duplicateHints: duplicates.filter((entry) => entry.index === index).map((entry) => entry.existingId),
        riskWarnings: evaluateCandidateRisk(item).flags.map((flag) => `${flag.severity}: ${flag.message}`),
      })),
      duplicates,
    };
  }

  async commitAlibabaLinks(payload: AlibabaLinkImportCommitDto, actor?: AdminActor) {
    const previewItems = Array.isArray(payload.previewItems) ? payload.previewItems : [];
    const indexes = new Set((payload.selectedIndexes ?? []).filter((value) => Number.isInteger(value) && value >= 0));
    const selected = previewItems.filter((_, index) => indexes.has(index)).map(normalizePreviewItem);
    if (selected.length === 0) {
      throw new BadRequestException({ code: "PRODUCT_RESEARCH_IMPORT_EMPTY_SELECTION", message: "No Alibaba preview rows selected" });
    }

    const batch = await this.prisma.productResearchImportBatch.create({
      data: {
        source: "ALIBABA_LINK",
        fileName: "alibaba-links",
        totalRows: previewItems.length,
        createdById: actor?.adminId ?? null,
      },
    });

    return this.commitCandidateImportBatch({
      batchId: batch.id,
      rows: selected.map((item) => ({ ...item, notes: joinNotes(item.notes, payload.notes) })),
      importSource: "ALIBABA_LINK",
      actor,
      duplicateAction: "skip",
    });
  }

  async listSuppliers() {
    return this.prisma.supplier.findMany({
      orderBy: [{ verifiedSupplier: "desc" }, { updatedAt: "desc" }, { name: "asc" }],
    });
  }

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

  async listImportBatches() {
    return this.prisma.productResearchImportBatch.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async listDecisions() {
    return this.prisma.productResearchDecision.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        candidate: {
          select: {
            id: true,
            productName: true,
            status: true,
            recommendedAction: true,
          },
        },
        operator: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async listTestLaunches() {
    return this.prisma.productTestLaunch.findMany({
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 100,
      include: {
        candidate: {
          select: {
            id: true,
            productName: true,
            status: true,
            recommendedAction: true,
          },
        },
      },
    });
  }

  async listRiskReview() {
    const candidates = await this.prisma.productCandidate.findMany({
      where: {
        OR: [
          { status: "HIGH_RISK_REVIEW" },
          { riskFlags: { some: { severity: { in: ["HIGH", "BLOCKING"] } } } },
        ],
      },
      include: {
        riskFlags: true,
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
    return candidates.map((candidate) => mapCandidateListItem(candidate));
  }

  async activateScoringRule(id: string, actor?: AdminActor) {
    const rule = await this.prisma.scoringRule.findUnique({ where: { id } });
    if (!rule) {
      throw new NotFoundException({ code: "SCORING_RULE_NOT_FOUND", message: "Scoring rule not found" });
    }

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
            actorEmail: actor?.adminEmail ?? null,
          },
        },
      });
    });

    return this.prisma.scoringRule.findUniqueOrThrow({ where: { id } });
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

    for (const id of ids) {
      await this.refreshCandidateAssessment(id, actor);
    }

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

    return { recalculated: ids.length };
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

    const finalScore = payload.finalScore;
    const createdScore = await this.prisma.$transaction(async (tx) => {
      const score = await tx.productCandidateScore.create({
        data: {
          candidateId: id,
          marketDemandScore: 0,
          trendSeasonalityScore: 0,
          competitionGapScore: 0,
          marginPotentialScore: 0,
          logisticsFitScore: 0,
          brandabilityScore: 0,
          supplierQualityScore: 0,
          riskScore: candidate.riskScore ?? 0,
          riskInverseScore: Math.max(0, 100 - (candidate.riskScore ?? 0)),
          testabilityScore: 0,
          finalScore,
          scoringVersion: `manual-${Date.now()}`,
          scoreReasonJson: {
            mode: "manual_adjustment",
            actorEmail: actor?.adminEmail ?? null,
          },
          isManualAdjusted: true,
          manualAdjustmentReason: payload.reason?.trim() || null,
        },
      });

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

    return createdScore;
  }

  async upsertSupplierQuote(candidateId: string, supplierId: string, payload: SupplierQuoteUpdateDto, actor?: AdminActor) {
    await ensureCandidateExists(this.prisma, candidateId);
    const supplier = await this.prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) {
      throw new NotFoundException({ code: "PRODUCT_RESEARCH_SUPPLIER_NOT_FOUND", message: "Supplier not found" });
    }

    const result = await this.prisma.productCandidateSupplier.upsert({
      where: {
        candidateId_supplierId: {
          candidateId,
          supplierId,
        },
      },
      create: {
        candidateId,
        supplierId,
        quotedUnitPriceCents: payload.quotedUnitPriceCents ?? null,
        quotedMoq: payload.quotedMoq ?? null,
        quotedLeadTimeDays: payload.quotedLeadTimeDays ?? null,
        quoteFileUrl: payload.quoteFileUrl?.trim() || null,
        notes: payload.notes?.trim() || null,
      },
      update: {
        quotedUnitPriceCents: payload.quotedUnitPriceCents ?? null,
        quotedMoq: payload.quotedMoq ?? null,
        quotedLeadTimeDays: payload.quotedLeadTimeDays ?? null,
        quoteFileUrl: payload.quoteFileUrl?.trim() || null,
        notes: payload.notes?.trim() || null,
      },
      include: {
        supplier: true,
      },
    });

    await this.refreshCandidateAssessment(candidateId, actor);
    return result;
  }

  async createDecision(candidateId: string, payload: DecisionCreateDto, actor?: AdminActor) {
    await ensureCandidateExists(this.prisma, candidateId);
    const decision = enumString(payload.decision, ["SAMPLE", "TEST", "WATCH", "APPROVE", "REJECT", "CONVERT_TO_PRODUCT"]);

    return this.prisma.$transaction(async (tx) => {
      const created = await tx.productResearchDecision.create({
        data: {
          candidateId,
          decision: decision as never,
          reason: payload.reason?.trim() || null,
          operatorId: actor?.adminId ?? null,
        },
      });

      await tx.productCandidate.update({
        where: { id: candidateId },
        data: mapCandidateStatusFromDecision(decision, actor),
      });

      await tx.auditLog.create({
        data: {
          actorId: actor?.adminId ?? null,
          action: "PRODUCT_RESEARCH_DECISION_CREATED",
          resource: "product_research_candidate",
          resourceId: candidateId,
          details: {
            decision,
            reason: payload.reason?.trim() || null,
            actorEmail: actor?.adminEmail ?? null,
          },
        },
      });

      return created;
    });
  }

  async upsertTestLaunch(candidateId: string, payload: TestLaunchUpsertDto, actor?: AdminActor) {
    await ensureCandidateExists(this.prisma, candidateId);
    if (!payload.channel?.trim()) {
      throw new BadRequestException({ code: "PRODUCT_RESEARCH_TEST_CHANNEL_REQUIRED", message: "Test launch channel is required" });
    }

    const ctr = ratio(payload.clicks ?? 0, payload.impressions ?? 0);
    const addToCartRate = ratio(payload.addToCart ?? 0, payload.productViews ?? 0);
    const checkoutRate = ratio(payload.beginCheckout ?? 0, payload.productViews ?? 0);
    const purchaseRate = ratio(payload.purchases ?? 0, payload.productViews ?? 0);
    const testScore = calculateTestScore({
      ctr,
      addToCartRate,
      checkoutRate,
      purchaseRate,
      productViews: payload.productViews ?? 0,
      customerFeedbackScore: payload.customerFeedbackScore ?? null,
      refundRiskScore: payload.refundRiskScore ?? null,
    });

    const launch = await this.prisma.productTestLaunch.create({
      data: {
        candidateId,
        landingPageUrl: payload.landingPageUrl?.trim() || null,
        channel: payload.channel.trim(),
        channelDetail: payload.channelDetail?.trim() || null,
        adSpendCents: payload.adSpendCents ?? 0,
        impressions: payload.impressions ?? 0,
        clicks: payload.clicks ?? 0,
        ctr,
        productViews: payload.productViews ?? 0,
        addToCart: payload.addToCart ?? 0,
        addToCartRate,
        beginCheckout: payload.beginCheckout ?? 0,
        checkoutRate,
        purchases: payload.purchases ?? 0,
        purchaseRate,
        revenueCents: payload.revenueCents ?? 0,
        refunds: payload.refunds ?? 0,
        customerFeedbackScore: payload.customerFeedbackScore ?? null,
        refundRiskScore: payload.refundRiskScore ?? null,
        customerFeedbackSummary: payload.customerFeedbackSummary?.trim() || null,
        status: (payload.status as never) ?? "PLANNED",
        testScore,
        startedAt: payload.startedAt ? new Date(payload.startedAt) : null,
        endedAt: payload.endedAt ? new Date(payload.endedAt) : null,
        notes: payload.notes?.trim() || null,
      },
    });

    const candidate = await this.prisma.productCandidate.findUniqueOrThrow({
      where: { id: candidateId },
      select: { finalScore: true },
    });
    const validatedScore = calculateValidatedScore(candidate.finalScore, testScore);

    await this.prisma.productCandidate.update({
      where: { id: candidateId },
      data: {
        validatedScore,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: actor?.adminId ?? null,
        action: "PRODUCT_RESEARCH_TEST_LAUNCH_CREATED",
        resource: "product_research_candidate",
        resourceId: candidateId,
        details: {
          channel: payload.channel.trim(),
          testScore,
          validatedScore,
          actorEmail: actor?.adminEmail ?? null,
        },
      },
    });

    return launch;
  }

  async convertToProductDraft(id: string, actor?: AdminActor) {
    const candidate = await this.prisma.productCandidate.findUnique({
      where: { id },
      include: {
        riskFlags: true,
      },
    });
    if (!candidate) {
      throw new NotFoundException({ code: "PRODUCT_RESEARCH_CANDIDATE_NOT_FOUND", message: "Candidate not found" });
    }
    if (candidate.status !== "APPROVED") {
      throw new BadRequestException({ code: "PRODUCT_RESEARCH_CONVERT_REQUIRES_APPROVAL", message: "Only approved candidates can convert to product drafts" });
    }
    if (candidate.riskFlags.some((flag) => flag.severity === "BLOCKING")) {
      throw new BadRequestException({ code: "PRODUCT_RESEARCH_CONVERT_BLOCKED_BY_RISK", message: "Blocking risk flags must be resolved before convert" });
    }
    if (candidate.convertedProductId) {
      return {
        candidateId: candidate.id,
        productId: candidate.convertedProductId,
        status: "DRAFT",
      };
    }

    const aiDraft = asRecord(candidate.aiDraftPayload);
    const features = asStringArray(aiDraft.features);
    const benefits = asStringArray(aiDraft.benefits);
    const useCases = candidate.useCase ? [candidate.useCase] : [];

    const created = await this.prisma.$transaction(async (tx) => {
      const slug = await buildAvailableProductSlug(tx, candidate.slugSuggestion || candidate.productName);
      const product = await tx.product.create({
        data: {
          title: candidate.productName,
          titleEn: candidate.productName,
          titleZh: candidate.chineseName || null,
          slug,
          category: candidate.category,
          shortDescription: candidate.positioningSummary || candidate.description || `${candidate.productName} product research draft`,
          shortDescriptionEn: candidate.positioningSummary || candidate.description || `${candidate.productName} product research draft`,
          shortDescriptionZh: candidate.chineseName ? `${candidate.chineseName} 商品草稿` : null,
          description: candidate.description || candidate.positioningSummary || `${candidate.productName} pending merchandising review.`,
          descriptionEn: candidate.description || candidate.positioningSummary || `${candidate.productName} pending merchandising review.`,
          descriptionZh: candidate.chineseName ? `${candidate.chineseName} 待商品化审核。` : null,
          seoTitle: asString(aiDraft.seoTitle) || `${candidate.productName} | PulseGear`,
          seoTitleEn: asString(aiDraft.seoTitle) || `${candidate.productName} | PulseGear`,
          seoTitleZh: candidate.chineseName ? `${candidate.chineseName} | PulseGear` : null,
          seoDescription: asString(aiDraft.seoDescription) || candidate.positioningSummary || candidate.description || null,
          seoDescriptionEn: asString(aiDraft.seoDescription) || candidate.positioningSummary || candidate.description || null,
          seoDescriptionZh: candidate.chineseName ? `${candidate.chineseName} 商品草稿，待运营完善。` : null,
          status: "DRAFT",
          badge: "Research Draft",
          benefits: benefits.length ? benefits : defaultBenefits(candidate),
          benefitsEn: benefits.length ? benefits : defaultBenefits(candidate),
          features: features.length ? features : defaultFeatures(candidate),
          featuresEn: features.length ? features : defaultFeatures(candidate),
          useCases,
          bundleEligible: false,
        },
      });

      await tx.productCandidate.update({
        where: { id: candidate.id },
        data: {
          convertedProductId: product.id,
        },
      });

      await tx.productResearchDecision.create({
        data: {
          candidateId: candidate.id,
          decision: "CONVERT_TO_PRODUCT",
          reason: "Converted to product draft",
          operatorId: actor?.adminId ?? null,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: actor?.adminId ?? null,
          action: "PRODUCT_RESEARCH_CONVERTED_TO_PRODUCT_DRAFT",
          resource: "product_research_candidate",
          resourceId: candidate.id,
          details: {
            productId: product.id,
            slug: product.slug,
            actorEmail: actor?.adminEmail ?? null,
          },
        },
      });

      return product;
    });

    return {
      candidateId: candidate.id,
      productId: created.id,
      status: created.status,
    };
  }

  private normalizeManualCandidatePayload(payload: CreateCandidateDto): CandidateImportDraft {
    const productName = requiredString(payload.productName, "productName");
    const category = requiredString(payload.category, "category");
    const targetMarket = requiredString(payload.targetMarket, "targetMarket");
    return {
      productName,
      chineseName: optionalString(payload.chineseName),
      slugSuggestion: optionalString(payload.slugSuggestion),
      category,
      targetMarket,
      targetAudience: optionalString(payload.targetAudience),
      useCase: optionalString(payload.useCase),
      description: optionalString(payload.description),
      notes: optionalString(payload.notes),
      brandAngle: optionalString(payload.brandAngle),
      positioningSummary: optionalString(payload.positioningSummary),
      alibabaKeywords: optionalString(payload.alibabaKeywords),
      sourceUrl: optionalString(payload.sourceUrl),
      source: enumString(payload.source, ["MANUAL", "AI_GENERATED", "CSV", "ALIBABA_LINK", "SUPPLIER_QUOTE"], "MANUAL"),
      rawImportData: jsonValue(payload.rawImportData),
      aiDraftPayload: jsonValue(payload.aiDraftPayload),
    };
  }

  private async createCandidateRecord(seed: CandidateImportDraft, actor?: AdminActor) {
    const duplicate = await this.prisma.productCandidate.findFirst({
      where: {
        productName: { equals: seed.productName, mode: "insensitive" },
        category: { equals: seed.category, mode: "insensitive" },
        targetMarket: { equals: seed.targetMarket, mode: "insensitive" },
      },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

    const created = await this.prisma.$transaction(async (tx) => {
      const candidate = await tx.productCandidate.create({
        data: {
          productName: seed.productName,
          chineseName: seed.chineseName ?? null,
          slugSuggestion: seed.slugSuggestion ?? null,
          category: seed.category,
          targetMarket: seed.targetMarket,
          targetAudience: seed.targetAudience ?? null,
          useCase: seed.useCase ?? null,
          description: seed.description ?? null,
          notes: seed.notes ?? null,
          brandAngle: seed.brandAngle ?? null,
          positioningSummary: seed.positioningSummary ?? null,
          alibabaKeywords: seed.alibabaKeywords ?? null,
          source: seed.source,
          sourceUrl: seed.sourceUrl ?? null,
          rawImportData: seed.rawImportData ?? Prisma.JsonNull,
          aiDraftPayload: seed.aiDraftPayload ?? Prisma.JsonNull,
          possibleDuplicateOfId: duplicate?.id ?? null,
          createdById: actor?.adminId ?? null,
        },
        include: candidateDetailInclude,
      });

      await tx.auditLog.create({
        data: {
          actorId: actor?.adminId ?? null,
          action: "PRODUCT_RESEARCH_CANDIDATE_CREATED",
          resource: "product_research_candidate",
          resourceId: candidate.id,
          details: {
            productName: candidate.productName,
            source: candidate.source,
            targetMarket: candidate.targetMarket,
            possibleDuplicateOfId: candidate.possibleDuplicateOfId,
            actorEmail: actor?.adminEmail ?? null,
          },
        },
      });

      return candidate;
    });

    return created;
  }

  private async commitCandidateImportBatch(input: {
    batchId: string;
    rows: CandidateImportDraft[];
    importSource: "AI_GENERATED" | "CSV" | "ALIBABA_LINK";
    actor?: AdminActor;
    duplicateAction: "merge" | "skip" | "create_anyway";
  }) {
    let createdCount = 0;
    let duplicateCount = 0;
    let skippedCount = 0;
    const createdIds: string[] = [];

    for (const row of input.rows) {
      const duplicate = await this.prisma.productCandidate.findFirst({
        where: {
          productName: { equals: row.productName, mode: "insensitive" },
          category: { equals: row.category, mode: "insensitive" },
          targetMarket: { equals: row.targetMarket, mode: "insensitive" },
        },
      });

      if (duplicate) {
        duplicateCount += 1;
        if (input.duplicateAction === "skip") {
          skippedCount += 1;
          continue;
        }
        if (input.duplicateAction === "merge") {
          await this.prisma.productCandidate.update({
            where: { id: duplicate.id },
            data: {
              notes: mergeTextFields(duplicate.notes, row.notes),
              sourceUrl: duplicate.sourceUrl ?? row.sourceUrl ?? null,
              alibabaKeywords: duplicate.alibabaKeywords ?? row.alibabaKeywords ?? null,
              rawImportData: row.rawImportData ?? undefined,
              aiDraftPayload: row.aiDraftPayload ?? undefined,
            },
          });
          await this.refreshCandidateAssessment(duplicate.id, input.actor);
          continue;
        }
      }

      const created = await this.createCandidateRecord({ ...row, source: input.importSource }, input.actor);
      createdIds.push(created.id);
      createdCount += 1;
      await this.refreshCandidateAssessment(created.id, input.actor);
    }

    await this.prisma.productResearchImportBatch.update({
      where: { id: input.batchId },
      data: {
        createdCount,
        skippedCount,
        duplicateCount,
        invalidCount: 0,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: input.actor?.adminId ?? null,
        action: "PRODUCT_RESEARCH_IMPORT_BATCH_COMMITTED",
        resource: "product_research_import_batch",
        resourceId: input.batchId,
        details: {
          createdCount,
          duplicateCount,
          skippedCount,
          createdIds,
          actorEmail: input.actor?.adminEmail ?? null,
        },
      },
    });

    return {
      batchId: input.batchId,
      importedCount: createdCount,
      duplicateCount,
      skippedCount,
      createdIds,
    };
  }

  private async refreshCandidateAssessment(candidateId: string, actor?: AdminActor) {
    const aiConfig = await resolveProductResearchAiConfig(this.prisma, this.config);
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

      await tx.productResearchRiskFlag.deleteMany({ where: { candidateId } });
      if (risk.flags.length > 0) {
        await tx.productResearchRiskFlag.createMany({
          data: risk.flags.map((flag) => ({
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

      await tx.productCandidate.update({
        where: { id: candidateId },
        data: {
          finalScore: score.dimensions.finalScore,
          riskScore: risk.riskScore,
          recommendedAction: score.recommendedAction,
          status: candidateStatusFromAssessment(score.recommendedAction, risk.riskScore),
        },
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

  private async findDuplicatePreviewMatches(items: CandidateImportDraft[]) {
    const matches: Array<{ index: number; existingId: string }> = [];
    for (const [index, item] of items.entries()) {
      const existing = await this.prisma.productCandidate.findFirst({
        where: {
          productName: { equals: item.productName, mode: "insensitive" },
          category: { equals: item.category, mode: "insensitive" },
          targetMarket: { equals: item.targetMarket, mode: "insensitive" },
        },
        select: { id: true },
      });
      if (existing) {
        matches.push({ index, existingId: existing.id });
      }
    }
    return matches;
  }

  private async findCandidateByName(productName: string) {
    return this.prisma.productCandidate.findFirst({
      where: { productName: { equals: productName, mode: "insensitive" } },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    });
  }
}

function resolveCandidateSort(sort?: string): Prisma.ProductCandidateOrderByWithRelationInput[] {
  switch (sort) {
    case "score-desc":
      return [{ finalScore: "desc" }, { updatedAt: "desc" }];
    case "score-asc":
      return [{ finalScore: "asc" }, { updatedAt: "desc" }];
    case "created-asc":
      return [{ createdAt: "asc" }];
    case "created-desc":
      return [{ createdAt: "desc" }];
    case "updated-asc":
      return [{ updatedAt: "asc" }, { createdAt: "asc" }];
    default:
      return [{ updatedAt: "desc" }, { createdAt: "desc" }];
  }
}

function requiredString(value: unknown, field: string) {
  const normalized = optionalString(value);
  if (!normalized) {
    throw new BadRequestException({ code: "PRODUCT_RESEARCH_VALIDATION_ERROR", message: `${field} is required` });
  }
  return normalized;
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function enumString<T extends string>(value: unknown, allowed: readonly T[], fallback?: T) {
  if (typeof value === "string" && allowed.includes(value as T)) {
    return value as T;
  }
  if (fallback) return fallback;
  throw new BadRequestException({ code: "PRODUCT_RESEARCH_VALIDATION_ERROR", message: `Invalid enum value: ${String(value)}` });
}

function jsonValue(value: unknown): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
}

function mapCandidateStatusFromDecision(decision: string, actor?: AdminActor): Prisma.ProductCandidateUpdateInput {
  switch (decision) {
    case "SAMPLE":
      return { status: "SAMPLE", recommendedAction: "SAMPLE" };
    case "TEST":
      return { status: "TEST", recommendedAction: "TEST" };
    case "WATCH":
      return { status: "WATCH", recommendedAction: "WATCH" };
    case "APPROVE":
      return {
        status: "APPROVED",
        recommendedAction: "REVIEW",
        approvedAt: new Date(),
        approvedBy: actor?.adminId ? { connect: { id: actor.adminId } } : undefined,
      };
    case "REJECT":
      return { status: "REJECTED", recommendedAction: "REJECT" };
    default:
      return {};
  }
}

async function ensureCandidateExists(prisma: PrismaService, candidateId: string) {
  const candidate = await prisma.productCandidate.findUnique({
    where: { id: candidateId },
    select: { id: true },
  });
  if (!candidate) {
    throw new NotFoundException({ code: "PRODUCT_RESEARCH_CANDIDATE_NOT_FOUND", message: "Candidate not found" });
  }
}

function ratio(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Number((numerator / denominator).toFixed(4));
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim()) : [];
}

function defaultBenefits(candidate: { targetMarket: string; useCase: string | null }) {
  return [
    `Draft positioning for ${candidate.targetMarket}`,
    candidate.useCase ? `Built for ${candidate.useCase}` : "Use case pending merchandising review",
    "Benefits pending AI research refinement",
  ];
}

function defaultFeatures(candidate: { category: string }) {
  return [
    `${candidate.category} draft feature set`,
    "Supplier and testing data pending review",
    "Final merchandising copy required before publish",
  ];
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80) || "research-draft";
}

async function buildAvailableProductSlug(tx: Prisma.TransactionClient, source: string) {
  const base = slugify(source);
  let slug = base;
  let suffix = 2;

  while (await tx.product.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

function round2(value: number | null | undefined) {
  if (value == null) return null;
  return Number(value.toFixed(2));
}

function parseWeights(value: Prisma.JsonValue | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const weights = value as Record<string, unknown>;
  const parsed = Object.fromEntries(
    Object.entries(defaultScoringWeights).map(([key, fallback]) => {
      const next = weights[key];
      return [key, typeof next === "number" ? next : fallback];
    }),
  ) as Partial<typeof defaultScoringWeights>;
  return parsed;
}

function normalizePreviewItem(item: Record<string, unknown>): CandidateImportDraft {
  const productName = requiredString(item.productName, "productName");
  const category = requiredString(item.category, "category");
  const targetMarket = requiredString(item.targetMarket, "targetMarket");
  return {
    productName,
    chineseName: optionalString(item.chineseName),
    slugSuggestion: optionalString(item.slugSuggestion),
    category,
    targetMarket,
    targetAudience: optionalString(item.targetAudience),
    useCase: optionalString(item.useCase),
    description: optionalString(item.description),
    notes: optionalString(item.notes),
    brandAngle: optionalString(item.brandAngle),
    positioningSummary: optionalString(item.positioningSummary),
    alibabaKeywords: optionalString(item.alibabaKeywords),
    sourceUrl: optionalString(item.sourceUrl),
    source: enumString(item.source, ["MANUAL", "AI_GENERATED", "CSV", "ALIBABA_LINK", "SUPPLIER_QUOTE"], "MANUAL"),
    rawImportData: jsonValue(item.rawImportData),
    aiDraftPayload: jsonValue(item.aiDraftPayload),
  };
}

function normalizeCandidateCsvRow(row: Record<string, unknown>, index: number) {
  const productName = optionalString(row.product_name ?? row.productName);
  const category = optionalString(row.category);
  const targetMarket = optionalString(row.target_market ?? row.targetMarket);
  const errors: string[] = [];
  if (!productName) errors.push("product_name is required");
  if (!category) errors.push("category is required");
  if (!targetMarket) errors.push("target_market is required");
  const draft: CandidateImportDraft = {
    productName: productName ?? `Row ${index + 1}`,
    chineseName: optionalString(row.chinese_name ?? row.chineseName),
    slugSuggestion: productName ?? null,
    category: category ?? "uncategorized",
    targetMarket: targetMarket ?? "US",
    targetAudience: optionalString(row.target_audience ?? row.targetAudience),
    useCase: optionalString(row.use_case ?? row.useCase),
    description: optionalString(row.description),
    notes: optionalString(row.notes),
    alibabaKeywords: optionalString(row.alibaba_keywords ?? row.alibabaKeywords),
    source: "CSV",
    rawImportData: row as Prisma.InputJsonValue,
  };
  return {
    index,
    original: row,
    errors,
    draft,
  };
}

function normalizeSupplierQuoteRow(row: Record<string, unknown>, index: number) {
  const productName = optionalString(row.product_name ?? row.productName);
  const supplierName = optionalString(row.supplier_name ?? row.supplierName);
  const platform = enumString(row.platform, ["ALIBABA", "ALIEXPRESS", "CJ_DROPSHIPPING", "AGENT", "OTHER"], "OTHER");
  const supplierUrl = optionalString(row.supplier_url ?? row.supplierUrl);
  const errors: string[] = [];
  if (!productName) errors.push("product_name is required");
  if (!supplierName) errors.push("supplier_name is required");
  const supplierData: Prisma.SupplierUncheckedCreateInput = {
    platform,
    name: supplierName ?? `Supplier ${index + 1}`,
    url: supplierUrl ?? null,
    country: optionalString(row.country),
    verifiedSupplier: toBoolean(row.verified_supplier ?? row.verifiedSupplier),
    tradeAssurance: toBoolean(row.trade_assurance ?? row.tradeAssurance),
    yearsOnPlatform: toNullableInt(row.years_on_platform ?? row.yearsOnPlatform),
    responseRate: toNullableFloat(row.response_rate ?? row.responseRate),
    moq: toNullableInt(row.moq),
    samplePriceCents: toMoneyCents(row.sample_price ?? row.samplePrice),
    unitPriceCents: toMoneyCents(row.unit_price ?? row.unitPrice),
    customLogoMoq: toNullableInt(row.custom_logo_moq ?? row.customLogoMoq),
    customPackagingMoq: toNullableInt(row.custom_packaging_moq ?? row.customPackagingMoq),
    leadTimeDays: toNullableInt(row.lead_time_days ?? row.leadTimeDays),
    shippingToUSCents: toMoneyCents(row.shipping_to_us ?? row.shippingToUS),
    shippingToUKCents: toMoneyCents(row.shipping_to_uk ?? row.shippingToUK),
    certifications: splitDelimitedStrings(row.certifications),
    notes: optionalString(row.notes),
  };
  const quoteData = {
    quotedUnitPriceCents: supplierData.unitPriceCents,
    quotedMoq: supplierData.moq,
    quotedLeadTimeDays: supplierData.leadTimeDays,
    notes: optionalString(row.notes),
  };
  return {
    index,
    original: row,
    errors,
    productName: productName ?? "",
    supplierUrl,
    preview: {
      productName,
      supplierName,
      platform,
      moq: supplierData.moq,
      unitPriceCents: supplierData.unitPriceCents,
      shippingToUSCents: supplierData.shippingToUSCents,
      leadTimeDays: supplierData.leadTimeDays,
      verifiedSupplier: supplierData.verifiedSupplier,
      tradeAssurance: supplierData.tradeAssurance,
    },
    supplierData,
    quoteData,
  };
}

function splitDelimitedStrings(value: unknown) {
  return typeof value === "string" && value.trim()
    ? value
        .split(/[|,]/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function normalizeLinkList(links?: string[]) {
  return Array.isArray(links)
    ? [...new Set(links.map((item) => item.trim()).filter((item) => item.startsWith("http")))]
    : [];
}

function toBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return ["true", "1", "yes", "y"].includes(value.toLowerCase());
  if (typeof value === "number") return value > 0;
  return false;
}

function toNullableInt(value: unknown) {
  if (value == null || value === "") return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function toNullableFloat(value: unknown) {
  if (value == null || value === "") return null;
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function toMoneyCents(value: unknown) {
  if (value == null || value === "") return null;
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : null;
}

function mergeTextFields(current: string | null, incoming: string | null | undefined) {
  if (!incoming) return current;
  if (!current) return incoming;
  if (current.includes(incoming)) return current;
  return `${current}\n${incoming}`.trim();
}

function joinNotes(current: string | null | undefined, appended: string | null | undefined) {
  return mergeTextFields(current ?? null, appended ?? null);
}
