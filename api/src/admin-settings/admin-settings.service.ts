import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../common/prisma.service";
import type { UpdateAdminSettingsDto } from "./dto/update-admin-settings.dto";
import type {
  AdminActor,
  AdminCopyConfigPayload,
  AdminSettingsPayload,
  CopyConfigItem,
  LocalizedCopyConfig,
  PublicSiteCopySnapshotPayload,
  PublicStorefrontSettingsPayload,
  TemplateConfigItem,
} from "./admin-settings.types";

const SETTINGS_ID = "default";
const defaultSiteSettings: CopyConfigItem[] = [
  { key: "site.brand_name", value: "PulseGear" },
  { key: "site.shipping_copy", value: "Free shipping over $60" },
  { key: "site.returns_copy", value: "30-day returns" },
  { key: "ai.provider", value: "deepseek" },
  { key: "ai.base_url", value: "https://api.deepseek.com" },
  { key: "ai.model.seo_copy", value: "deepseek-v4-pro" },
  { key: "ai.model.product_research_candidate", value: "deepseek-v4-pro" },
  { key: "ai.model.product_research_scoring", value: "deepseek-v4-pro" },
  { key: "ai.model.product_research_copy", value: "deepseek-v4-pro" },
  { key: "ai.model.fast", value: "deepseek-v4-flash" },
];
const defaultUiCopy: CopyConfigItem[] = [
  { key: "ui.admin.seo.ai_draft_badge", value: "AI Draft" },
  { key: "ui.admin.seo.not_connected", value: "Not Connected" },
  { key: "ui.admin.seo.apply_confirm_title", value: "Apply this draft to live data?" },
  { key: "ui.site.language.label", value: "Language" },
  { key: "ui.site.language.en", value: "EN" },
  { key: "ui.site.language.zh", value: "中文" },
  { key: "ui.site.promo", value: "Free shipping over $60 / 30-day returns" },
  { key: "ui.site.open_cart", value: "Open cart" },
  { key: "ui.site.open_menu", value: "Open menu" },
  { key: "ui.site.nav.shop", value: "Shop" },
  { key: "ui.site.nav.run", value: "Run" },
  { key: "ui.site.nav.train", value: "Train" },
  { key: "ui.site.nav.court", value: "Court" },
  { key: "ui.site.nav.guides", value: "Guides" },
  { key: "ui.site.nav.fit_guide", value: "Fit Guide" },
  { key: "ui.site.footer.description", value: "Lightweight support and carry essentials for running, training, and court sports." },
  { key: "ui.site.footer.newsletter_placeholder", value: "Email for training guides" },
  { key: "ui.site.footer.join", value: "Join" },
  { key: "ui.site.footer.shop", value: "Shop" },
  { key: "ui.site.footer.support", value: "Support" },
  { key: "ui.site.footer.all_gear", value: "All gear" },
  { key: "ui.site.footer.training_guides", value: "Training Guides" },
  { key: "ui.site.footer.shipping_returns", value: "Shipping & Returns" },
  { key: "ui.site.footer.about", value: "About" },
];
const defaultUiCopyZh: CopyConfigItem[] = [
  { key: "ui.admin.seo.ai_draft_badge", value: "AI 草稿" },
  { key: "ui.admin.seo.not_connected", value: "未连接" },
  { key: "ui.admin.seo.apply_confirm_title", value: "确认将此草稿应用到正式数据吗？" },
  { key: "ui.site.language.label", value: "语言" },
  { key: "ui.site.language.en", value: "EN" },
  { key: "ui.site.language.zh", value: "中文" },
  { key: "ui.site.promo", value: "满 $60 免运费 / 30 天退货" },
  { key: "ui.site.open_cart", value: "打开购物车" },
  { key: "ui.site.open_menu", value: "打开菜单" },
  { key: "ui.site.nav.shop", value: "商城" },
  { key: "ui.site.nav.run", value: "跑步" },
  { key: "ui.site.nav.train", value: "训练" },
  { key: "ui.site.nav.court", value: "球场" },
  { key: "ui.site.nav.guides", value: "指南" },
  { key: "ui.site.nav.fit_guide", value: "尺码指南" },
  { key: "ui.site.footer.description", value: "面向跑步、训练与球类运动的轻量支撑与随身装备。" },
  { key: "ui.site.footer.newsletter_placeholder", value: "输入邮箱获取训练指南" },
  { key: "ui.site.footer.join", value: "订阅" },
  { key: "ui.site.footer.shop", value: "选购" },
  { key: "ui.site.footer.support", value: "支持" },
  { key: "ui.site.footer.all_gear", value: "全部装备" },
  { key: "ui.site.footer.training_guides", value: "训练指南" },
  { key: "ui.site.footer.shipping_returns", value: "配送与退货" },
  { key: "ui.site.footer.about", value: "关于我们" },
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
      this.prisma.uiCopy.findMany({ where: { locale: { in: ["en", "en-US", "zh", "zh-CN"] } }, orderBy: [{ locale: "asc" }, { key: "asc" }] }),
      this.prisma.contentTemplate.findMany({ where: { locale: "en-US" }, orderBy: { key: "asc" } }),
      this.prisma.seoAutomationRule.findMany({ orderBy: { key: "asc" } }),
    ]);

    const mergedSiteSettings = mergeConfigItems(defaultSiteSettings, siteSettings.map((item) => ({ key: item.key, value: item.value as string | number | boolean | null })));
    const mergedUiCopy = mergeLocalizedConfigItems(
      { en: defaultUiCopy, zh: defaultUiCopyZh },
      {
        en: uiCopy.filter((item) => item.locale === "en" || item.locale === "en-US").map((item) => ({ key: item.key, value: item.value })),
        zh: uiCopy.filter((item) => item.locale === "zh" || item.locale === "zh-CN").map((item) => ({ key: item.key, value: item.value })),
      },
    );
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
      for (const locale of ["en", "zh"] as const) {
        for (const item of input.uiCopy[locale]) {
          await tx.uiCopy.upsert({
            where: { key_locale: { key: item.key, locale } },
            update: { value: String(item.value ?? "") },
            create: { key: item.key, locale, value: String(item.value ?? "") },
          });
        }
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
            uiCopy: input.uiCopy.en.length + input.uiCopy.zh.length,
            contentTemplates: input.contentTemplates.length,
            seoRules: input.seoRules.length,
          },
        },
      });
    });

    return this.getCopyConfig();
  }

  async getPublicSiteCopySnapshot(locale: "en" | "zh" = "en"): Promise<PublicSiteCopySnapshotPayload> {
    const config = await this.getCopyConfig();
    const getValue = (items: CopyConfigItem[], key: string) => items.find((item) => item.key === key)?.value;
    const getTemplate = (items: TemplateConfigItem[], key: string) => items.find((item) => item.key === key)?.value;
    const localeUiCopy = config.uiCopy[locale];

    return {
      site: {
        brandName: String(getValue(config.siteSettings, "site.brand_name") ?? "PulseGear"),
        shippingCopy: String(getValue(config.siteSettings, "site.shipping_copy") ?? "Free shipping over $60"),
        returnsCopy: String(getValue(config.siteSettings, "site.returns_copy") ?? "30-day returns"),
      },
      storefront: {
        languageLabel: String(getValue(localeUiCopy, "ui.site.language.label") ?? (locale === "zh" ? "语言" : "Language")),
        languageEn: String(getValue(localeUiCopy, "ui.site.language.en") ?? "EN"),
        languageZh: String(getValue(localeUiCopy, "ui.site.language.zh") ?? "中文"),
        promo: String(getValue(localeUiCopy, "ui.site.promo") ?? (locale === "zh" ? "满 $60 免运费 / 30 天退货" : "Free shipping over $60 / 30-day returns")),
        openCart: String(getValue(localeUiCopy, "ui.site.open_cart") ?? (locale === "zh" ? "打开购物车" : "Open cart")),
        openMenu: String(getValue(localeUiCopy, "ui.site.open_menu") ?? (locale === "zh" ? "打开菜单" : "Open menu")),
        nav: {
          shop: String(getValue(localeUiCopy, "ui.site.nav.shop") ?? (locale === "zh" ? "商城" : "Shop")),
          run: String(getValue(localeUiCopy, "ui.site.nav.run") ?? (locale === "zh" ? "跑步" : "Run")),
          train: String(getValue(localeUiCopy, "ui.site.nav.train") ?? (locale === "zh" ? "训练" : "Train")),
          court: String(getValue(localeUiCopy, "ui.site.nav.court") ?? (locale === "zh" ? "球场" : "Court")),
          guides: String(getValue(localeUiCopy, "ui.site.nav.guides") ?? (locale === "zh" ? "指南" : "Guides")),
          fitGuide: String(getValue(localeUiCopy, "ui.site.nav.fit_guide") ?? (locale === "zh" ? "尺码指南" : "Fit Guide")),
        },
        footer: {
          description: String(getValue(localeUiCopy, "ui.site.footer.description") ?? (locale === "zh"
            ? "面向跑步、训练与球类运动的轻量支撑与随身装备。"
            : "Lightweight support and carry essentials for running, training, and court sports.")),
          newsletterPlaceholder: String(getValue(localeUiCopy, "ui.site.footer.newsletter_placeholder") ?? (locale === "zh" ? "输入邮箱获取训练指南" : "Email for training guides")),
          join: String(getValue(localeUiCopy, "ui.site.footer.join") ?? (locale === "zh" ? "订阅" : "Join")),
          shop: String(getValue(localeUiCopy, "ui.site.footer.shop") ?? (locale === "zh" ? "选购" : "Shop")),
          support: String(getValue(localeUiCopy, "ui.site.footer.support") ?? (locale === "zh" ? "支持" : "Support")),
          allGear: String(getValue(localeUiCopy, "ui.site.footer.all_gear") ?? (locale === "zh" ? "全部装备" : "All gear")),
          trainingGuides: String(getValue(localeUiCopy, "ui.site.footer.training_guides") ?? (locale === "zh" ? "训练指南" : "Training Guides")),
          shippingReturns: String(getValue(localeUiCopy, "ui.site.footer.shipping_returns") ?? (locale === "zh" ? "配送与退货" : "Shipping & Returns")),
          about: String(getValue(localeUiCopy, "ui.site.footer.about") ?? (locale === "zh" ? "关于我们" : "About")),
        },
      },
      ui: {
        aiDraftBadge: String(getValue(localeUiCopy, "ui.admin.seo.ai_draft_badge") ?? (locale === "zh" ? "AI 草稿" : "AI Draft")),
        notConnected: String(getValue(localeUiCopy, "ui.admin.seo.not_connected") ?? (locale === "zh" ? "未连接" : "Not Connected")),
        applyConfirmTitle: String(getValue(localeUiCopy, "ui.admin.seo.apply_confirm_title") ?? (locale === "zh" ? "确认将此草稿应用到正式数据吗？" : "Apply this draft to live data?")),
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

function mergeLocalizedConfigItems(defaults: LocalizedCopyConfig<CopyConfigItem>, current: LocalizedCopyConfig<CopyConfigItem>) {
  return {
    en: mergeConfigItems(defaults.en, current.en),
    zh: mergeConfigItems(defaults.zh, current.zh),
  };
}

function mergeTemplateItems(defaults: TemplateConfigItem[], current: TemplateConfigItem[]) {
  const currentMap = new Map(current.map((item) => [item.key, item]));
  return defaults.map((item) => currentMap.get(item.key) ?? item);
}
