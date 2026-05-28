ALTER TABLE "Product"
ADD COLUMN "titleEn" TEXT,
ADD COLUMN "titleZh" TEXT,
ADD COLUMN "shortDescriptionEn" TEXT,
ADD COLUMN "shortDescriptionZh" TEXT,
ADD COLUMN "descriptionEn" TEXT,
ADD COLUMN "descriptionZh" TEXT,
ADD COLUMN "seoTitleEn" TEXT,
ADD COLUMN "seoTitleZh" TEXT,
ADD COLUMN "seoDescriptionEn" TEXT,
ADD COLUMN "seoDescriptionZh" TEXT,
ADD COLUMN "benefitsEn" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
ADD COLUMN "benefitsZh" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
ADD COLUMN "featuresEn" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
ADD COLUMN "featuresZh" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL;

UPDATE "Product"
SET
  "titleEn" = "title",
  "shortDescriptionEn" = "shortDescription",
  "descriptionEn" = "description",
  "seoTitleEn" = "seoTitle",
  "seoDescriptionEn" = "seoDescription",
  "benefitsEn" = "benefits",
  "featuresEn" = "features"
WHERE
  "titleEn" IS NULL
  OR "shortDescriptionEn" IS NULL
  OR "descriptionEn" IS NULL;
