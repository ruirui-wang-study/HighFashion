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
