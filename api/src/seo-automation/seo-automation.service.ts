import { Injectable, NotFoundException } from "@nestjs/common";
import { faqs } from "../../../data/faq";
import { guides } from "../../../data/guides";
import {
  getManagedCollectionLandingPages,
  getManagedCollectionPages,
  getManagedGuidePages,
  getManagedSitemapPaths,
  staticSeoPages,
} from "../../../data/seo-managed-routes";
import { PrismaService } from "../common/prisma.service";
import type {
  ContentBriefItem,
  ContentOpportunityItem,
  Ga4SyncResult,
  InternalLinkSuggestionItem,
  ProductSeoDraft,
  SearchConsoleSyncResult,
  SeoAutomationOverview,
  SeoChangeLogItem,
  SeoIssueItem,
  SeoRecommendationItem,
} from "./seo-automation.types";

type AdminActor = {
  adminId: string;
  adminEmail: string;
};

type HealthCheckPage = {
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

type HealthCheckResult = {
  lastRunAt: string;
  pages: HealthCheckPage[];
  issues: SeoIssueItem[];
};

const issuePenalty: Record<string, number> = {
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

const gscMockRows = [
  {
    page: "/products/pulseflex-knee-sleeve",
    query: "best knee sleeve for running",
    country: "US",
    device: "mobile",
    clicks: 82,
    impressions: 2040,
    ctr: 0.0402,
    position: 9.4,
    date: "2026-05-21",
  },
  {
    page: "/guides/choose-knee-support-running",
    query: "running knee support",
    country: "US",
    device: "desktop",
    clicks: 67,
    impressions: 1805,
    ctr: 0.0371,
    position: 11.2,
    date: "2026-05-21",
  },
  {
    page: "/products/corecarry-running-belt",
    query: "no bounce running belt",
    country: "CA",
    device: "mobile",
    clicks: 24,
    impressions: 890,
    ctr: 0.027,
    position: 14.6,
    date: "2026-05-21",
  },
];

const ga4MockRows = [
  {
    landingPage: "/products/pulseflex-knee-sleeve",
    sourceMedium: "google / organic",
    sessions: 138,
    totalUsers: 120,
    pageViews: 201,
    viewItem: 112,
    addToCart: 9,
    beginCheckout: 3,
    purchase: 0,
    revenue: 0,
    date: "2026-05-21",
  },
  {
    landingPage: "/guides/choose-knee-support-running",
    sourceMedium: "google / organic",
    sessions: 91,
    totalUsers: 82,
    pageViews: 134,
    viewItem: 0,
    addToCart: 0,
    beginCheckout: 0,
    purchase: 0,
    revenue: 0,
    date: "2026-05-21",
  },
];

const opportunityDrafts = [
  {
    id: "opp_1",
    opportunityType: "HIGH_IMPRESSIONS_LOW_CTR",
    keyword: "best knee sleeve for running",
    currentPage: "/products/pulseflex-knee-sleeve",
    suggestedAction: "Improve title and meta description for stronger search intent match.",
    priority: "HIGH",
    expectedImpact: "High",
  },
  {
    id: "opp_2",
    opportunityType: "POSITION_8_TO_20",
    keyword: "running knee support",
    currentPage: "/guides/choose-knee-support-running",
    suggestedAction: "Refresh guide content and add stronger product CTAs.",
    priority: "MEDIUM",
    expectedImpact: "Medium",
  },
  {
    id: "opp_3",
    opportunityType: "PRODUCT_IMPRESSIONS_NO_CONVERSION",
    keyword: "best knee sleeve for running",
    currentPage: "/products/pulseflex-knee-sleeve",
    suggestedAction: "Strengthen product education and FAQ around fit and use case.",
    priority: "HIGH",
    expectedImpact: "Medium",
  },
] as const;

const internalLinkDrafts = [
  {
    id: "link_1",
    sourcePage: "/guides/choose-knee-support-running",
    targetPage: "/products/pulseflex-knee-sleeve",
    anchorText: "breathable knee sleeve for running",
    reason: "Guide has clicks but needs a stronger product handoff.",
    priority: "HIGH",
  },
  {
    id: "link_2",
    sourcePage: "/products/pulseflex-knee-sleeve",
    targetPage: "/guides/choose-knee-support-running",
    anchorText: "how to choose knee support for running",
    reason: "Product page needs supporting educational internal links.",
    priority: "MEDIUM",
  },
] as const;

const recommendationDrafts = [
  {
    id: "rec_1",
    recommendationType: "TITLE",
    resourceType: "product",
    pageUrl: "/products/pulseflex-knee-sleeve",
    reason: "High impressions with below-benchmark CTR and missing SEO title.",
    priority: "HIGH",
    draftPayload: {
      seoTitle: "PulseFlex Knee Sleeve for Running | Breathable Support | PulseGear",
    },
  },
  {
    id: "rec_2",
    recommendationType: "META_DESCRIPTION",
    resourceType: "product",
    pageUrl: "/products/pulseflex-knee-sleeve",
    reason: "Missing SEO description on an indexable product page.",
    priority: "HIGH",
    draftPayload: {
      seoDescription: "Breathable knee support for running and training with a secure, low-profile fit that stays comfortable through repeat sessions.",
    },
  },
  {
    id: "rec_3",
    recommendationType: "GUIDE",
    resourceType: "guide",
    pageUrl: null,
    reason: "Query demand exists without a precise landing page.",
    priority: "MEDIUM",
    draftPayload: {
      suggestedGuideTitle: "How to Choose a Knee Sleeve for Summer Running",
      targetKeyword: "best knee sleeve for running",
    },
  },
] as const;

@Injectable()
export class SeoAutomationService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(): Promise<SeoAutomationOverview> {
    const [health, opportunities, recommendations, briefs, logs] = await Promise.all([
      this.runHealthCheck(),
      this.generateOpportunities(),
      this.generateRecommendations(),
      this.listContentPipeline(),
      this.listChangeLog(),
    ]);

    const averageHealthScore = health.pages.length
      ? Math.round(health.pages.reduce((sum, page) => sum + page.healthScore, 0) / health.pages.length)
      : 0;

    return {
      healthCheck: {
        lastRunAt: health.lastRunAt,
        scannedPages: health.pages.length,
        openIssues: health.issues.length,
        averageHealthScore,
      },
      searchConsole: this.getSearchConsoleConnection(),
      ga4: this.getGa4Connection(),
      opportunities: {
        total: opportunities.length,
        new: opportunities.filter((item) => item.status === "NEW").length,
      },
      recommendations: {
        total: recommendations.length,
        draft: recommendations.filter((item) => item.status === "DRAFT").length,
      },
      contentPipeline: {
        total: briefs.length,
        needsReview: briefs.filter((item) => item.status === "NEEDS_REVIEW").length,
      },
      recentChanges: logs.slice(0, 5),
    };
  }

  async runHealthCheck(): Promise<HealthCheckResult> {
    const products = await this.prisma.product.findMany({
      include: {
        images: { select: { alt: true } },
      },
      orderBy: { title: "asc" },
    });
    const managedSitemapPaths = new Set(getManagedSitemapPaths());
    const pages: HealthCheckPage[] = [];
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

  async syncSearchConsole(): Promise<SearchConsoleSyncResult> {
    const connection = this.getSearchConsoleConnection();
    const rows = gscMockRows;

    for (const row of rows) {
      await (this.prisma as unknown as {
        searchConsoleQueryDaily: { upsert: (args: unknown) => Promise<unknown> };
        searchConsolePageDaily: { upsert: (args: unknown) => Promise<unknown> };
      }).searchConsoleQueryDaily.upsert({
        where: {
          siteUrl_date_query_page_country_device: {
            siteUrl: "sc-domain:pulsegear.local",
            date: new Date(row.date),
            query: row.query,
            page: row.page,
            country: row.country,
            device: row.device,
          },
        },
        update: {
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position,
        },
        create: {
          siteUrl: "sc-domain:pulsegear.local",
          date: new Date(row.date),
          query: row.query,
          page: row.page,
          country: row.country,
          device: row.device,
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position,
        },
      });
      await (this.prisma as unknown as {
        searchConsolePageDaily: { upsert: (args: unknown) => Promise<unknown> };
      }).searchConsolePageDaily.upsert({
        where: {
          siteUrl_date_page_country_device: {
            siteUrl: "sc-domain:pulsegear.local",
            date: new Date(row.date),
            page: row.page,
            country: row.country,
            device: row.device,
          },
        },
        update: {
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position,
        },
        create: {
          siteUrl: "sc-domain:pulsegear.local",
          date: new Date(row.date),
          page: row.page,
          country: row.country,
          device: row.device,
          clicks: row.clicks,
          impressions: row.impressions,
          ctr: row.ctr,
          position: row.position,
        },
      });
    }

    return {
      connection,
      rows,
      syncedAt: connection.connected ? new Date().toISOString() : null,
    };
  }

  async syncGa4(): Promise<Ga4SyncResult> {
    const connection = this.getGa4Connection();
    const rows = ga4MockRows;
    for (const row of rows) {
      await (this.prisma as unknown as {
        ga4LandingPageDaily: { upsert: (args: unknown) => Promise<unknown> };
      }).ga4LandingPageDaily.upsert({
        where: {
          landingPage_sourceMedium_date: {
            landingPage: row.landingPage,
            sourceMedium: row.sourceMedium,
            date: new Date(row.date),
          },
        },
        update: {
          sessions: row.sessions,
          totalUsers: row.totalUsers,
          pageViews: row.pageViews,
          viewItem: row.viewItem,
          addToCart: row.addToCart,
          beginCheckout: row.beginCheckout,
          purchase: row.purchase,
          revenue: row.revenue,
        },
        create: {
          landingPage: row.landingPage,
          sourceMedium: row.sourceMedium,
          date: new Date(row.date),
          sessions: row.sessions,
          totalUsers: row.totalUsers,
          pageViews: row.pageViews,
          viewItem: row.viewItem,
          addToCart: row.addToCart,
          beginCheckout: row.beginCheckout,
          purchase: row.purchase,
          revenue: row.revenue,
        },
      });
    }
    return {
      connection,
      rows,
      syncedAt: connection.connected ? new Date().toISOString() : null,
    };
  }

  async generateOpportunities(): Promise<ContentOpportunityItem[]> {
    await this.seedOpportunityDrafts();
    return this.listOpportunities();
  }

  async listOpportunities(): Promise<ContentOpportunityItem[]> {
    let rows = await (this.prisma as unknown as {
      contentOpportunity: { findMany: (args: unknown) => Promise<Array<Record<string, unknown>>> };
    }).contentOpportunity.findMany({
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    });
    if (rows.length === 0) {
      await this.seedOpportunityDrafts();
      rows = await (this.prisma as unknown as {
        contentOpportunity: { findMany: (args: unknown) => Promise<Array<Record<string, unknown>>> };
      }).contentOpportunity.findMany({
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      });
    }

    return rows.map((row) => ({
      id: String(row.id),
      opportunityType: String(row.opportunityType),
      keyword: row.keyword ? String(row.keyword) : null,
      currentPage: row.currentPage ? String(row.currentPage) : null,
      suggestedAction: String(row.suggestedAction),
      priority: String(row.priority),
      expectedImpact: String(row.expectedImpact),
      status: String(row.status) as ContentOpportunityItem["status"],
    }));
  }

  async generateRecommendations(): Promise<SeoRecommendationItem[]> {
    const pulseflexProductId = await this.getProductIdBySlug("pulseflex-knee-sleeve");
    await this.seedRecommendationDrafts(pulseflexProductId);

    return this.listRecommendations();
  }

  async listRecommendations(): Promise<SeoRecommendationItem[]> {
    let rows = await (this.prisma as unknown as {
      seoRecommendation: { findMany: (args: unknown) => Promise<Array<Record<string, unknown>>> };
    }).seoRecommendation.findMany({
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    });
    if (rows.length === 0) {
      const pulseflexProductId = await this.getProductIdBySlug("pulseflex-knee-sleeve");
      await this.seedRecommendationDrafts(pulseflexProductId);
      rows = await (this.prisma as unknown as {
        seoRecommendation: { findMany: (args: unknown) => Promise<Array<Record<string, unknown>>> };
      }).seoRecommendation.findMany({
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      });
    }

    return rows.map((row) => this.mapRecommendation(row));
  }

  async createContentBriefFromOpportunity(opportunityId: string): Promise<ContentBriefItem> {
    const opportunity = await (this.prisma as unknown as {
      contentOpportunity: { findUnique: (args: unknown) => Promise<Record<string, unknown> | null> };
    }).contentOpportunity.findUnique({
      where: { id: opportunityId },
    });
    if (!opportunity) {
      await this.generateOpportunities();
    }

    const pulseflexProductId = await this.getProductIdBySlug("pulseflex-knee-sleeve");

    const brief: ContentBriefItem = {
      id: "brief_1",
      sourceOpportunityId: opportunityId,
      title: "Knee Support Guide Content Brief",
      targetKeyword: "best knee sleeve for running",
      outline: [
        "Define runner intent and support use case",
        "Compare sleeve versus strap",
        "Recommend related products and guide links",
      ],
      draftContent: null,
      relatedProductIds: [pulseflexProductId],
      relatedCollectionSlugs: ["support"],
      status: "BRIEF_GENERATED",
    };

    await (this.prisma as unknown as {
      contentBrief: { upsert: (args: unknown) => Promise<unknown> };
    }).contentBrief.upsert({
      where: { id: brief.id },
      update: {
        sourceOpportunityId: brief.sourceOpportunityId,
        title: brief.title,
        targetKeyword: brief.targetKeyword,
        outline: brief.outline,
        draftContent: brief.draftContent,
        relatedProductIds: brief.relatedProductIds,
        relatedCollectionSlugs: brief.relatedCollectionSlugs,
      },
      create: {
        id: brief.id,
        sourceOpportunityId: brief.sourceOpportunityId,
        title: brief.title,
        targetKeyword: brief.targetKeyword,
        outline: brief.outline,
        draftContent: brief.draftContent,
        relatedProductIds: brief.relatedProductIds,
        relatedCollectionSlugs: brief.relatedCollectionSlugs,
        status: brief.status,
      },
    });

    const created = await (this.prisma as unknown as {
      contentBrief: { findUnique: (args: unknown) => Promise<Record<string, unknown> | null> };
    }).contentBrief.findUnique({
      where: { id: brief.id },
    });
    if (!created) {
      throw new NotFoundException({ code: "CONTENT_BRIEF_NOT_FOUND", message: "Content brief not found" });
    }

    return this.mapContentBrief(created);
  }

  async listContentPipeline(): Promise<ContentBriefItem[]> {
    let rows = await (this.prisma as unknown as {
      contentBrief: { findMany: (args: unknown) => Promise<Array<Record<string, unknown>>> };
    }).contentBrief.findMany({
      orderBy: [{ createdAt: "desc" }],
    });
    if (rows.length === 0) {
      await this.createContentBriefFromOpportunity("opp_1");
      rows = await (this.prisma as unknown as {
        contentBrief: { findMany: (args: unknown) => Promise<Array<Record<string, unknown>>> };
      }).contentBrief.findMany({
        orderBy: [{ createdAt: "desc" }],
      });
    }

    return rows.map((row) => this.mapContentBrief(row));
  }

  async generateInternalLinkSuggestions(): Promise<InternalLinkSuggestionItem[]> {
    await this.seedInternalLinkDrafts();

    return this.listInternalLinks();
  }

  async listInternalLinks(): Promise<InternalLinkSuggestionItem[]> {
    let rows = await (this.prisma as unknown as {
      internalLinkSuggestion: { findMany: (args: unknown) => Promise<Array<Record<string, unknown>>> };
    }).internalLinkSuggestion.findMany({
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    });
    if (rows.length === 0) {
      await this.seedInternalLinkDrafts();
      rows = await (this.prisma as unknown as {
        internalLinkSuggestion: { findMany: (args: unknown) => Promise<Array<Record<string, unknown>>> };
      }).internalLinkSuggestion.findMany({
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      });
    }

    return rows.map((row) => ({
      id: String(row.id),
      sourcePage: String(row.sourcePage),
      targetPage: String(row.targetPage),
      anchorText: String(row.anchorText),
      reason: String(row.reason),
      priority: String(row.priority),
      status: String(row.status) as InternalLinkSuggestionItem["status"],
    }));
  }

  async listChangeLog(): Promise<SeoChangeLogItem[]> {
    const rows = await (this.prisma as unknown as {
      seoChangeLog: { findMany: (args: unknown) => Promise<Array<Record<string, unknown>>> };
    }).seoChangeLog.findMany({
      orderBy: { createdAt: "desc" },
    });

    return rows.map((row) => ({
      id: String(row.id),
      action: String(row.action),
      resourceType: String(row.resourceType),
      resourceId: row.resourceId ? String(row.resourceId) : null,
      operatorId: row.operatorId ? String(row.operatorId) : null,
      createdAt: new Date(row.createdAt as string | Date).toISOString(),
    }));
  }

  private async seedOpportunityDrafts() {
    for (const draft of opportunityDrafts) {
      await (this.prisma as unknown as {
        contentOpportunity: { upsert: (args: unknown) => Promise<unknown> };
      }).contentOpportunity.upsert({
        where: { id: draft.id },
        update: {
          opportunityType: draft.opportunityType,
          keyword: draft.keyword,
          currentPage: draft.currentPage,
          suggestedAction: draft.suggestedAction,
          priority: draft.priority,
          expectedImpact: draft.expectedImpact,
        },
        create: {
          id: draft.id,
          opportunityType: draft.opportunityType,
          keyword: draft.keyword,
          currentPage: draft.currentPage,
          suggestedAction: draft.suggestedAction,
          priority: draft.priority,
          expectedImpact: draft.expectedImpact,
          status: "NEW",
        },
      });
    }
  }

  private async seedRecommendationDrafts(pulseflexProductId: string) {
    for (const draft of recommendationDrafts) {
      const resourceId = draft.resourceType === "product" ? pulseflexProductId : null;

      await (this.prisma as unknown as {
        seoRecommendation: { upsert: (args: unknown) => Promise<unknown> };
      }).seoRecommendation.upsert({
        where: { id: draft.id },
        update: {
          recommendationType: draft.recommendationType,
          resourceType: draft.resourceType,
          resourceId,
          reason: draft.reason,
          priority: draft.priority,
          draftPayload: draft.draftPayload,
          isAiDraft: true,
        } as Record<string, unknown>,
        create: {
          id: draft.id,
          recommendationType: draft.recommendationType,
          resourceType: draft.resourceType,
          resourceId,
          reason: draft.reason,
          priority: draft.priority,
          status: "DRAFT",
          draftPayload: draft.draftPayload,
          isAiDraft: true,
        } as Record<string, unknown>,
      });
    }
  }

  private async seedInternalLinkDrafts() {
    for (const draft of internalLinkDrafts) {
      await (this.prisma as unknown as {
        internalLinkSuggestion: { upsert: (args: unknown) => Promise<unknown> };
      }).internalLinkSuggestion.upsert({
        where: { id: draft.id },
        update: {
          sourcePage: draft.sourcePage,
          targetPage: draft.targetPage,
          anchorText: draft.anchorText,
          reason: draft.reason,
          priority: draft.priority,
        },
        create: {
          id: draft.id,
          sourcePage: draft.sourcePage,
          targetPage: draft.targetPage,
          anchorText: draft.anchorText,
          reason: draft.reason,
          priority: draft.priority,
          status: "NEW",
        },
      });
    }
  }

  async generateProductSeoDraft(productId: string): Promise<ProductSeoDraft> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { images: { select: { alt: true } } },
    });
    if (!product) {
      throw new NotFoundException({ code: "PRODUCT_NOT_FOUND", message: "Product not found" });
    }

    return {
      seoTitle: `${product.title} for Running | Lightweight Support | PulseGear`,
      seoDescription: `${product.shortDescription} Sweat-ready support for runners and training days with a secure, breathable fit.`,
      imageAltText: product.images.map((image, index) => image.alt?.trim() || `${product.title} image ${index + 1}`),
      productFaq: [
        {
          question: `Who is ${product.title} best for?`,
          answer: `${product.title} is best for runners and training users who want breathable support without bulky coverage.`,
        },
      ],
      relatedGuides: guides.slice(0, 2).map((guide) => guide.slug),
      relatedProducts: ["corecarry-running-belt"],
      merchantFeedSuggestions: {
        google_product_category: product.category,
        custom_label_0: "seo-draft",
      },
      aiDraft: true,
    };
  }

  async applyProductSeoDraft(productId: string, draft: ProductSeoDraft, actor: AdminActor) {
    const existing = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { images: { select: { alt: true } } },
    });
    if (!existing) {
      throw new NotFoundException({ code: "PRODUCT_NOT_FOUND", message: "Product not found" });
    }

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: {
        seoTitle: draft.seoTitle,
        seoDescription: draft.seoDescription,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: actor.adminId,
        action: "SEO_DRAFT_APPLIED",
        resource: "product",
        resourceId: productId,
        details: {
          actorEmail: actor.adminEmail,
          seoTitle: draft.seoTitle,
          seoDescription: draft.seoDescription,
        },
      },
    });

    await (this.prisma as unknown as {
      seoChangeLog: { create: (args: unknown) => Promise<unknown> };
    }).seoChangeLog.create({
      data: {
        action: "PRODUCT_SEO_APPLIED",
        resourceType: "product",
        resourceId: productId,
        oldValue: {
          seoTitle: existing.seoTitle,
          seoDescription: existing.seoDescription,
        },
        newValue: {
          seoTitle: draft.seoTitle,
          seoDescription: draft.seoDescription,
        },
        operatorId: actor.adminId,
      },
    });

    return updated;
  }

  async bulkReviewIssues(ids: string[]) {
    return {
      reviewed: ids.length,
    };
  }

  async applyRecommendation(recommendationId: string, actor: AdminActor) {
    let recommendation = await (this.prisma as unknown as {
      seoRecommendation: { findUnique: (args: unknown) => Promise<Record<string, unknown> | null> };
    }).seoRecommendation.findUnique({
      where: { id: recommendationId },
    });
    if (!recommendation) {
      await this.generateRecommendations();
      recommendation = await (this.prisma as unknown as {
        seoRecommendation: { findUnique: (args: unknown) => Promise<Record<string, unknown> | null> };
      }).seoRecommendation.findUnique({
        where: { id: recommendationId },
      });
    }
    if (!recommendation) {
      throw new NotFoundException({ code: "SEO_RECOMMENDATION_NOT_FOUND", message: "Recommendation not found" });
    }

    const mappedRecommendation = this.mapRecommendation(recommendation);

    if (mappedRecommendation.resourceType === "product" && mappedRecommendation.resourceId) {
      const draft = await this.generateProductSeoDraft(mappedRecommendation.resourceId);
      if ("seoTitle" in mappedRecommendation.draftPayload && typeof mappedRecommendation.draftPayload.seoTitle === "string") {
        draft.seoTitle = mappedRecommendation.draftPayload.seoTitle;
      }
      if ("seoDescription" in mappedRecommendation.draftPayload && typeof mappedRecommendation.draftPayload.seoDescription === "string") {
        draft.seoDescription = mappedRecommendation.draftPayload.seoDescription;
      }
      await this.applyProductSeoDraft(mappedRecommendation.resourceId, draft, actor);
    }

    const updated = await (this.prisma as unknown as {
      seoRecommendation: { update: (args: unknown) => Promise<Record<string, unknown>> };
    }).seoRecommendation.update({
      where: { id: recommendationId },
      data: {
        status: "APPLIED",
        appliedAt: new Date(),
      },
    });

    return this.mapRecommendation(updated);
  }

  async rejectRecommendation(recommendationId: string, actor: AdminActor) {
    let recommendation = await (this.prisma as unknown as {
      seoRecommendation: { findUnique: (args: unknown) => Promise<Record<string, unknown> | null> };
    }).seoRecommendation.findUnique({
      where: { id: recommendationId },
    });
    if (!recommendation) {
      await this.generateRecommendations();
      recommendation = await (this.prisma as unknown as {
        seoRecommendation: { findUnique: (args: unknown) => Promise<Record<string, unknown> | null> };
      }).seoRecommendation.findUnique({
        where: { id: recommendationId },
      });
    }
    if (!recommendation) {
      throw new NotFoundException({ code: "SEO_RECOMMENDATION_NOT_FOUND", message: "Recommendation not found" });
    }
    await this.prisma.auditLog.create({
      data: {
        actorId: actor.adminId,
        action: "SEO_RECOMMENDATION_REJECTED",
        resource: "seo_recommendation",
        resourceId: recommendationId,
        details: { actorEmail: actor.adminEmail },
      },
    });
    const updated = await (this.prisma as unknown as {
      seoRecommendation: { update: (args: unknown) => Promise<Record<string, unknown>> };
    }).seoRecommendation.update({
      where: { id: recommendationId },
      data: {
        status: "REJECTED",
      },
    });
    return this.mapRecommendation(updated);
  }

  async applyInternalLinkSuggestion(id: string, actor: AdminActor) {
    let suggestion = await (this.prisma as unknown as {
      internalLinkSuggestion: { findUnique: (args: unknown) => Promise<Record<string, unknown> | null> };
    }).internalLinkSuggestion.findUnique({
      where: { id },
    });
    if (!suggestion) {
      await this.generateInternalLinkSuggestions();
      suggestion = await (this.prisma as unknown as {
        internalLinkSuggestion: { findUnique: (args: unknown) => Promise<Record<string, unknown> | null> };
      }).internalLinkSuggestion.findUnique({
        where: { id },
      });
    }
    if (!suggestion) {
      throw new NotFoundException({ code: "INTERNAL_LINK_SUGGESTION_NOT_FOUND", message: "Internal link suggestion not found" });
    }
    const mappedSuggestion = this.mapInternalLinkSuggestion(suggestion);

    await this.prisma.auditLog.create({
      data: {
        actorId: actor.adminId,
        action: "INTERNAL_LINK_APPLIED",
        resource: "internal_link_suggestion",
        resourceId: id,
        details: {
          actorEmail: actor.adminEmail,
          sourcePage: mappedSuggestion.sourcePage,
          targetPage: mappedSuggestion.targetPage,
          anchorText: mappedSuggestion.anchorText,
        },
      },
    });

    await (this.prisma as unknown as {
      seoChangeLog: { create: (args: unknown) => Promise<unknown> };
    }).seoChangeLog.create({
      data: {
        action: "INTERNAL_LINK_APPLIED",
        resourceType: "internal_link",
        resourceId: id,
        oldValue: null,
        newValue: mappedSuggestion,
        operatorId: actor.adminId,
      },
    });

    const updated = await (this.prisma as unknown as {
      internalLinkSuggestion: { update: (args: unknown) => Promise<Record<string, unknown>> };
    }).internalLinkSuggestion.update({
      where: { id },
      data: {
        status: "APPLIED",
      },
    });

    return this.mapInternalLinkSuggestion(updated);
  }

  async publishContentBrief(id: string, actor: AdminActor) {
    let brief = await (this.prisma as unknown as {
      contentBrief: { findUnique: (args: unknown) => Promise<Record<string, unknown> | null> };
    }).contentBrief.findUnique({
      where: { id },
    });
    if (!brief && id === "brief_1") {
      brief = await this.createContentBriefFromOpportunity("opp_1") as unknown as Record<string, unknown>;
    }
    if (!brief) {
      throw new NotFoundException({ code: "CONTENT_BRIEF_NOT_FOUND", message: "Content brief not found" });
    }
    const mappedBrief = this.mapContentBrief(brief);

    await this.prisma.auditLog.create({
      data: {
        actorId: actor.adminId,
        action: "CONTENT_BRIEF_PUBLISHED",
        resource: "content_brief",
        resourceId: id,
        details: {
          actorEmail: actor.adminEmail,
          title: mappedBrief.title,
        },
      },
    });

    await (this.prisma as unknown as {
      seoChangeLog: { create: (args: unknown) => Promise<unknown> };
    }).seoChangeLog.create({
      data: {
        action: "CONTENT_BRIEF_PUBLISHED",
        resourceType: "content_brief",
        resourceId: id,
        oldValue: { status: mappedBrief.status },
        newValue: { status: "PUBLISHED" },
        operatorId: actor.adminId,
      },
    });

    const updated = await (this.prisma as unknown as {
      contentBrief: { update: (args: unknown) => Promise<Record<string, unknown>> };
    }).contentBrief.update({
      where: { id },
      data: {
        status: "PUBLISHED",
      },
    });

    return this.mapContentBrief(updated);
  }

  private async persistHealthCheck(pages: HealthCheckPage[], issues: SeoIssueItem[]) {
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

  private getSearchConsoleConnection() {
    return {
      connected: Boolean(process.env.GSC_SITE_URL && process.env.GSC_CLIENT_EMAIL && process.env.GSC_PRIVATE_KEY),
      status: (process.env.GSC_SITE_URL && process.env.GSC_CLIENT_EMAIL && process.env.GSC_PRIVATE_KEY ? "Connected" : "Not Connected") as
        | "Connected"
        | "Not Connected",
    };
  }

  private getGa4Connection() {
    return {
      connected: Boolean(process.env.GA4_PROPERTY_ID && process.env.GA4_CLIENT_EMAIL && process.env.GA4_PRIVATE_KEY),
      status: (process.env.GA4_PROPERTY_ID && process.env.GA4_CLIENT_EMAIL && process.env.GA4_PRIVATE_KEY ? "Connected" : "Not Connected") as
        | "Connected"
        | "Not Connected",
    };
  }

  private async getProductIdBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!product) {
      throw new NotFoundException({ code: "PRODUCT_NOT_FOUND", message: `Product not found for slug: ${slug}` });
    }
    return product.id;
  }

  private mapRecommendation(row: Record<string, unknown>): SeoRecommendationItem {
    return {
      id: String(row.id),
      recommendationType: String(row.recommendationType),
      resourceType: String(row.resourceType),
      resourceId: row.resourceId ? String(row.resourceId) : null,
      pageUrl: recommendationDrafts.find((item) => item.id === row.id)?.pageUrl ?? null,
      reason: String(row.reason),
      priority: String(row.priority),
      status: String(row.status) as SeoRecommendationItem["status"],
      isAiDraft: Boolean(row.isAiDraft),
      draftPayload: (row.draftPayload as Record<string, unknown>) ?? {},
    };
  }

  private mapContentBrief(row: Record<string, unknown>): ContentBriefItem {
    return {
      id: String(row.id),
      sourceOpportunityId: row.sourceOpportunityId ? String(row.sourceOpportunityId) : null,
      title: String(row.title),
      targetKeyword: String(row.targetKeyword),
      outline: Array.isArray(row.outline) ? row.outline.map((item) => String(item)) : [],
      draftContent: row.draftContent ? String(row.draftContent) : null,
      relatedProductIds: Array.isArray(row.relatedProductIds) ? row.relatedProductIds.map((item) => String(item)) : [],
      relatedCollectionSlugs: Array.isArray(row.relatedCollectionSlugs) ? row.relatedCollectionSlugs.map((item) => String(item)) : [],
      status: String(row.status) as ContentBriefItem["status"],
    };
  }

  private mapInternalLinkSuggestion(row: Record<string, unknown>): InternalLinkSuggestionItem {
    return {
      id: String(row.id),
      sourcePage: String(row.sourcePage),
      targetPage: String(row.targetPage),
      anchorText: String(row.anchorText),
      reason: String(row.reason),
      priority: String(row.priority),
      status: String(row.status) as InternalLinkSuggestionItem["status"],
    };
  }
}

function buildProductHealthPage(
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

function buildStaticHealthPage(
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

function buildFaqHealthPage(sitemapPaths: Set<string>): HealthCheckPage {
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

function buildPageIssues(page: HealthCheckPage) {
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

function scoreIssueTypes(issueTypes: string[]) {
  return Math.max(
    0,
    issueTypes.reduce((score, issueType) => score - (issuePenalty[issueType] ?? 0), 100),
  );
}

function mapIssue(page: HealthCheckPage, issueType: string, detectedAt: string): SeoIssueItem {
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
