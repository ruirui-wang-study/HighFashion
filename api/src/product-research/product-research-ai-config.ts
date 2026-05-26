import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../common/prisma.service";

export type ProductResearchAiProviderKind = "local" | "openai" | "deepseek" | "mimo";

export type ProductResearchAiConfig = {
  provider: ProductResearchAiProviderKind;
  baseUrl: string | null;
  candidateModel: string | null;
  scoringModel: string | null;
  copyModel: string | null;
  fastModel: string | null;
  apiKeyConfigured: boolean;
  apiKeySource: "settings" | "env" | "none";
  fallbackProvider: "local";
};

const AI_SETTING_KEYS = {
  provider: "product_research.ai.provider",
  baseUrl: "product_research.ai.base_url",
  candidateModel: "product_research.ai.model_candidate_generation",
  scoringModel: "product_research.ai.model_scoring",
  copyModel: "product_research.ai.model_copy",
  fastModel: "product_research.ai.model_fast",
} as const;

const providerEnvMap: Record<Exclude<ProductResearchAiProviderKind, "local">, { apiKey: string; baseUrl?: string; candidateModel?: string; scoringModel?: string; copyModel?: string; fastModel?: string }> = {
  openai: {
    apiKey: "OPENAI_API_KEY",
    candidateModel: "OPENAI_MODEL_CANDIDATE_GENERATION",
    scoringModel: "OPENAI_MODEL_SCORING",
    copyModel: "OPENAI_MODEL_COPY",
  },
  deepseek: {
    apiKey: "DEEPSEEK_API_KEY",
    baseUrl: "DEEPSEEK_BASE_URL",
    candidateModel: "DEEPSEEK_MODEL_CANDIDATE_GENERATION",
    scoringModel: "DEEPSEEK_MODEL_SCORING",
    copyModel: "DEEPSEEK_MODEL_COPY",
    fastModel: "DEEPSEEK_MODEL_FAST",
  },
  mimo: {
    apiKey: "MIMO_API_KEY",
    baseUrl: "MIMO_BASE_URL",
    candidateModel: "MIMO_MODEL_CANDIDATE_GENERATION",
    scoringModel: "MIMO_MODEL_SCORING",
    copyModel: "MIMO_MODEL_COPY",
    fastModel: "MIMO_MODEL_FAST",
  },
};

export async function resolveProductResearchAiConfig(prisma: PrismaService, config: ConfigService): Promise<ProductResearchAiConfig> {
  const settings = await prisma.siteSetting.findMany({
    where: {
      key: {
        in: Object.values(AI_SETTING_KEYS),
      },
    },
  });
  const settingMap = new Map(settings.map((item) => [item.key, item.value]));

  const requestedProvider = normalizeProvider((settingMap.get(AI_SETTING_KEYS.provider) as string | null | undefined) ?? config.get<string>("PRODUCT_RESEARCH_AI_PROVIDER"));
  if (requestedProvider === "local") {
    return {
      provider: "local",
      baseUrl: null,
      candidateModel: null,
      scoringModel: null,
      copyModel: null,
      fastModel: null,
      apiKeyConfigured: false,
      apiKeySource: "none",
      fallbackProvider: "local",
    };
  }

  const envMap = providerEnvMap[requestedProvider];
  const configuredApiKey = config.get<string>(envMap.apiKey) ?? null;
  const apiKeySource: ProductResearchAiConfig["apiKeySource"] = config.get<string>(envMap.apiKey) ? "env" : "none";

  return {
    provider: requestedProvider,
    baseUrl: asNonEmptyString(settingMap.get(AI_SETTING_KEYS.baseUrl)) ?? (envMap.baseUrl ? config.get<string>(envMap.baseUrl) ?? null : null),
    candidateModel: asNonEmptyString(settingMap.get(AI_SETTING_KEYS.candidateModel)) ?? (envMap.candidateModel ? config.get<string>(envMap.candidateModel) ?? null : null),
    scoringModel: asNonEmptyString(settingMap.get(AI_SETTING_KEYS.scoringModel)) ?? (envMap.scoringModel ? config.get<string>(envMap.scoringModel) ?? null : null),
    copyModel: asNonEmptyString(settingMap.get(AI_SETTING_KEYS.copyModel)) ?? (envMap.copyModel ? config.get<string>(envMap.copyModel) ?? null : null),
    fastModel: asNonEmptyString(settingMap.get(AI_SETTING_KEYS.fastModel)) ?? (envMap.fastModel ? config.get<string>(envMap.fastModel) ?? null : null),
    apiKeyConfigured: Boolean(configuredApiKey),
    apiKeySource,
    fallbackProvider: "local",
  };
}

function normalizeProvider(value?: string | null): ProductResearchAiProviderKind {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "openai" || normalized === "deepseek" || normalized === "mimo" || normalized === "local") {
    return normalized;
  }
  return "local";
}

function asNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
