CREATE TYPE "ContentType" AS ENUM ('GUIDE', 'FAQ', 'COLLECTION_PAGE');
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE "ContentEntry" (
  "id" TEXT NOT NULL,
  "type" "ContentType" NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ContentEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GuideContent" (
  "entryId" TEXT NOT NULL,
  "dek" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "authorName" TEXT NOT NULL,
  "authorRole" TEXT NOT NULL,
  "readTime" TEXT NOT NULL,
  "sections" JSONB NOT NULL,
  "faq" JSONB NOT NULL,
  "relatedProducts" JSONB NOT NULL,
  "relatedCollections" JSONB NOT NULL,
  "relatedGuides" JSONB NOT NULL,
  CONSTRAINT "GuideContent_pkey" PRIMARY KEY ("entryId")
);

CREATE TABLE "FaqContent" (
  "entryId" TEXT NOT NULL,
  "items" JSONB NOT NULL,
  CONSTRAINT "FaqContent_pkey" PRIMARY KEY ("entryId")
);

CREATE TABLE "CollectionLandingContent" (
  "entryId" TEXT NOT NULL,
  "pathname" TEXT NOT NULL,
  "scenario" TEXT,
  "intro" TEXT,
  "category" TEXT,
  "useCase" TEXT,
  "relatedGuideSlugs" JSONB NOT NULL,
  CONSTRAINT "CollectionLandingContent_pkey" PRIMARY KEY ("entryId")
);

CREATE UNIQUE INDEX "ContentEntry_type_slug_key" ON "ContentEntry"("type", "slug");
CREATE INDEX "ContentEntry_type_status_idx" ON "ContentEntry"("type", "status");
CREATE UNIQUE INDEX "CollectionLandingContent_pathname_key" ON "CollectionLandingContent"("pathname");

ALTER TABLE "GuideContent" ADD CONSTRAINT "GuideContent_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "ContentEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FaqContent" ADD CONSTRAINT "FaqContent_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "ContentEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CollectionLandingContent" ADD CONSTRAINT "CollectionLandingContent_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "ContentEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
