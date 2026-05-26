import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AiConfigService } from "../ai/ai-config.service";
import type { AiResolvedConfig } from "../ai/ai-config.types";
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
  constructor(
    private readonly aiConfigService: AiConfigService,
    private readonly config: ConfigService = new ConfigService(),
  ) {}

  async getStatus(): Promise<SeoAiStatus> {
    const aiConfig = await this.aiConfigService.resolve();
    const model = this.resolveSeoCopyModel(aiConfig);

    return {
      configuredProvider: aiConfig.provider,
      effectiveProvider: this.canUseSeoCopy(aiConfig, model) ? aiConfig.provider : aiConfig.fallbackProvider,
      fallbackProvider: aiConfig.fallbackProvider,
      baseUrl: aiConfig.baseUrl,
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
    if (!this.canUseSeoCopy(aiConfig, model)) {
      return null;
    }

    const apiKey = this.aiConfigService.getApiKey(aiConfig.provider);
    if (!apiKey) {
      return null;
    }

    const prompt = JSON.stringify({
      task: input.task,
      ...input.payload,
    });

    try {
      const response = await fetch(`${aiConfig.baseUrl!.replace(/\/+$/, "")}/chat/completions`, {
        method: "POST",
        headers: this.buildHeaders(aiConfig.provider, apiKey),
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: input.systemPrompt },
            { role: "user", content: prompt },
          ],
          thinking: { type: "disabled" },
          max_tokens: input.maxTokens,
          temperature: input.temperature,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string | null }; finish_reason?: string | null }>;
      };
      const rawContent = payload.choices?.[0]?.message?.content ?? "";
      const finishReason = payload.choices?.[0]?.finish_reason ?? null;
      const parsed = parseAiJsonPayload(rawContent);
      if (finishReason === "length" || !parsed) {
        return null;
      }

      return parsed as T;
    } catch {
      return null;
    }
  }

  private resolveSeoCopyModel(aiConfig: AiResolvedConfig) {
    return aiConfig.models.seoCopy ?? aiConfig.models.productResearchCopy ?? aiConfig.models.productResearchScoring ?? aiConfig.models.productResearchCandidate;
  }

  private canUseSeoCopy(aiConfig: AiResolvedConfig, model: string | null) {
    return aiConfig.provider === "deepseek" && aiConfig.apiKeyConfigured && Boolean(aiConfig.baseUrl) && Boolean(model);
  }

  private buildHeaders(provider: AiResolvedConfig["provider"], apiKey: string): Record<string, string> {
    if (provider === "mimo") {
      return {
        "Content-Type": "application/json",
        "api-key": apiKey,
      };
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };
  }
}

function parseAiJsonPayload(raw: string) {
  if (!raw) return null;
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (!fenceMatch) return null;
    try {
      return JSON.parse(fenceMatch[1]?.trim() ?? "");
    } catch {
      return null;
    }
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
