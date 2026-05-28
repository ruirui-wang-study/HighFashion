ALTER TYPE "ContentType" ADD VALUE 'STATIC_PAGE';

CREATE TABLE "StaticPageContent" (
  "entryId" TEXT NOT NULL,
  "pageKey" TEXT NOT NULL,
  "pathname" TEXT NOT NULL,
  "content" JSONB NOT NULL,
  "contentEn" JSONB,
  "contentZh" JSONB,
  CONSTRAINT "StaticPageContent_pkey" PRIMARY KEY ("entryId"),
  CONSTRAINT "StaticPageContent_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "ContentEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "StaticPageContent_pageKey_key" ON "StaticPageContent"("pageKey");
CREATE UNIQUE INDEX "StaticPageContent_pathname_key" ON "StaticPageContent"("pathname");
