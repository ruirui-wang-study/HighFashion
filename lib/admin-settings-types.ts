export type AdminSettings = {
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
  updatedAt: string;
};

export type AdminSettingsInput = Omit<AdminSettings, "updatedAt">;

export type CopyConfigItem = {
  key: string;
  value: string | number | boolean | null;
};

export type TemplateConfigItem = {
  key: string;
  name: string;
  value: string;
  status?: string;
};

export type LocalizedCopyConfig<T> = {
  en: T[];
  zh: T[];
};

export type AdminCopyConfig = {
  siteSettings: CopyConfigItem[];
  uiCopy: LocalizedCopyConfig<CopyConfigItem>;
  contentTemplates: TemplateConfigItem[];
  seoRules: CopyConfigItem[];
  updatedAt: string;
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
