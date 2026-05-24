import type { AdminDashboardAnalytics, AdminFunnelAnalytics, AdminProductAnalytics, AdminSalesAnalytics, AnalyticsRangeDays } from "./admin-analytics-types";
import type { AdminFaq, AdminFaqPayload, AdminGuide, AdminGuidePayload } from "./admin-content-types";
import type { AdminMerchantFeedExport, AdminMerchantFeedOverview } from "./admin-marketing-types";
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
  SeoChangeLogItem,
  SeoIssueItem,
  SeoRecommendationItem,
  SearchConsoleSyncResult,
} from "./seo-automation-types";
import type { AdminInventoryItem, AdminProduct, AdminProductPayload } from "./admin-types";

type ApiResponse<T> = { success: true; data: T } | { success: false; error: { code: string; message: string } };

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

async function adminApiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
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
  return adminApiFetch<SeoAutomationOverview>("/api/admin/seo/automation/overview");
}

export function runSeoHealthCheck() {
  return adminApiFetch<{ lastRunAt: string; pages: unknown[]; issues: SeoIssueItem[] }>("/api/admin/seo/automation/health-check/run", {
    method: "POST",
  });
}

export function getSeoIssues() {
  return adminApiFetch<SeoIssueItem[]>("/api/admin/seo/issues");
}

export function bulkReviewSeoIssues(ids: string[]) {
  return adminApiFetch<{ reviewed: number }>("/api/admin/seo/issues/bulk-review", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export function syncSeoGsc() {
  return adminApiFetch<SearchConsoleSyncResult>("/api/admin/seo/gsc/sync", { method: "POST" });
}

export function syncSeoGa4() {
  return adminApiFetch<Ga4SyncResult>("/api/admin/seo/ga4/sync", { method: "POST" });
}

export function getSeoOpportunities() {
  return adminApiFetch<ContentOpportunityItem[]>("/api/admin/seo/opportunities");
}

export function generateSeoOpportunities() {
  return adminApiFetch<ContentOpportunityItem[]>("/api/admin/seo/opportunities/generate", { method: "POST" });
}

export function createSeoContentBrief(opportunityId: string) {
  return adminApiFetch<ContentBriefItem>(`/api/admin/seo/opportunities/${opportunityId}/brief`, { method: "POST" });
}

export function getSeoRecommendations() {
  return adminApiFetch<SeoRecommendationItem[]>("/api/admin/seo/recommendations");
}

export function generateSeoRecommendations() {
  return adminApiFetch<SeoRecommendationItem[]>("/api/admin/seo/recommendations/generate", { method: "POST" });
}

export function applySeoRecommendation(id: string) {
  return adminApiFetch<SeoRecommendationItem>(`/api/admin/seo/recommendations/${id}/apply`, { method: "POST" });
}

export function rejectSeoRecommendation(id: string) {
  return adminApiFetch<SeoRecommendationItem>(`/api/admin/seo/recommendations/${id}/reject`, { method: "POST" });
}

export function getSeoContentPipeline() {
  return adminApiFetch<ContentBriefItem[]>("/api/admin/seo/content-pipeline");
}

export function publishSeoContentBrief(id: string) {
  return adminApiFetch<ContentBriefItem>(`/api/admin/seo/content-pipeline/${id}/publish`, { method: "POST" });
}

export function getSeoInternalLinks() {
  return adminApiFetch<InternalLinkSuggestionItem[]>("/api/admin/seo/internal-links");
}

export function generateSeoInternalLinks() {
  return adminApiFetch<InternalLinkSuggestionItem[]>("/api/admin/seo/internal-links/generate", { method: "POST" });
}

export function applySeoInternalLink(id: string) {
  return adminApiFetch<InternalLinkSuggestionItem>(`/api/admin/seo/internal-links/${id}/apply`, { method: "POST" });
}

export function getSeoChangeLog() {
  return adminApiFetch<SeoChangeLogItem[]>("/api/admin/seo/change-log");
}

export function generateAdminProductSeoDraft(id: string) {
  return adminApiFetch<ProductSeoDraft>(`/api/admin/seo/products/${id}/seo/generate`, { method: "POST" });
}

export function applyAdminProductSeoDraft(id: string, draft: ProductSeoDraft) {
  return adminApiFetch<AdminProduct>(`/api/admin/seo/products/${id}/seo/apply`, {
    method: "POST",
    body: JSON.stringify(draft),
  });
}
