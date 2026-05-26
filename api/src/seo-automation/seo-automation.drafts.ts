export const opportunityDrafts = [
  {
    id: "opp_1",
    opportunityType: "HIGH_IMPRESSIONS_LOW_CTR",
    keyword: "best knee sleeve for running",
    currentPage: "/products/pulseflex-knee-sleeve",
    suggestedAction: "Improve title and meta description for stronger search intent match.",
    priority: "HIGH",
    expectedImpact: "High",
  },
  {
    id: "opp_2",
    opportunityType: "POSITION_8_TO_20",
    keyword: "running knee support",
    currentPage: "/guides/choose-knee-support-running",
    suggestedAction: "Refresh guide content and add stronger product CTAs.",
    priority: "MEDIUM",
    expectedImpact: "Medium",
  },
  {
    id: "opp_3",
    opportunityType: "PRODUCT_IMPRESSIONS_NO_CONVERSION",
    keyword: "best knee sleeve for running",
    currentPage: "/products/pulseflex-knee-sleeve",
    suggestedAction: "Strengthen product education and FAQ around fit and use case.",
    priority: "HIGH",
    expectedImpact: "Medium",
  },
] as const;

export const internalLinkDrafts = [
  {
    id: "link_1",
    sourcePage: "/guides/choose-knee-support-running",
    targetPage: "/products/pulseflex-knee-sleeve",
    anchorText: "breathable knee sleeve for running",
    reason: "Guide has clicks but needs a stronger product handoff.",
    priority: "HIGH",
  },
  {
    id: "link_2",
    sourcePage: "/products/pulseflex-knee-sleeve",
    targetPage: "/guides/choose-knee-support-running",
    anchorText: "how to choose knee support for running",
    reason: "Product page needs supporting educational internal links.",
    priority: "MEDIUM",
  },
] as const;

export const recommendationDrafts = [
  {
    id: "rec_1",
    recommendationType: "TITLE",
    resourceType: "product",
    pageUrl: "/products/pulseflex-knee-sleeve",
    reason: "High impressions with below-benchmark CTR and missing SEO title.",
    priority: "HIGH",
    draftPayload: {
      seoTitle: "PulseFlex Knee Sleeve for Running | Breathable Support | PulseGear",
    },
  },
  {
    id: "rec_2",
    recommendationType: "META_DESCRIPTION",
    resourceType: "product",
    pageUrl: "/products/pulseflex-knee-sleeve",
    reason: "Missing SEO description on an indexable product page.",
    priority: "HIGH",
    draftPayload: {
      seoDescription: "Breathable knee support for running and training with a secure, low-profile fit that stays comfortable through repeat sessions.",
    },
  },
  {
    id: "rec_3",
    recommendationType: "GUIDE",
    resourceType: "guide",
    pageUrl: null,
    reason: "Query demand exists without a precise landing page.",
    priority: "MEDIUM",
    draftPayload: {
      suggestedGuideTitle: "How to Choose a Knee Sleeve for Summer Running",
      targetKeyword: "best knee sleeve for running",
    },
  },
] as const;
