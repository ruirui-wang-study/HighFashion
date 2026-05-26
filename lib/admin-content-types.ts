export type AdminContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type AdminGuideSection = {
  heading: string;
  body: string;
};

export type AdminGuideFaqItem = {
  question: string;
  answer: string;
};

export type AdminGuideCollectionLink = {
  title: string;
  path: string;
};

export type AdminGuide = {
  id: string;
  title: string;
  titleEn: string | null;
  titleZh: string | null;
  slug: string;
  status: AdminContentStatus;
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
  sections: AdminGuideSection[];
  sectionsEn: AdminGuideSection[];
  sectionsZh: AdminGuideSection[];
  faq: AdminGuideFaqItem[];
  faqEn: AdminGuideFaqItem[];
  faqZh: AdminGuideFaqItem[];
  relatedProducts: string[];
  relatedCollections: AdminGuideCollectionLink[];
  relatedGuides: string[];
};

export type AdminGuidePayload = Omit<AdminGuide, "id" | "publishedAt" | "updatedAt">;

export type AdminFaq = {
  id: string;
  title: string;
  titleEn: string | null;
  titleZh: string | null;
  slug: string;
  status: AdminContentStatus;
  seoTitle: string | null;
  seoTitleEn: string | null;
  seoTitleZh: string | null;
  seoDescription: string | null;
  seoDescriptionEn: string | null;
  seoDescriptionZh: string | null;
  items: AdminGuideFaqItem[];
  itemsEn: AdminGuideFaqItem[];
  itemsZh: AdminGuideFaqItem[];
  updatedAt: string;
};

export type AdminFaqPayload = Omit<AdminFaq, "id" | "updatedAt">;

export type AdminCollectionLanding = {
  id: string;
  title: string;
  titleEn: string | null;
  titleZh: string | null;
  slug: string;
  pathname: string;
  scenario: string | null;
  status: AdminContentStatus;
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

export type AdminCollectionLandingPayload = Omit<AdminCollectionLanding, "id" | "updatedAt">;

export type AdminAboutStaticPageContent = {
  eyebrow: string;
  heroTitle: string;
  heroBody: string;
  paragraphs: string[];
  visualLabel: string;
};

export type AdminFitGuideStaticPageCard = {
  title: string;
};

export type AdminFitGuideStaticPageRow = {
  product: string;
  measure: string;
  fitCheck: string;
};

export type AdminFitGuideStaticPageContent = {
  eyebrow: string;
  title: string;
  body: string;
  cards: AdminFitGuideStaticPageCard[];
  headers: {
    product: string;
    measure: string;
    fitCheck: string;
  };
  rows: AdminFitGuideStaticPageRow[];
};

export type AdminHomePageStaticPageBenefit = {
  title: string;
  body: string;
};

export type AdminHomePageStaticPageBundle = {
  title: string;
};

export type AdminHomePageStaticPageReview = {
  quote: string;
};

export type AdminHomePageStaticPageContent = {
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
  benefits: [AdminHomePageStaticPageBenefit, AdminHomePageStaticPageBenefit, AdminHomePageStaticPageBenefit, AdminHomePageStaticPageBenefit];
  bundlesEyebrow: string;
  bundlesTitle: string;
  bundles: [AdminHomePageStaticPageBundle, AdminHomePageStaticPageBundle, AdminHomePageStaticPageBundle];
  bundlePrefix: string;
  bundleBody: string;
  shopKit: string;
  reviewsEyebrow: string;
  reviewsTitle: string;
  reviewsBody: string;
  showReviews: boolean;
  reviewQuotes: [AdminHomePageStaticPageReview, AdminHomePageStaticPageReview, AdminHomePageStaticPageReview, AdminHomePageStaticPageReview];
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

export type AdminStaticPage = {
  id: string;
  pageKey: "ABOUT" | "FIT_GUIDE" | "HOME_PAGE";
  title: string;
  titleEn: string | null;
  titleZh: string | null;
  slug: string;
  pathname: string;
  status: AdminContentStatus;
  seoTitle: string | null;
  seoTitleEn: string | null;
  seoTitleZh: string | null;
  seoDescription: string | null;
  seoDescriptionEn: string | null;
  seoDescriptionZh: string | null;
  content: AdminAboutStaticPageContent | AdminFitGuideStaticPageContent | AdminHomePageStaticPageContent;
  contentEn: AdminAboutStaticPageContent | AdminFitGuideStaticPageContent | AdminHomePageStaticPageContent | null;
  contentZh: AdminAboutStaticPageContent | AdminFitGuideStaticPageContent | AdminHomePageStaticPageContent | null;
  updatedAt: string;
};

export type AdminStaticPagePayload = Omit<AdminStaticPage, "id" | "updatedAt">;
