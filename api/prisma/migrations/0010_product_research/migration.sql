CREATE TYPE "ProductCandidateSource" AS ENUM ('MANUAL', 'AI_GENERATED', 'CSV', 'ALIBABA_LINK', 'SUPPLIER_QUOTE');
CREATE TYPE "ProductCandidateStatus" AS ENUM ('NEW', 'RESEARCHING', 'WATCH', 'SAMPLE', 'TEST', 'APPROVED', 'REJECTED', 'HIGH_RISK_REVIEW');
CREATE TYPE "ProductResearchRecommendedAction" AS ENUM ('SAMPLE', 'TEST', 'WATCH', 'REJECT', 'REVIEW');
CREATE TYPE "SupplierPlatform" AS ENUM ('ALIBABA', 'ALIEXPRESS', 'CJ_DROPSHIPPING', 'AGENT', 'OTHER');
CREATE TYPE "ProductResearchSignalSource" AS ENUM ('GOOGLE_TRENDS', 'GSC', 'GA4', 'AMAZON', 'ETSY', 'TIKTOK', 'ALIBABA', 'MANUAL');
CREATE TYPE "ProductTestLaunchStatus" AS ENUM ('PLANNED', 'RUNNING', 'COMPLETED', 'STOPPED');
CREATE TYPE "ProductResearchDecisionType" AS ENUM ('SAMPLE', 'TEST', 'WATCH', 'APPROVE', 'REJECT', 'CONVERT_TO_PRODUCT');
CREATE TYPE "ProductResearchImportSource" AS ENUM ('AI', 'CSV', 'ALIBABA_LINK', 'SUPPLIER_QUOTE', 'MANUAL');
CREATE TYPE "ProductResearchRiskSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'BLOCKING');

