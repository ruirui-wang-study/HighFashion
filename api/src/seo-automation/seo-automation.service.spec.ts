import { ConfigService } from "@nestjs/config";
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
    siteSetting: {
      findMany: jest.fn().mockResolvedValue([]),
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
    const service = new SeoAutomationService(prisma, new ConfigService());

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

  it("uses deepseek to rewrite recommendation drafts when ai provider is configured", async () => {
    const prisma = createPrismaMock() as PrismaService & {
      siteSetting: { findMany: jest.Mock };
    };
    prisma.siteSetting.findMany.mockResolvedValue([
      { key: "product_research.ai.provider", value: "deepseek" },
      { key: "product_research.ai.base_url", value: "https://api.deepseek.com" },
      { key: "product_research.ai.model_candidate_generation", value: "deepseek-v4-pro" },
      { key: "product_research.ai.model_scoring", value: "deepseek-v4-pro" },
      { key: "product_research.ai.model_copy", value: "deepseek-v4-pro" },
    ]);

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            finish_reason: "stop",
            message: {
              content: JSON.stringify({
                items: [
                  {
                    id: "rec_1",
                    reason: "AI rewrite reason for title.",
                    draftPayload: {
                      seoTitle: "AI Title | PulseGear",
                    },
                  },
                  {
                    id: "rec_2",
                    reason: "AI rewrite reason for meta description.",
                    draftPayload: {
                      seoDescription: "AI meta description for runners.",
                    },
                  },
                  {
                    id: "rec_3",
                    reason: "AI rewrite reason for guide recommendation.",
                    draftPayload: {
                      suggestedGuideTitle: "AI Guide Title",
                      targetKeyword: "best knee sleeve for running",
                    },
                  },
                ],
              }),
            },
          },
        ],
      }),
    });

    const originalFetch = global.fetch;
    const service = new SeoAutomationService(prisma, new ConfigService({ DEEPSEEK_API_KEY: "test-key" }));
    global.fetch = fetchMock as typeof global.fetch;

    try {
      const recommendations = await service.generateRecommendations();

      expect(fetchMock).toHaveBeenCalled();
      expect(recommendations.find((item) => item.id === "rec_1")?.draftPayload).toMatchObject({
        seoTitle: "AI Title | PulseGear",
      });
      expect(recommendations.find((item) => item.id === "rec_2")?.draftPayload).toMatchObject({
        seoDescription: "AI meta description for runners.",
      });
      expect(recommendations.find((item) => item.id === "rec_3")?.draftPayload).toMatchObject({
        suggestedGuideTitle: "AI Guide Title",
      });
      expect(recommendations.find((item) => item.id === "rec_1")?.reason).toBe("AI rewrite reason for title.");
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("uses deepseek to rewrite internal link drafts when ai provider is configured", async () => {
    const prisma = createPrismaMock() as PrismaService & {
      siteSetting: { findMany: jest.Mock };
    };
    prisma.siteSetting.findMany.mockResolvedValue([
      { key: "product_research.ai.provider", value: "deepseek" },
      { key: "product_research.ai.base_url", value: "https://api.deepseek.com" },
      { key: "product_research.ai.model_candidate_generation", value: "deepseek-v4-pro" },
      { key: "product_research.ai.model_scoring", value: "deepseek-v4-pro" },
      { key: "product_research.ai.model_copy", value: "deepseek-v4-pro" },
    ]);

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            finish_reason: "stop",
            message: {
              content: JSON.stringify({
                items: [
                  {
                    id: "link_1",
                    anchorText: "runner knee sleeve support guide",
                    reason: "AI rewrite reason for guide-to-product handoff.",
                  },
                  {
                    id: "link_2",
                    anchorText: "how to choose knee support for training runs",
                    reason: "AI rewrite reason for product-to-guide education link.",
                  },
                ],
              }),
            },
          },
        ],
      }),
    });

    const originalFetch = global.fetch;
    const service = new SeoAutomationService(prisma, new ConfigService({ DEEPSEEK_API_KEY: "test-key" }));
    global.fetch = fetchMock as typeof global.fetch;

    try {
      const links = await service.generateInternalLinkSuggestions();

      expect(fetchMock).toHaveBeenCalled();
      expect(links.find((item) => item.id === "link_1")).toMatchObject({
        anchorText: "runner knee sleeve support guide",
        reason: "AI rewrite reason for guide-to-product handoff.",
      });
      expect(links.find((item) => item.id === "link_2")).toMatchObject({
        anchorText: "how to choose knee support for training runs",
        reason: "AI rewrite reason for product-to-guide education link.",
      });
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("uses deepseek to rewrite opportunity drafts when ai provider is configured", async () => {
    const prisma = createPrismaMock() as PrismaService & {
      siteSetting: { findMany: jest.Mock };
    };
    prisma.siteSetting.findMany.mockResolvedValue([
      { key: "product_research.ai.provider", value: "deepseek" },
      { key: "product_research.ai.base_url", value: "https://api.deepseek.com" },
      { key: "product_research.ai.model_candidate_generation", value: "deepseek-v4-pro" },
      { key: "product_research.ai.model_scoring", value: "deepseek-v4-pro" },
      { key: "product_research.ai.model_copy", value: "deepseek-v4-pro" },
    ]);

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            finish_reason: "stop",
            message: {
              content: JSON.stringify({
                items: [
                  {
                    id: "opp_1",
                    suggestedAction: "Rewrite the product title and meta description to match runner intent and improve click-through from search.",
                    expectedImpact: "High",
                  },
                  {
                    id: "opp_2",
                    suggestedAction: "Refresh the guide with clearer comparisons and stronger product bridges for knee support shoppers.",
                    expectedImpact: "Medium",
                  },
                  {
                    id: "opp_3",
                    suggestedAction: "Add fit education and FAQ content to reduce hesitation on a high-impression product page.",
                    expectedImpact: "Medium",
                  },
                ],
              }),
            },
          },
        ],
      }),
    });

    const originalFetch = global.fetch;
    const service = new SeoAutomationService(prisma, new ConfigService({ DEEPSEEK_API_KEY: "test-key" }));
    global.fetch = fetchMock as typeof global.fetch;

    try {
      const opportunities = await service.generateOpportunities();

      expect(fetchMock).toHaveBeenCalled();
      expect(opportunities.find((item) => item.id === "opp_1")).toMatchObject({
        suggestedAction: "Rewrite the product title and meta description to match runner intent and improve click-through from search.",
        expectedImpact: "High",
      });
      expect(opportunities.find((item) => item.id === "opp_2")).toMatchObject({
        suggestedAction: "Refresh the guide with clearer comparisons and stronger product bridges for knee support shoppers.",
      });
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("uses deepseek to rewrite content brief title and outline when ai provider is configured", async () => {
    const prisma = createPrismaMock() as PrismaService & {
      siteSetting: { findMany: jest.Mock };
    };
    prisma.siteSetting.findMany.mockResolvedValue([
      { key: "product_research.ai.provider", value: "deepseek" },
      { key: "product_research.ai.base_url", value: "https://api.deepseek.com" },
      { key: "product_research.ai.model_candidate_generation", value: "deepseek-v4-pro" },
      { key: "product_research.ai.model_scoring", value: "deepseek-v4-pro" },
      { key: "product_research.ai.model_copy", value: "deepseek-v4-pro" },
    ]);

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            finish_reason: "stop",
            message: {
              content: JSON.stringify({
                title: "Runner's Guide Brief: Choosing the Right Knee Sleeve",
                outline: [
                  "Explain when runners typically look for knee sleeve support",
                  "Compare sleeve fit, compression feel, and breathability",
                  "Connect buying questions to PulseGear product and guide links",
                ],
              }),
            },
          },
        ],
      }),
    });

    const originalFetch = global.fetch;
    const service = new SeoAutomationService(prisma, new ConfigService({ DEEPSEEK_API_KEY: "test-key" }));
    global.fetch = fetchMock as typeof global.fetch;

    try {
      const brief = await service.createContentBriefFromOpportunity("opp_1");

      expect(fetchMock).toHaveBeenCalled();
      expect(brief.title).toBe("Runner's Guide Brief: Choosing the Right Knee Sleeve");
      expect(brief.outline).toEqual([
        "Explain when runners typically look for knee sleeve support",
        "Compare sleeve fit, compression feel, and breathability",
        "Connect buying questions to PulseGear product and guide links",
      ]);
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("uses deepseek to rewrite product seo draft fields when ai provider is configured", async () => {
    const prisma = createPrismaMock() as PrismaService & {
      siteSetting: { findMany: jest.Mock };
    };
    prisma.siteSetting.findMany.mockResolvedValue([
      { key: "product_research.ai.provider", value: "deepseek" },
      { key: "product_research.ai.base_url", value: "https://api.deepseek.com" },
      { key: "product_research.ai.model_candidate_generation", value: "deepseek-v4-pro" },
      { key: "product_research.ai.model_scoring", value: "deepseek-v4-pro" },
      { key: "product_research.ai.model_copy", value: "deepseek-v4-pro" },
    ]);

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            finish_reason: "stop",
            message: {
              content: JSON.stringify({
                seoTitle: "PulseFlex Knee Sleeve | Breathable Running Support",
                seoDescription: "Lightweight knee compression for running and training, with breathable fabric and a secure fit that stays comfortable through repeat sessions.",
                productFaq: [
                  {
                    question: "Who should use PulseFlex Knee Sleeve?",
                    answer: "Runners and training users who want lightweight, breathable knee support without bulky coverage.",
                  },
                ],
              }),
            },
          },
        ],
      }),
    });

    const originalFetch = global.fetch;
    const service = new SeoAutomationService(prisma, new ConfigService({ DEEPSEEK_API_KEY: "test-key" }));
    global.fetch = fetchMock as typeof global.fetch;

    try {
      const draft = await service.generateProductSeoDraft("product_1");

      expect(fetchMock).toHaveBeenCalled();
      expect(draft.seoTitle).toBe("PulseFlex Knee Sleeve | Breathable Running Support");
      expect(draft.seoDescription).toBe(
        "Lightweight knee compression for running and training, with breathable fabric and a secure fit that stays comfortable through repeat sessions.",
      );
      expect(draft.productFaq).toEqual([
        {
          question: "Who should use PulseFlex Knee Sleeve?",
          answer: "Runners and training users who want lightweight, breathable knee support without bulky coverage.",
        },
      ]);
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("includes ai provider status in seo automation overview", async () => {
    const prisma = createPrismaMock() as PrismaService & {
      siteSetting: { findMany: jest.Mock };
    };
    prisma.siteSetting.findMany.mockResolvedValue([
      { key: "product_research.ai.provider", value: "deepseek" },
      { key: "product_research.ai.base_url", value: "https://api.deepseek.com" },
      { key: "product_research.ai.model_copy", value: "deepseek-v4-pro" },
    ]);

    const service = new SeoAutomationService(prisma, new ConfigService({ DEEPSEEK_API_KEY: "test-key" }));

    const overview = await service.getOverview();

    expect(overview.aiStatus).toMatchObject({
      configuredProvider: "deepseek",
      effectiveProvider: "deepseek",
      fallbackProvider: "local",
      baseUrl: "https://api.deepseek.com",
      model: "deepseek-v4-pro",
      apiKeyConfigured: true,
    });
  });
});
