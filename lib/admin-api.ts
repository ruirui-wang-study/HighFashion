import type { AdminDashboardAnalytics, AdminFunnelAnalytics, AdminProductAnalytics, AdminSalesAnalytics, AnalyticsRangeDays } from "./admin-analytics-types";
import type { AdminCollectionLanding, AdminCollectionLandingPayload, AdminFaq, AdminFaqPayload, AdminGuide, AdminGuidePayload, AdminStaticPage, AdminStaticPagePayload } from "./admin-content-types";
import type { AdminMerchantFeedExport, AdminMerchantFeedOverview } from "./admin-marketing-types";
import type {
  CommerceQuoteSimulation,
  CommerceRuleSetSummary,
  CommerceRuleSetValidationResult,
  UpsertCommerceRuleSetPayload,
} from "./admin-commerce-rules-types";
import type { AdminOrderDetail, AdminOrderListItem } from "./admin-orders-types";
import type { AdminCopyConfig, AdminSettings, AdminSettingsInput } from "./admin-settings-types";
import type { AdminSeoOverview, AdminSeoPages, AdminSeoQueries, SearchConsoleRangeDays } from "./admin-seo-types";
import type {
  ContentBriefItem,
  ContentOpportunityItem,
  Ga4SyncResult,
  InternalLinkSuggestionItem,
  ProductSeoDraft,
  SeoAutomationOverview,
  SeoChangeLogPage,
  SeoIssueItem,
  SeoRecommendationItem,
  SearchConsoleSyncResult,
} from "./seo-automation-types";
import type { AdminInventoryItem, AdminProduct, AdminProductPayload } from "./admin-types";
import { adminOpenApiFetch } from "./admin-openapi-client";
import type {
  ProductResearchAssessmentRuntime,
  ProductResearchCandidateDetail,
  ProductResearchCandidateScore,
  ProductResearchCandidateSignal,
  ProductResearchHistoryPage,
  ProductResearchCandidateListResponse,
  ProductResearchRiskReviewItem,
  ProductResearchDashboard,
  ProductResearchDecisionListItem,
  ProductResearchImportBatch,
  ProductResearchImportPreview,
  ProductResearchScoringRule,
  ProductResearchScoringRuleActivationResult,
  ProductResearchSupplier,
  ProductResearchTestLaunch,
} from "./product-research-types";
import type { GeoDashboardSummary, GeoPrompt, GeoRecommendation, GeoTestRun } from "./admin-geo-types";

type ApiResponse<T> = { success: true; data: T } | { success: false; error: { code: string; message: string } };

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

async function adminApiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const requestId = (typeof crypto !== "undefined" && "randomUUID" in crypto) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-request-id": requestId,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !body.success) {
    const message = body.success ? "Admin API request failed" : body.error.message;
    throw new Error(message);
  }
  return body.data;
}

function toQueryString(query: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const suffix = params.toString();
  return suffix ? `?${suffix}` : "";
}

export function getAdminProducts(query: { search?: string; status?: string; category?: string; stock?: string } = {}) {
  return adminApiFetch<AdminProduct[]>(`/api/admin/products${toQueryString(query)}`);
}

export function getAdminProduct(id: string) {
  return adminApiFetch<AdminProduct>(`/api/admin/products/${id}`);
}

