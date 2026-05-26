export type ProductResearchDashboard = {
  summary: {
    totalCandidates: number;
    highRiskCandidates: number;
    approvedCandidates: number;
    runningTests: number;
    averageFinalScore: number | null;
    averageValidatedScore: number | null;
    providerStatus: {
      activeAiProvider: string;
      activeAiBaseUrl: string | null;
      activeAiModels: {
        candidateGeneration: string | null;
        scoring: string | null;
        copy: string | null;
        fast: string | null;
      };
      aiApiKeyConfigured: boolean;
      aiApiKeySource: string;
      openAiConfigured: boolean;
      deepSeekConfigured: boolean;
      mimoConfigured: boolean;
      googleTrendsConfigured: boolean;
      gscConfigured: boolean;
      ga4Configured: boolean;
    };
  };
  statusBreakdown: Record<string, number>;
  recommendedActionBreakdown: Record<string, number>;
  recentImports: Array<{
    id: string;
    source: string;
    fileName: string | null;
    createdAt: string;
  }>;
  recentDecisions: Array<{
    id: string;
    candidateId: string;
    decision: string;
    createdAt: string;
  }>;
};

export type ProductResearchCandidateListResponse = {
  items: ProductResearchCandidateListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ProductResearchRiskReviewItem = ProductResearchCandidateListItem & {
  openRiskFlags: Array<{
    id: string;
    riskType: string;
    severity: string;
    message: string;
    createdAt: string;
  }>;
};

export type ProductResearchCandidateListItem = {
  id: string;
  productName: string;
  category: string;
  targetMarket: string;
  source: string;
  status: string;
  recommendedAction: string;
  recommendedActionLabel: string;
  finalScore: number | null;
  riskScore: number | null;
  validatedScore: number | null;
  primaryRiskSeverity: string;
  supplierCount: number;
  latestScore: {
    id: string;
    finalScore: number;
    scoringVersion: string;
    createdAt: string;
  } | null;
  updatedAt: string;
};

export type ProductResearchCandidateDetail = {
  id: string;
  productName: string;
  chineseName: string | null;
  category: string;
  targetMarket: string;
  targetAudience: string | null;
  useCase: string | null;
  description: string | null;
  notes: string | null;
  source: string;
  status: string;
  recommendedAction: string;
  recommendedActionLabel: string;
  latestScore: {
    id: string;
    finalScore: number;
    scoringVersion: string;
    createdAt: string;
  } | null;
  primaryRiskSeverity: string;
  finalScore: number | null;
  riskScore: number | null;
  validatedScore: number | null;
  possibleDuplicateOfId: string | null;
  createdAt: string;
  updatedAt: string;
  scores: Array<{
    id: string;
    finalScore: number;
    scoringVersion: string;
    createdAt: string;
  }>;
  suppliers: Array<{
    supplierId: string;
    supplierName: string;
    platform: string;
    quotedUnitPriceCents: number | null;
    quotedMoq: number | null;
    quotedLeadTimeDays: number | null;
    shippingToUSCents: number | null;
    shippingToUKCents: number | null;
    verifiedSupplier: boolean;
    tradeAssurance: boolean;
  }>;
  hasUnresolvedBlockingRisk: boolean;
  riskFlags: Array<{
    id?: string;
    severity: string;
    riskType?: string;
    message?: string;
    resolvedAt?: string | null;
    resolutionNote?: string | null;
    createdAt?: string;
  }>;
  decisions: Array<{
    id: string;
    decision: string;
    reason?: string | null;
    createdAt: string;
  }>;
  signals: Array<{
    id: string;
    source: string;
    metricName: string;
    metricValue: number;
    rawData?: unknown;
    collectedAt: string;
  }>;
  testLaunches: Array<{
    id: string;
    landingPageUrl?: string | null;
    channel: string;
    channelDetail?: string | null;
    adSpendCents: number;
    impressions: number;
    clicks: number;
    ctr: number;
    productViews: number;
    addToCart: number;
    addToCartRate: number;
    beginCheckout: number;
    checkoutRate: number;
    purchases: number;
    purchaseRate: number;
    revenueCents: number;
    refunds: number;
    customerFeedbackScore?: number | null;
    refundRiskScore?: number | null;
    customerFeedbackSummary?: string | null;
    notes?: string | null;
    testScore?: number | null;
    status: string;
    startedAt?: string | null;
    endedAt?: string | null;
    createdAt: string;
  }>;
};

export type ProductResearchImportPreviewItem = {
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
  rawImportData?: unknown;
  aiDraftPayload?: unknown;
  duplicateHints?: string[];
  riskWarnings?: string[];
};

export type ProductResearchImportPreview = {
  fileName?: string | null;
  requestedCount?: number;
  items?: ProductResearchImportPreviewItem[];
  previewRows?: ProductResearchImportPreviewItem[];
  previewItems?: ProductResearchImportPreviewItem[];
  duplicates: Array<{ index: number; existingId?: string; supplierUrl?: string }>;
  invalidRows: Array<{ index: number; errors: string[]; row: Record<string, unknown> }>;
  riskWarnings?: Array<{ index: number; warning: string }>;
  links?: string[];
  notes?: string | null;
};

export type ProductResearchSupplier = {
  id: string;
  platform: string;
  name: string;
  url: string | null;
  country: string | null;
  verifiedSupplier: boolean;
  tradeAssurance: boolean;
  yearsOnPlatform: number | null;
  responseRate: number | null;
  moq: number | null;
  samplePriceCents: number | null;
  unitPriceCents: number | null;
  customLogoMoq: number | null;
  customPackagingMoq: number | null;
  leadTimeDays: number | null;
  shippingToUSCents: number | null;
  shippingToUKCents: number | null;
  certifications: string[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductResearchScoringRule = {
  id: string;
  version: string;
  weights: Record<string, number>;
  isActive: boolean;
  createdById: string | null;
  createdAt: string;
};

export type ProductResearchScoringRuleActivationResult = {
  rule: ProductResearchScoringRule;
  recalculated: number;
};

export type ProductResearchDecisionListItem = {
  id: string;
  candidateId: string;
  decision: string;
  reason: string | null;
  createdAt: string;
  candidate: {
    id: string;
    productName: string;
    status: string;
    recommendedAction: string;
  };
  operator: {
    id: string;
    email: string;
    name: string;
  } | null;
};

export type ProductResearchTestLaunch = {
  id: string;
  candidateId: string;
  landingPageUrl: string | null;
  channel: string;
  adSpendCents: number;
  impressions: number;
  clicks: number;
  ctr: number;
  productViews: number;
  addToCart: number;
  addToCartRate: number;
  beginCheckout: number;
  checkoutRate: number;
  purchases: number;
  purchaseRate: number;
  revenueCents: number;
  refunds: number;
  testScore: number | null;
  status: string;
  startedAt: string | null;
  endedAt: string | null;
  candidate: {
    id: string;
    productName: string;
    status: string;
    recommendedAction: string;
  };
};

export type ProductResearchImportBatch = {
  id: string;
  source: string;
  fileName: string | null;
  totalRows: number;
  createdCount: number;
  skippedCount: number;
  duplicateCount: number;
  invalidCount: number;
  createdAt: string;
  createdBy: {
    id: string;
    email: string;
    name: string;
  } | null;
};
