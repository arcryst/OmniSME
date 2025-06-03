/*
  Warnings:

  - A unique constraint covering the columns `[userId,softwareId,status]` on the table `License` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "License_userId_softwareId_key";

-- CreateIndex
CREATE UNIQUE INDEX "License_userId_softwareId_status_key" ON "License"("userId", "softwareId", "status");
