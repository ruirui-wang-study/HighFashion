import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { getManagedCollectionLandingPages, getManagedCollectionPages, getManagedGuidePages, getManagedSitemapPaths, staticSeoPages } from "../../../data/seo-managed-routes";
import { PrismaService } from "../common/prisma.service";
import { SearchConsoleSyncService } from "./search-console-sync.service";
import type { SeoOverviewResponse, SeoPageRow, SeoPagesResponse, SeoQueriesResponse } from "./admin-seo.types";

const productInclude = {
  images: {
    select: {
      alt: true,
    },
  },
} satisfies Prisma.ProductInclude;

type ProductRecord = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

@Injectable()
export class AdminSeoService {
  private readonly searchConsoleSync = new SearchConsoleSyncService();

  constructor(private readonly prisma: PrismaService) {}

  async getOverview(days: number): Promise<SeoOverviewResponse> {
    const pages = await this.getPages(days);
    const queries = await this.getQueries(days);
    const metrics = this.searchConsoleSync.getProvider().getPageMetrics(days);
    const organicClicks = metrics.reduce((sum, item) => sum + item.clicks, 0);
    const impressions = metrics.reduce((sum, item) => sum + item.impressions, 0);
    const averagePosition = metrics.length ? Number((metrics.reduce((sum, item) => sum + item.position, 0) / metrics.length).toFixed(1)) : 0;

    return {
      rangeDays: days,
      searchConsole: this.searchConsoleSync.getConnectionStatus(),
      summary: {
        organicClicks,
        impressions,
        ctr: impressions > 0 ? Number((organicClicks / impressions).toFixed(4)) : 0,
        averagePosition,
      },
      topQueries: queries.rows.slice(0, 5),
      topPages: pages.rows.slice(0, 5).map((row) => ({
        url: row.url,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
        healthScore: row.healthScore,
      })),
      pagesLosingTraffic: metrics
        .filter((item) => item.clicksDelta < 0)
        .sort((a, b) => a.clicksDelta - b.clicksDelta)
        .slice(0, 5)
        .map((item) => ({
          url: item.url,
          clicksDelta: item.clicksDelta,
          impressionsDelta: item.impressionsDelta,
          healthScore: pages.rows.find((row) => row.url === item.url)?.healthScore ?? 100,
        })),
      healthSummary: {
        averageHealthScore: pages.rows.length ? Math.round(pages.rows.reduce((sum, row) => sum + row.healthScore, 0) / pages.rows.length) : 0,
        pagesBelow80: pages.rows.filter((row) => row.healthScore < 80).length,
      },
    };
  }

  async getPages(days: number): Promise<SeoPagesResponse> {
    const connection = this.searchConsoleSync.getConnectionStatus();
    const pageMetrics = new Map(this.searchConsoleSync.getProvider().getPageMetrics(days).map((item) => [item.url, item]));
    const sitemapPaths = new Set(getManagedSitemapPaths());
    const productRows = (await this.prisma.product.findMany({ include: productInclude, orderBy: { title: "asc" } }))
      .map((product) => mapProductPageRow(product, sitemapPaths, pageMetrics.get(`/products/${product.slug}`)));

    const rows = [
      ...productRows,
      ...staticSeoPages.map((page) => mapStaticPageRow({ ...page, inSitemap: sitemapPaths.has(page.url) }, pageMetrics.get(page.url))),
      ...getManagedGuidePages().map((page) => mapStaticPageRow({ ...page, inSitemap: sitemapPaths.has(page.url) }, pageMetrics.get(page.url))),
      ...getManagedCollectionPages().map((page) => mapStaticPageRow({ ...page, inSitemap: sitemapPaths.has(page.url) }, pageMetrics.get(page.url))),
      ...getManagedCollectionLandingPages().map((page) => mapStaticPageRow({ ...page, inSitemap: sitemapPaths.has(page.url) }, pageMetrics.get(page.url))),
    ].sort((a, b) => a.healthScore - b.healthScore || b.clicks - a.clicks);

    return {
      rangeDays: days,
      searchConsole: connection,
      rows,
    };
  }

  async getQueries(days: number): Promise<SeoQueriesResponse> {
    return {
      rangeDays: days,
      searchConsole: this.searchConsoleSync.getConnectionStatus(),
      rows: this.searchConsoleSync.getProvider().getQueryMetrics(days),
    };
  }
}

function mapProductPageRow(
  product: ProductRecord,
  sitemapPaths: Set<string>,
  metrics?: { clicks: number; impressions: number; ctr: number; position: number },
): SeoPageRow {
  const issues = [
    ...(product.seoTitle ? [] : ["missing title"]),
    ...(product.seoDescription ? [] : ["missing description"]),
    ...(product.canonicalUrl ? [] : ["missing canonical"]),
    ...(product.images.every((image) => image.alt.trim()) ? [] : ["missing alt text"]),
    ...(sitemapPaths.has(`/products/${product.slug}`) ? [] : ["not in sitemap"]),
    ...(["ACTIVE"].includes(product.status) ? [] : ["no structured data"]),
  ];
  return {
    url: `/products/${product.slug}`,
    title: product.seoTitle ?? null,
    description: product.seoDescription ?? null,
    canonical: product.canonicalUrl ?? null,
    indexStatus: product.status === "ACTIVE" ? "indexable" : "noindex",
    clicks: metrics?.clicks ?? 0,
    impressions: metrics?.impressions ?? 0,
    ctr: metrics?.ctr ?? 0,
    position: metrics?.position ?? 0,
    issues,
    healthScore: scoreIssues(issues),
  };
}

function mapStaticPageRow(
  page: {
    url: string;
    title: string | null;
    description: string | null;
    canonical: string | null;
    indexStatus: "indexable" | "noindex";
    hasAltText: boolean;
    inSitemap: boolean;
    hasStructuredData: boolean;
  },
  metrics?: { clicks: number; impressions: number; ctr: number; position: number },
): SeoPageRow {
  const issues = [
    ...(page.title ? [] : ["missing title"]),
    ...(page.description ? [] : ["missing description"]),
    ...(page.canonical ? [] : ["missing canonical"]),
    ...(page.hasAltText ? [] : ["missing alt text"]),
    ...(page.inSitemap ? [] : ["not in sitemap"]),
    ...(page.hasStructuredData ? [] : ["no structured data"]),
  ];

  return {
    url: page.url,
    title: page.title,
    description: page.description,
    canonical: page.canonical,
    indexStatus: page.indexStatus,
    clicks: metrics?.clicks ?? 0,
    impressions: metrics?.impressions ?? 0,
    ctr: metrics?.ctr ?? 0,
    position: metrics?.position ?? 0,
    issues,
    healthScore: scoreIssues(issues),
  };
}

function scoreIssues(issues: string[]) {
  const penalties: Record<string, number> = {
    "missing title": 25,
    "missing description": 20,
    "missing canonical": 15,
    "missing alt text": 15,
    "not in sitemap": 10,
    "no structured data": 15,
  };
  const score = issues.reduce((sum, issue) => sum - (penalties[issue] ?? 0), 100);
  return Math.max(0, score);
}
