import type { PrismaService } from "../common/prisma.service";
import { SeoAutomationService } from "./seo-automation.service";

function createPrismaMock() {
  const seoRecommendations: Array<Record<string, unknown>> = [];
  const contentOpportunities: Array<Record<string, unknown>> = [];
  const contentBriefs: Array<Record<string, unknown>> = [];
  const internalLinkSuggestions: Array<Record<string, unknown>> = [];
  const seoChangeLogs: Array<Record<string, unknown>> = [];

  return {
    product: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: "product_1",
          title: "PulseFlex Knee Sleeve",
          slug: "pulseflex-knee-sleeve",
          category: "Support",
          shortDescription: "Breathable compression knee support.",
          description: "Supportive sleeve for running and training.",
          seoTitle: null,
          seoDescription: null,
          canonicalUrl: null,
          status: "ACTIVE",
          images: [{ alt: "PulseFlex Knee Sleeve front" }, { alt: "" }],
        },
        {
          id: "product_2",
          title: "CoreCarry Running Belt",
          slug: "corecarry-running-belt",
          category: "Carry",
          shortDescription: "No-bounce belt for phone and keys.",
          description: "Low-profile run belt.",
          seoTitle: "CoreCarry Running Belt | PulseGear",
          seoDescription: "No-bounce running belt for compact carry.",
          canonicalUrl: "/products/corecarry-running-belt",
          status: "ACTIVE",
          images: [{ alt: "CoreCarry Running Belt" }],
        },
      ]),
      findUnique: jest.fn().mockResolvedValue({
        id: "product_1",
        title: "PulseFlex Knee Sleeve",
        slug: "pulseflex-knee-sleeve",
        category: "Support",
        shortDescription: "Breathable compression knee support.",
        description: "Supportive sleeve for running and training.",
        seoTitle: null,
        seoDescription: null,
        canonicalUrl: null,
        images: [{ alt: "PulseFlex Knee Sleeve front" }, { alt: "" }],
      }),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: "product_1", ...data })),
    },
    contentEntry: {
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue({ id: "guide_1" }),
    },
    seoPage: {
      upsert: jest.fn().mockImplementation(({ create }) => Promise.resolve({ id: create.url, ...create })),
      findMany: jest.fn().mockResolvedValue([]),
    },
    seoIssue: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
      findMany: jest.fn().mockResolvedValue([]),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    searchConsoleQueryDaily: {
      upsert: jest.fn().mockImplementation(({ create }) => Promise.resolve({ id: create.query, ...create })),
    },
    searchConsolePageDaily: {
      upsert: jest.fn().mockImplementation(({ create }) => Promise.resolve({ id: create.page, ...create })),
    },
    ga4LandingPageDaily: {
      upsert: jest.fn().mockImplementation(({ create }) => Promise.resolve({ id: create.landingPage, ...create })),
    },
    contentOpportunity: {
      upsert: jest.fn().mockImplementation(({ where, create, update }) => {
        const index = contentOpportunities.findIndex((item) => item.id === where.id);
        if (index >= 0) {
          contentOpportunities[index] = { ...contentOpportunities[index], ...update };
          return Promise.resolve(contentOpportunities[index]);
        }
        const created = { ...create, createdAt: new Date(), updatedAt: new Date() };
        contentOpportunities.push(created);
        return Promise.resolve(created);
      }),
      findMany: jest.fn().mockImplementation(() => Promise.resolve([...contentOpportunities])),
      findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve(contentOpportunities.find((item) => item.id === where.id) ?? null)),
      update: jest.fn().mockImplementation(({ where, data }) => {
        const index = contentOpportunities.findIndex((item) => item.id === where.id);
        if (index < 0) return Promise.resolve(null);
        contentOpportunities[index] = { ...contentOpportunities[index], ...data, updatedAt: new Date() };
        return Promise.resolve(contentOpportunities[index]);
      }),
    },
    seoRecommendation: {
      upsert: jest.fn().mockImplementation(({ where, create, update }) => {
        const index = seoRecommendations.findIndex((item) => item.id === where.id);
        if (index >= 0) {
          seoRecommendations[index] = { ...seoRecommendations[index], ...update, updatedAt: new Date() };
          return Promise.resolve(seoRecommendations[index]);
        }
        const created = { ...create, createdAt: new Date(), updatedAt: new Date(), appliedAt: null };
        seoRecommendations.push(created);
        return Promise.resolve(created);
      }),
      findMany: jest.fn().mockImplementation(() => Promise.resolve([...seoRecommendations])),
      findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve(seoRecommendations.find((item) => item.id === where.id) ?? null)),
      update: jest.fn().mockImplementation(({ where, data }) => {
        const index = seoRecommendations.findIndex((item) => item.id === where.id);
        if (index < 0) return Promise.resolve(null);
        seoRecommendations[index] = { ...seoRecommendations[index], ...data, updatedAt: new Date() };
        return Promise.resolve(seoRecommendations[index]);
      }),
    },
    contentBrief: {
      upsert: jest.fn().mockImplementation(({ where, create, update }) => {
        const index = contentBriefs.findIndex((item) => item.id === where.id);
        if (index >= 0) {
          contentBriefs[index] = { ...contentBriefs[index], ...update, updatedAt: new Date() };
          return Promise.resolve(contentBriefs[index]);
        }
        const created = { ...create, createdAt: new Date(), updatedAt: new Date() };
        contentBriefs.push(created);
        return Promise.resolve(created);
      }),
      findMany: jest.fn().mockImplementation(() => Promise.resolve([...contentBriefs])),
      findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve(contentBriefs.find((item) => item.id === where.id) ?? null)),
      update: jest.fn().mockImplementation(({ where, data }) => {
        const index = contentBriefs.findIndex((item) => item.id === where.id);
        if (index < 0) return Promise.resolve(null);
        contentBriefs[index] = { ...contentBriefs[index], ...data, updatedAt: new Date() };
        return Promise.resolve(contentBriefs[index]);
      }),
    },
    internalLinkSuggestion: {
      upsert: jest.fn().mockImplementation(({ where, create, update }) => {
        const index = internalLinkSuggestions.findIndex((item) => item.id === where.id);
        if (index >= 0) {
          internalLinkSuggestions[index] = { ...internalLinkSuggestions[index], ...update, updatedAt: new Date() };
          return Promise.resolve(internalLinkSuggestions[index]);
        }
        const created = { ...create, createdAt: new Date(), updatedAt: new Date() };
        internalLinkSuggestions.push(created);
        return Promise.resolve(created);
      }),
      findMany: jest.fn().mockImplementation(() => Promise.resolve([...internalLinkSuggestions])),
      findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve(internalLinkSuggestions.find((item) => item.id === where.id) ?? null)),
      update: jest.fn().mockImplementation(({ where, data }) => {
        const index = internalLinkSuggestions.findIndex((item) => item.id === where.id);
        if (index < 0) return Promise.resolve(null);
        internalLinkSuggestions[index] = { ...internalLinkSuggestions[index], ...data, updatedAt: new Date() };
        return Promise.resolve(internalLinkSuggestions[index]);
      }),
    },
    seoChangeLog: {
      create: jest.fn().mockImplementation(({ data }) => {
        const created = { id: `log_${seoChangeLogs.length + 1}`, createdAt: new Date(), ...data };
        seoChangeLogs.push(created);
        return Promise.resolve(created);
      }),
      findMany: jest.fn().mockImplementation(() => Promise.resolve([...seoChangeLogs].sort((a, b) => Number((b.createdAt as Date)) - Number((a.createdAt as Date))))),
    },
    auditLog: {
      create: jest.fn().mockResolvedValue({ id: "audit_1" }),
    },
    adminSettings: {
      upsert: jest.fn().mockResolvedValue({
        id: "default",
        storefrontUrl: "http://localhost:3000",
        supportEmail: "support@pulsegear.local",
        checkoutCurrency: "usd",
        timezone: "America/Los_Angeles",
        shippingCountries: ["US"],
        defaultFulfillmentSlaDays: 3,
        returnsPolicyUrl: "/faq",
        orderAutoFulfill: false,
        primaryPaymentProvider: "Stripe Checkout",
        stripeAutomaticPaymentMethods: true,
        paymentFailureMessage: null,
        adminSessionTtlHours: 12,
        auditLoggingEnabled: true,
        updatedAt: new Date(),
      }),
    },
  } as unknown as PrismaService;
}