export function createAdminProduct(payload: AdminProductPayload) {
  return adminApiFetch<AdminProduct>("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminProduct(id: string, payload: AdminProductPayload) {
  return adminApiFetch<AdminProduct>(`/api/admin/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getAdminInventory(query: { search?: string; productId?: string; category?: string; stock?: string } = {}) {
  return adminApiFetch<AdminInventoryItem[]>(`/api/admin/inventory${toQueryString(query)}`);
}

export function adjustAdminInventory(payload: { variantId: string; quantityDelta: number; reason: string }) {
  return adminApiFetch<AdminInventoryItem>("/api/admin/inventory/adjustments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAdminDashboardAnalytics(days: AnalyticsRangeDays = 7) {
  return adminApiFetch<AdminDashboardAnalytics>(`/api/admin/analytics/dashboard${toQueryString({ days: String(days) })}`);
}

export function getAdminSalesAnalytics(days: AnalyticsRangeDays = 7) {
  return adminApiFetch<AdminSalesAnalytics>(`/api/admin/analytics/sales${toQueryString({ days: String(days) })}`);
}

export function getAdminProductAnalytics(days: AnalyticsRangeDays = 7) {
  return adminApiFetch<AdminProductAnalytics>(`/api/admin/analytics/products${toQueryString({ days: String(days) })}`);
}

export function getAdminFunnelAnalytics(days: AnalyticsRangeDays = 7) {
  return adminApiFetch<AdminFunnelAnalytics>(`/api/admin/analytics/funnel${toQueryString({ days: String(days) })}`);
}

export function getAdminSeoOverview(days: SearchConsoleRangeDays = 7) {
  return adminApiFetch<AdminSeoOverview>(`/api/admin/seo/overview${toQueryString({ days: String(days) })}`);
}

export function getAdminSeoPages(days: SearchConsoleRangeDays = 7) {
  return adminApiFetch<AdminSeoPages>(`/api/admin/seo/pages${toQueryString({ days: String(days) })}`);
}

export function getAdminSeoQueries(days: SearchConsoleRangeDays = 7) {
  return adminApiFetch<AdminSeoQueries>(`/api/admin/seo/queries${toQueryString({ days: String(days) })}`);
}

export function getAdminGuides(query: { status?: string } = {}) {
  return adminApiFetch<AdminGuide[]>(`/api/admin/content/guides${toQueryString(query)}`);
}

export function getAdminGuide(id: string) {
  return adminApiFetch<AdminGuide>(`/api/admin/content/guides/${id}`);
}

export function createAdminGuide(payload: AdminGuidePayload) {
  return adminApiFetch<AdminGuide>("/api/admin/content/guides", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminGuide(id: string, payload: AdminGuidePayload) {
  return adminApiFetch<AdminGuide>(`/api/admin/content/guides/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function publishAdminGuide(id: string) {
  return adminApiFetch<AdminGuide>(`/api/admin/content/guides/${id}/publish`, { method: "POST" });
}

export function archiveAdminGuide(id: string) {
  return adminApiFetch<AdminGuide>(`/api/admin/content/guides/${id}/archive`, { method: "POST" });
}

export function draftAdminGuide(id: string) {
  return adminApiFetch<AdminGuide>(`/api/admin/content/guides/${id}/draft`, { method: "POST" });
}

export function getAdminFaq() {
  return adminApiFetch<AdminFaq>("/api/admin/content/faq");
}

export function updateAdminFaq(payload: AdminFaqPayload) {
  return adminApiFetch<AdminFaq>("/api/admin/content/faq", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function getAdminCollectionLandings() {
  return adminApiFetch<AdminCollectionLanding[]>("/api/admin/content/collections");
}

export function getAdminCollectionLanding(id: string) {
  return adminApiFetch<AdminCollectionLanding>(`/api/admin/content/collections/${id}`);
}

export function updateAdminCollectionLanding(id: string, payload: AdminCollectionLandingPayload) {
  return adminApiFetch<AdminCollectionLanding>(`/api/admin/content/collections/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getAdminStaticPages() {
  return adminApiFetch<AdminStaticPage[]>("/api/admin/content/static-pages");
}

export function getAdminStaticPage(id: string) {
  return adminApiFetch<AdminStaticPage>(`/api/admin/content/static-pages/${id}`);
}

export function updateAdminStaticPage(id: string, payload: AdminStaticPagePayload) {
  return adminApiFetch<AdminStaticPage>(`/api/admin/content/static-pages/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getAdminMerchantFeed() {
  return adminApiFetch<AdminMerchantFeedOverview>("/api/admin/marketing/merchant-feed");
}

export function exportAdminMerchantFeed(format: "xml" | "json") {
  return adminApiFetch<AdminMerchantFeedExport>(`/api/admin/marketing/merchant-feed/export${toQueryString({ format })}`);
}

export function getAdminOrders(query: {
  search?: string;
  paymentStatus?: string;
  fulfillmentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}) {
  return adminApiFetch<AdminOrderListItem[]>(`/api/admin/orders${toQueryString(query)}`);
}

export function getAdminOrder(id: string) {
  return adminApiFetch<AdminOrderDetail>(`/api/admin/orders/${id}`);
}

export function addAdminOrderNote(id: string, payload: { note: string }) {
  return adminApiFetch<AdminOrderDetail["notes"][number]>(`/api/admin/orders/${id}/notes`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fulfillAdminOrder(id: string) {
  return adminApiFetch<AdminOrderDetail>(`/api/admin/orders/${id}/fulfill`, {
    method: "POST",
  });
}

export function getAdminSettings() {
  return adminApiFetch<AdminSettings>("/api/admin/settings");
}

export function updateAdminSettings(payload: AdminSettingsInput) {
  return adminApiFetch<AdminSettings>("/api/admin/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function getAdminCopyConfig() {
  return adminApiFetch<AdminCopyConfig>("/api/admin/settings/copy");
}

export function updateAdminCopyConfig(payload: Omit<AdminCopyConfig, "updatedAt">) {
  return adminApiFetch<AdminCopyConfig>("/api/admin/settings/copy", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function getSeoAutomationOverview() {
  return adminOpenApiFetch<SeoAutomationOverview>("/api/admin/seo/automation/overview");
}

export function getProductResearchDashboard() {
  return adminOpenApiFetch<ProductResearchDashboard>("/api/admin/product-research/dashboard");
}

export function getProductResearchAssessmentRuntime() {
  return adminOpenApiFetch<ProductResearchAssessmentRuntime>("/api/admin/product-research/assessment-runtime");
}

export function getProductResearchCandidates(query: {
  search?: string;
  status?: string;
  source?: string;
  category?: string;
  targetMarket?: string;
  recommendedAction?: string;
  riskSeverity?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  return adminOpenApiFetch<ProductResearchCandidateListResponse>("/api/admin/product-research/candidates", { query });
}

export function getProductResearchCandidate(id: string) {
  return adminOpenApiFetch<ProductResearchCandidateDetail>("/api/admin/product-research/candidates/{id}", { pathParams: { id } });
}

export function getProductResearchCandidateScores(id: string, query: { page?: number; pageSize?: number } = {}) {
  return adminOpenApiFetch<ProductResearchHistoryPage<ProductResearchCandidateScore>>(
    "/api/admin/product-research/candidates/{id}/scores",
    { pathParams: { id }, query },
  );
}

export function getProductResearchCandidateSignals(id: string, query: { page?: number; pageSize?: number } = {}) {
  return adminOpenApiFetch<ProductResearchHistoryPage<ProductResearchCandidateSignal>>(
    "/api/admin/product-research/candidates/{id}/signals",
    { pathParams: { id }, query },
  );
}

export function recalculateProductResearchCandidate(id: string) {
  return adminOpenApiFetch<ProductResearchCandidateDetail>("/api/admin/product-research/candidates/{id}/recalculate", {
    method: "POST",
    pathParams: { id },
  });
}

export function bulkRecalculateProductResearchCandidates(ids: string[], reason?: string) {
  return adminOpenApiFetch<{ recalculated: number; background: boolean }>(
    "/api/admin/product-research/candidates/bulk-recalculate",
    {
      method: "POST",
      body: JSON.stringify({ ids, reason }),
    },
  );
}

export function createProductResearchCandidate(payload: {
  productName: string;
  category: string;
  targetMarket: string;
  source?: "MANUAL" | "AI_GENERATED" | "CSV" | "ALIBABA_LINK" | "SUPPLIER_QUOTE";
  chineseName?: string;
  targetAudience?: string;
  useCase?: string;
  description?: string;
  notes?: string;
  brandAngle?: string;
  positioningSummary?: string;
  alibabaKeywords?: string;
  sourceUrl?: string;
}) {
  return adminOpenApiFetch<ProductResearchCandidateDetail>("/api/admin/product-research/candidates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createProductResearchDecision(id: string, payload: { decision: string; reason?: string }) {
  return adminOpenApiFetch<{ id: string; decision: string }>("/api/admin/product-research/candidates/{id}/decisions", {
    method: "POST",
    pathParams: { id },
    body: JSON.stringify(payload),
  });
}

export function adjustProductResearchScore(id: string, payload: { finalScore: number; reason?: string }) {
  return adminOpenApiFetch<{ id: string; finalScore: number }>("/api/admin/product-research/candidates/{id}/score-adjust", {
    method: "POST",
    pathParams: { id },
    body: JSON.stringify(payload),
  });
}

export function createProductResearchTestLaunch(id: string, payload: {
  channel: string;
  landingPageUrl?: string;
  channelDetail?: string;
  adSpendCents?: number;
  impressions?: number;
  clicks?: number;
  productViews?: number;
  addToCart?: number;
  beginCheckout?: number;
  purchases?: number;
  revenueCents?: number;
  refunds?: number;
  customerFeedbackScore?: number;
  refundRiskScore?: number;
  customerFeedbackSummary?: string;
  status?: string;
  notes?: string;
}) {
  return adminOpenApiFetch<ProductResearchTestLaunch>("/api/admin/product-research/candidates/{id}/test-launches", {
    method: "POST",
    pathParams: { id },
    body: JSON.stringify(payload),
  });
}

export function convertProductResearchCandidate(id: string) {
  return adminOpenApiFetch<{ candidateId: string; productId: string; status: string }>(
    "/api/admin/product-research/candidates/{id}/convert-to-product",
    { method: "POST", pathParams: { id } },
  );
}

export function getProductResearchSuppliers() {
  return adminOpenApiFetch<ProductResearchSupplier[]>("/api/admin/product-research/suppliers");
}

export function getProductResearchScoringRules() {
  return adminOpenApiFetch<ProductResearchScoringRule[]>("/api/admin/product-research/scoring-rules");
}

export function createProductResearchScoringRule(payload: { version: string; weights: Record<string, number>; isActive?: boolean }) {
  return adminOpenApiFetch<ProductResearchScoringRule>("/api/admin/product-research/scoring-rules", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function activateProductResearchScoringRule(id: string, options?: { recalculateExisting?: boolean }) {
  return adminOpenApiFetch<ProductResearchScoringRuleActivationResult>(
    "/api/admin/product-research/scoring-rules/{id}/activate",
    {
      method: "POST",
      pathParams: { id },
      body: JSON.stringify({ recalculateExisting: options?.recalculateExisting }),
    },
  );
}

export function getProductResearchImportBatches() {
  return adminOpenApiFetch<ProductResearchImportBatch[]>("/api/admin/product-research/import/batches");
}

export function previewProductResearchAiImport(payload: {
  brandDirection?: string;
  targetMarket?: string;
  excludedCategories?: string[];
  count?: number;
}) {
  return adminOpenApiFetch<ProductResearchImportPreview>("/api/admin/product-research/import/ai/preview", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function commitProductResearchAiImport(payload: {
  previewItems: Array<Record<string, unknown>>;
  selectedIndexes: number[];
}) {
  return adminOpenApiFetch<{ batchId: string; importedCount: number; duplicateCount: number; skippedCount: number; createdIds: string[] }>(
    "/api/admin/product-research/import/ai/commit",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function previewProductResearchCsvImport(payload: {
  fileName?: string;
  rows: Array<Record<string, unknown>>;
  mapping?: Record<string, string>;
}) {
  return adminOpenApiFetch<ProductResearchImportPreview>("/api/admin/product-research/import/csv/preview", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function commitProductResearchCsvImport(payload: {
  batchId?: string;
  rows: Array<Record<string, unknown>>;
  action?: "merge" | "skip" | "create_anyway";
}) {
  return adminOpenApiFetch<{ batchId: string; importedCount: number; duplicateCount: number; skippedCount: number; createdIds: string[] }>(
    "/api/admin/product-research/import/csv/commit",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function previewProductResearchSupplierQuoteImport(payload: {
  fileName?: string;
  rows: Array<Record<string, unknown>>;
  mapping?: Record<string, string>;
}) {
  return adminOpenApiFetch<ProductResearchImportPreview>("/api/admin/product-research/import/supplier-quotes/preview", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function commitProductResearchSupplierQuoteImport(payload: {
  batchId?: string;
  rows: Array<Record<string, unknown>>;
  action?: "merge" | "skip" | "create_anyway";
}) {
  return adminOpenApiFetch<{ batchId: string; importedCount: number; duplicateCount: number; skippedCount: number }>(
    "/api/admin/product-research/import/supplier-quotes/commit",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function previewProductResearchAlibabaImport(payload: { links: string[]; notes?: string }) {
  return adminOpenApiFetch<ProductResearchImportPreview>("/api/admin/product-research/import/alibaba-links/preview", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function commitProductResearchAlibabaImport(payload: {
  previewItems: Array<Record<string, unknown>>;
  selectedIndexes: number[];
  notes?: string;
}) {
  return adminOpenApiFetch<{ batchId: string; importedCount: number; duplicateCount: number; skippedCount: number; createdIds: string[] }>(
    "/api/admin/product-research/import/alibaba-links/commit",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function getProductResearchDecisions() {
  return adminOpenApiFetch<ProductResearchDecisionListItem[]>("/api/admin/product-research/decisions");
}

export function getProductResearchTestLaunches() {
  return adminOpenApiFetch<ProductResearchTestLaunch[]>("/api/admin/product-research/test-launches");
}

export function getProductResearchRiskReview() {
  return adminOpenApiFetch<ProductResearchRiskReviewItem[]>("/api/admin/product-research/risk-review");
}

export function resolveProductResearchRiskFlag(candidateId: string, flagId: string, note?: string) {
  return adminOpenApiFetch<ProductResearchCandidateDetail>(
    "/api/admin/product-research/candidates/{id}/risk-flags/{flagId}/resolve",
    {
      method: "POST",
      pathParams: { id: candidateId, flagId },
      body: JSON.stringify({ note }),
    },
  );
}

export function runSeoHealthCheck() {
  return adminOpenApiFetch<{ lastRunAt: string; pages: unknown[]; issues: SeoIssueItem[] }>(
    "/api/admin/seo/automation/health-check/run",
    { method: "POST" },
  );
}

export function getSeoIssues() {
  return adminOpenApiFetch<SeoIssueItem[]>("/api/admin/seo/issues");
}

export function bulkReviewSeoIssues(ids: string[]) {
  return adminOpenApiFetch<{ reviewed: number }>("/api/admin/seo/issues/bulk-review", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export function syncSeoGsc() {
  return adminOpenApiFetch<SearchConsoleSyncResult>("/api/admin/seo/gsc/sync", { method: "POST" });
}

export function syncSeoGa4() {
  return adminOpenApiFetch<Ga4SyncResult>("/api/admin/seo/ga4/sync", { method: "POST" });
}

export function getSeoOpportunities() {
  return adminOpenApiFetch<ContentOpportunityItem[]>("/api/admin/seo/opportunities");
}

export function generateSeoOpportunities() {
  return adminOpenApiFetch<ContentOpportunityItem[]>("/api/admin/seo/opportunities/generate", { method: "POST" });
}

export function createSeoContentBrief(opportunityId: string) {
  return adminOpenApiFetch<ContentBriefItem>("/api/admin/seo/opportunities/{id}/brief", {
    method: "POST",
    pathParams: { id: opportunityId },
  });
}

export function getSeoRecommendations() {
  return adminOpenApiFetch<SeoRecommendationItem[]>("/api/admin/seo/recommendations");
}

export function generateSeoRecommendations() {
  return adminOpenApiFetch<SeoRecommendationItem[]>("/api/admin/seo/recommendations/generate", { method: "POST" });
}

export function applySeoRecommendation(id: string) {
  return adminOpenApiFetch<SeoRecommendationItem>("/api/admin/seo/recommendations/{id}/apply", {
    method: "POST",
    pathParams: { id },
  });
}

export function rejectSeoRecommendation(id: string) {
  return adminOpenApiFetch<SeoRecommendationItem>("/api/admin/seo/recommendations/{id}/reject", {
    method: "POST",
    pathParams: { id },
  });
}

export function getSeoContentPipeline() {
  return adminOpenApiFetch<ContentBriefItem[]>("/api/admin/seo/content-pipeline");
}

export function publishSeoContentBrief(id: string) {
  return adminOpenApiFetch<ContentBriefItem>("/api/admin/seo/content-pipeline/{id}/publish", {
    method: "POST",
    pathParams: { id },
  });
}

export function getSeoInternalLinks() {
  return adminOpenApiFetch<InternalLinkSuggestionItem[]>("/api/admin/seo/internal-links");
}

export function generateSeoInternalLinks() {
  return adminOpenApiFetch<InternalLinkSuggestionItem[]>("/api/admin/seo/internal-links/generate", { method: "POST" });
}

export function applySeoInternalLink(id: string) {
  return adminOpenApiFetch<InternalLinkSuggestionItem>("/api/admin/seo/internal-links/{id}/apply", {
    method: "POST",
    pathParams: { id },
  });
}

export function getSeoChangeLog(query: { page?: number; pageSize?: number } = {}) {
  return adminOpenApiFetch<SeoChangeLogPage>("/api/admin/seo/change-log", { query });
}

export function generateAdminProductSeoDraft(id: string) {
  return adminOpenApiFetch<ProductSeoDraft>("/api/admin/seo/products/{id}/seo/generate", {
    method: "POST",
    pathParams: { id },
  });
}

export function applyAdminProductSeoDraft(id: string, draft: ProductSeoDraft) {
  return adminOpenApiFetch<AdminProduct>("/api/admin/seo/products/{id}/seo/apply", {
    method: "POST",
    pathParams: { id },
    body: JSON.stringify(draft),
  });
}

export function getActiveCommerceRuleSet() {
  return adminApiFetch<unknown>("/api/admin/commerce/rules/active");
}

export function listCommerceRuleSets() {
  return adminApiFetch<CommerceRuleSetSummary[]>("/api/admin/commerce/rules/sets");
}

export function upsertCommerceRuleSetDraft(payload: UpsertCommerceRuleSetPayload) {
  return adminApiFetch<unknown>("/api/admin/commerce/rules/draft", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function validateCommerceRuleSetDraft(payload: UpsertCommerceRuleSetPayload) {
  return adminApiFetch<CommerceRuleSetValidationResult>("/api/admin/commerce/rules/validate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function validateCommerceRuleSetById(id: string) {
  return adminApiFetch<CommerceRuleSetValidationResult>(`/api/admin/commerce/rules/sets/${id}/validate`, {
    method: "POST",
  });
}

export function publishCommerceRuleSet(id: string) {
  return adminApiFetch<unknown>(`/api/admin/commerce/rules/sets/${id}/publish`, {
    method: "POST",
  });
}

export function simulateCommerceQuote(payload: {
  items: Array<{ variantId: string; quantity: number }>;
  country?: string;
  region?: string;
  postalCode?: string;
  currency?: string;
}) {
  return adminApiFetch<CommerceQuoteSimulation>("/api/admin/commerce/rules/simulate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAdminGeoSummary() {
  return adminApiFetch<GeoDashboardSummary>("/api/admin/geo");
}

export function getAdminGeoPrompts() {
  return adminApiFetch<GeoPrompt[]>("/api/admin/geo/prompts");
}

export function createAdminGeoPrompt(payload: { prompt: string; isActive?: boolean }) {
  return adminApiFetch<GeoPrompt>("/api/admin/geo/prompts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAdminGeoResults() {
  return adminApiFetch<GeoTestRun[]>("/api/admin/geo/results");
}

export function createAdminGeoResult(payload: {
  platform: "CHATGPT" | "PERPLEXITY" | "GEMINI" | "GOOGLE_AI_OVERVIEW";
  promptId?: string;
  prompt: string;
  mentionedBrands?: string[];
  citedUrls?: string[];
  whetherPulseGearMentioned: boolean;
  whetherPulseGearCited: boolean;
  competitorBrands?: string[];
  notes?: string;
}) {
  return adminApiFetch<GeoTestRun>("/api/admin/geo/results", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAdminGeoCompetitors() {
  return adminApiFetch<Array<{ brand: string; count: number }>>("/api/admin/geo/competitors");
}

export function getAdminGeoRecommendations() {
  return adminApiFetch<GeoRecommendation[]>("/api/admin/geo/recommendations");
}

export function createAdminGeoRecommendation(payload: {
  query?: string;
  pagePath?: string;
  recommendation: string;
  recommendationType: string;
  priority?: string;
}) {
  return adminApiFetch<GeoRecommendation>("/api/admin/geo/recommendations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
