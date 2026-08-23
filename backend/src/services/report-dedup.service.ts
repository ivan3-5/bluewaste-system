import prisma from "../config/database";
import { WasteCategory, ReportStatus, Severity, Prisma } from "@prisma/client";
import { env } from "../config/env";
import { GeoCache } from "../utils/geo-cache";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Default deduplication radius from env (1–50 m). Prefer 30 m per spec. */
export const DEDUP_DISTANCE_THRESHOLD_METERS: number = env.DEDUP_DISTANCE_METERS;

/**
 * Hard upper-bound regardless of env config.
 * Reports >50 m apart are always treated as separate incidents.
 */
export const DEDUP_MAX_THRESHOLD_METERS = 50;

/**
 * Bounding-box expansion in degrees added on top of the threshold
 * for the initial coarse DB filter (before precise Haversine check).
 *
 * 0.0005° ≈ 55 m at the equator — safely covers the 50 m max radius.
 */
const BBOX_DEGREES = 0.0005;

// ─── Types ────────────────────────────────────────────────────────────────────

type PrismaTx = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

interface IncidentCandidate {
  id: string;
  latitude: number;
  longitude: number;
  category: WasteCategory;
  status: ReportStatus;
  contributorCount: number;
  isResolved: boolean;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class ReportDedupService {
  // ── Geometry helpers ────────────────────────────────────────────────────────

  /**
   * Haversine formula: great-circle distance between two GPS coordinates in **meters**.
   */
  static haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6_371_000; // Earth radius in metres
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);

    const a =
      sinDLat * sinDLat +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * sinDLon * sinDLon;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // ── Core dedup logic ────────────────────────────────────────────────────────

  /**
   * Find the nearest open `WasteIncident` that:
   *  - Has the **same waste category** as the incoming report
   *  - Is **not** marked as resolved
   *  - Is within the configurable distance threshold
   *
   * Uses a coarse bounding-box DB filter first, then precise Haversine distance.
   *
   * @param lat          Latitude of the new report
   * @param lon          Longitude of the new report
   * @param category     Waste category of the new report
   * @param thresholdMeters  Override threshold (capped at DEDUP_MAX_THRESHOLD_METERS)
   * @param tx           Optional Prisma transaction client
   * @returns Nearest matching incident, or `null` if none found
   */
  static async findNearbyIncident(
    lat: number,
    lon: number,
    category: WasteCategory,
    thresholdMeters: number = DEDUP_DISTANCE_THRESHOLD_METERS,
    tx?: PrismaTx,
  ): Promise<IncidentCandidate | null> {
    const effectiveThreshold = Math.min(
      thresholdMeters,
      DEDUP_MAX_THRESHOLD_METERS,
    );

    const client = (tx ?? prisma) as typeof prisma;

    // 1. Coarse bounding-box filter (fast DB index scan)
    const candidates = await client.wasteIncident.findMany({
      where: {
        category,
        isResolved: false,
        latitude: {
          gte: lat - BBOX_DEGREES,
          lte: lat + BBOX_DEGREES,
        },
        longitude: {
          gte: lon - BBOX_DEGREES,
          lte: lon + BBOX_DEGREES,
        },
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        category: true,
        status: true,
        contributorCount: true,
        isResolved: true,
      },
    });

    if (candidates.length === 0) {
      return null;
    }

    // 2. Precise Haversine distance filter — find the nearest candidate
    let nearest: IncidentCandidate | null = null;
    let nearestDistance = Infinity;

    for (const candidate of candidates) {
      const dist = this.haversineDistance(
        lat,
        lon,
        candidate.latitude,
        candidate.longitude,
      );

      if (dist <= effectiveThreshold && dist < nearestDistance) {
        nearest = candidate;
        nearestDistance = dist;
      }
    }

    return nearest;
  }

  // ── Transaction helper ──────────────────────────────────────────────────────

