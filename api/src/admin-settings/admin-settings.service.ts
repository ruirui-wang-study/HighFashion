import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma.service";
import type { UpdateAdminSettingsDto } from "./dto/update-admin-settings.dto";
import type {
  AdminActor,
  AdminCopyConfigPayload,
  AdminSettingsPayload,
  CopyConfigItem,
  PublicSiteCopySnapshotPayload,
  PublicStorefrontSettingsPayload,
  TemplateConfigItem,
} from "./admin-settings.types";

const SETTINGS_ID = "default";
const defaultSiteSettings: CopyConfigItem[] = [
  { key: "site.brand_name", value: "PulseGear" },
  { key: "site.shipping_copy", value: "Free shipping over $60" },
  { key: "site.returns_copy", value: "30-day returns" },
];
const defaultUiCopy: CopyConfigItem[] = [
  { key: "ui.admin.seo.ai_draft_badge", value: "AI Draft" },
  { key: "ui.admin.seo.not_connected", value: "Not Connected" },
  { key: "ui.admin.seo.apply_confirm_title", value: "Apply this draft to live data?" },
];
const defaultTemplates: TemplateConfigItem[] = [
  { key: "template.seo.product.title", name: "Product title template", value: "{{title}} | PulseGear", status: "ACTIVE" },
  { key: "template.seo.product.description", name: "Product description template", value: "{{shortDescription}}", status: "ACTIVE" },
];
const defaultSeoRules: CopyConfigItem[] = [
  { key: "rule.seo.title.min_length", value: 20 },
  { key: "rule.seo.title.max_length", value: 70 },
  { key: "rule.seo.description.min_length", value: 70 },
  { key: "rule.seo.description.max_length", value: 180 },
];

