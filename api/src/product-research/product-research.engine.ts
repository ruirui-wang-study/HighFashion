import type { Prisma } from "@prisma/client";

export const defaultScoringWeights = {
  marketDemand: 0.15,
  trendSeasonality: 0.1,
  competitionGap: 0.1,
  marginPotential: 0.15,
  logisticsFit: 0.1,
  brandability: 0.15,
  supplierQuality: 0.1,
  riskInverse: 0.1,
  testability: 0.05,
} as const;

export const blockingRiskKeywords = [
  { keyword: "medical", riskType: "MEDICAL_CLAIM", severity: "BLOCKING", message: "Medical claim language requires rejection or explicit compliance review." },
  { keyword: "therapy", riskType: "MEDICAL_CLAIM", severity: "BLOCKING", message: "Therapy claims are not allowed for standard product research approval." },
  { keyword: "pain relief", riskType: "MEDICAL_CLAIM", severity: "BLOCKING", message: "Pain relief messaging creates medical claim risk." },
  { keyword: "cure", riskType: "MEDICAL_CLAIM", severity: "BLOCKING", message: "Cure claims are not permitted in this catalog." },
  { keyword: "children", riskType: "CHILD_SAFETY", severity: "BLOCKING", message: "Children's safety products require separate compliance review." },
  { keyword: "helmet", riskType: "PROTECTIVE_GEAR", severity: "BLOCKING", message: "Helmets and high-safety protective gear are out of scope." },
  { keyword: "electric", riskType: "ELECTRONICS", severity: "BLOCKING", message: "Electric products are blocked in the current sourcing scope." },
  { keyword: "heated", riskType: "ELECTRONICS", severity: "BLOCKING", message: "Heated products create elevated product safety risk." },
  { keyword: "supplement", riskType: "CONSUMABLE", severity: "BLOCKING", message: "Supplements are blocked from this product research pipeline." },
  { keyword: "food", riskType: "CONSUMABLE", severity: "BLOCKING", message: "Food products are blocked from this product research pipeline." },
  { keyword: "replica", riskType: "IP_RISK", severity: "BLOCKING", message: "Replica or imitation products must be rejected." },
  { keyword: "branded", riskType: "IP_RISK", severity: "HIGH", message: "Branded references may create trademark or supplier image rights risk." },
] as const;

export type ProductResearchCandidateSeed = {
  productName: string;
  chineseName?: string | null;
  category: string;
  targetMarket: string;
  targetAudience?: string | null;
  useCase?: string | null;
  description?: string | null;
  notes?: string | null;
  alibabaKeywords?: string | null;
  sourceUrl?: string | null;
  rawImportData?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | null;
  aiDraftPayload?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | null;
};

export type SupplierAssessmentInput = {
  verifiedSupplier?: boolean;
  tradeAssurance?: boolean;
  responseRate?: number | null;
  moq?: number | null;
  samplePriceCents?: number | null;
  unitPriceCents?: number | null;
  customLogoMoq?: number | null;
  customPackagingMoq?: number | null;
  leadTimeDays?: number | null;
  shippingToUSCents?: number | null;
  shippingToUKCents?: number | null;
  certifications?: string[] | null;
};

export type SignalInput = {
  source: string;
  metricName: string;
  metricValue: number;
  rawData?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | null;
};

export type RiskFlagDraft = {
  riskType: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "BLOCKING";
  message: string;
};

