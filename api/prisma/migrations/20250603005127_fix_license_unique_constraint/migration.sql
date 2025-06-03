/*
  Warnings:

  - A unique constraint covering the columns `[userId,softwareId]` on the table `License` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "License_userId_softwareId_status_key";

-- CreateIndex
CREATE INDEX "License_userId_softwareId_idx" ON "License"("userId", "softwareId");

-- CreateIndex
CREATE INDEX "License_status_idx" ON "License"("status");

-- CreateIndex
CREATE UNIQUE INDEX "unique_active_license_where_status_active" ON "License"("userId", "softwareId");
