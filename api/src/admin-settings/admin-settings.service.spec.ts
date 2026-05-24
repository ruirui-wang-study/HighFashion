import type { PrismaService } from "../common/prisma.service";
import { AdminSettingsService } from "./admin-settings.service";

describe("AdminSettingsService", () => {
  const actor = { adminId: "admin_1", adminEmail: "admin@pulsegear.local" };

  function createPrismaMock() {
    const record = {
      id: "default",
      storefrontUrl: "http://localhost:3000",
      supportEmail: "support@pulsegear.local",
      checkoutCurrency: "usd",
      timezone: "America/Los_Angeles",
      shippingCountries: ["US", "GB"],
      defaultFulfillmentSlaDays: 3,
      returnsPolicyUrl: "/faq",
      orderAutoFulfill: false,
      primaryPaymentProvider: "Stripe Checkout",
      stripeAutomaticPaymentMethods: true,
      paymentFailureMessage: "Retry checkout from cart if payment is not confirmed.",
      adminSessionTtlHours: 12,
      auditLoggingEnabled: true,
      updatedAt: new Date("2026-05-22T00:00:00.000Z"),
    };

    const tx = {
      adminSettings: {
        upsert: jest.fn().mockResolvedValue({
          ...record,
          supportEmail: "ops@pulsegear.local",
          shippingCountries: ["US", "GB", "CA"],
          updatedAt: new Date("2026-05-22T02:00:00.000Z"),
        }),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({}),
      },
      siteSetting: {
        upsert: jest.fn().mockImplementation(({ create }) => Promise.resolve(create)),
      },
      uiCopy: {
        upsert: jest.fn().mockImplementation(({ create }) => Promise.resolve(create)),
      },
      contentTemplate: {
        upsert: jest.fn().mockImplementation(({ create }) => Promise.resolve(create)),
      },
      seoAutomationRule: {
        upsert: jest.fn().mockImplementation(({ create }) => Promise.resolve(create)),
      },
    };

    const prisma = {
      adminSettings: {
        upsert: jest.fn().mockResolvedValue(record),
      },
      siteSetting: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      uiCopy: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      contentTemplate: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      seoAutomationRule: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      $transaction: async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
    } as unknown as PrismaService;

    return { prisma, tx };
  }

  it("returns default settings payload", async () => {
    const { prisma } = createPrismaMock();
    const service = new AdminSettingsService(prisma);

    const result = await service.getSettings();

    expect(result).toEqual(expect.objectContaining({
      storefrontUrl: "http://localhost:3000",
      supportEmail: "support@pulsegear.local",
      adminSessionTtlHours: 12,
    }));
  });

  it("updates settings and writes audit log", async () => {
    const { prisma, tx } = createPrismaMock();
    const service = new AdminSettingsService(prisma);

    const result = await service.updateSettings(actor, {
      storefrontUrl: "http://localhost:3000",
      supportEmail: "ops@pulsegear.local",
      checkoutCurrency: "USD",
      timezone: "America/Los_Angeles",
      shippingCountries: ["us", "gb", "ca"],
      defaultFulfillmentSlaDays: 5,
      returnsPolicyUrl: "/returns",
      orderAutoFulfill: false,
      primaryPaymentProvider: "Stripe Checkout",
      stripeAutomaticPaymentMethods: true,
      paymentFailureMessage: "Retry from cart.",
      adminSessionTtlHours: 12,
      auditLoggingEnabled: true,
    });

    expect(tx.adminSettings.upsert).toHaveBeenCalled();
    expect(tx.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: actor.adminId,
        action: "SETTINGS_UPDATED",
        resource: "admin_settings",
      }),
    });
    expect(result.supportEmail).toBe("ops@pulsegear.local");
    expect(result.shippingCountries).toEqual(["US", "GB", "CA"]);
  });

  it("returns default copy config and public site copy snapshot", async () => {
    const { prisma } = createPrismaMock();
    const service = new AdminSettingsService(prisma);

    const config = await service.getCopyConfig();
    const snapshot = await service.getPublicSiteCopySnapshot();

    expect(config.uiCopy.some((item: { key: string }) => item.key === "ui.admin.seo.ai_draft_badge")).toBe(true);
    expect(config.contentTemplates.some((item: { key: string }) => item.key === "template.seo.product.title")).toBe(true);
    expect(config.seoRules.some((item: { key: string }) => item.key === "rule.seo.title.min_length")).toBe(true);
    expect(snapshot.ui.aiDraftBadge).toBeTruthy();
    expect(snapshot.seo.productTitleTemplate).toBeTruthy();
  });

  it("updates copy config and writes audit log", async () => {
    const { prisma, tx } = createPrismaMock();
    const service = new AdminSettingsService(prisma);

    const result = await service.updateCopyConfig(actor, {
      uiCopy: [
        { key: "ui.admin.seo.ai_draft_badge", value: "AI Draft" },
        { key: "ui.admin.seo.not_connected", value: "Not Connected" },
      ],
      contentTemplates: [
        { key: "template.seo.product.title", name: "Product title template", value: "{{title}} | PulseGear" },
      ],
      seoRules: [
        { key: "rule.seo.title.min_length", value: 20 },
      ],
      siteSettings: [
        { key: "site.brand_name", value: "PulseGear" },
      ],
    });

    expect(tx.uiCopy.upsert).toHaveBeenCalled();
    expect(tx.contentTemplate.upsert).toHaveBeenCalled();
    expect(tx.seoAutomationRule.upsert).toHaveBeenCalled();
    expect(tx.siteSetting.upsert).toHaveBeenCalled();
    expect(tx.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: actor.adminId,
        action: "COPY_CONFIG_UPDATED",
        resource: "copy_config",
      }),
    });
    expect(result.uiCopy.some((item: { key: string }) => item.key === "ui.admin.seo.ai_draft_badge")).toBe(true);
  });
});
