import type { ContentStatus } from "@prisma/client";

export type GuideSectionInput = {
  heading: string;
  body: string;
};

export type GuideFaqItemInput = {
  question: string;
  answer: string;
};

export type GuideCollectionLinkInput = {
  title: string;
  path: string;
};

export type AdminActor = {
  adminId: string;
  adminEmail: string;
};

export type GuidePayload = {
  id: string;
  title: string;
  titleEn: string | null;
  titleZh: string | null;
  slug: string;
  status: ContentStatus;
  seoTitle: string | null;
  seoTitleEn: string | null;
  seoTitleZh: string | null;
  seoDescription: string | null;
  seoDescriptionEn: string | null;
  seoDescriptionZh: string | null;
  publishedAt: string | null;
  updatedAt: string;
  dek: string;
  dekEn: string | null;
  dekZh: string | null;
  category: string;
  categoryEn: string | null;
  categoryZh: string | null;
  authorName: string;
  authorRole: string;
  authorRoleEn: string | null;
  authorRoleZh: string | null;
  readTime: string;
  readTimeEn: string | null;
  readTimeZh: string | null;
  sections: GuideSectionInput[];
  sectionsEn: GuideSectionInput[];
  sectionsZh: GuideSectionInput[];
  faq: GuideFaqItemInput[];
  faqEn: GuideFaqItemInput[];
  faqZh: GuideFaqItemInput[];
  relatedProducts: string[];
  relatedCollections: GuideCollectionLinkInput[];
  relatedGuides: string[];
};

export type FaqPayload = {
  id: string;
  title: string;
  titleEn: string | null;
  titleZh: string | null;
  slug: string;
  status: ContentStatus;
  seoTitle: string | null;
  seoTitleEn: string | null;
  seoTitleZh: string | null;
  seoDescription: string | null;
  seoDescriptionEn: string | null;
  seoDescriptionZh: string | null;
  items: GuideFaqItemInput[];
  itemsEn: GuideFaqItemInput[];
  itemsZh: GuideFaqItemInput[];
  updatedAt: string;
};

export type CollectionLandingPayload = {
  id: string;
  title: string;
  titleEn: string | null;
  titleZh: string | null;
  slug: string;
  pathname: string;
  scenario: string | null;
  status: ContentStatus;
  seoTitle: string | null;
  seoTitleEn: string | null;
  seoTitleZh: string | null;
  seoDescription: string | null;
  seoDescriptionEn: string | null;
  seoDescriptionZh: string | null;
  intro: string | null;
  introEn: string | null;
  introZh: string | null;
  category: string | null;
  useCase: string | null;
  relatedGuideSlugs: string[];
  updatedAt: string;
};

export type AboutStaticPageContentPayload = {
  eyebrow: string;
  heroTitle: string;
  heroBody: string;
  paragraphs: string[];
  visualLabel: string;
};

export type FitGuideStaticPageCardPayload = {
  title: string;
};

export type FitGuideStaticPageRowPayload = {
  product: string;
  measure: string;
  fitCheck: string;
};

export type FitGuideStaticPageContentPayload = {
  eyebrow: string;
  title: string;
  body: string;
  cards: FitGuideStaticPageCardPayload[];
  headers: {
    product: string;
    measure: string;
    fitCheck: string;
  };
  rows: FitGuideStaticPageRowPayload[];
};

export type HomePageStaticPageBenefitPayload = {
  title: string;
  body: string;
};

export type HomePageStaticPageBundlePayload = {
  title: string;
};

export type HomePageStaticPageReviewPayload = {
  quote: string;
};

export type HomePageStaticPageContentPayload = {
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
  benefits: [HomePageStaticPageBenefitPayload, HomePageStaticPageBenefitPayload, HomePageStaticPageBenefitPayload, HomePageStaticPageBenefitPayload];
  bundlesEyebrow: string;
  bundlesTitle: string;
  bundles: [HomePageStaticPageBundlePayload, HomePageStaticPageBundlePayload, HomePageStaticPageBundlePayload];
  bundlePrefix: string;
  bundleBody: string;
  shopKit: string;
  reviewsEyebrow: string;
  reviewsTitle: string;
  reviewsBody: string;
  showReviews: boolean;
  reviewQuotes: [HomePageStaticPageReviewPayload, HomePageStaticPageReviewPayload, HomePageStaticPageReviewPayload, HomePageStaticPageReviewPayload];
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

export type StaticPagePayload = {
  id: string;
  pageKey: "ABOUT" | "FIT_GUIDE" | "HOME_PAGE";
  title: string;
  titleEn: string | null;
  titleZh: string | null;
  slug: string;
  pathname: string;
  status: ContentStatus;
  seoTitle: string | null;
  seoTitleEn: string | null;
  seoTitleZh: string | null;
  seoDescription: string | null;
  seoDescriptionEn: string | null;
  seoDescriptionZh: string | null;
  content: AboutStaticPageContentPayload | FitGuideStaticPageContentPayload | HomePageStaticPageContentPayload;
  contentEn: AboutStaticPageContentPayload | FitGuideStaticPageContentPayload | HomePageStaticPageContentPayload | null;
  contentZh: AboutStaticPageContentPayload | FitGuideStaticPageContentPayload | HomePageStaticPageContentPayload | null;
  updatedAt: string;
};
