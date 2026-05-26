import type { Guide } from "./types";

export type PublishedGuide = {
  id: string;
  title: string;
  slug: string;
  status: "PUBLISHED";
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  updatedAt: string;
  dek: string;
  category: string;
  authorName: string;
  authorRole: string;
  readTime: string;
  sections: Guide["sections"];
  faq: Guide["faq"];
  relatedProducts: string[];
  relatedCollections: Guide["relatedCollections"];
  relatedGuides: string[];
};

export type PublishedFaq = {
  title: string;
  seoTitle: string | null;
  seoDescription: string | null;
  items: Guide["faq"];
};

export type PublishedCollectionLanding = {
  title: string;
  description: string;
  intro: string;
  pathname: string;
  slug: string;
  scenario: string | null;
  category: string | null;
  useCase: string | null;
  relatedGuideSlugs: string[];
  updatedAt: string;
};

export type PublishedAboutStaticPage = {
  pageKey: "ABOUT";
  title: string;
  seoTitle: string | null;
  seoDescription: string | null;
  pathname: string;
  slug: string;
  updatedAt: string;
  content: {
    eyebrow: string;
    heroTitle: string;
    heroBody: string;
    paragraphs: string[];
    visualLabel: string;
  };
};

export type PublishedFitGuideStaticPage = {
  pageKey: "FIT_GUIDE";
  title: string;
  seoTitle: string | null;
  seoDescription: string | null;
  pathname: string;
  slug: string;
  updatedAt: string;
  content: {
    eyebrow: string;
    title: string;
    body: string;
    cards: Array<{ title: string }>;
    headers: {
      product: string;
      measure: string;
      fitCheck: string;
    };
    rows: Array<{
      product: string;
      measure: string;
      fitCheck: string;
    }>;
  };
};

export type PublishedHomeStaticPage = {
  pageKey: "HOME_PAGE";
  title: string;
  seoTitle: string | null;
  seoDescription: string | null;
  pathname: string;
  slug: string;
  updatedAt: string;
  content: {
    metadataTitle: string;
    metadataDescription: string;
    eyebrow: string;
    heroTitle: string;
    heroBody: string;
    ctas: [string, string, string];
    visualLabel: string;
    shopByScenario: string;
    scenes: [string, string, string, string];
    scenarioLinks: [string, string, string, string];
    benefitsEyebrow: string;
    benefitsTitle: string;
    benefits: Array<{ title: string; body: string }>;
    bundlesEyebrow: string;
    bundlesTitle: string;
    bundles: Array<{ title: string }>;
    bundlePrefix: string;
    bundleBody: string;
    shopKit: string;
    reviewsEyebrow: string;
    reviewsTitle: string;
    reviewsBody: string;
    showReviews: boolean;
    reviewQuotes: Array<{ quote: string }>;
    verifiedReview: string;
    guidesEyebrow: string;
    guidesTitle: string;
    guidesBody: string;
    browseGuides: string;
    featuredGuideSlugs: [string, string, string];
    bestSellersEyebrow: string;
    bestSellersTitle: string;
    bestSellersBody: string;
    compareEyebrow: string;
    compareTitle: string;
    compareTable: [string, string, string, string];
    compareSupportHigh: string;
    compareSupportLight: string;
    compareCarryYes: string;
    compareCarryNo: string;
  };
};

export type PublishedStaticPage = PublishedAboutStaticPage | PublishedFitGuideStaticPage | PublishedHomeStaticPage;

export function mapPublishedGuideToGuide(guide: PublishedGuide): Guide {
  return {
    title: guide.title,
    slug: guide.slug,
    metaTitle: guide.seoTitle?.trim() || `${guide.title} | PulseGear Guides`,
    metaDescription: guide.seoDescription?.trim() || guide.dek,
    dek: guide.dek,
    publishedAt: guide.publishedAt ? guide.publishedAt.slice(0, 10) : guide.updatedAt.slice(0, 10),
    updatedAt: guide.updatedAt.slice(0, 10),
    author: { name: guide.authorName, role: guide.authorRole },
    category: guide.category,
    readTime: guide.readTime,
    sections: guide.sections,
    faq: guide.faq,
    relatedProducts: guide.relatedProducts,
    relatedCollections: guide.relatedCollections,
    relatedGuides: guide.relatedGuides,
  };
}
