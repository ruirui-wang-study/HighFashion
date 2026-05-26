import { ConfigService } from "@nestjs/config";
import { AiConfigService } from "../ai/ai-config.service";
import type { AiProviderKind, AiResolvedConfig } from "../ai/ai-config.types";
import { PrismaService } from "../common/prisma.service";

export type ProductResearchAiProviderKind = AiProviderKind;

export type ProductResearchAiConfig = {
  provider: ProductResearchAiProviderKind;
  baseUrl: string | null;
  candidateModel: string | null;
  scoringModel: string | null;
  copyModel: string | null;
  fastModel: string | null;
  apiKeyConfigured: boolean;
  apiKeySource: "env" | "none";
  fallbackProvider: "local";
};

export async function resolveProductResearchAiConfig(prisma: PrismaService, config: ConfigService): Promise<ProductResearchAiConfig> {
  const aiConfig = await new AiConfigService(prisma, config).resolve();
  return mapAiConfigToProductResearch(aiConfig);
}

export function mapAiConfigToProductResearch(aiConfig: AiResolvedConfig): ProductResearchAiConfig {
  return {
    provider: aiConfig.provider,
    baseUrl: aiConfig.baseUrl,
    candidateModel: aiConfig.models.productResearchCandidate,
    scoringModel: aiConfig.models.productResearchScoring,
    copyModel: aiConfig.models.productResearchCopy,
    fastModel: aiConfig.models.fast,
    apiKeyConfigured: aiConfig.apiKeyConfigured,
    apiKeySource: aiConfig.apiKeySource,
    fallbackProvider: aiConfig.fallbackProvider,
  };
}
