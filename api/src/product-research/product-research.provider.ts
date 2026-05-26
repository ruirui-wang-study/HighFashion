import type { Prisma } from "@prisma/client";

export type CandidateImportDraft = {
  productName: string;
  chineseName?: string | null;
  slugSuggestion?: string | null;
  category: string;
  targetMarket: string;
  targetAudience?: string | null;
  useCase?: string | null;
  description?: string | null;
  notes?: string | null;
  brandAngle?: string | null;
  positioningSummary?: string | null;
  alibabaKeywords?: string | null;
  sourceUrl?: string | null;
  source: "MANUAL" | "AI_GENERATED" | "CSV" | "ALIBABA_LINK" | "SUPPLIER_QUOTE";
  rawImportData?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | null;
  aiDraftPayload?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | null;
  duplicateHints?: string[];
  riskWarnings?: string[];
};

export type ProductResearchSignalDraft = {
  source: "GOOGLE_TRENDS" | "GSC" | "GA4" | "AMAZON" | "ETSY" | "TIKTOK" | "ALIBABA" | "MANUAL";
  metricName: string;
  metricValue: number;
  rawData?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | null;
};

export abstract class ProductResearchProvider {
  abstract generateCandidates(input: {
    brandDirection?: string;
    targetMarket?: string;
    excludedCategories?: string[];
    count: number;
  }): Promise<CandidateImportDraft[]>;

  abstract enrichAlibabaLinks(input: { links: string[]; notes?: string | null }): Promise<CandidateImportDraft[]>;

  abstract collectSignals(input: {
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
  }): Promise<ProductResearchSignalDraft[]>;
}
