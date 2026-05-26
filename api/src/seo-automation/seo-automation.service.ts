import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AiConfigService } from "../ai/ai-config.service";
import { PrismaService } from "../common/prisma.service";
import { SeoAiRuntimeService } from "./seo-ai-runtime.service";
import { SeoChangeLogService } from "./seo-change-log.service";
import { SeoContentPipelineService } from "./seo-content-pipeline.service";
import { SeoHealthService } from "./seo-health.service";
import type { HealthCheckResult } from "./seo-health.shared";
import { SeoInternalLinkService } from "./seo-internal-link.service";
import { SeoOpportunityService } from "./seo-opportunity.service";
import { SeoRecommendationService } from "./seo-recommendation.service";
import { SeoSyncService } from "./seo-sync.service";
import type {
  ContentBriefItem,
  ContentOpportunityItem,
  Ga4SyncResult,
  InternalLinkSuggestionItem,
  ProductSeoDraft,
  SearchConsoleSyncResult,
  SeoAutomationOverview,
  SeoChangeLogItem,
  SeoIssueItem,
  SeoRecommendationItem,
} from "./seo-automation.types";
import type { SeoAdminActor } from "./seo-automation.shared";

@Injectable()
export class SeoAutomationService {
  private readonly seoAiRuntime: SeoAiRuntimeService;
  private readonly opportunityService: SeoOpportunityService;
  private readonly contentPipelineService: SeoContentPipelineService;
  private readonly recommendationService: SeoRecommendationService;
  private readonly internalLinkService: SeoInternalLinkService;
  private readonly healthService: SeoHealthService;
  private readonly syncService: SeoSyncService;
  private readonly changeLogService: SeoChangeLogService;

  constructor(
    prisma: PrismaService,
    config: ConfigService = new ConfigService(),
    seoAiRuntime?: SeoAiRuntimeService,
    opportunityService?: SeoOpportunityService,
    contentPipelineService?: SeoContentPipelineService,
    recommendationService?: SeoRecommendationService,
    internalLinkService?: SeoInternalLinkService,
    healthService?: SeoHealthService,
    syncService?: SeoSyncService,
    changeLogService?: SeoChangeLogService,
  ) {
    this.seoAiRuntime = seoAiRuntime ?? new SeoAiRuntimeService(new AiConfigService(prisma, config), config);
    this.opportunityService = opportunityService ?? new SeoOpportunityService(prisma, this.seoAiRuntime);
    this.contentPipelineService = contentPipelineService ?? new SeoContentPipelineService(prisma, this.seoAiRuntime, this.opportunityService);
    this.recommendationService = recommendationService ?? new SeoRecommendationService(prisma, this.seoAiRuntime, this.contentPipelineService);
    this.internalLinkService = internalLinkService ?? new SeoInternalLinkService(prisma, this.seoAiRuntime);
    this.healthService = healthService ?? new SeoHealthService(prisma);
    this.syncService = syncService ?? new SeoSyncService(prisma);
    this.changeLogService = changeLogService ?? new SeoChangeLogService(prisma);
  }

  async getOverview(): Promise<SeoAutomationOverview> {
    const aiStatus = await this.seoAiRuntime.getStatus();
    const [health, opportunities, recommendations, briefs, logs] = await Promise.all([
      this.runHealthCheck(),
      this.generateOpportunities(),
      this.generateRecommendations(),
      this.listContentPipeline(),
      this.listChangeLog(),
    ]);

    const averageHealthScore = health.pages.length
      ? Math.round(health.pages.reduce((sum, page) => sum + page.healthScore, 0) / health.pages.length)
      : 0;

    return {
      healthCheck: {
        lastRunAt: health.lastRunAt,
        scannedPages: health.pages.length,
        openIssues: health.issues.length,
        averageHealthScore,
      },
      searchConsole: this.syncService.getSearchConsoleConnection(),
      ga4: this.syncService.getGa4Connection(),
      opportunities: {
        total: opportunities.length,
        new: opportunities.filter((item) => item.status === "NEW").length,
      },
      recommendations: {
        total: recommendations.length,
        draft: recommendations.filter((item) => item.status === "DRAFT").length,
      },
      contentPipeline: {
        total: briefs.length,
        needsReview: briefs.filter((item) => item.status === "NEEDS_REVIEW").length,
      },
      aiStatus,
      recentChanges: logs.slice(0, 5),
    };
  }

  async runHealthCheck(): Promise<HealthCheckResult> {
    return this.healthService.runHealthCheck();
  }

  async listIssues(): Promise<SeoIssueItem[]> {
    return this.healthService.listIssues();
  }

  async syncSearchConsole(): Promise<SearchConsoleSyncResult> {
    return this.syncService.syncSearchConsole();
  }

  async syncGa4(): Promise<Ga4SyncResult> {
    return this.syncService.syncGa4();
  }

  async generateOpportunities(): Promise<ContentOpportunityItem[]> {
    return this.opportunityService.generateOpportunities();
  }

  async listOpportunities(): Promise<ContentOpportunityItem[]> {
    return this.opportunityService.listOpportunities();
  }

  async generateRecommendations(): Promise<SeoRecommendationItem[]> {
    return this.recommendationService.generateRecommendations();
  }

  async listRecommendations(): Promise<SeoRecommendationItem[]> {
    return this.recommendationService.listRecommendations();
  }

  async createContentBriefFromOpportunity(opportunityId: string): Promise<ContentBriefItem> {
    return this.contentPipelineService.createContentBriefFromOpportunity(opportunityId);
  }

  async listContentPipeline(): Promise<ContentBriefItem[]> {
    return this.contentPipelineService.listContentPipeline();
  }

  async generateInternalLinkSuggestions(): Promise<InternalLinkSuggestionItem[]> {
    return this.internalLinkService.generateInternalLinkSuggestions();
  }

  async listInternalLinks(): Promise<InternalLinkSuggestionItem[]> {
    return this.internalLinkService.listInternalLinks();
  }

  async listChangeLog(): Promise<SeoChangeLogItem[]> {
    return this.changeLogService.listChangeLog();
  }

  async generateProductSeoDraft(productId: string): Promise<ProductSeoDraft> {
    return this.contentPipelineService.generateProductSeoDraft(productId);
  }

  async applyProductSeoDraft(productId: string, draft: ProductSeoDraft, actor: SeoAdminActor) {
    return this.contentPipelineService.applyProductSeoDraft(productId, draft, actor);
  }

  async bulkReviewIssues(ids: string[]) {
    return {
      reviewed: ids.length,
    };
  }

  async applyRecommendation(recommendationId: string, actor: SeoAdminActor) {
    return this.recommendationService.applyRecommendation(recommendationId, actor);
  }

  async rejectRecommendation(recommendationId: string, actor: SeoAdminActor) {
    return this.recommendationService.rejectRecommendation(recommendationId, actor);
  }

  async applyInternalLinkSuggestion(id: string, actor: SeoAdminActor) {
    return this.internalLinkService.applyInternalLinkSuggestion(id, actor);
  }

  async publishContentBrief(id: string, actor: SeoAdminActor) {
    return this.contentPipelineService.publishContentBrief(id, actor);
  }
}
