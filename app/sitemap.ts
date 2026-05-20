import type { MetadataRoute } from "next";
import { guides } from "@/data/guides";
import { products } from "@/data/products";
import { categorySlugs } from "@/lib/category-routes";
import { getSiteUrl } from "@/lib/seo";

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
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...Object.values(categorySlugs).map((slug) => ({
      url: `${siteUrl}/collections/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...guides.map((guide) => ({
      url: `${siteUrl}/guides/${guide.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
  ];
}
