import { faqs } from "../../../data/faq";
import type { SeoIssueItem } from "./seo-automation.types";

export type HealthCheckPage = {
  id: string;
  url: string;
  pageType: string;
  title: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  h1Count: number;
  missingAltCount: number;
  inSitemap: boolean;
  isIndexable: boolean;
  hasProductJsonLd: boolean;
  hasBreadcrumbJsonLd: boolean;
  healthScore: number;
};

export type HealthCheckResult = {
  lastRunAt: string;
  pages: HealthCheckPage[];
  issues: SeoIssueItem[];
};

export const issuePenalty: Record<string, number> = {
  missing_title: 25,
  title_length: 10,
  missing_description: 20,
  description_length: 10,
  missing_canonical: 15,
  missing_h1: 15,
  duplicate_h1: 15,
  missing_alt: 15,
  missing_product_json_ld: 15,
  missing_breadcrumb_json_ld: 10,
  not_in_sitemap: 10,
  unexpected_noindex: 20,
};

export function buildProductHealthPage(
  product: {
    id: string;
    slug: string;
    seoTitle: string | null;
    seoDescription: string | null;
    canonicalUrl: string | null;
    images: Array<{ alt: string }>;
  },
  sitemapPaths: Set<string>,
): HealthCheckPage {
  const issueTypes = collectIssueTypes({
    title: product.seoTitle,
    description: product.seoDescription,
    canonical: product.canonicalUrl,
    h1Count: 1,
    missingAltCount: product.images.filter((image) => !image.alt.trim()).length,
    inSitemap: sitemapPaths.has(`/products/${product.slug}`),
    isIndexable: true,
    hasProductJsonLd: true,
    hasBreadcrumbJsonLd: true,
    pageType: "PRODUCT",
  });

  return {
    id: `/products/${product.slug}`,
    url: `/products/${product.slug}`,
    pageType: "PRODUCT",
    title: product.seoTitle,
    metaDescription: product.seoDescription,
    canonicalUrl: product.canonicalUrl,
    h1Count: 1,
    missingAltCount: product.images.filter((image) => !image.alt.trim()).length,
    inSitemap: sitemapPaths.has(`/products/${product.slug}`),
    isIndexable: true,
    hasProductJsonLd: true,
    hasBreadcrumbJsonLd: true,
    healthScore: scoreIssueTypes(issueTypes),
  };
}

export function buildStaticHealthPage(
  page: {
    url: string;
    title: string | null;
    description: string | null;
    canonical: string | null;
    indexStatus: "indexable" | "noindex";
    hasAltText: boolean;
    hasStructuredData: boolean;
  },
  pageType: string,
  sitemapPaths: Set<string>,
): HealthCheckPage {
  const issueTypes = collectIssueTypes({
    title: page.title,
    description: page.description,
    canonical: page.canonical,
    h1Count: 1,
    missingAltCount: page.hasAltText ? 0 : 1,
    inSitemap: sitemapPaths.has(page.url),
    isIndexable: page.indexStatus === "indexable",
    hasProductJsonLd: pageType === "PRODUCT",
    hasBreadcrumbJsonLd: page.hasStructuredData,
    pageType,
  });

  return {
    id: page.url,
    url: page.url,
    pageType,
    title: page.title,
    metaDescription: page.description,
    canonicalUrl: page.canonical,
    h1Count: 1,
    missingAltCount: page.hasAltText ? 0 : 1,
    inSitemap: sitemapPaths.has(page.url),
    isIndexable: page.indexStatus === "indexable",
    hasProductJsonLd: pageType === "PRODUCT",
    hasBreadcrumbJsonLd: page.hasStructuredData,
    healthScore: scoreIssueTypes(issueTypes),
  };
}

export function buildFaqHealthPage(sitemapPaths: Set<string>): HealthCheckPage {
  const page = {
    url: "/faq",
    title: "FAQ, Shipping, and Returns",
    description: "Review PulseGear shipping, returns, fit, and checkout answers before placing an order.",
    canonical: "/faq",
    indexStatus: "indexable" as const,
    hasAltText: true,
    hasStructuredData: faqs.length > 0,
  };
  return buildStaticHealthPage(page, "FAQ", sitemapPaths);
}

export function buildPageIssues(page: HealthCheckPage) {
  return collectIssueTypes({
    title: page.title,
    description: page.metaDescription,
    canonical: page.canonicalUrl,
    h1Count: page.h1Count,
    missingAltCount: page.missingAltCount,
    inSitemap: page.inSitemap,
    isIndexable: page.isIndexable,
    hasProductJsonLd: page.hasProductJsonLd,
    hasBreadcrumbJsonLd: page.hasBreadcrumbJsonLd,
    pageType: page.pageType,
  });
}

export function mapIssue(page: HealthCheckPage, issueType: string, detectedAt: string): SeoIssueItem {
  return {
    id: `${page.id}:${issueType}`,
    pageId: page.id,
    pageUrl: page.url,
    pageType: page.pageType,
    issueType,
    severity: issueType === "missing_title" || issueType === "unexpected_noindex" ? "HIGH" : "MEDIUM",
    status: "OPEN",
    message: issueType.replaceAll("_", " "),
    healthScore: page.healthScore,
    detectedAt,
  };
}

function collectIssueTypes(input: {
  title: string | null;
  description: string | null;
  canonical: string | null;
  h1Count: number;
  missingAltCount: number;
  inSitemap: boolean;
  isIndexable: boolean;
  hasProductJsonLd: boolean;
  hasBreadcrumbJsonLd: boolean;
  pageType: string;
}) {
  const issues: string[] = [];
  if (!input.title) issues.push("missing_title");
  if (input.title && (input.title.length < 20 || input.title.length > 70)) issues.push("title_length");
  if (!input.description) issues.push("missing_description");
  if (input.description && (input.description.length < 70 || input.description.length > 180)) issues.push("description_length");
  if (!input.canonical) issues.push("missing_canonical");
  if (input.h1Count === 0) issues.push("missing_h1");
  if (input.h1Count > 1) issues.push("duplicate_h1");
  if (input.missingAltCount > 0) issues.push("missing_alt");
  if (input.pageType === "PRODUCT" && !input.hasProductJsonLd) issues.push("missing_product_json_ld");
  if (!input.hasBreadcrumbJsonLd) issues.push("missing_breadcrumb_json_ld");
  if (!input.inSitemap) issues.push("not_in_sitemap");
  if (!input.isIndexable) issues.push("unexpected_noindex");
  return issues;
}

function scoreIssueTypes(issueTypes: string[]) {
  return Math.max(
    0,
    issueTypes.reduce((score, issueType) => score - (issuePenalty[issueType] ?? 0), 100),
  );
}
