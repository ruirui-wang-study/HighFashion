import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AiConfigService } from "../ai/ai-config.service";
import { PrismaService } from "../common/prisma.service";
import { DeepSeekProductResearchProvider } from "./deepseek-product-research.provider";
import { LocalProductResearchProvider } from "./local-product-research.provider";
import { MimoProductResearchProvider } from "./mimo-product-research.provider";
import { ProductResearchAssessmentService } from "./product-research-assessment.service";
import { ProductResearchCandidateService } from "./product-research-candidate.service";
import { ProductResearchController } from "./product-research.controller";
import { ProductResearchImportService } from "./product-research-import.service";
import { ProductResearchRuntimeService } from "./product-research-runtime.service";
import { ProductResearchService } from "./product-research.service";
import { ProductResearchWorkflowService } from "./product-research-workflow.service";

@Module({
  controllers: [ProductResearchController],
  providers: [
    ProductResearchService,
    ProductResearchCandidateService,
    ProductResearchImportService,
    ProductResearchAssessmentService,
    ProductResearchWorkflowService,
    ProductResearchRuntimeService,
    PrismaService,
    ConfigService,
    AiConfigService,
    LocalProductResearchProvider,
    DeepSeekProductResearchProvider,
    MimoProductResearchProvider,
  ],
  exports: [ProductResearchService],
})
export class ProductResearchModule {}
