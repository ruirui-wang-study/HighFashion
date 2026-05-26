import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AiConfigService } from "../ai/ai-config.service";
import { PrismaService } from "../common/prisma.service";
import { SeoAutomationController } from "./seo-automation.controller";
import { SeoAiRuntimeService } from "./seo-ai-runtime.service";
import { SeoAutomationService } from "./seo-automation.service";
import { SeoChangeLogService } from "./seo-change-log.service";
import { SeoContentPipelineService } from "./seo-content-pipeline.service";
import { SeoHealthService } from "./seo-health.service";
import { SeoInternalLinkService } from "./seo-internal-link.service";
import { SeoOpportunityService } from "./seo-opportunity.service";
import { SeoRecommendationService } from "./seo-recommendation.service";
import { SeoSyncService } from "./seo-sync.service";

@Module({
  controllers: [SeoAutomationController],
  providers: [
    SeoAutomationService,
    SeoAiRuntimeService,
    SeoOpportunityService,
    SeoContentPipelineService,
    SeoRecommendationService,
    SeoInternalLinkService,
    SeoHealthService,
    SeoSyncService,
    SeoChangeLogService,
    PrismaService,
    ConfigService,
    AiConfigService,
  ],
  exports: [SeoAutomationService],
})
export class SeoAutomationModule {}