  /**
   * Called inside the `ReportCrudService.create()` transaction.
   *
   * Either:
   * - Links `reportId` to an existing nearby `WasteIncident` and increments its `contributorCount`, OR
   * - Creates a brand-new `WasteIncident` and links `reportId` to it.
   *
   * @returns The `WasteIncident.id` that was assigned to the report.
   */
  static async assignOrCreateIncident(
    tx: PrismaTx,
    reportId: string,
    lat: number,
    lon: number,
    category: WasteCategory,
    severity?: Severity | null,
    address?: string,
  ): Promise<string> {
    // Skip dedup for spam/no_waste — never group "no waste" reports
    if (category === WasteCategory.no_waste) {
      return this._createNewIncident(tx, lat, lon, category, severity, address, reportId);
    }

    const nearby = await this.findNearbyIncident(lat, lon, category, undefined, tx);

    if (nearby) {
      // ── Merge: link report to existing incident ──────────────────────────

      // 1. Update incident contributor count (and optionally escalate severity)
      await (tx as typeof prisma).wasteIncident.update({
        where: { id: nearby.id },
        data: {
          contributorCount: { increment: 1 },
          // Escalate severity if the new report is more critical
          ...(this._isSeverityHigher(severity, nearby.status) && severity
            ? { severity }
            : {}),
        },
      });

      // 2. Find the primary (oldest) report of this incident to copy
      //    its status and assigned workers to the newly grouped report.
      const primaryReport = await (tx as typeof prisma).report.findFirst({
        where: { incidentId: nearby.id, isDeleted: false },
        select: {
          status: true,
          assignedToId: true,
          assignedWorkers: {
            select: { workerId: true },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      // 3. Build the update payload for the new report
      const inheritedWorkerIds =
        primaryReport?.assignedWorkers?.map((w) => w.workerId) ?? [];

      const reportUpdateData: Record<string, unknown> = {
        incidentId: nearby.id,
        // Inherit the incident's current status so the new report
        // isn't left as PENDING while the incident is IN_PROGRESS, etc.
        ...(primaryReport?.status &&
          primaryReport.status !== "PENDING" && {
            status: primaryReport.status,
          }),
        // Inherit the primary assigned worker (legacy single-worker FK)
        ...(primaryReport?.assignedToId && {
          assignedToId: primaryReport.assignedToId,
        }),
      };

      await (tx as typeof prisma).report.update({
        where: { id: reportId },
        data: reportUpdateData,
      });

      // 4. Copy all ReportWorker assignments to the new report
      if (inheritedWorkerIds.length > 0) {
        // Use createMany with skipDuplicates for safety
        await (tx as typeof prisma).reportWorker.createMany({
          data: inheritedWorkerIds.map((workerId) => ({
            reportId,
            workerId,
          })),
          skipDuplicates: true,
        });
      }

      return nearby.id;
    }

    // ── No match: create a new incident ─────────────────────────────────────
    return this._createNewIncident(tx, lat, lon, category, severity, address, reportId);
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private static async _createNewIncident(
    tx: PrismaTx,
    lat: number,
    lon: number,
    category: WasteCategory,
    severity: Severity | null | undefined,
    address: string | undefined,
    reportId: string,
  ): Promise<string> {
    const incident = await (tx as typeof prisma).wasteIncident.create({
      data: {
        category,
        latitude: lat,
        longitude: lon,
        address: address ?? null,
        contributorCount: 1,
        status: ReportStatus.PENDING,
        severity: severity ?? null,
        isResolved: false,
      },
    });

    // Link the report to the newly created incident
    await (tx as typeof prisma).report.update({
      where: { id: reportId },
      data: { incidentId: incident.id },
    });

    return incident.id;
  }

  /**
   * Determine if the incoming report's severity is higher than the incident's
   * current severity so we can escalate the incident level.
   */
  private static _isSeverityHigher(
    incomingSeverity: Severity | null | undefined,
    _currentStatus: ReportStatus,
  ): boolean {
    // Severity rank (higher index = more critical)
    const rank: Record<string, number> = {
      SPAM: 0,
      MODERATE: 1,
      HIGH: 2,
      CRITICAL: 3,
    };

    if (!incomingSeverity) return false;
    return (rank[incomingSeverity] ?? 0) > 0;
  }

  // ── Status propagation ───────────────────────────────────────────────────────

  /**
   * Called whenever a `Report.status` changes (e.g. from `ReportCrudService.updateStatus()`).
   * Updates `WasteIncident.isResolved` and `WasteIncident.status` to reflect the
   * aggregate state of all linked reports.
   *
   * Incident is marked resolved only when ALL linked reports are CLEANED or REJECTED.
   */
  static async syncIncidentStatus(
    incidentId: string,
    tx?: PrismaTx,
  ): Promise<void> {
    const client = (tx ?? prisma) as typeof prisma;

    const reports = await client.report.findMany({
      where: { incidentId, isDeleted: false },
      select: { status: true },
    });

    if (reports.length === 0) return;

    const allResolved = reports.every(
      (r) =>
        r.status === ReportStatus.CLEANED || r.status === ReportStatus.REJECTED,
    );

    // Pick the "best active status" to surface on the incident
    const statusPriority: Record<ReportStatus, number> = {
      IN_PROGRESS: 5,
      CLEANUP_SCHEDULED: 4,
      VERIFIED: 3,
      PENDING: 2,
      REJECTED: 1,
      CLEANED: 0,
    };

    const activeStatus = reports.reduce<ReportStatus>(
      (best, r) =>
        statusPriority[r.status] > statusPriority[best] ? r.status : best,
      reports[0].status,
    );

    await client.wasteIncident.update({
      where: { id: incidentId },
      data: {
        isResolved: allResolved,
        status: activeStatus,
      },
    });
  }

  // ── Bidirectional propagation ─────────────────────────────────────────────

  /**
   * When a report's status is changed by an admin, propagate that same status
   * to ALL sibling reports in the same WasteIncident (except the one just changed).
   *
   * Also records a StatusHistory entry for each sibling so the audit trail is clean.
   *
   * @param changedReportId  The report whose status was just updated
   * @param newStatus        The new status to propagate
   * @param changedById      Admin/worker who made the change
   */
  static async propagateStatusToSiblings(
    changedReportId: string,
    newStatus: ReportStatus,
    changedById: string,
  ): Promise<{ updatedCount: number }> {
    // Find the incidentId of the changed report
    const changedReport = await prisma.report.findUnique({
      where: { id: changedReportId },
      select: { incidentId: true, status: true },
    });

    if (!changedReport?.incidentId) {
      return { updatedCount: 0 }; // Not part of any incident — nothing to do
    }

    const incidentId = changedReport.incidentId;

    // Find all other active sibling reports in the same incident
    const siblings = await prisma.report.findMany({
      where: {
        incidentId,
        id: { not: changedReportId }, // exclude the one that was just changed
        isDeleted: false,
        isSpam: false,
      },
      select: { id: true, status: true, reporterId: true, title: true },
    });

    if (siblings.length === 0) {
      return { updatedCount: 0 };
    }

    const siblingIds = siblings.map((s) => s.id);

    // Use sequential awaits instead of nested $transaction to avoid
    // Neon connection-pool serialization issues with interactive transactions
    // 1. Bulk-update status on all sibling reports
    await prisma.report.updateMany({
      where: { id: { in: siblingIds } },
      data: { status: newStatus },
    });

    // 2. Create StatusHistory for each sibling (audit trail)
    await prisma.statusHistory.createMany({
      data: siblings.map((s) => ({
        reportId: s.id,
        previousStatus: s.status,
        newStatus,
        changedById,
        notes: `[Auto-sync] Status propagated from grouped incident (same waste location)`,
      })),
    });

    // 3. Sync the WasteIncident aggregate status
    await this.syncIncidentStatus(incidentId);

    await GeoCache.invalidateAll();

    return { updatedCount: siblings.length };
  }

  /**
   * When workers are assigned to a report, propagate the same worker assignment
   * to ALL sibling reports in the same WasteIncident.
   *
   * @param changedReportId  The report that just had workers assigned
   * @param workerIds        The new set of worker IDs (replaces existing)
   * @param primaryWorkerId  The primary worker ID for the legacy FK
   */
  static async propagateWorkersToSiblings(
    changedReportId: string,
    workerIds: string[],
    primaryWorkerId: string | null,
  ): Promise<{ updatedCount: number }> {
    // Find the incidentId
    const changedReport = await prisma.report.findUnique({
      where: { id: changedReportId },
      select: { incidentId: true },
    });

    if (!changedReport?.incidentId) {
      return { updatedCount: 0 };
    }

    const incidentId = changedReport.incidentId;

    // Find all other active sibling reports
    const siblings = await prisma.report.findMany({
      where: {
        incidentId,
        id: { not: changedReportId },
        isDeleted: false,
        isSpam: false,
      },
      select: { id: true },
    });

    if (siblings.length === 0) {
      return { updatedCount: 0 };
    }

    const siblingIds = siblings.map((s) => s.id);

    // Sequential awaits — avoids nested interactive transaction issues on Neon pooled connections
    // 1. Clear old worker assignments for all siblings
    await prisma.reportWorker.deleteMany({
      where: { reportId: { in: siblingIds } },
    });

    // 2. Copy the new worker assignments to every sibling
    if (workerIds.length > 0) {
      const rows = siblingIds.flatMap((reportId) =>
        workerIds.map((workerId) => ({ reportId, workerId })),
      );
      await prisma.reportWorker.createMany({ data: rows, skipDuplicates: true });
    }

    // 3. Update legacy single-worker FK on all siblings
    await prisma.report.updateMany({
      where: { id: { in: siblingIds } },
      data: { assignedToId: primaryWorkerId },
    });

    return { updatedCount: siblings.length };
  }
}
