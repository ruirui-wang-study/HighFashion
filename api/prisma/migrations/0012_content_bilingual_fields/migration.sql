ALTER TABLE "ContentEntry"
  ADD COLUMN "titleEn" TEXT,
  ADD COLUMN "titleZh" TEXT,
  ADD COLUMN "seoTitleEn" TEXT,
  ADD COLUMN "seoTitleZh" TEXT,
  ADD COLUMN "seoDescriptionEn" TEXT,
  ADD COLUMN "seoDescriptionZh" TEXT;

ALTER TABLE "GuideContent"
  ADD COLUMN "dekEn" TEXT,
  ADD COLUMN "dekZh" TEXT,
  ADD COLUMN "categoryEn" TEXT,
  ADD COLUMN "categoryZh" TEXT,
  ADD COLUMN "authorRoleEn" TEXT,
  ADD COLUMN "authorRoleZh" TEXT,
  ADD COLUMN "readTimeEn" TEXT,
  ADD COLUMN "readTimeZh" TEXT,
  ADD COLUMN "sectionsEn" JSONB,
  ADD COLUMN "sectionsZh" JSONB,
  ADD COLUMN "faqEn" JSONB,
  ADD COLUMN "faqZh" JSONB;

ALTER TABLE "FaqContent"
  ADD COLUMN "itemsEn" JSONB,
  ADD COLUMN "itemsZh" JSONB;

UPDATE "ContentEntry"
SET
  "titleEn" = "title",
  "seoTitleEn" = "seoTitle",
  "seoDescriptionEn" = "seoDescription";

UPDATE "GuideContent"
SET
  "dekEn" = "dek",
  "categoryEn" = "category",
  "authorRoleEn" = "authorRole",
  "readTimeEn" = "readTime",
  "sectionsEn" = "sections",
  "faqEn" = "faq";

UPDATE "FaqContent"
SET
  "itemsEn" = "items";
