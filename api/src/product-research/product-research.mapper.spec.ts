import {
  getLatestCandidateScore,
  getPrimaryRiskSeverity,
  mapCandidateDetail,
  mapCandidateListItem,
  mapRecommendedActionBadge,
  mapSupplierQuoteComparison,
} from "./product-research.mapper";

describe("product research mapper", () => {
  it("maps a candidate list item with the latest score snapshot", () => {
    const result = mapCandidateListItem({
      id: "cand_1",
      productName: "PulseBand Sweat Guard",
      category: "Sweat",
      targetMarket: "US",
      source: "AI_GENERATED",
      status: "RESEARCHING",
      recommendedAction: "TEST",
      finalScore: 78.4,
      riskScore: 35,
      validatedScore: null,
      updatedAt: new Date("2026-05-25T02:00:00.000Z"),
      scores: [
        {
          id: "score_older",
          finalScore: 71,
          scoringVersion: "v1",
          createdAt: new Date("2026-05-24T00:00:00.000Z"),
        },
        {
          id: "score_latest",
          finalScore: 78.4,
          scoringVersion: "v2",
          createdAt: new Date("2026-05-25T01:00:00.000Z"),
        },
      ],
      riskFlags: [{ severity: "MEDIUM" }, { severity: "LOW" }],
      suppliers: [{ supplierId: "sup_1" }, { supplierId: "sup_2" }],
    });

    expect(result).toEqual({
      id: "cand_1",
      productName: "PulseBand Sweat Guard",
      category: "Sweat",
      targetMarket: "US",
      source: "AI_GENERATED",
      status: "RESEARCHING",
      recommendedAction: "TEST",
      recommendedActionLabel: "Test",
      finalScore: 78.4,
      riskScore: 35,
      validatedScore: null,
      primaryRiskSeverity: "MEDIUM",
      supplierCount: 2,
      latestScore: {
        id: "score_latest",
        finalScore: 78.4,
        scoringVersion: "v2",
        createdAt: "2026-05-25T01:00:00.000Z",
      },
      updatedAt: "2026-05-25T02:00:00.000Z",
    });
  });

  it("maps a candidate detail payload with normalized timestamps", () => {
    const result = mapCandidateDetail({
      id: "cand_2",
      productName: "CourtDry Wrist Band",
      status: "APPROVED",
      recommendedAction: "SAMPLE",
      createdAt: new Date("2026-05-25T02:30:00.000Z"),
      updatedAt: new Date("2026-05-25T03:00:00.000Z"),
      scores: [{ id: "score_1", finalScore: 86.25, scoringVersion: "v3", createdAt: new Date("2026-05-25T02:45:00.000Z") }],
      suppliers: [{ supplierId: "sup_1", quotedUnitPriceCents: 320, quotedLeadTimeDays: 9, supplier: { id: "sup_1", name: "Ningbo Fit Supply", platform: "ALIBABA" } }],
      riskFlags: [{ severity: "HIGH", riskType: "medical_claim", message: "Mentions pain relief." }],
      decisions: [{ id: "decision_1", decision: "APPROVE", createdAt: new Date("2026-05-25T03:10:00.000Z") }],
      signals: [],
      testLaunches: [],
    });

    expect(result.latestScore?.finalScore).toBe(86.25);
    expect(result.primaryRiskSeverity).toBe("HIGH");
    expect(result.createdAt).toBe("2026-05-25T02:30:00.000Z");
    expect(result.decisions[0]?.createdAt).toBe("2026-05-25T03:10:00.000Z");
  });

  it("prefers the newest score when projecting the latest score", () => {
    expect(getLatestCandidateScore([
      { id: "score_1", finalScore: 62, scoringVersion: "v1", createdAt: new Date("2026-05-24T00:00:00.000Z") },
      { id: "score_2", finalScore: 81, scoringVersion: "v2", createdAt: new Date("2026-05-25T00:00:00.000Z") },
    ])).toEqual({
      id: "score_2",
      finalScore: 81,
      scoringVersion: "v2",
      createdAt: "2026-05-25T00:00:00.000Z",
    });
  });

  it("maps recommended action values to UI-safe labels", () => {
    expect(mapRecommendedActionBadge("SAMPLE")).toEqual({ value: "SAMPLE", label: "Sample" });
    expect(mapRecommendedActionBadge("REVIEW")).toEqual({ value: "REVIEW", label: "Review" });
  });

  it("rolls up the highest risk severity", () => {
    expect(getPrimaryRiskSeverity([{ severity: "LOW" }, { severity: "BLOCKING" }, { severity: "HIGH" }])).toBe("BLOCKING");
    expect(getPrimaryRiskSeverity([])).toBe("LOW");
  });

  it("maps supplier quote comparison rows", () => {
    expect(mapSupplierQuoteComparison({
      supplierId: "sup_9",
      quotedUnitPriceCents: 240,
      quotedMoq: 200,
      quotedLeadTimeDays: 12,
      supplier: {
        id: "sup_9",
        name: "Yiwu Motion Factory",
        platform: "ALIBABA",
        shippingToUSCents: 80,
        shippingToUKCents: 95,
        verifiedSupplier: true,
        tradeAssurance: true,
      },
    })).toEqual({
      supplierId: "sup_9",
      supplierName: "Yiwu Motion Factory",
      platform: "ALIBABA",
      quotedUnitPriceCents: 240,
      quotedMoq: 200,
      quotedLeadTimeDays: 12,
      shippingToUSCents: 80,
      shippingToUKCents: 95,
      verifiedSupplier: true,
      tradeAssurance: true,
    });
  });
});
