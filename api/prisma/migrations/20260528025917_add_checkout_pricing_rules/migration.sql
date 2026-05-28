-- CreateEnum
CREATE TYPE "RuleSetStatus" AS ENUM ('DRAFT', 'STAGING', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TaxMode" AS ENUM ('EXCLUSIVE', 'INCLUSIVE');

-- CreateEnum
CREATE TYPE "ShippingFeeMode" AS ENUM ('FLAT', 'FREE_OVER_THRESHOLD');

-- CreateEnum
CREATE TYPE "PaymentMethodCode" AS ENUM ('CARD', 'APPLE_PAY', 'GOOGLE_PAY', 'PAYPAL', 'BNPL');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "pricingSnapshot" JSONB,
ADD COLUMN     "ruleSetVersion" INTEGER;

-- CreateTable
CREATE TABLE "CommerceRuleSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "RuleSetStatus" NOT NULL DEFAULT 'DRAFT',
    "description" TEXT,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "createdByAdminId" TEXT,
    "publishedByAdminId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommerceRuleSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRule" (
    "id" TEXT NOT NULL,
    "ruleSetId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "regionCode" TEXT,
    "postalCodePattern" TEXT,
    "currency" TEXT NOT NULL,
    "taxMode" "TaxMode" NOT NULL DEFAULT 'EXCLUSIVE',
    "rateBps" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingRule" (
    "id" TEXT NOT NULL,
    "ruleSetId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "regionCode" TEXT,
    "currency" TEXT NOT NULL,
    "feeMode" "ShippingFeeMode" NOT NULL,
    "flatFeeMinor" INTEGER,
    "freeOverMinor" INTEGER,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "etaMinDays" INTEGER,
    "etaMaxDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethodRule" (
    "id" TEXT NOT NULL,
    "ruleSetId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "method" "PaymentMethodCode" NOT NULL,
    "minAmountMinor" INTEGER,
    "maxAmountMinor" INTEGER,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethodRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommerceRuleSet_status_effectiveFrom_effectiveTo_idx" ON "CommerceRuleSet"("status", "effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE UNIQUE INDEX "CommerceRuleSet_version_key" ON "CommerceRuleSet"("version");

-- CreateIndex
CREATE INDEX "TaxRule_ruleSetId_countryCode_regionCode_currency_priority_idx" ON "TaxRule"("ruleSetId", "countryCode", "regionCode", "currency", "priority");

-- CreateIndex
CREATE INDEX "ShippingRule_ruleSetId_countryCode_regionCode_currency_prio_idx" ON "ShippingRule"("ruleSetId", "countryCode", "regionCode", "currency", "priority");

-- CreateIndex
CREATE INDEX "PaymentMethodRule_ruleSetId_countryCode_currency_method_pri_idx" ON "PaymentMethodRule"("ruleSetId", "countryCode", "currency", "method", "priority");

-- AddForeignKey
ALTER TABLE "TaxRule" ADD CONSTRAINT "TaxRule_ruleSetId_fkey" FOREIGN KEY ("ruleSetId") REFERENCES "CommerceRuleSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingRule" ADD CONSTRAINT "ShippingRule_ruleSetId_fkey" FOREIGN KEY ("ruleSetId") REFERENCES "CommerceRuleSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethodRule" ADD CONSTRAINT "PaymentMethodRule_ruleSetId_fkey" FOREIGN KEY ("ruleSetId") REFERENCES "CommerceRuleSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
