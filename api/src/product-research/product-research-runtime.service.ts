import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AiConfigService } from "../ai/ai-config.service";
import { DeepSeekProductResearchProvider } from "./deepseek-product-research.provider";
import { LocalProductResearchProvider } from "./local-product-research.provider";
import { MimoProductResearchProvider } from "./mimo-product-research.provider";
import { mapAiConfigToProductResearch } from "./product-research-ai-config";

@Injectable()
export class ProductResearchRuntimeService {
  private readonly logger = new Logger(ProductResearchRuntimeService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly aiConfigService: AiConfigService,
    private readonly localProvider: LocalProductResearchProvider,
    private readonly deepSeekProvider: DeepSeekProductResearchProvider,
    private readonly mimoProvider: MimoProductResearchProvider,
  ) {}

  async generateCandidates(input: {
    brandDirection?: string;
    targetMarket?: string;
    excludedCategories?: string[];
    count: number;
  }) {
    const aiConfig = mapAiConfigToProductResearch(await this.aiConfigService.resolve());

    if (aiConfig.provider === "deepseek" && aiConfig.apiKeyConfigured && aiConfig.baseUrl && aiConfig.candidateModel) {
      try {
        return await this.deepSeekProvider.generateCandidates(input, {
          apiKey: this.config.get<string>("DEEPSEEK_API_KEY")!,
          baseUrl: aiConfig.baseUrl,
          model: aiConfig.candidateModel,
        });
      } catch (error) {
        this.logger.warn(
          `DeepSeek candidate generation failed; using local fallback (${error instanceof Error ? error.message : "unknown error"})`,
        );
        return this.localProvider.generateCandidates(input);
      }
    }

    if (aiConfig.provider === "mimo" && aiConfig.apiKeyConfigured && aiConfig.baseUrl && aiConfig.candidateModel) {
      try {
        return await this.mimoProvider.generateCandidates(input, {
          apiKey: this.config.get<string>("MIMO_API_KEY")!,
          baseUrl: aiConfig.baseUrl,
          model: aiConfig.candidateModel,
        });
      } catch (error) {
        this.logger.warn(
          `MiMo candidate generation failed; using local fallback (${error instanceof Error ? error.message : "unknown error"})`,
        );
        return this.localProvider.generateCandidates(input);
      }
    }

    if (aiConfig.provider !== "local" && aiConfig.apiKeyConfigured) {
      this.logger.warn(`AI provider "${aiConfig.provider}" is not fully configured; using local fallback`);
    }

    return this.localProvider.generateCandidates(input);
  }

  enrichAlibabaLinks(input: { links: string[]; notes?: string | null }) {
    return this.localProvider.enrichAlibabaLinks(input);
  }

  collectSignals(input: {
    candidate: {
      productName: string;
      category: string;
      targetMarket: string;
      targetAudience?: string | null;
      useCase?: string | null;
      description?: string | null;
      notes?: string | null;
      alibabaKeywords?: string | null;
    };
  }) {
    return this.localProvider.collectSignals(input);
  }
}
