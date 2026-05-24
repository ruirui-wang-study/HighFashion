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

export type AdminCopyConfig = {
  siteSettings: CopyConfigItem[];
  uiCopy: CopyConfigItem[];
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