CREATE TABLE "ProductCandidate" (
  "id" TEXT NOT NULL,
  "productName" TEXT NOT NULL,
  "chineseName" TEXT,
  "slugSuggestion" TEXT,
  "category" TEXT NOT NULL,
  "targetMarket" TEXT NOT NULL,
  "targetAudience" TEXT,
  "useCase" TEXT,
  "description" TEXT,
  "notes" TEXT,
  "brandAngle" TEXT,
  "positioningSummary" TEXT,
  "alibabaKeywords" TEXT,
  "source" "ProductCandidateSource" NOT NULL,
  "sourceUrl" TEXT,
  "rawImportData" JSONB,
  "aiDraftPayload" JSONB,
  "status" "ProductCandidateStatus" NOT NULL DEFAULT 'NEW',
  "recommendedAction" "ProductResearchRecommendedAction" NOT NULL DEFAULT 'WATCH',
  "finalScore" DOUBLE PRECISION,
  "riskScore" INTEGER,
  "validatedScore" DOUBLE PRECISION,
  "possibleDuplicateOfId" TEXT,
  "createdById" TEXT,
  "approvedById" TEXT,
  "approvedAt" TIMESTAMP(3),
  "convertedProductId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductCandidate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductCandidateScore" (
  "id" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "marketDemandScore" INTEGER NOT NULL,
  "trendSeasonalityScore" INTEGER NOT NULL,
  "competitionGapScore" INTEGER NOT NULL,
  "marginPotentialScore" INTEGER NOT NULL,
  "logisticsFitScore" INTEGER NOT NULL,
  "brandabilityScore" INTEGER NOT NULL,
  "supplierQualityScore" INTEGER NOT NULL,
  "riskScore" INTEGER NOT NULL,
  "riskInverseScore" INTEGER NOT NULL,
  "testabilityScore" INTEGER NOT NULL,
  "finalScore" DOUBLE PRECISION NOT NULL,
  "scoringVersion" TEXT NOT NULL,
  "scoreReasonJson" JSONB,
  "isManualAdjusted" BOOLEAN NOT NULL DEFAULT false,
  "manualAdjustmentReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductCandidateScore_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Supplier" (
  "id" TEXT NOT NULL,
  "platform" "SupplierPlatform" NOT NULL,
  "name" TEXT NOT NULL,
  "url" TEXT,
  "country" TEXT,
  "verifiedSupplier" BOOLEAN NOT NULL DEFAULT false,
  "tradeAssurance" BOOLEAN NOT NULL DEFAULT false,
  "yearsOnPlatform" INTEGER,
  "responseRate" DOUBLE PRECISION,
  "moq" INTEGER,
  "samplePriceCents" INTEGER,
  "unitPriceCents" INTEGER,
  "customLogoMoq" INTEGER,
  "customPackagingMoq" INTEGER,
  "leadTimeDays" INTEGER,
  "shippingToUSCents" INTEGER,
  "shippingToUKCents" INTEGER,
  "certifications" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductCandidateSupplier" (
  "candidateId" TEXT NOT NULL,
  "supplierId" TEXT NOT NULL,
  "quotedUnitPriceCents" INTEGER,
  "quotedMoq" INTEGER,
  "quotedLeadTimeDays" INTEGER,
  "quoteFileUrl" TEXT,
  "notes" TEXT,
  CONSTRAINT "ProductCandidateSupplier_pkey" PRIMARY KEY ("candidateId", "supplierId")
);

CREATE TABLE "ProductResearchSignal" (
  "id" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "source" "ProductResearchSignalSource" NOT NULL,
  "metricName" TEXT NOT NULL,
  "metricValue" DOUBLE PRECISION NOT NULL,
  "rawData" JSONB,
  "collectedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductResearchSignal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductTestLaunch" (
  "id" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "landingPageUrl" TEXT,
  "channel" TEXT NOT NULL,
  "channelDetail" TEXT,
  "adSpendCents" INTEGER NOT NULL DEFAULT 0,
  "impressions" INTEGER NOT NULL DEFAULT 0,
  "clicks" INTEGER NOT NULL DEFAULT 0,
  "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "productViews" INTEGER NOT NULL DEFAULT 0,
  "addToCart" INTEGER NOT NULL DEFAULT 0,
  "addToCartRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "beginCheckout" INTEGER NOT NULL DEFAULT 0,
  "checkoutRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "purchases" INTEGER NOT NULL DEFAULT 0,
  "purchaseRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "revenueCents" INTEGER NOT NULL DEFAULT 0,
  "refunds" INTEGER NOT NULL DEFAULT 0,
  "customerFeedbackScore" INTEGER,
  "refundRiskScore" INTEGER,
  "customerFeedbackSummary" TEXT,
  "notes" TEXT,
  "testScore" DOUBLE PRECISION,
  "status" "ProductTestLaunchStatus" NOT NULL DEFAULT 'PLANNED',
  "startedAt" TIMESTAMP(3),
  "endedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductTestLaunch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductResearchDecision" (
  "id" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "decision" "ProductResearchDecisionType" NOT NULL,
  "reason" TEXT,
  "operatorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductResearchDecision_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductResearchImportBatch" (
  "id" TEXT NOT NULL,
  "source" "ProductResearchImportSource" NOT NULL,
  "fileName" TEXT,
  "totalRows" INTEGER NOT NULL DEFAULT 0,
  "createdCount" INTEGER NOT NULL DEFAULT 0,
  "skippedCount" INTEGER NOT NULL DEFAULT 0,
  "duplicateCount" INTEGER NOT NULL DEFAULT 0,
  "invalidCount" INTEGER NOT NULL DEFAULT 0,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductResearchImportBatch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductResearchRiskFlag" (
  "id" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  "riskType" TEXT NOT NULL,
  "severity" "ProductResearchRiskSeverity" NOT NULL,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductResearchRiskFlag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ScoringRule" (
  "id" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "weights" JSONB NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT false,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ScoringRule_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ScoringRule_version_key" ON "ScoringRule"("version");
CREATE INDEX "ProductCandidate_status_updatedAt_idx" ON "ProductCandidate"("status", "updatedAt");
CREATE INDEX "ProductCandidate_source_createdAt_idx" ON "ProductCandidate"("source", "createdAt");
CREATE INDEX "ProductCandidate_targetMarket_category_idx" ON "ProductCandidate"("targetMarket", "category");
CREATE INDEX "ProductCandidate_productName_idx" ON "ProductCandidate"("productName");
CREATE INDEX "ProductCandidate_productName_category_targetMarket_idx" ON "ProductCandidate"("productName", "category", "targetMarket");
CREATE INDEX "ProductCandidate_recommendedAction_idx" ON "ProductCandidate"("recommendedAction");
CREATE INDEX "ProductCandidate_finalScore_idx" ON "ProductCandidate"("finalScore");
CREATE INDEX "ProductCandidate_riskScore_idx" ON "ProductCandidate"("riskScore");
CREATE INDEX "ProductCandidate_possibleDuplicateOfId_idx" ON "ProductCandidate"("possibleDuplicateOfId");
CREATE INDEX "ProductCandidate_createdById_idx" ON "ProductCandidate"("createdById");
CREATE INDEX "ProductCandidate_approvedById_idx" ON "ProductCandidate"("approvedById");
CREATE INDEX "ProductCandidateScore_candidateId_createdAt_idx" ON "ProductCandidateScore"("candidateId", "createdAt");
CREATE INDEX "ProductCandidateScore_scoringVersion_idx" ON "ProductCandidateScore"("scoringVersion");
CREATE INDEX "Supplier_platform_country_idx" ON "Supplier"("platform", "country");
CREATE INDEX "Supplier_verifiedSupplier_tradeAssurance_idx" ON "Supplier"("verifiedSupplier", "tradeAssurance");
CREATE INDEX "Supplier_name_idx" ON "Supplier"("name");
CREATE INDEX "Supplier_url_idx" ON "Supplier"("url");
CREATE INDEX "ProductCandidateSupplier_supplierId_idx" ON "ProductCandidateSupplier"("supplierId");
CREATE INDEX "ProductResearchSignal_candidateId_source_idx" ON "ProductResearchSignal"("candidateId", "source");
CREATE INDEX "ProductResearchSignal_metricName_collectedAt_idx" ON "ProductResearchSignal"("metricName", "collectedAt");
CREATE INDEX "ProductTestLaunch_candidateId_status_idx" ON "ProductTestLaunch"("candidateId", "status");
CREATE INDEX "ProductTestLaunch_status_startedAt_idx" ON "ProductTestLaunch"("status", "startedAt");
CREATE INDEX "ProductResearchDecision_candidateId_createdAt_idx" ON "ProductResearchDecision"("candidateId", "createdAt");
CREATE INDEX "ProductResearchDecision_operatorId_createdAt_idx" ON "ProductResearchDecision"("operatorId", "createdAt");
CREATE INDEX "ProductResearchDecision_decision_createdAt_idx" ON "ProductResearchDecision"("decision", "createdAt");
CREATE INDEX "ProductResearchImportBatch_source_createdAt_idx" ON "ProductResearchImportBatch"("source", "createdAt");
CREATE INDEX "ProductResearchImportBatch_createdById_createdAt_idx" ON "ProductResearchImportBatch"("createdById", "createdAt");
CREATE INDEX "ProductResearchRiskFlag_candidateId_severity_idx" ON "ProductResearchRiskFlag"("candidateId", "severity");
CREATE INDEX "ProductResearchRiskFlag_severity_createdAt_idx" ON "ProductResearchRiskFlag"("severity", "createdAt");
CREATE INDEX "ScoringRule_isActive_createdAt_idx" ON "ScoringRule"("isActive", "createdAt");
CREATE INDEX "ScoringRule_createdById_idx" ON "ScoringRule"("createdById");

ALTER TABLE "ProductCandidate"
  ADD CONSTRAINT "ProductCandidate_possibleDuplicateOfId_fkey"
  FOREIGN KEY ("possibleDuplicateOfId") REFERENCES "ProductCandidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProductCandidate"
  ADD CONSTRAINT "ProductCandidate_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProductCandidate"
  ADD CONSTRAINT "ProductCandidate_approvedById_fkey"
  FOREIGN KEY ("approvedById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProductCandidate"
  ADD CONSTRAINT "ProductCandidate_convertedProductId_fkey"
  FOREIGN KEY ("convertedProductId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProductCandidateScore"
  ADD CONSTRAINT "ProductCandidateScore_candidateId_fkey"
  FOREIGN KEY ("candidateId") REFERENCES "ProductCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductCandidateSupplier"
  ADD CONSTRAINT "ProductCandidateSupplier_candidateId_fkey"
  FOREIGN KEY ("candidateId") REFERENCES "ProductCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductCandidateSupplier"
  ADD CONSTRAINT "ProductCandidateSupplier_supplierId_fkey"
  FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductResearchSignal"
  ADD CONSTRAINT "ProductResearchSignal_candidateId_fkey"
  FOREIGN KEY ("candidateId") REFERENCES "ProductCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductTestLaunch"
  ADD CONSTRAINT "ProductTestLaunch_candidateId_fkey"
  FOREIGN KEY ("candidateId") REFERENCES "ProductCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductResearchDecision"
  ADD CONSTRAINT "ProductResearchDecision_candidateId_fkey"
  FOREIGN KEY ("candidateId") REFERENCES "ProductCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductResearchDecision"
  ADD CONSTRAINT "ProductResearchDecision_operatorId_fkey"
  FOREIGN KEY ("operatorId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProductResearchImportBatch"
  ADD CONSTRAINT "ProductResearchImportBatch_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ProductResearchRiskFlag"
  ADD CONSTRAINT "ProductResearchRiskFlag_candidateId_fkey"
  FOREIGN KEY ("candidateId") REFERENCES "ProductCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ScoringRule"
  ADD CONSTRAINT "ScoringRule_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
