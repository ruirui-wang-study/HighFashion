import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AiConfigService } from "../ai/ai-config.service";
import type { AiProviderKind, AiResolvedConfig } from "../ai/ai-config.types";
import { completeLlmJson, parseLlmJsonPayload } from "../ai/llm-json-completion";
import type { ProductSeoDraft } from "./seo-automation.types";

type SeoAiStatus = {
  configuredProvider: string;
  effectiveProvider: string;
  fallbackProvider: "local";
  baseUrl: string | null;
  model: string | null;
  apiKeyConfigured: boolean;
};

@Injectable()
export class SeoAiRuntimeService {
  private readonly logger = new Logger(SeoAiRuntimeService.name);

  constructor(
    private readonly aiConfigService: AiConfigService,
    private readonly config: ConfigService = new ConfigService(),
  ) {}

  async getStatus(): Promise<SeoAiStatus> {
    const aiConfig = await this.aiConfigService.resolve();
    const model = this.resolveSeoCopyModel(aiConfig);
    const llm = this.resolveLlmEndpoints(aiConfig);

    return {
      configuredProvider: aiConfig.provider,
      effectiveProvider: this.canUseSeoCopy(aiConfig, model, llm) ? aiConfig.provider : aiConfig.fallbackProvider,
      fallbackProvider: aiConfig.fallbackProvider,
      baseUrl: llm.displayBaseUrl,
      model,
      apiKeyConfigured: aiConfig.apiKeyConfigured,
    };
  }

  async rewriteContentBrief(brief: {
    id: string;
    title: string;
    targetKeyword: string;
    outline: string[];
    relatedCollectionSlugs: string[];
  }) {
    const result = await this.completeJson<{
      title?: string;
      outline?: string[];
    }>({
      task: "rewrite_content_brief",
      systemPrompt:
        "You are an ecommerce SEO content strategist for a sports accessories DTC brand. Rewrite content briefs into clearer, buyer-first editorial plans. Return strict JSON only.",
      payload: {
        brand: "PulseGear",
        tone: ["professional", "concise", "performance-focused", "non-spammy"],
        constraints: [
          "Return strict JSON only.",
          "Keep the title concise and practical for editorial planning.",
          "Outline bullets should be specific, buyer-helpful, and SEO-aware.",
          "Do not invent unsupported claims, reviews, rankings, or medical language.",
        ],
        brief,
        outputSchema: {
          title: "string",
          outline: ["string"],
        },
      },
      maxTokens: 1800,
      temperature: 0.5,
    });

    return {
      title: asString(result?.title),
      outline: normalizeStringArray(result?.outline),
    };
  }

  async rewriteOpportunityDrafts(opportunities: Array<Record<string, unknown>>) {
    const result = await this.completeJson<{ items?: Array<Record<string, unknown>> }>({
      task: "rewrite_seo_opportunity_drafts",
      systemPrompt:
        "You are an ecommerce SEO assistant for a sports accessories DTC brand. Rewrite SEO opportunity actions into clearer, buyer-first optimization tasks. Return strict JSON only.",
      payload: {
        brand: "PulseGear",
        tone: ["professional", "concise", "performance-focused", "non-spammy"],
        constraints: [
          "Return strict JSON only.",
          "Keep expectedImpact to one of: High, Medium, Low.",
          "Do not use hype or guaranteed ranking claims.",
          "Suggested actions should be practical and buyer-first.",
        ],
        opportunities,
        outputSchema: {
          items: [
            {
              id: "string",
              suggestedAction: "string",
              expectedImpact: "High|Medium|Low",
            },
          ],
        },
      },
      maxTokens: 1800,
      temperature: 0.5,
    });

    return Array.isArray(result?.items) ? result.items : [];
  }

  async rewriteRecommendationDrafts(input: {
    product: Record<string, unknown>;
    recommendations: Array<Record<string, unknown>>;
  }) {
    const result = await this.completeJson<{ items?: Array<Record<string, unknown>> }>({
      task: "rewrite_seo_recommendation_drafts",
      systemPrompt:
        "You are an ecommerce SEO assistant for a sports accessories DTC brand. Rewrite recommendation drafts into stronger buyer-first SEO copy. Return strict JSON only.",
      payload: {
        brand: "PulseGear",
        tone: ["professional", "concise", "performance-focused", "non-spammy"],
        constraints: [
          "Return strict JSON only.",
          "Do not mention fake reviews, ratings, stock, shipping promises, or medical claims.",
          "Keep titles within 70 characters when possible.",
          "Keep meta descriptions within 160 characters when possible.",
        ],
        product: input.product,
        recommendations: input.recommendations,
        outputSchema: {
          items: [
            {
              id: "string",
              reason: "string",
              draftPayload: {
                seoTitle: "string?",
                seoDescription: "string?",
                suggestedGuideTitle: "string?",
                targetKeyword: "string?",
              },
            },
          ],
        },
      },
      maxTokens: 2200,
      temperature: 0.5,
    });

    return Array.isArray(result?.items) ? result.items : [];
  }