export function evaluateCandidateRisk(candidate: ProductResearchCandidateSeed, suppliers: SupplierAssessmentInput[] = []) {
  const haystack = `${candidate.productName} ${candidate.category} ${candidate.targetAudience ?? ""} ${candidate.useCase ?? ""} ${candidate.description ?? ""} ${candidate.notes ?? ""} ${candidate.alibabaKeywords ?? ""}`.toLowerCase();
  const flags: RiskFlagDraft[] = [];

  for (const rule of blockingRiskKeywords) {
    if (haystack.includes(rule.keyword)) {
      flags.push({ riskType: rule.riskType, severity: rule.severity, message: rule.message });
    }
  }

  if (/(brace|sleeve|sock|compression)/i.test(haystack)) {
    flags.push({ riskType: "SIZE_COMPLEXITY", severity: "MEDIUM", message: "Fit-sensitive product may create size mismatch and return risk." });
  }
  if (/(glass|bladder|bottle)/i.test(haystack)) {
    flags.push({ riskType: "BREAKAGE_OR_LEAK", severity: "MEDIUM", message: "Hydration gear needs packaging and leak-proof validation." });
  }
  if (suppliers.length === 0) {
    flags.push({ riskType: "SUPPLIER_UNVERIFIED", severity: "HIGH", message: "No supplier quote is attached yet." });
  }
  if (suppliers.some((supplier) => (supplier.leadTimeDays ?? 0) > 20)) {
    flags.push({ riskType: "LEAD_TIME", severity: "HIGH", message: "Supplier lead time is long for initial test velocity." });
  }
  if (suppliers.some((supplier) => (supplier.moq ?? 0) > 800)) {
    flags.push({ riskType: "MOQ", severity: "MEDIUM", message: "MOQ is high relative to initial test inventory." });
  }
  if (suppliers.some((supplier) => !supplier.verifiedSupplier && !supplier.tradeAssurance)) {
    flags.push({ riskType: "SUPPLIER_QUALITY", severity: "HIGH", message: "Supplier lacks verification and trade assurance." });
  }

  const severityWeight = { LOW: 10, MEDIUM: 20, HIGH: 35, BLOCKING: 80 } as const;
  const riskScore = clamp(
    flags.reduce((total, flag) => total + severityWeight[flag.severity], 0) / Math.max(flags.length, 1),
    0,
    100,
  );

  return {
    flags: dedupeRiskFlags(flags),
    riskScore,
  };
}

export function calculateCandidateScore(input: {
  candidate: ProductResearchCandidateSeed;
  suppliers: SupplierAssessmentInput[];
  signals: SignalInput[];
  riskScore: number;
  weights?: Partial<typeof defaultScoringWeights>;
}) {
  const weights = { ...defaultScoringWeights, ...(input.weights ?? {}) };
  const marketDemandScore = signalAverage(input.signals, ["searchDemand", "salesSignal", "painPointClarity"], fallbackMarketDemand(input.candidate));
  const trendSeasonalityScore = signalAverage(input.signals, ["trendMomentum", "summerFit", "marketFit"], fallbackTrend(input.candidate));
  const competitionGapScore = signalAverage(input.signals, ["competitionGap", "reviewImprovementGap"], fallbackCompetition(input.candidate));
  const marginPotentialScore = calculateMarginScore(input.suppliers);
  const logisticsFitScore = calculateLogisticsScore(input.candidate, input.suppliers);
  const brandabilityScore = signalAverage(input.signals, ["brandability", "contentPotential", "bundlePotential"], fallbackBrandability(input.candidate));
  const supplierQualityScore = calculateSupplierQualityScore(input.suppliers);
  const testabilityScore = signalAverage(input.signals, ["testability", "creativeFit", "seoPotential"], fallbackTestability(input.candidate));
  const riskInverseScore = clamp(100 - input.riskScore, 0, 100);

  const finalScore = Number(
    (
      marketDemandScore * weights.marketDemand +
      trendSeasonalityScore * weights.trendSeasonality +
      competitionGapScore * weights.competitionGap +
      marginPotentialScore * weights.marginPotential +
      logisticsFitScore * weights.logisticsFit +
      brandabilityScore * weights.brandability +
      supplierQualityScore * weights.supplierQuality +
      riskInverseScore * weights.riskInverse +
      testabilityScore * weights.testability
    ).toFixed(2),
  );

  const recommendedAction = recommendAction({
    finalScore,
    riskScore: input.riskScore,
    marginPotentialScore,
    logisticsFitScore,
    supplierQualityScore,
  });

  return {
    dimensions: {
      marketDemandScore,
      trendSeasonalityScore,
      competitionGapScore,
      marginPotentialScore,
      logisticsFitScore,
      brandabilityScore,
      supplierQualityScore,
      riskScore: input.riskScore,
      riskInverseScore,
      testabilityScore,
      finalScore,
    },
    recommendedAction,
  };
}

