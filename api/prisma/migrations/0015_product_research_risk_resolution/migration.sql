-- Add APPROVE to recommended action enum
ALTER TYPE "ProductResearchRecommendedAction" ADD VALUE IF NOT EXISTS 'APPROVE';

-- Risk flag resolution tracking
ALTER TABLE "ProductResearchRiskFlag"
ADD COLUMN IF NOT EXISTS "resolvedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "resolvedById" TEXT,
ADD COLUMN IF NOT EXISTS "resolutionNote" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ProductResearchRiskFlag_resolvedById_fkey'
  ) THEN
    ALTER TABLE "ProductResearchRiskFlag"
    ADD CONSTRAINT "ProductResearchRiskFlag_resolvedById_fkey"
    FOREIGN KEY ("resolvedById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "ProductResearchRiskFlag_candidateId_resolvedAt_idx"
ON "ProductResearchRiskFlag"("candidateId", "resolvedAt");
