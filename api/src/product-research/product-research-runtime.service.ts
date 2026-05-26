import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../common/prisma.service";
import { DeepSeekProductResearchProvider } from "./deepseek-product-research.provider";
import { LocalProductResearchProvider } from "./local-product-research.provider";
import { MimoProductResearchProvider } from "./mimo-product-research.provider";
import { resolveProductResearchAiConfig } from "./product-research-ai-config";

@Injectable()
export class ProductResearchRuntimeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
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
    const aiConfig = await resolveProductResearchAiConfig(this.prisma, this.config);

    if (aiConfig.provider === "deepseek" && aiConfig.apiKeyConfigured && aiConfig.baseUrl && aiConfig.candidateModel) {
      try {
        return await this.deepSeekProvider.generateCandidates(input, {
          apiKey: this.config.get<string>("DEEPSEEK_API_KEY")!,
          baseUrl: aiConfig.baseUrl,
          model: aiConfig.candidateModel,
        });
      } catch {
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
      } catch {
        return this.localProvider.generateCandidates(input);
      }
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
