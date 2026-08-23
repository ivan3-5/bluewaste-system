/**
 * backfill-incidents.ts
 *
 * One-time script that creates WasteIncident records for existing Report rows
 * that don't have an incidentId yet. Groups nearby same-category reports.
 *
 * Usage:
 *   cd backend
 *   npx ts-node scripts/backfill-incidents.ts
 *
 * Safe to run multiple times — only processes reports where incidentId IS NULL.
 */

import { PrismaClient, WasteCategory, ReportStatus, Severity } from "@prisma/client";
import { ReportDedupService } from "../src/services/report-dedup.service";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Finding reports without an incidentId...");

  // Only process genuine with_waste reports (no_waste are not grouped)
  const unlinkedReports = await prisma.report.findMany({
    where: {
      incidentId: null,
      isDeleted: false,
      isSpam: false,
      category: WasteCategory.with_waste,
    },
    select: {
      id: true,
      latitude: true,
      longitude: true,
      category: true,
      severity: true,
      address: true,
    },
    orderBy: { createdAt: "asc" }, // process oldest first so grouping is consistent
  });

  console.log(`Found ${unlinkedReports.length} unlinked reports to process.`);

  let created = 0;
  let grouped = 0;

  for (const report of unlinkedReports) {
    // Check if another unlinked report has already created an incident
    const nearby = await ReportDedupService.findNearbyIncident(
      report.latitude,
      report.longitude,
      report.category as WasteCategory,
    );

    await prisma.$transaction(async (tx: any) => {
      if (nearby) {
        // Increment contributor count on the existing incident
        await tx.wasteIncident.update({
          where: { id: nearby.id },
          data: { contributorCount: { increment: 1 } },
        });

        // Find the primary report of the incident to inherit its status/workers
        const primaryReport = await tx.report.findFirst({
          where: { incidentId: nearby.id, isDeleted: false },
          select: {
            status: true,
            assignedToId: true,
            assignedWorkers: { select: { workerId: true } },
          },
          orderBy: { createdAt: "asc" },
        });

        const inheritedWorkerIds =
          primaryReport?.assignedWorkers?.map((w: any) => w.workerId) ?? [];

        await tx.report.update({
          where: { id: report.id },
          data: {
            incidentId: nearby.id,
            // Inherit status (skip if primary is still PENDING — no change needed)
            ...(primaryReport?.status && primaryReport.status !== "PENDING"
              ? { status: primaryReport.status }
              : {}),
            ...(primaryReport?.assignedToId
              ? { assignedToId: primaryReport.assignedToId }
              : {}),
          },
        });

        // Copy worker assignments
        if (inheritedWorkerIds.length > 0) {
          await tx.reportWorker.createMany({
            data: inheritedWorkerIds.map((workerId: string) => ({
              reportId: report.id,
              workerId,
            })),
            skipDuplicates: true,
          });
        }

        grouped++;
      } else {
        const incident = await tx.wasteIncident.create({
          data: {
            category: report.category as WasteCategory,
            latitude: report.latitude,
            longitude: report.longitude,
            address: report.address ?? null,
            contributorCount: 1,
            status: ReportStatus.PENDING,
            severity: report.severity as Severity | null,
            isResolved: false,
          },
        });
        await tx.report.update({
          where: { id: report.id },
          data: { incidentId: incident.id },
        });
        created++;
      }
    });

    if ((created + grouped) % 50 === 0) {
      console.log(`  Progress: ${created} new incidents, ${grouped} grouped into existing`);
    }
  }

  console.log(`✅ Done! Created ${created} new incidents, grouped ${grouped} reports into existing incidents.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
