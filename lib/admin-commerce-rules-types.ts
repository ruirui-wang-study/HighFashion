export type CommerceRuleSetSummary = {
  id: string;
  name: string;
  version: number;
  status: "DRAFT" | "STAGING" | "ACTIVE" | "ARCHIVED";
  description: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type UpsertCommerceRuleSetPayload = {
  ruleSetId?: string;
  name: string;
  description?: string;
  taxRules: Array<{
    countryCode: string;
    regionCode?: string;
    postalCodePattern?: string;
    currency: string;
    taxMode: "EXCLUSIVE" | "INCLUSIVE";
    rateBps: number;
    priority?: number;
    enabled?: boolean;
  }>;
  shippingRules: Array<{
    countryCode: string;
    regionCode?: string;
    currency: string;
    feeMode: "FLAT" | "FREE_OVER_THRESHOLD";
    flatFeeMinor?: number;
    freeOverMinor?: number;
    priority?: number;
    enabled?: boolean;
    etaMinDays?: number;
    etaMaxDays?: number;
  }>;
  paymentRules: Array<{
    countryCode: string;
    currency: string;
    method: "CARD" | "APPLE_PAY" | "GOOGLE_PAY" | "PAYPAL" | "BNPL";
    minAmountMinor?: number;
    maxAmountMinor?: number;
    priority?: number;
    enabled?: boolean;
  }>;
};

export type CommerceRuleSetValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
  coverage: {
    requiredShippingCountries: string[];
    taxCountries: string[];
    shippingCountries: string[];
    paymentCountries: string[];
  };
};

export type CommerceQuoteSimulation = {
  quoteId: string;
  quoteExpiresAt: string;
  quoteSignature: string;
  pricing: {
    currency: string;
    subtotalCents: number;
    shippingCents: number;
    taxCents: number;
    discountCents: number;
    totalCents: number;
  };
  ruleContext: {
    ruleSetVersion: number | null;
    shippingRuleId: string | null;
    taxRuleId: string | null;
    paymentRuleIds: string[];
  };
  availablePaymentMethods: string[];
};
