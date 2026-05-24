CREATE TABLE "AdminSettings" (
  "id" TEXT NOT NULL,
  "storefrontUrl" TEXT NOT NULL,
  "supportEmail" TEXT NOT NULL,
  "checkoutCurrency" TEXT NOT NULL DEFAULT 'usd',
  "timezone" TEXT NOT NULL DEFAULT 'America/Los_Angeles',
  "shippingCountries" TEXT[] DEFAULT ARRAY['US','GB']::TEXT[],
  "defaultFulfillmentSlaDays" INTEGER NOT NULL DEFAULT 3,
  "returnsPolicyUrl" TEXT,
  "orderAutoFulfill" BOOLEAN NOT NULL DEFAULT false,
  "primaryPaymentProvider" TEXT NOT NULL DEFAULT 'Stripe Checkout',
  "stripeAutomaticPaymentMethods" BOOLEAN NOT NULL DEFAULT true,
  "paymentFailureMessage" TEXT,
  "adminSessionTtlHours" INTEGER NOT NULL DEFAULT 12,
  "auditLoggingEnabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "AdminSettings" (
  "id",
  "storefrontUrl",
  "supportEmail",
  "checkoutCurrency",
  "timezone",
  "shippingCountries",
  "defaultFulfillmentSlaDays",
  "returnsPolicyUrl",
  "orderAutoFulfill",
  "primaryPaymentProvider",
  "stripeAutomaticPaymentMethods",
  "paymentFailureMessage",
  "adminSessionTtlHours",
  "auditLoggingEnabled"
)
VALUES (
  'default',
  'http://localhost:3000',
  'support@pulsegear.local',
  'usd',
  'America/Los_Angeles',
  ARRAY['US','GB']::TEXT[],
  3,
  '/faq',
  false,
  'Stripe Checkout',
  true,
  'Retry checkout from cart if payment is not confirmed.',
  12,
  true
)
ON CONFLICT ("id") DO NOTHING;
