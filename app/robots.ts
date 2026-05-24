import type { MetadataRoute } from "next";
import { getRuntimeSiteUrl } from "@/lib/seo";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = await getRuntimeSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/cart", "/checkout", "/api", "/admin"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
