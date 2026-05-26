import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";
import { AiConfigService } from "../ai/ai-config.service";
import { PrismaService } from "../common/prisma.service";
import type { CandidateQueryDto } from "./dto/candidate-query.dto";
import type { CreateCandidateDto } from "./dto/create-candidate.dto";
import { mapAiConfigToProductResearch } from "./product-research-ai-config";
import { mapCandidateDetail, mapCandidateListItem } from "./product-research.mapper";
import type { CandidateImportDraft } from "./product-research.provider";
import { ProductResearchAssessmentService } from "./product-research-assessment.service";
import { ProductResearchImportService } from "./product-research-import.service";
import {
  type AdminActor,
  candidateDetailInclude,
  enumString,
  jsonValue,
  optionalString,
  requiredString,
  resolveCandidateSort,
  resolvePagination,
  round2,
} from "./product-research.shared";

@Injectable()
export class ProductResearchCandidateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly aiConfigService: AiConfigService,
    private readonly importService: ProductResearchImportService,
    private readonly assessmentService: ProductResearchAssessmentService,
  ) {}

  async getDashboard() {
    const aiConfig = mapAiConfigToProductResearch(await this.aiConfigService.resolve());
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

    const pagination = resolvePagination(query.page, query.pageSize);

    const [total, candidates] = await Promise.all([
      this.prisma.productCandidate.count({ where }),
      this.prisma.productCandidate.findMany({
        where,
        include: {
          scores: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          riskFlags: true,
          suppliers: {
            select: {
              supplierId: true,
            },
          },
        },
        orderBy: resolveCandidateSort(query.sort),
        skip: pagination.skip,
        take: pagination.pageSize,
      }),
    ]);

    return {
      items: candidates.map((candidate) => mapCandidateListItem(candidate)),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.max(1, Math.ceil(total / pagination.pageSize)),
    };
  }

  async createCandidate(payload: CreateCandidateDto, actor?: AdminActor) {
    const seed = this.normalizeManualCandidatePayload(payload);
    const created = await this.importService.createCandidateRecord(seed, actor);
    await this.assessmentService.refreshCandidateAssessment(created.id, actor);
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

  async listSuppliers() {
    return this.prisma.supplier.findMany({
      orderBy: [{ verifiedSupplier: "desc" }, { updatedAt: "desc" }, { name: "asc" }],
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
}
