import type {
  CandidateDetailItem,
  CandidateDetailRecord,
  CandidateListItem,
  CandidateListRecord,
  ProductResearchRecommendedAction,
  ProductResearchRiskReviewItem,
  ProductResearchRiskSeverity,
  RiskFlagInput,
  ScoreSnapshot,
  ScoreSnapshotInput,
  SupplierComparison,
  SupplierComparisonInput,
} from "./product-research.types";
import { recommendedActionLabels, riskSeverityRank } from "./product-research.types";

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export function getLatestCandidateScore(scores: ScoreSnapshotInput[]): ScoreSnapshot | null {
  if (!scores.length) return null;

  const latest = [...scores].sort((left, right) => {
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  })[0];

  return {
    id: latest.id,
    finalScore: latest.finalScore,
    scoringVersion: latest.scoringVersion,
    createdAt: toIsoString(latest.createdAt),
  };
}

export function getOpenRiskFlags(flags: RiskFlagInput[]) {
  return flags.filter((flag) => !flag.resolvedAt);
}

export function getPrimaryRiskSeverity(flags: RiskFlagInput[]): ProductResearchRiskSeverity {
  const openFlags = getOpenRiskFlags(flags);
  if (openFlags.length === 0) return "LOW";

  return [...openFlags].sort((left, right) => riskSeverityRank[right.severity] - riskSeverityRank[left.severity])[0]?.severity ?? "LOW";
}

export function mapRecommendedActionBadge(value: ProductResearchRecommendedAction) {
  return { value, label: recommendedActionLabels[value] };
}

export function mapSupplierQuoteComparison(input: SupplierComparisonInput): SupplierComparison {
  return {
    supplierId: input.supplierId,
    supplierName: input.supplier.name,
    platform: input.supplier.platform,
    quotedUnitPriceCents: input.quotedUnitPriceCents ?? null,
    quotedMoq: input.quotedMoq ?? null,
    quotedLeadTimeDays: input.quotedLeadTimeDays ?? null,
    shippingToUSCents: input.supplier.shippingToUSCents ?? null,
    shippingToUKCents: input.supplier.shippingToUKCents ?? null,
    verifiedSupplier: Boolean(input.supplier.verifiedSupplier),
    tradeAssurance: Boolean(input.supplier.tradeAssurance),
  };
}

export function mapRiskReviewItem(record: CandidateListRecord): ProductResearchRiskReviewItem {
  const base = mapCandidateListItem(record);
  const openRiskFlags = getOpenRiskFlags(record.riskFlags ?? [])
    .filter((flag): flag is RiskFlagInput & { id: string } => Boolean(flag.id))
    .map((flag) => ({
      id: flag.id!,
      riskType: flag.riskType ?? "UNKNOWN",
      severity: flag.severity,
      message: flag.message ?? "",
      createdAt: flag.createdAt ? toIsoString(flag.createdAt) : new Date().toISOString(),
    }));

  return {
    ...base,
    openRiskFlags,
  };
}

export function mapCandidateListItem(record: CandidateListRecord): CandidateListItem {
  return {
    id: record.id,
    productName: record.productName,
    category: record.category,
    targetMarket: record.targetMarket,
    source: record.source,
    status: record.status,
    recommendedAction: record.recommendedAction,
    recommendedActionLabel: recommendedActionLabels[record.recommendedAction],
    finalScore: record.finalScore ?? null,
    riskScore: record.riskScore ?? null,
    validatedScore: record.validatedScore ?? null,
    primaryRiskSeverity: getPrimaryRiskSeverity(record.riskFlags ?? []),
    supplierCount: record.suppliers?.length ?? 0,
    latestScore: getLatestCandidateScore(record.scores ?? []),
    updatedAt: toIsoString(record.updatedAt),
  };
}

export function mapCandidateDetail(record: CandidateDetailRecord): CandidateDetailItem {
  return {
    id: record.id,
    productName: record.productName,
    chineseName: record.chineseName ?? null,
    category: record.category,
    targetMarket: record.targetMarket,
    targetAudience: record.targetAudience ?? null,
    useCase: record.useCase ?? null,
    description: record.description ?? null,
    notes: record.notes ?? null,
    source: record.source,
    status: record.status,
    recommendedAction: record.recommendedAction,
    recommendedActionLabel: recommendedActionLabels[record.recommendedAction],
    latestScore: getLatestCandidateScore(record.scores),
    primaryRiskSeverity: getPrimaryRiskSeverity(record.riskFlags),
    finalScore: record.finalScore ?? null,
    riskScore: record.riskScore ?? null,
    validatedScore: record.validatedScore ?? null,
    possibleDuplicateOfId: record.possibleDuplicateOfId ?? null,
    createdAt: toIsoString(record.createdAt),
    updatedAt: toIsoString(record.updatedAt),
    suppliers: record.suppliers.map(mapSupplierQuoteComparison),
    riskFlags: record.riskFlags.map((flag) => ({
      id: flag.id,
      riskType: flag.riskType,
      severity: flag.severity,
      message: flag.message,
      resolvedAt: flag.resolvedAt ? toIsoString(flag.resolvedAt) : null,
      resolutionNote: flag.resolutionNote ?? null,
      createdAt: flag.createdAt ? toIsoString(flag.createdAt) : undefined,
    })),
    hasUnresolvedBlockingRisk: getOpenRiskFlags(record.riskFlags).some((flag) => flag.severity === "BLOCKING"),
    scores: record.scores.map((score) => ({
      ...score,
      createdAt: toIsoString(score.createdAt),
    })),
    decisions: record.decisions.map((decision) => ({
      ...decision,
      createdAt: toIsoString(decision.createdAt),
    })),
    signals: record.signals.map((signal) => ({
      ...signal,
      collectedAt: toIsoString(signal.collectedAt),
    })),
    testLaunches: record.testLaunches.map((launch) => ({
      ...launch,
      startedAt: launch.startedAt ? toIsoString(launch.startedAt) : null,
      endedAt: launch.endedAt ? toIsoString(launch.endedAt) : null,
      createdAt: toIsoString(launch.createdAt),
    })),
  };
}