@Injectable()
export class AdminSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    const settings = await this.prisma.adminSettings.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: buildDefaultSettings(),
    });

    return mapSettings(settings);
  }

  async updateSettings(actor: AdminActor, input: UpdateAdminSettingsDto) {
    const settings = await this.prisma.$transaction(async (tx) => {
      const saved = await tx.adminSettings.upsert({
        where: { id: SETTINGS_ID },
        update: buildSettingsData(input),
        create: {
          id: SETTINGS_ID,
          ...buildSettingsData(input),
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: actor.adminId,
          action: "SETTINGS_UPDATED",
          resource: "admin_settings",
          resourceId: SETTINGS_ID,
          details: {
            storefrontUrl: saved.storefrontUrl,
            supportEmail: saved.supportEmail,
            checkoutCurrency: saved.checkoutCurrency,
            actorEmail: actor.adminEmail,
          },
        },
      });

      return saved;
    });

    return mapSettings(settings);
  }

  async getPublicStorefrontSettings() {
    const settings = await this.prisma.adminSettings.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: buildDefaultSettings(),
    });

    return mapPublicSettings(settings);
  }

  async getCopyConfig(): Promise<AdminCopyConfigPayload> {
    const [siteSettings, uiCopy, contentTemplates, seoRules] = await Promise.all([
      this.prisma.siteSetting.findMany({ orderBy: { key: "asc" } }),
      this.prisma.uiCopy.findMany({ where: { locale: "en-US" }, orderBy: { key: "asc" } }),
      this.prisma.contentTemplate.findMany({ where: { locale: "en-US" }, orderBy: { key: "asc" } }),
      this.prisma.seoAutomationRule.findMany({ orderBy: { key: "asc" } }),
    ]);

    const mergedSiteSettings = mergeConfigItems(defaultSiteSettings, siteSettings.map((item) => ({ key: item.key, value: item.value as string | number | boolean | null })));
    const mergedUiCopy = mergeConfigItems(defaultUiCopy, uiCopy.map((item) => ({ key: item.key, value: item.value })));
    const mergedTemplates = mergeTemplateItems(defaultTemplates, contentTemplates.map((item) => ({
      key: item.key,
      name: item.name,
      value: String(item.content),
      status: item.status,
    })));
    const mergedSeoRules = mergeConfigItems(defaultSeoRules, seoRules.map((item) => ({ key: item.key, value: item.value as string | number | boolean | null })));

    return {
      siteSettings: mergedSiteSettings,
      uiCopy: mergedUiCopy,
      contentTemplates: mergedTemplates,
      seoRules: mergedSeoRules,
      updatedAt: new Date().toISOString(),
    };
  }

  async updateCopyConfig(actor: AdminActor, input: Omit<AdminCopyConfigPayload, "updatedAt">) {
    await this.prisma.$transaction(async (tx) => {
      for (const item of input.siteSettings) {
        await tx.siteSetting.upsert({
          where: { key: item.key },
          update: { value: item.value as Prisma.InputJsonValue },
          create: { key: item.key, value: item.value as Prisma.InputJsonValue },
        });
      }
      for (const item of input.uiCopy) {
        await tx.uiCopy.upsert({
          where: { key_locale: { key: item.key, locale: "en-US" } },
          update: { value: String(item.value ?? "") },
          create: { key: item.key, locale: "en-US", value: String(item.value ?? "") },
        });
      }
      for (const item of input.contentTemplates) {
        await tx.contentTemplate.upsert({
          where: { key_locale: { key: item.key, locale: "en-US" } },
          update: { name: item.name, content: item.value as unknown as Prisma.InputJsonValue, status: item.status ?? "ACTIVE" },
          create: { key: item.key, locale: "en-US", name: item.name, content: item.value as unknown as Prisma.InputJsonValue, status: item.status ?? "ACTIVE" },
        });
      }
      for (const item of input.seoRules) {
        await tx.seoAutomationRule.upsert({
          where: { key: item.key },
          update: { value: item.value as Prisma.InputJsonValue },
          create: { key: item.key, value: item.value as Prisma.InputJsonValue },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: actor.adminId,
          action: "COPY_CONFIG_UPDATED",
          resource: "copy_config",
          resourceId: "global",
          details: {
            actorEmail: actor.adminEmail,
            siteSettings: input.siteSettings.length,
            uiCopy: input.uiCopy.length,
            contentTemplates: input.contentTemplates.length,
            seoRules: input.seoRules.length,
          },
        },
      });
    });

    return this.getCopyConfig();
  }

  async getPublicSiteCopySnapshot(): Promise<PublicSiteCopySnapshotPayload> {
    const config = await this.getCopyConfig();
    const getValue = (items: CopyConfigItem[], key: string) => items.find((item) => item.key === key)?.value;
    const getTemplate = (items: TemplateConfigItem[], key: string) => items.find((item) => item.key === key)?.value;

    return {
      site: {
        brandName: String(getValue(config.siteSettings, "site.brand_name") ?? "PulseGear"),
        shippingCopy: String(getValue(config.siteSettings, "site.shipping_copy") ?? "Free shipping over $60"),
        returnsCopy: String(getValue(config.siteSettings, "site.returns_copy") ?? "30-day returns"),
      },
      ui: {
        aiDraftBadge: String(getValue(config.uiCopy, "ui.admin.seo.ai_draft_badge") ?? "AI Draft"),
        notConnected: String(getValue(config.uiCopy, "ui.admin.seo.not_connected") ?? "Not Connected"),
        applyConfirmTitle: String(getValue(config.uiCopy, "ui.admin.seo.apply_confirm_title") ?? "Apply this draft to live data?"),
      },
      seo: {
        productTitleTemplate: String(getTemplate(config.contentTemplates, "template.seo.product.title") ?? "{{title}} | PulseGear"),
        productDescriptionTemplate: String(getTemplate(config.contentTemplates, "template.seo.product.description") ?? "{{shortDescription}}"),
        titleMinLength: Number(getValue(config.seoRules, "rule.seo.title.min_length") ?? 20),
        titleMaxLength: Number(getValue(config.seoRules, "rule.seo.title.max_length") ?? 70),
        descriptionMinLength: Number(getValue(config.seoRules, "rule.seo.description.min_length") ?? 70),
        descriptionMaxLength: Number(getValue(config.seoRules, "rule.seo.description.max_length") ?? 180),
      },
    };
  }
}

function buildDefaultSettings() {
  return {
    id: SETTINGS_ID,
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
  } satisfies Prisma.AdminSettingsUncheckedCreateInput;
}