export function calculateTestScore(input: {
  ctr?: number | null;
  addToCartRate?: number | null;
  checkoutRate?: number | null;
  purchaseRate?: number | null;
  productViews?: number | null;
  beginCheckout?: number | null;
  customerFeedbackScore?: number | null;
  refundRiskScore?: number | null;
}) {
  const ctrScore = percentScore(input.ctr ?? 0, 0.01, 0.05);
  const engagementScore = volumeScore(input.productViews ?? 0, 50, 500);
  const addToCartScore = percentScore(input.addToCartRate ?? 0, 0.02, 0.12);
  const checkoutScore = percentScore(input.checkoutRate ?? 0, 0.01, 0.08);
  const purchaseScore = percentScore(input.purchaseRate ?? 0, 0.003, 0.04);
  const feedbackScore = clamp(input.customerFeedbackScore ?? 60, 0, 100);
  const refundRiskInverse = clamp(100 - (input.refundRiskScore ?? 30), 0, 100);

  return Number(
    (
      ctrScore * 0.15 +
      engagementScore * 0.1 +
      addToCartScore * 0.25 +
      checkoutScore * 0.15 +
      purchaseScore * 0.2 +
      feedbackScore * 0.1 +
      refundRiskInverse * 0.05
    ).toFixed(2),
  );
}

export function calculateValidatedScore(initialScore: number | null | undefined, testScore: number | null | undefined) {
  if (initialScore == null && testScore == null) return null;
  if (initialScore == null) return testScore ?? null;
  if (testScore == null) return initialScore;
  return Number((initialScore * 0.6 + testScore * 0.4).toFixed(2));
}

export function recommendAction(input: {
  finalScore: number;
  riskScore: number;
  marginPotentialScore: number;
  logisticsFitScore: number;
  supplierQualityScore: number;
}) {
  if (input.riskScore >= 70) return "REVIEW" as const;
  if (input.marginPotentialScore < 50) return "WATCH" as const;
  if (input.supplierQualityScore < 50) return "WATCH" as const;
  if (input.logisticsFitScore < 50) return "WATCH" as const;
  if (input.finalScore >= 85) return "SAMPLE" as const;
  if (input.finalScore >= 75) return "TEST" as const;
  if (input.finalScore >= 65) return "WATCH" as const;
  return "REJECT" as const;
}

export function candidateStatusFromAssessment(recommendedAction: "SAMPLE" | "TEST" | "WATCH" | "REJECT" | "REVIEW", riskScore: number) {
  if (riskScore >= 70 || recommendedAction === "REVIEW") return "HIGH_RISK_REVIEW" as const;
  if (recommendedAction === "SAMPLE") return "SAMPLE" as const;
  if (recommendedAction === "TEST") return "TEST" as const;
  if (recommendedAction === "REJECT") return "REJECTED" as const;
  return "WATCH" as const;
}

function calculateMarginScore(suppliers: SupplierAssessmentInput[]) {
  if (!suppliers.length) return 45;
  const supplier = pickBestSupplier(suppliers);
  const unit = supplier.unitPriceCents ?? 0;
  const shipping = Math.min(supplier.shippingToUSCents ?? supplier.shippingToUKCents ?? 0, 900);
  const samplePenalty = Math.min((supplier.samplePriceCents ?? 0) / 20, 20);
  const estimatedSellingPrice = estimateSellingPrice(unit, shipping);
  const estimatedCosts = unit + shipping + Math.round(estimatedSellingPrice * 0.06) + 180;
  const margin = estimatedSellingPrice <= 0 ? 0 : (estimatedSellingPrice - estimatedCosts) / estimatedSellingPrice;
  return clamp(Math.round(margin * 130 - samplePenalty + 35), 0, 100);
}

function calculateLogisticsScore(candidate: ProductResearchCandidateSeed, suppliers: SupplierAssessmentInput[]) {
  let score = 70;
  const haystack = `${candidate.productName} ${candidate.category} ${candidate.description ?? ""}`.toLowerCase();
  if (/(bottle|bladder)/i.test(haystack)) score -= 10;
  if (/(belt|socks|headband|wristband|brace)/i.test(haystack)) score += 8;
  if (suppliers.some((supplier) => (supplier.leadTimeDays ?? 0) > 20)) score -= 15;
  if (suppliers.some((supplier) => (supplier.shippingToUSCents ?? 0) > 900)) score -= 10;
  return clamp(score, 0, 100);
}

