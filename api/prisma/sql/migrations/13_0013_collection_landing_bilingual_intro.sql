ALTER TABLE "CollectionLandingContent"
  ADD COLUMN "introEn" TEXT,
  ADD COLUMN "introZh" TEXT;

UPDATE "CollectionLandingContent"
SET "introEn" = "intro";
