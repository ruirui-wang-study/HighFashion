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

export async function getPublicSiteCopySnapshot() {
  try {
    return await apiFetch<PublicSiteCopySnapshot>("/api/admin/settings/public-copy", {
      cache: "force-cache",
      next: { revalidate: 300, tags: ["site-copy"] },
    });
  } catch {
    return {
      site: {
        brandName: "PulseGear",
        shippingCopy: "Free shipping over $60",
        returnsCopy: "30-day returns",
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