function buildSettingsData(input: UpdateAdminSettingsDto) {
  return {
    storefrontUrl: input.storefrontUrl.trim(),
    supportEmail: input.supportEmail.trim().toLowerCase(),
    checkoutCurrency: input.checkoutCurrency.trim().toLowerCase(),
    timezone: input.timezone.trim(),
    shippingCountries: input.shippingCountries.map((country) => country.trim().toUpperCase()).filter(Boolean),
    defaultFulfillmentSlaDays: input.defaultFulfillmentSlaDays,
    returnsPolicyUrl: normalizeNullableString(input.returnsPolicyUrl),
    orderAutoFulfill: input.orderAutoFulfill,
    primaryPaymentProvider: input.primaryPaymentProvider.trim(),
    stripeAutomaticPaymentMethods: input.stripeAutomaticPaymentMethods,
    paymentFailureMessage: normalizeNullableString(input.paymentFailureMessage),
    adminSessionTtlHours: input.adminSessionTtlHours,
    auditLoggingEnabled: input.auditLoggingEnabled,
  } satisfies Prisma.AdminSettingsUncheckedUpdateInput;
}

function normalizeNullableString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function mapSettings(settings: {
  storefrontUrl: string;
  supportEmail: string;
  checkoutCurrency: string;
  timezone: string;
  shippingCountries: string[];
  defaultFulfillmentSlaDays: number;
  returnsPolicyUrl: string | null;
  orderAutoFulfill: boolean;
  primaryPaymentProvider: string;
  stripeAutomaticPaymentMethods: boolean;
  paymentFailureMessage: string | null;
  adminSessionTtlHours: number;
  auditLoggingEnabled: boolean;
  updatedAt: Date;
}): AdminSettingsPayload {
  return {
    storefrontUrl: settings.storefrontUrl,
    supportEmail: settings.supportEmail,
    checkoutCurrency: settings.checkoutCurrency,
    timezone: settings.timezone,
    shippingCountries: settings.shippingCountries,
    defaultFulfillmentSlaDays: settings.defaultFulfillmentSlaDays,
    returnsPolicyUrl: settings.returnsPolicyUrl,
    orderAutoFulfill: settings.orderAutoFulfill,
    primaryPaymentProvider: settings.primaryPaymentProvider,
    stripeAutomaticPaymentMethods: settings.stripeAutomaticPaymentMethods,
    paymentFailureMessage: settings.paymentFailureMessage,
    adminSessionTtlHours: settings.adminSessionTtlHours,
    auditLoggingEnabled: settings.auditLoggingEnabled,
    updatedAt: settings.updatedAt.toISOString(),
  };
}

function mapPublicSettings(settings: {
  storefrontUrl: string;
  supportEmail: string;
  checkoutCurrency: string;
  timezone: string;
  shippingCountries: string[];
  defaultFulfillmentSlaDays: number;
  returnsPolicyUrl: string | null;
  primaryPaymentProvider: string;
  stripeAutomaticPaymentMethods: boolean;
  paymentFailureMessage: string | null;
}): PublicStorefrontSettingsPayload {
  return {
    storefrontUrl: settings.storefrontUrl,
    supportEmail: settings.supportEmail,
    checkoutCurrency: settings.checkoutCurrency,
    timezone: settings.timezone,
    shippingCountries: settings.shippingCountries,
    defaultFulfillmentSlaDays: settings.defaultFulfillmentSlaDays,
    returnsPolicyUrl: settings.returnsPolicyUrl,
    primaryPaymentProvider: settings.primaryPaymentProvider,
    stripeAutomaticPaymentMethods: settings.stripeAutomaticPaymentMethods,
    paymentFailureMessage: settings.paymentFailureMessage,
  };
}

function mergeConfigItems(defaults: CopyConfigItem[], current: CopyConfigItem[]) {
  const currentMap = new Map(current.map((item) => [item.key, item]));
  return defaults.map((item) => currentMap.get(item.key) ?? item);
}

function mergeTemplateItems(defaults: TemplateConfigItem[], current: TemplateConfigItem[]) {
  const currentMap = new Map(current.map((item) => [item.key, item]));
  return defaults.map((item) => currentMap.get(item.key) ?? item);
}