describe("SeoAutomationService", () => {
  it("runs a health check and returns page issues with health scores", async () => {
    const service = new SeoAutomationService(createPrismaMock());

    const result = await service.runHealthCheck();

    expect(result.pages.length).toBeGreaterThan(4);
    expect(result.pages[0].healthScore).toBeLessThanOrEqual(100);
    expect(result.issues.some((issue: { issueType: string }) => issue.issueType === "missing_title")).toBe(true);
    expect(result.issues.some((issue: { pageUrl: string }) => issue.pageUrl === "/faq")).toBe(false);
  });

  it("returns disconnected but safe GSC and GA4 sync results when credentials are missing", async () => {
    const service = new SeoAutomationService(createPrismaMock());

    const gsc = await service.syncSearchConsole();
    const ga4 = await service.syncGa4();

    expect(gsc.connection.status).toBe("Not Connected");
    expect(gsc.rows.length).toBeGreaterThan(0);
    expect(ga4.connection.status).toBe("Not Connected");
    expect(ga4.rows.length).toBeGreaterThan(0);
  });

  it("generates keyword opportunities, draft recommendations, content briefs, and link suggestions", async () => {
    const service = new SeoAutomationService(createPrismaMock());

    await service.runHealthCheck();
    const opportunities = await service.generateOpportunities();
    const recommendations = await service.generateRecommendations();
    const brief = await service.createContentBriefFromOpportunity("opp_1");
    const links = await service.generateInternalLinkSuggestions();

    expect(opportunities.some((item: { opportunityType: string }) => item.opportunityType === "HIGH_IMPRESSIONS_LOW_CTR")).toBe(true);
    expect(recommendations.every((item: { status: string; isAiDraft: boolean }) => item.status === "DRAFT" && item.isAiDraft)).toBe(true);
    expect(brief.status).toBe("BRIEF_GENERATED");
    expect(links.some((item: { anchorText: string }) => item.anchorText.length > 0)).toBe(true);
  });

  it("generates product seo drafts and only writes product fields when apply is called", async () => {
    const prisma = createPrismaMock();
    const service = new SeoAutomationService(prisma);

    const draft = await service.generateProductSeoDraft("product_1");

    expect(draft.aiDraft).toBe(true);
    expect(prisma.product.update).not.toHaveBeenCalled();

    await service.applyProductSeoDraft("product_1", draft, { adminId: "admin_1", adminEmail: "seo@pulsegear.com" });

    expect(prisma.product.update).toHaveBeenCalled();
    expect(prisma.auditLog.create).toHaveBeenCalled();
    expect((prisma as unknown as { seoChangeLog: { create: jest.Mock } }).seoChangeLog.create).toHaveBeenCalled();
  });

  it("persists recommendations and internal links so later reads return updated statuses", async () => {
    const prisma = createPrismaMock();
    const service = new SeoAutomationService(prisma);

    const generatedRecommendations = await service.generateRecommendations();
    const generatedLinks = await service.generateInternalLinkSuggestions();

    expect(generatedRecommendations[0]?.status).toBe("DRAFT");
    expect(generatedLinks[0]?.status).toBe("NEW");

    await service.applyRecommendation("rec_1", { adminId: "admin_1", adminEmail: "seo@pulsegear.com" });
    await service.applyInternalLinkSuggestion("link_1", { adminId: "admin_1", adminEmail: "seo@pulsegear.com" });

    const recommendations = await service.listRecommendations();
    const links = await service.listInternalLinks();
    const logs = await service.listChangeLog();

    expect(recommendations.find((item) => item.id === "rec_1")?.status).toBe("APPLIED");
    expect(links.find((item) => item.id === "link_1")?.status).toBe("APPLIED");
    expect(logs.length).toBeGreaterThan(0);
  });
});
