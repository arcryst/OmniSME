-- First, drop the existing unique constraint
ALTER TABLE "License" DROP CONSTRAINT IF EXISTS "unique_active_license";

-- Delete any duplicate REVOKED licenses, keeping only the most recent one
WITH DuplicateRevoked AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY "userId", "softwareId", status 
                           ORDER BY "assignedAt" DESC) as rn
  FROM "License"
  WHERE status = 'REVOKED'
)
DELETE FROM "License"
WHERE id IN (
  SELECT id FROM DuplicateRevoked WHERE rn > 1
);

-- Add the new unique constraint that only applies to ACTIVE licenses
CREATE UNIQUE INDEX "unique_active_license_idx" 
ON "License"("userId", "softwareId") 
WHERE status = 'ACTIVE';

-- Add indexes for performance
CREATE INDEX "license_user_software_idx" ON "License"("userId", "softwareId");
CREATE INDEX "license_status_idx" ON "License"(status); 