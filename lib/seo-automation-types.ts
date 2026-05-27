export type SeoAutomationOverview = {
  healthCheck: {
    lastRunAt: string | null;
    scannedPages: number;
    openIssues: number;
    averageHealthScore: number;
  };
  searchConsole: {
    connected: boolean;
    status: "Connected" | "Not Connected";
  };
  ga4: {
    connected: boolean;
    status: "Connected" | "Not Connected";
  };
  opportunities: {
    total: number;
    new: number;
  };
  recommendations: {
    total: number;
    draft: number;
  };
  contentPipeline: {
    total: number;
    needsReview: number;
  };
  aiStatus: {
    configuredProvider: string;
    effectiveProvider: string;
    fallbackProvider: "local";
    baseUrl: string | null;
    model: string | null;
    apiKeyConfigured: boolean;
  };
  recentChanges: SeoChangeLogItem[];
};

export type SeoIssueItem = {
  id: string;
  pageId: string;
  pageUrl: string;
  pageType: string;
  issueType: string;
  severity: string;
  status: string;
  message: string;
  healthScore: number;
  detectedAt: string;
};

export type SearchConsoleSyncResult = {
  connection: {
    connected: boolean;
    status: "Connected" | "Not Connected";
  };
  rows: Array<{
    page: string;
    query: string;
    country: string;
    device: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    date: string;
  }>;
  syncedAt: string | null;
};

export type Ga4SyncResult = {
  connection: {
    connected: boolean;
    status: "Connected" | "Not Connected";
  };
  rows: Array<{
    landingPage: string;
    sourceMedium: string;
    sessions: number;
    totalUsers: number;
    pageViews: number;
    viewItem: number;
    addToCart: number;
    beginCheckout: number;
    purchase: number;
    revenue: number;
    date: string;
  }>;
  syncedAt: string | null;
};

export type ContentOpportunityItem = {
  id: string;
  opportunityType: string;
  keyword: string | null;
  currentPage: string | null;
  suggestedAction: string;
  priority: string;
  expectedImpact: string;
  status: "NEW" | "REVIEWED" | "ACCEPTED" | "REJECTED" | "DONE";
};

export type SeoRecommendationItem = {
  id: string;
  recommendationType: string;
  resourceType: string;
  resourceId: string | null;
  pageUrl: string | null;
  reason: string;
  priority: string;
  status: "DRAFT" | "REVIEWED" | "APPLIED" | "REJECTED";
  isAiDraft: boolean;
  draftPayload: Record<string, unknown>;
};

export type ContentBriefItem = {
  id: string;
  sourceOpportunityId: string | null;
  title: string;
  targetKeyword: string;
  outline: string[];
  draftContent: string | null;
  relatedProductIds: string[];
  relatedCollectionSlugs: string[];
  status:
    | "OPPORTUNITY"
    | "BRIEF_GENERATED"
    | "DRAFT_GENERATED"
    | "NEEDS_REVIEW"
    | "APPROVED"
    | "PUBLISHED"
    | "MONITORING";
};

export type InternalLinkSuggestionItem = {
  id: string;
  sourcePage: string;
  targetPage: string;
  anchorText: string;
  reason: string;
  priority: string;
  status: "NEW" | "ACCEPTED" | "REJECTED" | "APPLIED";
};

export type SeoChangeLogItem = {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  operatorId: string | null;
  createdAt: string;
};

export type SeoChangeLogPage = {
  items: SeoChangeLogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ProductSeoDraft = {
  seoTitle: string;
  seoDescription: string;
  imageAltText: string[];
  productFaq: Array<{ question: string; answer: string }>;
  relatedGuides: string[];
  relatedProducts: string[];
  merchantFeedSuggestions: Record<string, string>;
  aiDraft: true;
};