  async rewriteInternalLinkDrafts(suggestions: Array<Record<string, unknown>>) {
    const result = await this.completeJson<{ items?: Array<Record<string, unknown>> }>({
      task: "rewrite_internal_link_suggestions",
      systemPrompt:
        "You are an ecommerce SEO assistant for a sports accessories DTC brand. Rewrite internal link anchors and reasons into natural, buyer-first SEO suggestions. Return strict JSON only.",
      payload: {
        brand: "PulseGear",
        tone: ["professional", "concise", "performance-focused", "non-spammy"],
        constraints: [
          "Return strict JSON only.",
          "Do not use spammy anchors or exact-match over-optimization.",
          "Keep anchors natural and buyer-helpful.",
          "Do not invent medical claims or unsupported performance claims.",
        ],
        suggestions,
        outputSchema: {
          items: [
            {
              id: "string",
              anchorText: "string",
              reason: "string",
            },
          ],
        },
      },
      maxTokens: 1800,
      temperature: 0.5,
    });

    return Array.isArray(result?.items) ? result.items : [];
  }

  async rewriteProductSeoDraft(input: {
    product: Record<string, unknown>;
    currentDraft: Pick<ProductSeoDraft, "seoTitle" | "seoDescription" | "productFaq">;
  }) {
    const result = await this.completeJson<{
      seoTitle?: string;
      seoDescription?: string;
      productFaq?: Array<Record<string, unknown>>;
    }>({
      task: "rewrite_product_seo_draft",
      systemPrompt:
        "You are an ecommerce SEO assistant for a sports accessories DTC brand. Rewrite product SEO drafts into clearer, buyer-first metadata and FAQ copy. Return strict JSON only.",
      payload: {
        brand: "PulseGear",
        tone: ["professional", "concise", "performance-focused", "non-spammy"],
        constraints: [
          "Return strict JSON only.",
          "Do not invent ratings, reviews, stock, shipping promises, or medical claims.",
          "Keep title within 70 characters when possible.",
          "Keep meta description within 160 characters when possible.",
          "FAQ answers should be factual and buyer-helpful.",
        ],
        product: input.product,
        currentDraft: input.currentDraft,
        outputSchema: {
          seoTitle: "string",
          seoDescription: "string",
          productFaq: [
            {
              question: "string",
              answer: "string",
            },
          ],
        },
      },
      maxTokens: 1800,
      temperature: 0.5,
    });

    return {
      seoTitle: asString(result?.seoTitle),
      seoDescription: asString(result?.seoDescription),
      productFaq: normalizeFaqArray(result?.productFaq),
    };
  }

  private async completeJson<T>(input: {
    task: string;
    systemPrompt: string;
    payload: Record<string, unknown>;
    maxTokens: number;
    temperature: number;
  }): Promise<T | null> {
    const aiConfig = await this.aiConfigService.resolve();
    const model = this.resolveSeoCopyModel(aiConfig);
    const llm = this.resolveLlmEndpoints(aiConfig);

    if (!this.canUseSeoCopy(aiConfig, model, llm)) {
      return null;
    }

    const apiKey = this.aiConfigService.getApiKey(aiConfig.provider);
    if (!apiKey || !model) {
      return null;
    }

    const userPrompt = JSON.stringify({
      task: input.task,
      ...input.payload,
    });

    try {
      const result = await completeLlmJson({
        provider: aiConfig.provider as Exclude<AiProviderKind, "local">,
        apiKey,
        model,
        systemPrompt: input.systemPrompt,
        userPrompt,
        maxTokens: input.maxTokens,
        temperature: input.temperature,
        anthropicBaseUrl: llm.anthropicBaseUrl,
        openAiBaseUrl: llm.openAiBaseUrl,
      });

      if (!result || result.truncated) {
        if (result?.truncated) {
          this.logger.warn(`SEO AI JSON truncated for task ${input.task}`);
        }
        return null;
      }

      const parsed = parseLlmJsonPayload(result.rawContent);
      if (!parsed) {
        this.logger.warn(`SEO AI JSON parse failed for task ${input.task}`);
        return null;
      }

      return parsed as T;
    } catch (error) {
      this.logger.warn(
        `SEO AI request failed for task ${input.task} (${error instanceof Error ? error.message : "unknown error"})`,
      );
      return null;
    }
  }

  private resolveSeoCopyModel(aiConfig: AiResolvedConfig) {
    return aiConfig.models.seoCopy ?? aiConfig.models.productResearchCopy ?? aiConfig.models.productResearchScoring ?? aiConfig.models.productResearchCandidate;
  }

  private resolveLlmEndpoints(aiConfig: AiResolvedConfig) {
    const anthropicBaseUrl =
      aiConfig.provider === "mimo" ? this.config.get<string>("MIMO_ANTHROPIC_BASE_URL")?.trim() || null : null;

    const openAiBaseUrl =
      aiConfig.provider === "mimo" && anthropicBaseUrl
        ? this.config.get<string>("MIMO_BASE_URL")?.trim() || null
        : aiConfig.baseUrl;

    return {
      anthropicBaseUrl,
      openAiBaseUrl: anthropicBaseUrl ? openAiBaseUrl : aiConfig.baseUrl,
      displayBaseUrl: anthropicBaseUrl ?? aiConfig.baseUrl,
    };
  }

  private canUseSeoCopy(
    aiConfig: AiResolvedConfig,
    model: string | null,
    llm: ReturnType<SeoAiRuntimeService["resolveLlmEndpoints"]>,
  ) {
    if (!aiConfig.apiKeyConfigured || !model) {
      return false;
    }

    if (aiConfig.provider === "deepseek") {
      return Boolean(llm.openAiBaseUrl);
    }

    if (aiConfig.provider === "mimo") {
      return Boolean(llm.anthropicBaseUrl || llm.openAiBaseUrl);
    }

    return false;
  }
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim())
    : [];
}

function normalizeFaqArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const question = asString(record.question);
      const answer = asString(record.answer);
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((item): item is { question: string; answer: string } => Boolean(item));
}