function calculateSupplierQualityScore(suppliers: SupplierAssessmentInput[]) {
  if (!suppliers.length) return 25;
  const supplier = pickBestSupplier(suppliers);
  let score = 35;
  if (supplier.verifiedSupplier) score += 20;
  if (supplier.tradeAssurance) score += 15;
  if ((supplier.responseRate ?? 0) >= 0.9) score += 10;
  if ((supplier.moq ?? 1000) <= 200) score += 10;
  if ((supplier.customLogoMoq ?? 9999) <= 500) score += 5;
  if ((supplier.customPackagingMoq ?? 9999) <= 1000) score += 5;
  if ((supplier.leadTimeDays ?? 99) <= 12) score += 5;
  if ((supplier.certifications?.length ?? 0) > 0) score += 5;
  return clamp(score, 0, 100);
}

function signalAverage(signals: SignalInput[], metricNames: string[], fallback: number) {
  const matches = signals.filter((signal) => metricNames.includes(signal.metricName)).map((signal) => signal.metricValue);
  if (!matches.length) return fallback;
  return clamp(Math.round(matches.reduce((a, b) => a + b, 0) / matches.length), 0, 100);
}

function fallbackMarketDemand(candidate: ProductResearchCandidateSeed) {
  let score = 55;
  if (/running|run|training|pickleball|tennis/i.test(candidate.productName + candidate.useCase)) score += 10;
  if (/belt|socks|headband|wristband|brace/i.test(candidate.productName + candidate.category)) score += 8;
  return clamp(score, 0, 100);
}

function fallbackTrend(candidate: ProductResearchCandidateSeed) {
  let score = /us|uk/i.test(candidate.targetMarket) ? 60 : 52;
  if (/summer|hydration|outdoor/i.test(`${candidate.useCase ?? ""} ${candidate.description ?? ""}`)) score += 8;
  return clamp(score, 0, 100);
}

function fallbackCompetition(candidate: ProductResearchCandidateSeed) {
  return clamp(/pickleball|court|sweat/i.test(candidate.productName + candidate.category) ? 68 : 58, 0, 100);
}

function fallbackBrandability(candidate: ProductResearchCandidateSeed) {
  let score = 58;
  if (/socks|band|belt|brace/i.test(candidate.productName + candidate.category)) score += 14;
  if (/logo|bundle|color/i.test(`${candidate.description ?? ""} ${candidate.notes ?? ""}`)) score += 8;
  return clamp(score, 0, 100);
}

function fallbackTestability(candidate: ProductResearchCandidateSeed) {
  return clamp(/belt|sock|bottle|headband|wristband|brace/i.test(candidate.productName + candidate.category) ? 74 : 60, 0, 100);
}

function estimateSellingPrice(unitPriceCents: number, shippingCents: number) {
  const costBase = unitPriceCents + shippingCents;
  if (costBase <= 0) return 2800;
  return Math.max(2400, Math.round(costBase * 3.6));
}

function pickBestSupplier(suppliers: SupplierAssessmentInput[]) {
  return [...suppliers].sort((left, right) => {
    const leftScore = Number(Boolean(left.verifiedSupplier)) * 3 + Number(Boolean(left.tradeAssurance)) * 2 - (left.unitPriceCents ?? 999999) / 10000;
    const rightScore = Number(Boolean(right.verifiedSupplier)) * 3 + Number(Boolean(right.tradeAssurance)) * 2 - (right.unitPriceCents ?? 999999) / 10000;
    return rightScore - leftScore;
  })[0];
}

function percentScore(value: number, low: number, high: number) {
  if (value <= low) return 20;
  if (value >= high) return 95;
  return clamp(Math.round(20 + ((value - low) / (high - low)) * 75), 0, 100);
}

function volumeScore(value: number, low: number, high: number) {
  if (value <= low) return 20;
  if (value >= high) return 95;
  return clamp(Math.round(20 + ((value - low) / (high - low)) * 75), 0, 100);
}

function dedupeRiskFlags(flags: RiskFlagDraft[]) {
  const map = new Map<string, RiskFlagDraft>();
  for (const flag of flags) {
    const key = `${flag.riskType}:${flag.severity}:${flag.message}`;
    if (!map.has(key)) map.set(key, flag);
  }
  return [...map.values()];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
