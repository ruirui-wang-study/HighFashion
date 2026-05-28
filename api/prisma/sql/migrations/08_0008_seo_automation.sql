CREATE TYPE "SeoPageType" AS ENUM ('HOME', 'PRODUCT', 'COLLECTION', 'GUIDE', 'FAQ', 'LANDING');
CREATE TYPE "SeoIssueStatus" AS ENUM ('OPEN', 'REVIEWED', 'ACCEPTED', 'REJECTED', 'RESOLVED');
CREATE TYPE "SeoRecommendationStatus" AS ENUM ('DRAFT', 'REVIEWED', 'APPLIED', 'REJECTED');
CREATE TYPE "ContentOpportunityStatus" AS ENUM ('NEW', 'REVIEWED', 'ACCEPTED', 'REJECTED', 'DONE');
CREATE TYPE "ContentPipelineStatus" AS ENUM ('OPPORTUNITY', 'BRIEF_GENERATED', 'DRAFT_GENERATED', 'NEEDS_REVIEW', 'APPROVED', 'PUBLISHED', 'MONITORING');
CREATE TYPE "InternalLinkSuggestionStatus" AS ENUM ('NEW', 'ACCEPTED', 'REJECTED', 'APPLIED');

CREATE TABLE "SeoPage" (
  "id" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "pageType" "SeoPageType" NOT NULL,
  "title" TEXT,
  "metaDescription" TEXT,
  "canonicalUrl" TEXT,
  "h1Count" INTEGER NOT NULL DEFAULT 0,
  "missingAltCount" INTEGER NOT NULL DEFAULT 0,
  "inSitemap" BOOLEAN NOT NULL DEFAULT false,
  "isIndexable" BOOLEAN NOT NULL DEFAULT true,
  "hasProductJsonLd" BOOLEAN NOT NULL DEFAULT false,
  "hasBreadcrumbJsonLd" BOOLEAN NOT NULL DEFAULT false,
  "healthScore" INTEGER NOT NULL DEFAULT 100,
  "lastCheckedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SeoPage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SeoIssue" (
  "id" TEXT NOT NULL,
  "seoPageId" TEXT NOT NULL,
  "issueType" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" "SeoIssueStatus" NOT NULL DEFAULT 'OPEN',
  "metadata" JSONB,
  "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SeoIssue_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SeoRecommendation" (
  "id" TEXT NOT NULL,
  "seoPageId" TEXT,
  "recommendationType" TEXT NOT NULL,
  "resourceType" TEXT NOT NULL,
  "resourceId" TEXT,
  "draftPayload" JSONB NOT NULL,
  "reason" TEXT NOT NULL,
  "priority" TEXT NOT NULL,
  "status" "SeoRecommendationStatus" NOT NULL DEFAULT 'DRAFT',
  "isAiDraft" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "appliedAt" TIMESTAMP(3),
  CONSTRAINT "SeoRecommendation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SearchConsoleQueryDaily" (
  "id" TEXT NOT NULL,
  "siteUrl" TEXT NOT NULL,
  "page" TEXT NOT NULL,
  "query" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "device" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "clicks" INTEGER NOT NULL,
  "impressions" INTEGER NOT NULL,
  "ctr" DECIMAL(5,4) NOT NULL,
  "position" DECIMAL(6,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SearchConsoleQueryDaily_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SearchConsolePageDaily" (
  "id" TEXT NOT NULL,
  "siteUrl" TEXT NOT NULL,
  "page" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "device" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "clicks" INTEGER NOT NULL,
  "impressions" INTEGER NOT NULL,
  "ctr" DECIMAL(5,4) NOT NULL,
  "position" DECIMAL(6,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SearchConsolePageDaily_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Ga4LandingPageDaily" (
  "id" TEXT NOT NULL,
  "landingPage" TEXT NOT NULL,
  "sourceMedium" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "sessions" INTEGER NOT NULL,
  "totalUsers" INTEGER NOT NULL,
  "pageViews" INTEGER NOT NULL,
  "viewItem" INTEGER NOT NULL,
  "addToCart" INTEGER NOT NULL,
  "beginCheckout" INTEGER NOT NULL,
  "purchase" INTEGER NOT NULL,
  "revenue" DECIMAL(12,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Ga4LandingPageDaily_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContentOpportunity" (
  "id" TEXT NOT NULL,
  "opportunityType" TEXT NOT NULL,
  "keyword" TEXT,
  "currentPage" TEXT,
  "suggestedAction" TEXT NOT NULL,
  "priority" TEXT NOT NULL,
  "expectedImpact" TEXT NOT NULL,
  "status" "ContentOpportunityStatus" NOT NULL DEFAULT 'NEW',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContentOpportunity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContentBrief" (
  "id" TEXT NOT NULL,
  "sourceOpportunityId" TEXT,
  "title" TEXT NOT NULL,
  "targetKeyword" TEXT NOT NULL,
  "outline" JSONB,
  "draftContent" TEXT,
  "relatedProductIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "relatedCollectionSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "status" "ContentPipelineStatus" NOT NULL DEFAULT 'OPPORTUNITY',
  "publishedContentEntryId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContentBrief_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InternalLinkSuggestion" (
  "id" TEXT NOT NULL,
  "sourcePage" TEXT NOT NULL,
  "targetPage" TEXT NOT NULL,
  "anchorText" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "priority" TEXT NOT NULL,
  "status" "InternalLinkSuggestionStatus" NOT NULL DEFAULT 'NEW',
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InternalLinkSuggestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SeoChangeLog" (
  "id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "resourceType" TEXT NOT NULL,
  "resourceId" TEXT,
  "oldValue" JSONB,
  "newValue" JSONB,
  "operatorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SeoChangeLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SeoPage_url_key" ON "SeoPage"("url");
CREATE INDEX "SeoPage_pageType_idx" ON "SeoPage"("pageType");
CREATE INDEX "SeoPage_healthScore_idx" ON "SeoPage"("healthScore");
CREATE INDEX "SeoIssue_seoPageId_status_idx" ON "SeoIssue"("seoPageId", "status");
CREATE INDEX "SeoIssue_issueType_severity_idx" ON "SeoIssue"("issueType", "severity");
CREATE INDEX "SeoRecommendation_status_priority_idx" ON "SeoRecommendation"("status", "priority");
CREATE INDEX "SeoRecommendation_resourceType_resourceId_idx" ON "SeoRecommendation"("resourceType", "resourceId");
CREATE UNIQUE INDEX "SearchConsoleQueryDaily_siteUrl_date_query_page_country_device_key" ON "SearchConsoleQueryDaily"("siteUrl", "date", "query", "page", "country", "device");
CREATE UNIQUE INDEX "SearchConsolePageDaily_siteUrl_date_page_country_device_key" ON "SearchConsolePageDaily"("siteUrl", "date", "page", "country", "device");
CREATE UNIQUE INDEX "Ga4LandingPageDaily_landingPage_sourceMedium_date_key" ON "Ga4LandingPageDaily"("landingPage", "sourceMedium", "date");
CREATE INDEX "ContentOpportunity_status_priority_idx" ON "ContentOpportunity"("status", "priority");
CREATE INDEX "ContentOpportunity_opportunityType_idx" ON "ContentOpportunity"("opportunityType");
CREATE INDEX "ContentBrief_status_idx" ON "ContentBrief"("status");
CREATE INDEX "InternalLinkSuggestion_status_priority_idx" ON "InternalLinkSuggestion"("status", "priority");
CREATE INDEX "SeoChangeLog_resourceType_resourceId_idx" ON "SeoChangeLog"("resourceType", "resourceId");
CREATE INDEX "SeoChangeLog_operatorId_createdAt_idx" ON "SeoChangeLog"("operatorId", "createdAt");

ALTER TABLE "SeoIssue" ADD CONSTRAINT "SeoIssue_seoPageId_fkey" FOREIGN KEY ("seoPageId") REFERENCES "SeoPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SeoRecommendation" ADD CONSTRAINT "SeoRecommendation_seoPageId_fkey" FOREIGN KEY ("seoPageId") REFERENCES "SeoPage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContentBrief" ADD CONSTRAINT "ContentBrief_sourceOpportunityId_fkey" FOREIGN KEY ("sourceOpportunityId") REFERENCES "ContentOpportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SeoChangeLog" ADD CONSTRAINT "SeoChangeLog_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
