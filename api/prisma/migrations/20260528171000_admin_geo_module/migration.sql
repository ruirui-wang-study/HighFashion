-- CreateEnum
CREATE TYPE "GeoPlatform" AS ENUM ('CHATGPT', 'PERPLEXITY', 'GEMINI', 'GOOGLE_AI_OVERVIEW');

-- CreateEnum
CREATE TYPE "GeoRecommendationStatus" AS ENUM ('DRAFT', 'REVIEWED', 'APPLIED');

-- CreateTable
CREATE TABLE "GeoPrompt" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeoPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeoTestRun" (
    "id" TEXT NOT NULL,
    "platform" "GeoPlatform" NOT NULL,
    "promptId" TEXT,
    "promptText" TEXT NOT NULL,
    "notes" TEXT,
    "whetherPulseGearMentioned" BOOLEAN NOT NULL DEFAULT false,
    "whetherPulseGearCited" BOOLEAN NOT NULL DEFAULT false,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeoTestRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeoCitation" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeoCitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeoMention" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "isPulse" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeoMention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeoCompetitor" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeoCompetitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeoRecommendation" (
    "id" TEXT NOT NULL,
    "query" TEXT,
    "pagePath" TEXT,
    "recommendation" TEXT NOT NULL,
    "recommendationType" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" "GeoRecommendationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeoRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeoContentDraft" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "source" TEXT,
    "payload" JSONB NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeoContentDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GeoPrompt_prompt_key" ON "GeoPrompt"("prompt");

-- CreateIndex
CREATE INDEX "GeoPrompt_isActive_createdAt_idx" ON "GeoPrompt"("isActive", "createdAt");

-- CreateIndex
CREATE INDEX "GeoTestRun_platform_createdAt_idx" ON "GeoTestRun"("platform", "createdAt");

-- CreateIndex
CREATE INDEX "GeoTestRun_promptId_createdAt_idx" ON "GeoTestRun"("promptId", "createdAt");

-- CreateIndex
CREATE INDEX "GeoCitation_runId_idx" ON "GeoCitation"("runId");

-- CreateIndex
CREATE INDEX "GeoMention_runId_isPulse_idx" ON "GeoMention"("runId", "isPulse");

-- CreateIndex
CREATE INDEX "GeoCompetitor_runId_idx" ON "GeoCompetitor"("runId");

-- CreateIndex
CREATE INDEX "GeoRecommendation_status_priority_idx" ON "GeoRecommendation"("status", "priority");

-- CreateIndex
CREATE INDEX "GeoContentDraft_contentType_status_createdAt_idx" ON "GeoContentDraft"("contentType", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GeoContentDraft_slug_key" ON "GeoContentDraft"("slug");

-- AddForeignKey
ALTER TABLE "GeoTestRun" ADD CONSTRAINT "GeoTestRun_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "GeoPrompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeoCitation" ADD CONSTRAINT "GeoCitation_runId_fkey" FOREIGN KEY ("runId") REFERENCES "GeoTestRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeoMention" ADD CONSTRAINT "GeoMention_runId_fkey" FOREIGN KEY ("runId") REFERENCES "GeoTestRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeoCompetitor" ADD CONSTRAINT "GeoCompetitor_runId_fkey" FOREIGN KEY ("runId") REFERENCES "GeoTestRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
