export type AdminActor = {
  adminId: string;
  adminEmail: string;
};

export type AdminSettingsPayload = {
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

export type PublicStorefrontSettingsPayload = {
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

export type AdminCopyConfigPayload = {
  siteSettings: CopyConfigItem[];
  uiCopy: CopyConfigItem[];
  contentTemplates: TemplateConfigItem[];
  seoRules: CopyConfigItem[];
  updatedAt: string;
};

export type PublicSiteCopySnapshotPayload = {
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
