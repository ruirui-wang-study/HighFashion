import { Injectable } from "@nestjs/common";
import {
  getManagedCollectionLandingPages,
  getManagedCollectionPages,
  getManagedGuidePages,
  getManagedSitemapPaths,
  staticSeoPages,
} from "../../../data/seo-managed-routes";
import { PrismaService } from "../common/prisma.service";
import { buildFaqHealthPage, buildPageIssues, buildProductHealthPage, buildStaticHealthPage, type HealthCheckResult, mapIssue } from "./seo-health.shared";
import type { SeoIssueItem } from "./seo-automation.types";

@Injectable()
export class SeoHealthService {
  constructor(private readonly prisma: PrismaService) {}

  async runHealthCheck(): Promise<HealthCheckResult> {
    const products = await this.prisma.product.findMany({
      include: {
        images: { select: { alt: true } },
      },
      orderBy: { title: "asc" },
    });
    const managedSitemapPaths = new Set(getManagedSitemapPaths());
    const pages = [];
    const issues: SeoIssueItem[] = [];
    const checkedAt = new Date().toISOString();

    for (const product of products) {
      const page = buildProductHealthPage(product, managedSitemapPaths);
      const pageIssues = buildPageIssues(page);
      pages.push(page);
      issues.push(...pageIssues.map((issue) => mapIssue(page, issue, checkedAt)));
    }

    for (const page of [
      ...staticSeoPages.map((item) => buildStaticHealthPage(item, "HOME", managedSitemapPaths)),
      ...getManagedCollectionPages().map((item) => buildStaticHealthPage(item, "COLLECTION", managedSitemapPaths)),
      ...getManagedCollectionLandingPages().map((item) => buildStaticHealthPage(item, "LANDING", managedSitemapPaths)),
      ...getManagedGuidePages().map((item) => buildStaticHealthPage(item, "GUIDE", managedSitemapPaths)),
      buildFaqHealthPage(managedSitemapPaths),
    ]) {
      const pageIssues = buildPageIssues(page);
      pages.push(page);
      issues.push(...pageIssues.map((issue) => mapIssue(page, issue, checkedAt)));
    }

    await this.persistHealthCheck(pages, issues);
    return { lastRunAt: checkedAt, pages, issues };
  }

  async listIssues(): Promise<SeoIssueItem[]> {
    const health = await this.runHealthCheck();
    return health.issues;
  }

  private async persistHealthCheck(pages: HealthCheckResult["pages"], issues: SeoIssueItem[]) {
    for (const page of pages) {
      await (this.prisma as unknown as {
        seoPage: { upsert: (args: unknown) => Promise<unknown> };
      }).seoPage.upsert({
        where: { url: page.url },
        update: {
          pageType: page.pageType,
          title: page.title,
          metaDescription: page.metaDescription,
          canonicalUrl: page.canonicalUrl,
          h1Count: page.h1Count,
          missingAltCount: page.missingAltCount,
          inSitemap: page.inSitemap,
          isIndexable: page.isIndexable,
          hasProductJsonLd: page.hasProductJsonLd,
          hasBreadcrumbJsonLd: page.hasBreadcrumbJsonLd,
          healthScore: page.healthScore,
          lastCheckedAt: new Date(),
        },
        create: {
          url: page.url,
          pageType: page.pageType,
          title: page.title,
          metaDescription: page.metaDescription,
          canonicalUrl: page.canonicalUrl,
          h1Count: page.h1Count,
          missingAltCount: page.missingAltCount,
          inSitemap: page.inSitemap,
          isIndexable: page.isIndexable,
          hasProductJsonLd: page.hasProductJsonLd,
          hasBreadcrumbJsonLd: page.hasBreadcrumbJsonLd,
          healthScore: page.healthScore,
          lastCheckedAt: new Date(),
        },
      });
    }

    await (this.prisma as unknown as {
      seoIssue: { deleteMany: (args: unknown) => Promise<unknown>; createMany: (args: unknown) => Promise<unknown> };
    }).seoIssue.deleteMany({});

    if (issues.length > 0) {
      const seoPages = await (this.prisma as unknown as {
        seoPage: { findMany: (args: unknown) => Promise<Array<{ id: string; url: string }>> };
      }).seoPage.findMany({
        select: { id: true, url: true },
      });
      const pageIdByUrl = new Map(seoPages.map((page) => [page.url, page.id]));

      await (this.prisma as unknown as {
        seoIssue: { createMany: (args: unknown) => Promise<unknown> };
      }).seoIssue.createMany({
        data: issues
          .map((issue) => {
            const seoPageId = pageIdByUrl.get(issue.pageUrl);
            if (!seoPageId) return null;

            return {
              seoPageId,
              issueType: issue.issueType,
              severity: issue.severity,
              message: issue.message,
              status: "OPEN",
              detectedAt: new Date(issue.detectedAt),
            };
          })
          .filter((item): item is NonNullable<typeof item> => Boolean(item)),
      });
    }
  }
}
