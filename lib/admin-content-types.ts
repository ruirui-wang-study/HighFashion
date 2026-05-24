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
  slug: string;
  status: AdminContentStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  updatedAt: string;
  dek: string;
  category: string;
  authorName: string;
  authorRole: string;
  readTime: string;
  sections: AdminGuideSection[];
  faq: AdminGuideFaqItem[];
  relatedProducts: string[];
  relatedCollections: AdminGuideCollectionLink[];
  relatedGuides: string[];
};

export type AdminGuidePayload = Omit<AdminGuide, "id" | "publishedAt" | "updatedAt">;

export type AdminFaq = {
  id: string;
  title: string;
  slug: string;
  status: AdminContentStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  items: AdminGuideFaqItem[];
  updatedAt: string;
};

export type AdminFaqPayload = Omit<AdminFaq, "id" | "updatedAt">;
