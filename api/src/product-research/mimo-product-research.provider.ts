import { Injectable } from "@nestjs/common";
import { completeLlmJson, parseLlmJsonPayload } from "../ai/llm-json-completion";
import type { CandidateImportDraft } from "./product-research.provider";

type MimoGenerateInput = {
  brandDirection?: string;
  targetMarket?: string;
  excludedCategories?: string[];
  count: number;
};

type MimoProviderConfig = {
  apiKey: string;
  model: string;
  /** OpenAI-compatible root, e.g. https://api.xiaomimimo.com/v1 */
  baseUrl?: string;
  /** Anthropic-compatible root, e.g. https://token-plan-cn.xiaomimimo.com/anthropic */
  anthropicBaseUrl?: string;
};

@Injectable()
export class MimoProductResearchProvider {
  async generateCandidates(input: MimoGenerateInput, config: MimoProviderConfig): Promise<CandidateImportDraft[]> {
    const userPrompt = buildUserPrompt(input);
    const systemPrompt =
      "You are a product research assistant for a sports accessories DTC brand focused on US and UK markets. Return strict JSON only.";

    const result = await completeLlmJson({
      provider: "mimo",
      apiKey: config.apiKey,
      model: config.model,
      systemPrompt,
      userPrompt,
      maxTokens: 1800,
      temperature: 0.7,
      anthropicBaseUrl: config.anthropicBaseUrl,
      openAiBaseUrl: config.baseUrl,
    });

    if (!result?.rawContent) {
      throw new Error("MiMo request returned no content");
    }

    const parsed = parseLlmJsonPayload(result.rawContent) as Record<string, unknown> | null;
    const items = Array.isArray(parsed?.items) ? parsed.items : [];
    return items.slice(0, input.count).map((item, index) => normalizeMimoCandidate(item, input, index));
  }
}

function buildUserPrompt(input: MimoGenerateInput) {
  return JSON.stringify({
    task: "generate_product_candidates",
    constraints: {
      brandDirection: input.brandDirection ?? "performance utility",
      targetMarket: input.targetMarket ?? "US",
      excludedCategories: input.excludedCategories ?? [],
      count: input.count,
    },
    outputSchema: {
      items: [
        {
          productName: "string",
          category: "string",
          targetAudience: "string",
          useCase: "string",
          description: "string",
          brandAngle: "string",
          positioningSummary: "string",
          alibabaKeywords: "string",
          seoTitleDraft: "string",
          seoDescriptionDraft: "string",
          features: ["string"],
          benefits: ["string"],
        },
      ],
    },
    rules: [
      "Only propose sports accessories and adjacent low-risk products.",
      "Avoid medical treatment, supplements, electronics, heated products, replica products, and unsafe categories.",
      "Keep output concise and commercially realistic for US and UK DTC testing.",
    ],
  });
}

function normalizeMimoCandidate(item: unknown, input: MimoGenerateInput, index: number): CandidateImportDraft {
  const record = item && typeof item === "object" && !Array.isArray(item) ? (item as Record<string, unknown>) : {};
  const productName = asString(record.productName) ?? `MiMo Candidate ${index + 1}`;
  const targetMarket = input.targetMarket?.trim() || "US";
  const description = asString(record.description) ?? "AI-generated candidate pending review.";
  return {
    productName,
    slugSuggestion: productName,
    category: asString(record.category) ?? "training-accessories",
    targetMarket,
    targetAudience: asString(record.targetAudience),
    useCase: asString(record.useCase),
    description,
    brandAngle: asString(record.brandAngle),
    positioningSummary: asString(record.positioningSummary),
    alibabaKeywords: asString(record.alibabaKeywords),
    source: "AI_GENERATED",
    aiDraftPayload: {
      seoTitle: asString(record.seoTitleDraft) ?? `${productName} | PulseGear`,
      seoDescription: asString(record.seoDescriptionDraft) ?? description,
      features: asStringArray(record.features),
      benefits: asStringArray(record.benefits),
      provider: "mimo",
    },
    duplicateHints: [],
    riskWarnings: [],
  };
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim())
    : [];
}
