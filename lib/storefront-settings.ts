import { apiFetch } from "./api-client";

export type PublicStorefrontSettings = {
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
};

export type PublicSiteCopySnapshot = {
  site: {
    brandName: string;
    shippingCopy: string;
    returnsCopy: string;
  };
  storefront: {
    languageLabel: string;
    languageEn: string;
    languageZh: string;
    promo: string;
    openCart: string;
    openMenu: string;
    nav: {
      shop: string;
      run: string;
      train: string;
      court: string;
      guides: string;
      fitGuide: string;
    };
    footer: {
      description: string;
      newsletterPlaceholder: string;
      join: string;
      shop: string;
      support: string;
      allGear: string;
      trainingGuides: string;
      shippingReturns: string;
      about: string;
    };
  };
  ui: {
    aiDraftBadge: string;
    notConnected: string;
    applyConfirmTitle: string;
  };
  seo: {
    productTitleTemplate: string;
    productDescriptionTemplate: string;
    titleMinLength: number;
    titleMaxLength: number;
    descriptionMinLength: number;
    descriptionMaxLength: number;
  };
};

const fallbackSettings: PublicStorefrontSettings = {
  storefrontUrl: "http://localhost:3000",
  supportEmail: "support@pulsegear.local",
  checkoutCurrency: "usd",
  timezone: "America/Los_Angeles",
  shippingCountries: ["US", "GB"],
  defaultFulfillmentSlaDays: 3,
  returnsPolicyUrl: "/faq",
  primaryPaymentProvider: "Stripe Checkout",
  stripeAutomaticPaymentMethods: true,
  paymentFailureMessage: "Retry checkout from cart if payment is not confirmed.",
};

export async function getPublicStorefrontSettings() {
  try {
    return await apiFetch<PublicStorefrontSettings>("/api/admin/settings/public", { cache: "no-store" });
  } catch {
    return fallbackSettings;
  }
}

export async function getPublicSiteCopySnapshot(locale: "en" | "zh" = "en") {
  try {
    return await apiFetch<PublicSiteCopySnapshot>(`/api/admin/settings/public-copy?locale=${locale}`, {
      cache: "force-cache",
      next: { revalidate: 300, tags: ["site-copy", `site-copy-${locale}`] },
    });
  } catch {
    return {
      site: {
        brandName: "PulseGear",
        shippingCopy: "Free shipping over $60",
        returnsCopy: "30-day returns",
      },
      storefront: {
        languageLabel: locale === "zh" ? "语言" : "Language",
        languageEn: "EN",
        languageZh: "中文",
        promo: locale === "zh" ? "满 $60 免运费 / 30 天退货" : "Free shipping over $60 / 30-day returns",
        openCart: locale === "zh" ? "打开购物车" : "Open cart",
        openMenu: locale === "zh" ? "打开菜单" : "Open menu",
        nav: {
          shop: locale === "zh" ? "商城" : "Shop",
          run: locale === "zh" ? "跑步" : "Run",
          train: locale === "zh" ? "训练" : "Train",
          court: locale === "zh" ? "球场" : "Court",
          guides: locale === "zh" ? "指南" : "Guides",
          fitGuide: locale === "zh" ? "尺码指南" : "Fit Guide",
        },
        footer: {
          description: locale === "zh"
            ? "面向跑步、训练与球类运动的轻量支撑与随身装备。"
            : "Lightweight support and carry essentials for running, training, and court sports.",
          newsletterPlaceholder: locale === "zh" ? "输入邮箱获取训练指南" : "Email for training guides",
          join: locale === "zh" ? "订阅" : "Join",
          shop: locale === "zh" ? "选购" : "Shop",
          support: locale === "zh" ? "支持" : "Support",
          allGear: locale === "zh" ? "全部装备" : "All gear",
          trainingGuides: locale === "zh" ? "训练指南" : "Training Guides",
          shippingReturns: locale === "zh" ? "配送与退货" : "Shipping & Returns",
          about: locale === "zh" ? "关于我们" : "About",
        },
      },
      ui: {
        aiDraftBadge: "AI Draft",
        notConnected: "Not Connected",
        applyConfirmTitle: "Apply this draft to live data?",
      },
      seo: {
        productTitleTemplate: "{{title}} | PulseGear",
        productDescriptionTemplate: "{{shortDescription}}",
        titleMinLength: 20,
        titleMaxLength: 70,
        descriptionMinLength: 70,
        descriptionMaxLength: 180,
      },
    } satisfies PublicSiteCopySnapshot;
  }
}

export { fallbackSettings };
