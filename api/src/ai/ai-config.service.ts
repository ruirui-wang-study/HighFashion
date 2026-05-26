import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../common/prisma.service";
import type { AiModelSlot, AiProviderKind, AiResolvedConfig } from "./ai-config.types";

const AI_SETTING_KEYS = {
  provider: ["ai.provider", "product_research.ai.provider"],
  baseUrl: ["ai.base_url", "product_research.ai.base_url"],
  seoCopy: ["ai.model.seo_copy"],
  productResearchCandidate: ["ai.model.product_research_candidate", "product_research.ai.model_candidate_generation"],
  productResearchScoring: ["ai.model.product_research_scoring", "product_research.ai.model_scoring"],
  productResearchCopy: ["ai.model.product_research_copy", "product_research.ai.model_copy"],
  fast: ["ai.model.fast", "product_research.ai.model_fast"],
} as const;

const PROVIDER_ENV_MAP: Record<
  Exclude<AiProviderKind, "local">,
  {
    apiKey: string;
    baseUrl?: string;
    candidateModel?: string;
    scoringModel?: string;
    copyModel?: string;
    seoCopyModel?: string;
    fastModel?: string;
  }
> = {
  openai: {
    apiKey: "OPENAI_API_KEY",
    candidateModel: "OPENAI_MODEL_CANDIDATE_GENERATION",
    scoringModel: "OPENAI_MODEL_SCORING",
    copyModel: "OPENAI_MODEL_COPY",
    seoCopyModel: "OPENAI_MODEL_SEO_COPY",
    fastModel: "OPENAI_MODEL_FAST",
  },
  deepseek: {
    apiKey: "DEEPSEEK_API_KEY",
    baseUrl: "DEEPSEEK_BASE_URL",
    candidateModel: "DEEPSEEK_MODEL_CANDIDATE_GENERATION",
    scoringModel: "DEEPSEEK_MODEL_SCORING",
    copyModel: "DEEPSEEK_MODEL_COPY",
    seoCopyModel: "DEEPSEEK_MODEL_SEO_COPY",
    fastModel: "DEEPSEEK_MODEL_FAST",
  },
  mimo: {
    apiKey: "MIMO_API_KEY",
    baseUrl: "MIMO_BASE_URL",
    candidateModel: "MIMO_MODEL_CANDIDATE_GENERATION",
    scoringModel: "MIMO_MODEL_SCORING",
    copyModel: "MIMO_MODEL_COPY",
    seoCopyModel: "MIMO_MODEL_SEO_COPY",
    fastModel: "MIMO_MODEL_FAST",
  },
};

@Injectable()
export class AiConfigService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService = new ConfigService(),
  ) {}

  async resolve(): Promise<AiResolvedConfig> {
    const settings = await this.prisma.siteSetting.findMany({
      where: {
        key: {
          in: Object.values(AI_SETTING_KEYS).flat(),
        },
      },
    });
    const settingMap = new Map(settings.map((item) => [item.key, item.value]));
    const provider = normalizeProvider(
      firstNonEmpty([
        ...AI_SETTING_KEYS.provider.map((key) => settingMap.get(key)),
        this.config.get<string>("AI_PROVIDER"),
        this.config.get<string>("PRODUCT_RESEARCH_AI_PROVIDER"),
      ]),
    );

    if (provider === "local") {
      return {
        provider: "local",
        baseUrl: null,
        models: {
          seoCopy: null,
          productResearchCandidate: null,
          productResearchScoring: null,
          productResearchCopy: null,
          fast: null,
        },
        apiKeyConfigured: false,
        apiKeySource: "none",
        fallbackProvider: "local",
      };
    }

    const envMap = PROVIDER_ENV_MAP[provider];
    const apiKey = this.config.get<string>(envMap.apiKey) ?? null;

    return {
      provider,
      baseUrl:
        firstNonEmpty([
          ...AI_SETTING_KEYS.baseUrl.map((key) => settingMap.get(key)),
          this.config.get<string>("AI_BASE_URL"),
          envMap.baseUrl ? this.config.get<string>(envMap.baseUrl) : null,
        ]) ?? null,
      models: {
        seoCopy: this.resolveModel(settingMap, "seoCopy", provider),
        productResearchCandidate: this.resolveModel(settingMap, "productResearchCandidate", provider),
        productResearchScoring: this.resolveModel(settingMap, "productResearchScoring", provider),
        productResearchCopy: this.resolveModel(settingMap, "productResearchCopy", provider),
        fast: this.resolveModel(settingMap, "fast", provider),
      },
      apiKeyConfigured: Boolean(apiKey),
      apiKeySource: apiKey ? "env" : "none",
      fallbackProvider: "local",
    };
  }

  getApiKey(provider: AiProviderKind): string | null {
    if (provider === "local") return null;
    return this.config.get<string>(PROVIDER_ENV_MAP[provider].apiKey) ?? null;
  }

  private resolveModel(settingMap: Map<string, unknown>, slot: AiModelSlot, provider: Exclude<AiProviderKind, "local">) {
    const envMap = PROVIDER_ENV_MAP[provider];
    const envValue = (() => {
      switch (slot) {
        case "seoCopy":
          return this.config.get<string>("AI_MODEL_SEO_COPY") ?? (envMap.seoCopyModel ? this.config.get<string>(envMap.seoCopyModel) : null);
        case "productResearchCandidate":
          return this.config.get<string>("AI_MODEL_PRODUCT_RESEARCH_CANDIDATE") ?? (envMap.candidateModel ? this.config.get<string>(envMap.candidateModel) : null);
        case "productResearchScoring":
          return this.config.get<string>("AI_MODEL_PRODUCT_RESEARCH_SCORING") ?? (envMap.scoringModel ? this.config.get<string>(envMap.scoringModel) : null);
        case "productResearchCopy":
          return this.config.get<string>("AI_MODEL_PRODUCT_RESEARCH_COPY") ?? (envMap.copyModel ? this.config.get<string>(envMap.copyModel) : null);
        case "fast":
          return this.config.get<string>("AI_MODEL_FAST") ?? (envMap.fastModel ? this.config.get<string>(envMap.fastModel) : null);
      }
    })();

    return (
      firstNonEmpty([
        ...AI_SETTING_KEYS[slot].map((key) => settingMap.get(key)),
        envValue,
      ]) ?? null
    );
  }
}

function normalizeProvider(value?: string | null): AiProviderKind {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "openai" || normalized === "deepseek" || normalized === "mimo" || normalized === "local") {
    return normalized;
  }
  return "local";
}

function firstNonEmpty(values: Array<unknown>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}
