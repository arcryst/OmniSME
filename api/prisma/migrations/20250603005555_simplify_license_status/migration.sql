/*
  Warnings:

  - The values [SUSPENDED,EXPIRED,REVOKED] on the enum `LicenseStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LicenseStatus_new" AS ENUM ('ACTIVE', 'INACTIVE');
ALTER TABLE "License" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "License" ALTER COLUMN "status" TYPE "LicenseStatus_new" USING ("status"::text::"LicenseStatus_new");
ALTER TYPE "LicenseStatus" RENAME TO "LicenseStatus_old";
ALTER TYPE "LicenseStatus_new" RENAME TO "LicenseStatus";
DROP TYPE "LicenseStatus_old";
ALTER TABLE "License" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- DropIndex
DROP INDEX "unique_active_license_where_status_active";

-- RenameIndex
ALTER INDEX "License_status_idx" RENAME TO "license_status_idx";

-- RenameIndex
ALTER INDEX "License_userId_softwareId_idx" RENAME TO "license_user_software_idx";
