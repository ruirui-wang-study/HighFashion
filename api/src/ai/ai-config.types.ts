export type AiProviderKind = "local" | "openai" | "deepseek" | "mimo";

export type AiApiKeySource = "env" | "none";

export type AiModelSlot =
  | "seoCopy"
  | "productResearchCandidate"
  | "productResearchScoring"
  | "productResearchCopy"
  | "fast";

export type AiResolvedConfig = {
  provider: AiProviderKind;
  baseUrl: string | null;
  models: Record<AiModelSlot, string | null>;
  apiKeyConfigured: boolean;
  apiKeySource: AiApiKeySource;
  fallbackProvider: "local";
};
