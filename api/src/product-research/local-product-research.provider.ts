import { Injectable } from "@nestjs/common";
import type { CandidateImportDraft, ProductResearchSignalDraft } from "./product-research.provider";
import { ProductResearchProvider } from "./product-research.provider";

const seedIdeas = [
  { name: "SprintLock Race Belt", category: "running-belts", audience: "runners", useCase: "race day and long runs", description: "No-bounce bib belt with soft flask pocket and reflective trim.", keywords: "running race belt no bounce hydration bib", brandAngle: "lightweight race-day utility", summary: "Lean, no-bounce carry for race-day runners who hate bulky waist packs." },
  { name: "CourtDry Grip Towel", category: "court-accessories", audience: "pickleball and tennis players", useCase: "hot court sessions", description: "Clip-on microfiber towel for sweat control between rallies.", keywords: "pickleball towel tennis sweat towel clip", brandAngle: "court-side sweat management", summary: "Simple court accessory with clear bundle and logo potential." },
  { name: "PulseFlex Elbow Sleeve", category: "support-gear", audience: "lifters and court athletes", useCase: "training support and warm-up", description: "Breathable compression sleeve with anti-slip cuff and neutral styling.", keywords: "elbow sleeve compression gym tennis", brandAngle: "performance support without bulky medical cues", summary: "Functional support gear that stays inside allowed sports-accessory positioning." },
  { name: "HydraClip Flask Carrier", category: "hydration-accessories", audience: "runners", useCase: "summer outdoor training", description: "Handheld flask strap with no-slip grip and stash pocket.", keywords: "running flask strap hydration handheld", brandAngle: "summer-ready hydration utility", summary: "Content-friendly hydration accessory for warm-weather training." },
  { name: "GripFlow Training Socks", category: "sport-socks", audience: "gym users", useCase: "training and studio sessions", description: "Performance socks with heel lock, arch compression, and breathable knit zones.", keywords: "training socks grip gym running", brandAngle: "everyday performance upgrade", summary: "Repeat-purchase accessory with color and bundle potential." },
  { name: "CarryLite Pickleball Pouch", category: "court-accessories", audience: "pickleball players", useCase: "casual court carry", description: "Compact paddle bag insert for balls, grip tape, and essentials.", keywords: "pickleball accessories pouch balls grip tape", brandAngle: "organized court carry", summary: "Accessory-led court SKU with easy education and content hooks." },
];

@Injectable()
export class LocalProductResearchProvider extends ProductResearchProvider {
  async generateCandidates(input: {
    brandDirection?: string;
    targetMarket?: string;
    excludedCategories?: string[];
    count: number;
  }) {
    const excluded = new Set((input.excludedCategories ?? []).map((item) => item.toLowerCase().trim()));
    const market = input.targetMarket?.trim() || "US";
    const direction = input.brandDirection?.trim() || "performance utility";
    return seedIdeas
      .filter((idea) => !excluded.has(idea.category.toLowerCase()))
      .slice(0, input.count)
      .map<CandidateImportDraft>((idea) => ({
        productName: idea.name,
        slugSuggestion: idea.name,
        category: idea.category,
        targetMarket: market,
        targetAudience: idea.audience,
        useCase: idea.useCase,
        description: idea.description,
        brandAngle: `${direction} - ${idea.brandAngle}`,
        positioningSummary: idea.summary,
        alibabaKeywords: idea.keywords,
        source: "AI_GENERATED",
        aiDraftPayload: {
          seoTitle: `${idea.name} for ${market} athletes | PulseGear`,
          seoDescription: idea.summary,
          features: [
            "AI Draft: test-ready merchandising angle",
            "AI Draft: supplier briefing starter",
            "AI Draft: SEO-friendly accessory positioning",
          ],
          benefits: [
            "AI Draft: lightweight performance utility",
            "AI Draft: straightforward usage story for ads and SEO",
            "AI Draft: suitable for sample-first evaluation",
          ],
        },
        duplicateHints: [],
        riskWarnings: [],
      }));
  }

