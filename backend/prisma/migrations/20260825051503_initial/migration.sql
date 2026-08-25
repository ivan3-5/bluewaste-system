/*
  Warnings:

  - You are about to drop the column `priority` on the `Report` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CleanupScheduleStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('CRITICAL', 'HIGH', 'MODERATE', 'SPAM');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'CLEANUP_SCHEDULE';

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "priority",
ADD COLUMN     "aiCategories" TEXT[],
ADD COLUMN     "aiGeminiMs" INTEGER,
ADD COLUMN     "aiImageHash" TEXT,
ADD COLUMN     "aiModel" TEXT,
ADD COLUMN     "aiProcessingMs" INTEGER,
ADD COLUMN     "aiReason" TEXT,
ADD COLUMN     "cleanupScheduleId" TEXT,
ADD COLUMN     "incidentId" TEXT,
ADD COLUMN     "severity" "Severity";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT NOT NULL DEFAULT '';

-- DropEnum
DROP TYPE "Priority";

-- CreateTable
CREATE TABLE "ReportingZone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coordinates" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "ReportingZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CleanupSchedule" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "barangay" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "CleanupScheduleStatus" NOT NULL DEFAULT 'UPCOMING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "equipment" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "CleanupSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CleanupScheduleWorker" (
    "id" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduleId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,

    CONSTRAINT "CleanupScheduleWorker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportWorker" (
    "id" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,

    CONSTRAINT "ReportWorker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WasteIncident" (
    "id" TEXT NOT NULL,
    "category" "WasteCategory" NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT,
    "contributorCount" INTEGER NOT NULL DEFAULT 1,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "severity" "Severity",
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WasteIncident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReportingZone_isActive_idx" ON "ReportingZone"("isActive");

-- CreateIndex
CREATE INDEX "ReportingZone_createdById_idx" ON "ReportingZone"("createdById");

-- CreateIndex
CREATE INDEX "CleanupSchedule_status_idx" ON "CleanupSchedule"("status");

-- CreateIndex
CREATE INDEX "CleanupSchedule_scheduledAt_idx" ON "CleanupSchedule"("scheduledAt");

-- CreateIndex
CREATE INDEX "CleanupSchedule_createdById_idx" ON "CleanupSchedule"("createdById");

-- CreateIndex
CREATE INDEX "CleanupSchedule_barangay_idx" ON "CleanupSchedule"("barangay");

-- CreateIndex
CREATE INDEX "CleanupScheduleWorker_workerId_idx" ON "CleanupScheduleWorker"("workerId");

-- CreateIndex
CREATE UNIQUE INDEX "CleanupScheduleWorker_scheduleId_workerId_key" ON "CleanupScheduleWorker"("scheduleId", "workerId");

-- CreateIndex
CREATE INDEX "ReportWorker_workerId_idx" ON "ReportWorker"("workerId");

-- CreateIndex
CREATE INDEX "ReportWorker_reportId_idx" ON "ReportWorker"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportWorker_reportId_workerId_key" ON "ReportWorker"("reportId", "workerId");

-- CreateIndex
CREATE INDEX "WasteIncident_category_idx" ON "WasteIncident"("category");

-- CreateIndex
CREATE INDEX "WasteIncident_status_idx" ON "WasteIncident"("status");

-- CreateIndex
CREATE INDEX "WasteIncident_isResolved_idx" ON "WasteIncident"("isResolved");

-- CreateIndex
CREATE INDEX "WasteIncident_latitude_longitude_idx" ON "WasteIncident"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "WasteIncident_createdAt_idx" ON "WasteIncident"("createdAt");

-- CreateIndex
CREATE INDEX "WasteIncident_category_isResolved_idx" ON "WasteIncident"("category", "isResolved");

-- CreateIndex
CREATE INDEX "Report_incidentId_idx" ON "Report"("incidentId");

-- CreateIndex
CREATE INDEX "Report_aiImageHash_idx" ON "Report"("aiImageHash");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_cleanupScheduleId_fkey" FOREIGN KEY ("cleanupScheduleId") REFERENCES "CleanupSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "WasteIncident"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportingZone" ADD CONSTRAINT "ReportingZone_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CleanupSchedule" ADD CONSTRAINT "CleanupSchedule_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CleanupSchedule" ADD CONSTRAINT "CleanupSchedule_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CleanupScheduleWorker" ADD CONSTRAINT "CleanupScheduleWorker_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "CleanupSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CleanupScheduleWorker" ADD CONSTRAINT "CleanupScheduleWorker_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportWorker" ADD CONSTRAINT "ReportWorker_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportWorker" ADD CONSTRAINT "ReportWorker_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
