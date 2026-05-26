export type ProductCandidateSource =
  | "MANUAL"
  | "AI_GENERATED"
  | "CSV"
  | "ALIBABA_LINK"
  | "SUPPLIER_QUOTE";

export type ProductCandidateStatus =
  | "NEW"
  | "RESEARCHING"
  | "WATCH"
  | "SAMPLE"
  | "TEST"
  | "APPROVED"
  | "REJECTED"
  | "HIGH_RISK_REVIEW";

export type ProductResearchRecommendedAction =
  | "SAMPLE"
  | "TEST"
  | "WATCH"
  | "REJECT"
  | "REVIEW";

export type ProductResearchRiskSeverity = "LOW" | "MEDIUM" | "HIGH" | "BLOCKING";

export type ProductResearchDecisionType =
  | "SAMPLE"
  | "TEST"
  | "WATCH"
  | "APPROVE"
  | "REJECT"
  | "CONVERT_TO_PRODUCT";

export type SupplierPlatform = "ALIBABA" | "ALIEXPRESS" | "CJ_DROPSHIPPING" | "AGENT" | "OTHER";

export type ScoreSnapshotInput = {
  id: string;
  finalScore: number;
  scoringVersion: string;
  createdAt: Date | string;
};

export type ScoreSnapshot = {
  id: string;
  finalScore: number;
  scoringVersion: string;
  createdAt: string;
};

export type RiskFlagInput = {
  severity: ProductResearchRiskSeverity;
  riskType?: string;
  message?: string;
  createdAt?: Date | string;
};

export type SupplierComparisonInput = {
  supplierId: string;
  quotedUnitPriceCents?: number | null;
  quotedMoq?: number | null;
  quotedLeadTimeDays?: number | null;
  supplier: {
    id: string;
    name: string;
    platform: SupplierPlatform;
    shippingToUSCents?: number | null;
    shippingToUKCents?: number | null;
    verifiedSupplier?: boolean;
    tradeAssurance?: boolean;
  };
};

export type SupplierComparison = {
  supplierId: string;
  supplierName: string;
  platform: SupplierPlatform;
  quotedUnitPriceCents: number | null;
  quotedMoq: number | null;
  quotedLeadTimeDays: number | null;
  shippingToUSCents: number | null;
  shippingToUKCents: number | null;
  verifiedSupplier: boolean;
  tradeAssurance: boolean;
};

export type CandidateListRecord = {
  id: string;
  productName: string;
  category: string;
  targetMarket: string;
  source: ProductCandidateSource;
  status: ProductCandidateStatus;
  recommendedAction: ProductResearchRecommendedAction;
  finalScore: number | null;
  riskScore: number | null;
  validatedScore: number | null;
  updatedAt: Date | string;
  scores?: ScoreSnapshotInput[];
  riskFlags?: RiskFlagInput[];
  suppliers?: Array<{ supplierId: string }>;
};

export type CandidateListItem = {
  id: string;
  productName: string;
  category: string;
  targetMarket: string;
  source: ProductCandidateSource;
  status: ProductCandidateStatus;
  recommendedAction: ProductResearchRecommendedAction;
  recommendedActionLabel: string;
  finalScore: number | null;
  riskScore: number | null;
  validatedScore: number | null;
  primaryRiskSeverity: ProductResearchRiskSeverity;
  supplierCount: number;
  latestScore: ScoreSnapshot | null;
  updatedAt: string;
};

export type CandidateDecisionRecord = {
  id: string;
  decision: ProductResearchDecisionType;
  reason?: string | null;
  createdAt: Date | string;
};

export type CandidateDetailRecord = {
  id: string;
  productName: string;
  chineseName?: string | null;
  category?: string;
  targetMarket?: string;
  targetAudience?: string | null;
  useCase?: string | null;
  description?: string | null;
  notes?: string | null;
  source?: ProductCandidateSource;
  status: ProductCandidateStatus;
  recommendedAction: ProductResearchRecommendedAction;
  finalScore?: number | null;
  riskScore?: number | null;
  validatedScore?: number | null;
  possibleDuplicateOfId?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  scores: ScoreSnapshotInput[];
  suppliers: SupplierComparisonInput[];
  riskFlags: RiskFlagInput[];
  decisions: CandidateDecisionRecord[];
  signals: Array<{
    id: string;
    source: string;
    metricName: string;
    metricValue: number;
    rawData?: unknown;
    collectedAt: Date | string;
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
    startedAt?: Date | string | null;
    endedAt?: Date | string | null;
    createdAt: Date | string;
  }>;
};

export type CandidateDetailItem = {
  id: string;
  productName: string;
  chineseName?: string | null;
  category?: string;
  targetMarket?: string;
  targetAudience?: string | null;
  useCase?: string | null;
  description?: string | null;
  notes?: string | null;
  source?: ProductCandidateSource;
  status: ProductCandidateStatus;
  recommendedAction: ProductResearchRecommendedAction;
  recommendedActionLabel: string;
  latestScore: ScoreSnapshot | null;
  primaryRiskSeverity: ProductResearchRiskSeverity;
  finalScore?: number | null;
  riskScore?: number | null;
  validatedScore?: number | null;
  possibleDuplicateOfId?: string | null;
  createdAt: string;
  updatedAt: string;
  suppliers: SupplierComparison[];
  riskFlags: RiskFlagInput[];
  scores: ScoreSnapshotInput[];
  decisions: Array<CandidateDecisionRecord & { createdAt: string }>;
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

export const recommendedActionLabels: Record<ProductResearchRecommendedAction, string> = {
  SAMPLE: "Sample",
  TEST: "Test",
  WATCH: "Watch",
  REJECT: "Reject",
  REVIEW: "Review",
};

export const riskSeverityRank: Record<ProductResearchRiskSeverity, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  BLOCKING: 3,
};
