-- AlterTable
ALTER TABLE "AdminSettings" ALTER COLUMN "shippingCountries" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ContentBrief" ALTER COLUMN "relatedProductIds" DROP DEFAULT,
ALTER COLUMN "relatedCollectionSlugs" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ContentOpportunity" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ContentTemplate" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Ga4LandingPageDaily" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "InternalLinkSuggestion" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ProductCandidate" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ProductTestLaunch" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SearchConsolePageDaily" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SearchConsoleQueryDaily" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SeoAutomationRule" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SeoIssue" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SeoPage" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SeoRecommendation" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SiteSetting" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Supplier" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "UiCopy" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Ga4LandingPageDaily_landingPage_date_idx" ON "Ga4LandingPageDaily"("landingPage", "date");

-- CreateIndex
CREATE INDEX "SearchConsolePageDaily_page_date_idx" ON "SearchConsolePageDaily"("page", "date");

-- CreateIndex
CREATE INDEX "SearchConsoleQueryDaily_page_date_idx" ON "SearchConsoleQueryDaily"("page", "date");

-- RenameIndex
ALTER INDEX "SearchConsoleQueryDaily_siteUrl_date_query_page_country_device_" RENAME TO "SearchConsoleQueryDaily_siteUrl_date_query_page_country_dev_key";
