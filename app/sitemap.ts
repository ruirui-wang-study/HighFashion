import { baseCollectionPages, collectionLandingPages } from "@/data/collection-pages";
import type { MetadataRoute } from "next";
import { guides } from "@/data/guides";
import { products } from "@/data/products";
import { categorySlugs } from "@/lib/category-routes";
import { getSiteUrl } from "@/lib/seo";

function daysSince(dateString: string) {
  const then = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - then.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function getGuidePriority(updatedAt: string, publishedAt: string) {
  const updatedDays = daysSince(updatedAt);
  const publishedDays = daysSince(publishedAt);

  if (updatedDays <= 14) return 0.72;
  if (publishedDays <= 30) return 0.68;
  return 0.62;
}

function getGuideChangeFrequency(updatedAt: string): MetadataRoute.Sitemap[number]["changeFrequency"] {
  const updatedDays = daysSince(updatedAt);
  if (updatedDays <= 14) return "weekly";
  if (updatedDays <= 90) return "monthly";
  return "yearly";
}

function getCommercialChangeFrequency(updatedAt: string): MetadataRoute.Sitemap[number]["changeFrequency"] {
  const updatedDays = daysSince(updatedAt);
  if (updatedDays <= 30) return "weekly";
  if (updatedDays <= 120) return "monthly";
  return "yearly";
}

function getCommercialPriority(updatedAt: string, basePriority: number) {
  const updatedDays = daysSince(updatedAt);
  if (updatedDays <= 30) return basePriority;
  if (updatedDays <= 120) return Math.max(basePriority - 0.04, 0.5);
  return Math.max(basePriority - 0.08, 0.5);
}

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const staticRoutes = [
    "",
    "/about",
    "/shop",
    "/faq",
    "/fit-guide",
    "/guides",
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : 0.7,
    })),
    ...products.map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: getCommercialChangeFrequency(product.updatedAt),
      priority: getCommercialPriority(product.updatedAt, 0.8),
    })),
    ...Object.values(categorySlugs).map((slug) => {
      const page = baseCollectionPages[slug];
      return {
        url: `${siteUrl}/collections/${slug}`,
        lastModified: new Date(page.updatedAt),
        changeFrequency: getCommercialChangeFrequency(page.updatedAt),
        priority: getCommercialPriority(page.updatedAt, 0.75),
      };
    }),
    ...collectionLandingPages.map((page) => ({
      url: `${siteUrl}${page.pathname}`,
      lastModified: new Date(page.updatedAt),
      changeFrequency: getCommercialChangeFrequency(page.updatedAt),
      priority: getCommercialPriority(page.updatedAt, 0.72),
    })),
    ...guides.map((guide) => ({
      url: `${siteUrl}/guides/${guide.slug}`,
      lastModified: new Date(guide.updatedAt),
      changeFrequency: getGuideChangeFrequency(guide.updatedAt),
      priority: getGuidePriority(guide.updatedAt, guide.publishedAt),
    })),
  ];
}
