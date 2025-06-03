-- First, update all non-ACTIVE statuses to INACTIVE
UPDATE "License"
SET status = 'INACTIVE'
WHERE status IN ('SUSPENDED', 'EXPIRED', 'REVOKED');

-- Drop the existing type and create new one
DROP TYPE IF EXISTS "LicenseStatus";
CREATE TYPE "LicenseStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- Drop existing indexes and constraints
DROP INDEX IF EXISTS "unique_active_license_idx";
DROP INDEX IF EXISTS "license_user_software_idx";
DROP INDEX IF EXISTS "license_status_idx";

-- Create a temporary column for the status
ALTER TABLE "License" ADD COLUMN temp_status text;

-- Copy the current status to the temporary column
UPDATE "License" SET temp_status = 
  CASE 
    WHEN status::text = 'ACTIVE' THEN 'ACTIVE'
    ELSE 'INACTIVE'
  END;

-- Drop the existing status column
ALTER TABLE "License" DROP COLUMN status;

-- Drop and recreate the enum type
DROP TYPE IF EXISTS "LicenseStatus";
CREATE TYPE "LicenseStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- Add the new status column
ALTER TABLE "License" ADD COLUMN status "LicenseStatus" NOT NULL DEFAULT 'ACTIVE';

-- Copy the data from temporary column
UPDATE "License" SET status = temp_status::text::"LicenseStatus";

-- Drop the temporary column
ALTER TABLE "License" DROP COLUMN temp_status;

-- Add new indexes
CREATE INDEX "license_user_software_idx" ON "License"("userId", "softwareId");
CREATE INDEX "license_status_idx" ON "License"(status);

-- Add unique constraint for active licenses
CREATE UNIQUE INDEX "unique_active_license_idx" 
ON "License"("userId", "softwareId") 
WHERE status = 'ACTIVE'; 