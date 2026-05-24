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
  slug: string;
  status: ContentStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  updatedAt: string;
  dek: string;
  category: string;
  authorName: string;
  authorRole: string;
  readTime: string;
  sections: GuideSectionInput[];
  faq: GuideFaqItemInput[];
  relatedProducts: string[];
  relatedCollections: GuideCollectionLinkInput[];
  relatedGuides: string[];
};

export type FaqPayload = {
  id: string;
  title: string;
  slug: string;
  status: ContentStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  items: GuideFaqItemInput[];
  updatedAt: string;
};
