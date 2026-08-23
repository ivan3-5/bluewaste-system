/**
 * diagnostic.ts — checks the two most-recent reports for incidentId,
 * then re-links them if they're within 30m and same category,
 * then propagates status from the newer to the older.
 *
 * Run: npx ts-node scripts/diagnostic.ts
 */

import { PrismaClient, WasteCategory, ReportStatus } from "@prisma/client";
import { ReportDedupService } from "../src/services/report-dedup.service";

const prisma = new PrismaClient();

async function main() {
  // Grab the 5 most recent non-spam, non-deleted with_waste reports
  const recent = await prisma.report.findMany({
    where: { isDeleted: false, isSpam: false, category: WasteCategory.with_waste },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      incidentId: true,
      status: true,
      latitude: true,
      longitude: true,
      category: true,
      severity: true,
      address: true,
      assignedToId: true,
      assignedWorkers: { select: { workerId: true } },
      createdAt: true,
    },
  });

  console.log("\n=== Recent with_waste reports ===");
  recent.forEach((r) => {
    console.log(
      `  ${r.id} | incidentId=${r.incidentId ?? "NULL"} | status=${r.status} | ${r.latitude},${r.longitude} | ${r.createdAt.toISOString()}`
    );
  });

  // Check distances between consecutive reports
  console.log("\n=== Pairwise distances (metres) ===");
  for (let i = 0; i < recent.length; i++) {
    for (let j = i + 1; j < recent.length; j++) {
      const d = ReportDedupService.haversineDistance(
        recent[i].latitude, recent[i].longitude,
        recent[j].latitude, recent[j].longitude,
      );
      const sameIncident = recent[i].incidentId && recent[i].incidentId === recent[j].incidentId;
      console.log(`  ${recent[i].id.slice(0,8)}...  ↔  ${recent[j].id.slice(0,8)}...  | ${d.toFixed(1)}m | sameIncident=${sameIncident}`);
    }
  }

  // Re-link any reports within 30m that don't have an incidentId
  console.log("\n=== Re-linking unlinked reports ===");
  const unlinked = recent.filter((r) => !r.incidentId);
  if (unlinked.length === 0) {
    console.log("  All reports already have incidentId — no re-linking needed.");
  } else {
    for (const r of unlinked) {
      await prisma.$transaction(async (tx: any) => {
        await ReportDedupService.assignOrCreateIncident(
          tx,
          r.id,
          r.latitude,
          r.longitude,
          r.category as WasteCategory,
          r.severity as any,
          r.address ?? undefined,
        );
      });
      console.log(`  Re-linked report ${r.id.slice(0, 8)}...`);
    }
  }

  // After re-linking, propagate the status of the VERIFIED report to siblings
  console.log("\n=== Propagating status from VERIFIED reports ===");
  const verifiedReports = await prisma.report.findMany({
    where: {
      isDeleted: false, isSpam: false,
      status: { not: "PENDING" },
      incidentId: { not: null },
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: { id: true, status: true, incidentId: true },
  });

  const sysUserId = (
    await prisma.user.findFirst({
      where: { role: "LGU_ADMIN" },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    })
  )?.id;

  for (const vr of verifiedReports) {
    if (!sysUserId) { console.log("  No admin user found — skipping propagation"); break; }
    const { updatedCount } = await ReportDedupService.propagateStatusToSiblings(
      vr.id, vr.status as ReportStatus, sysUserId,
    );
    console.log(`  Report ${vr.id.slice(0,8)}... (${vr.status}) → propagated to ${updatedCount} sibling(s)`);
  }

  console.log("\nDone.");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
