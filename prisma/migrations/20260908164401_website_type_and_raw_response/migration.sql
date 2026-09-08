/*
  Warnings:

  - You are about to drop the column `hasWebsite` on the `Lead` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "WebsiteType" AS ENUM ('NONE', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'WHATSAPP', 'LINKTREE', 'OTHER_SOCIAL', 'REAL');

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "hasWebsite",
ADD COLUMN     "socialHandle" TEXT,
ADD COLUMN     "websiteType" "WebsiteType" NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "Search" ADD COLUMN     "rawResponse" JSONB;

-- CreateIndex
CREATE INDEX "Lead_websiteType_idx" ON "Lead"("websiteType");