  async enrichAlibabaLinks(input: { links: string[]; notes?: string | null }) {
    return input.links.map<CandidateImportDraft>((link, index) => {
      const normalized = link.trim();
      const slug = normalized.split("/").filter(Boolean).at(-1)?.replace(/[-_]/g, " ") || `Alibaba candidate ${index + 1}`;
      const title = titleCase(slug.replace(/\?.*$/, ""));
      return {
        productName: title,
        slugSuggestion: title,
        category: inferCategoryFromText(title),
        targetMarket: "US",
        targetAudience: inferAudienceFromText(title),
        useCase: inferUseCaseFromText(title),
        description: `Imported from Alibaba link for manual enrichment. ${input.notes ?? ""}`.trim(),
        brandAngle: "supplier-led candidate intake",
        positioningSummary: "Link-based candidate requires quote and image-rights validation before testing.",
        alibabaKeywords: title.toLowerCase(),
        sourceUrl: normalized,
        source: "ALIBABA_LINK",
        rawImportData: { link: normalized, notes: input.notes ?? null },
        aiDraftPayload: {
          seoTitle: `${title} draft | PulseGear research`,
          seoDescription: "Alibaba-sourced candidate pending supplier validation and product research scoring.",
        },
        riskWarnings: normalized.includes("branded") ? ["Potential branded listing - review IP risk before commit."] : [],
      };
    });
  }

  async collectSignals(input: {
    candidate: {
      productName: string;
      category: string;
      targetMarket: string;
      targetAudience?: string | null;
      useCase?: string | null;
      description?: string | null;
      notes?: string | null;
      alibabaKeywords?: string | null;
    };
  }) {
    const haystack = `${input.candidate.productName} ${input.candidate.category} ${input.candidate.useCase ?? ""} ${input.candidate.description ?? ""}`.toLowerCase();
    const seasonBoost = /summer|hydration|outdoor/.test(haystack) ? 78 : 62;
    const courtBoost = /pickleball|tennis|court/.test(haystack) ? 74 : 60;
    const performanceBoost = /running|training|gym|support|sock|belt|brace/.test(haystack) ? 72 : 58;

    const signals: ProductResearchSignalDraft[] = [
      { source: "MANUAL", metricName: "searchDemand", metricValue: performanceBoost, rawData: { provider: "local-fallback" } },
      { source: "GOOGLE_TRENDS", metricName: "trendMomentum", metricValue: seasonBoost, rawData: { provider: "local-fallback" } },
      { source: "MANUAL", metricName: "competitionGap", metricValue: courtBoost, rawData: { provider: "local-fallback" } },
      { source: "MANUAL", metricName: "brandability", metricValue: 68, rawData: { provider: "local-fallback" } },
      { source: "MANUAL", metricName: "testability", metricValue: performanceBoost, rawData: { provider: "local-fallback" } },
      { source: "MANUAL", metricName: "painPointClarity", metricValue: /no bounce|support|grip|sweat|hydration/.test(haystack) ? 80 : 60, rawData: { provider: "local-fallback" } },
      { source: "MANUAL", metricName: "reviewImprovementGap", metricValue: 64, rawData: { provider: "local-fallback" } },
      { source: "MANUAL", metricName: "contentPotential", metricValue: 72, rawData: { provider: "local-fallback" } },
      { source: "MANUAL", metricName: "seoPotential", metricValue: 70, rawData: { provider: "local-fallback" } },
      { source: "GA4", metricName: "marketFit", metricValue: /us|uk/i.test(input.candidate.targetMarket) ? 75 : 55, rawData: { provider: "local-fallback" } },
      { source: "GSC", metricName: "summerFit", metricValue: seasonBoost, rawData: { provider: "local-fallback" } },
      { source: "ALIBABA", metricName: "salesSignal", metricValue: 61, rawData: { provider: "local-fallback" } },
      { source: "MANUAL", metricName: "bundlePotential", metricValue: /sock|belt|towel|band/.test(haystack) ? 76 : 62, rawData: { provider: "local-fallback" } },
      { source: "MANUAL", metricName: "creativeFit", metricValue: /belt|sock|headband|brace|bottle/.test(haystack) ? 78 : 64, rawData: { provider: "local-fallback" } },
    ];

    return signals;
  }
}

function titleCase(input: string) {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function inferCategoryFromText(input: string) {
  const value = input.toLowerCase();
  if (value.includes("sock")) return "sport-socks";
  if (value.includes("belt")) return "running-belts";
  if (value.includes("brace") || value.includes("sleeve")) return "support-gear";
  if (value.includes("bottle") || value.includes("flask")) return "hydration-accessories";
  if (value.includes("pickleball") || value.includes("tennis") || value.includes("court")) return "court-accessories";
  return "training-accessories";
}

function inferAudienceFromText(input: string) {
  const value = input.toLowerCase();
  if (value.includes("pickleball") || value.includes("tennis")) return "court sport players";
  if (value.includes("run") || value.includes("belt") || value.includes("flask")) return "runners";
  return "training users";
}

function inferUseCaseFromText(input: string) {
  const value = input.toLowerCase();
  if (value.includes("pickleball") || value.includes("tennis")) return "court sessions";
  if (value.includes("bottle") || value.includes("flask")) return "summer outdoor training";
  if (value.includes("belt")) return "running carry";
  return "training sessions";
}
