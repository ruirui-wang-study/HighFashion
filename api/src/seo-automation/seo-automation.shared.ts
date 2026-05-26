import type { ContentBriefItem, InternalLinkSuggestionItem, SeoRecommendationItem } from "./seo-automation.types";
import { recommendationDrafts } from "./seo-automation.drafts";

export type SeoAdminActor = {
  adminId: string;
  adminEmail: string;
};

export function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function asString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export function normalizeExpectedImpact(value: unknown) {
  const normalized = asString(value);
  if (!normalized) return null;
  const lower = normalized.toLowerCase();
  if (lower === "high") return "High";
  if (lower === "medium") return "Medium";
  if (lower === "low") return "Low";
  return null;
}

export function mapRecommendation(row: Record<string, unknown>): SeoRecommendationItem {
  return {
    id: String(row.id),
    recommendationType: String(row.recommendationType),
    resourceType: String(row.resourceType),
    resourceId: row.resourceId ? String(row.resourceId) : null,
    pageUrl: recommendationDrafts.find((item) => item.id === row.id)?.pageUrl ?? null,
    reason: String(row.reason),
    priority: String(row.priority),
    status: String(row.status) as SeoRecommendationItem["status"],
    isAiDraft: Boolean(row.isAiDraft),
    draftPayload: (row.draftPayload as Record<string, unknown>) ?? {},
  };
}

export function mapContentBrief(row: Record<string, unknown>): ContentBriefItem {
  return {
    id: String(row.id),
    sourceOpportunityId: row.sourceOpportunityId ? String(row.sourceOpportunityId) : null,
    title: String(row.title),
    targetKeyword: String(row.targetKeyword),
    outline: Array.isArray(row.outline) ? row.outline.map((item) => String(item)) : [],
    draftContent: row.draftContent ? String(row.draftContent) : null,
    relatedProductIds: Array.isArray(row.relatedProductIds) ? row.relatedProductIds.map((item) => String(item)) : [],
    relatedCollectionSlugs: Array.isArray(row.relatedCollectionSlugs) ? row.relatedCollectionSlugs.map((item) => String(item)) : [],
    status: String(row.status) as ContentBriefItem["status"],
  };
}

export function mapInternalLinkSuggestion(row: Record<string, unknown>): InternalLinkSuggestionItem {
  return {
    id: String(row.id),
    sourcePage: String(row.sourcePage),
    targetPage: String(row.targetPage),
    anchorText: String(row.anchorText),
    reason: String(row.reason),
    priority: String(row.priority),
    status: String(row.status) as InternalLinkSuggestionItem["status"],
  };
}
