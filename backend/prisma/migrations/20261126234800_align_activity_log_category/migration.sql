-- CreateEnum
CREATE TYPE "ActivityCategory" AS ENUM ('AUTH', 'USER', 'REPORT', 'SCHEDULE', 'ZONE', 'SYSTEM');

-- DropIndex
DROP INDEX "ActivityLog_action_createdAt_idx";

-- DropIndex
DROP INDEX "ActivityLog_category_createdAt_idx";

-- DropIndex
DROP INDEX "ActivityLog_createdAt_idx";

-- DropIndex
DROP INDEX "ActivityLog_userId_createdAt_idx";

-- DropIndex
DROP INDEX "ActivityLog_userRole_createdAt_idx";

-- AlterTable (preserve existing rows by casting text to ActivityCategory)
ALTER TABLE "ActivityLog"
  ALTER COLUMN "category" TYPE "ActivityCategory"
  USING "category"::"ActivityCategory";

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_userRole_idx" ON "ActivityLog"("userRole");

-- CreateIndex
CREATE INDEX "ActivityLog_category_idx" ON "ActivityLog"("category");

-- CreateIndex
CREATE INDEX "ActivityLog_action_idx" ON "ActivityLog"("action");

-- CreateIndex
CREATE INDEX "ActivityLog_category_createdAt_idx" ON "ActivityLog"("category", "createdAt" DESC);
