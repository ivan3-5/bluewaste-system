import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";
import {
  ADMIN_REPORT_STATUS_LABELS,
  type AdminReport,
} from "@/lib/admin-report";
import type { ReportStatus } from "@/types";

const PLACEHOLDER_IMAGE_URL =
  "https://placehold.co/800x600?text=No+Image+Available";

type DashboardReportRow = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  latitude: number;
  longitude: number;
  address: string | null;
  analysisConfidence: number | null;
  analysisStatus: string | null;
  severity: string | null;
  reportedAt: Date;
  updatedAt: Date;
  analyzedAt: Date | null;
  imageUrl: string | null;
  images: Array<{
    id: string;
    imageUrl: string;
    publicId: string | null;
    type: string;
    createdAt: Date;
  }>;
  reporterId?: string | null;
  reporterName?: string | null;
  reporterEmail?: string | null;
  assignedToId?: string | null;
  assignedToName?: string | null;
  assignedWorkerNames?: string | null;
  assignedWorkers?: Array<{ id: string; firstName: string; lastName: string; email?: string }> | null;
  // Gemini AI fields
  aiCategories?: string[] | null;
  aiReason?: string | null;
  aiModel?: string | null;
  aiProcessingMs?: number | null;
  aiGeminiMs?: number | null;
};

type DashboardStatsRow = {
  totalReports: bigint | number;
  pendingCount: bigint | number;
  inProgressCount: bigint | number;
  cleanedCount: bigint | number;
};

type DashboardTrendRow = {
  day: Date;
  count: bigint | number;
};

type DashboardCategoryRow = {
  bucket: string;
  count: bigint | number;
};

const WASTE_BUCKET_LABELS: Record<string, string> = {
  with_waste: "With Waste",
  no_waste: "No Waste",
};

function toNumber(value: bigint | number | null | undefined) {
  return Number(value ?? 0);
}

function mapDashboardStatus(status: string) {
  if (status in ADMIN_REPORT_STATUS_LABELS) {
    return status as ReportStatus;
  }

  return "PENDING" as ReportStatus;
}

function mapDashboardCategory(analysisStatus: string | null) {
  return analysisStatus === "CLEAN" ? "no_waste" : "with_waste";
}

function mapDashboardReport(row: DashboardReportRow): AdminReport {
  const images = Array.isArray(row.images)
    ? row.images.map((image) => ({
        id: image.id,
        imageUrl: image.imageUrl,
        publicId: image.publicId ?? "",
        type:
          image.type === "CLEANUP" ? ("CLEANUP" as const) : ("REPORT" as const),
        createdAt:
          image.createdAt instanceof Date
            ? image.createdAt.toISOString()
            : String(image.createdAt),
      }))
    : [];

  const primaryImage =
    images.find((image) => image.type === "REPORT") ?? images[0] ?? null;

  const assignedWorkers = Array.isArray(row.assignedWorkers)
    ? row.assignedWorkers
    : [];

  return {
    id: row.id,
    imageUrl: primaryImage?.imageUrl || row.imageUrl || PLACEHOLDER_IMAGE_URL,
    images,
    category: mapDashboardCategory(
      row.analysisStatus,
    ) as AdminReport["category"],
    confidence: Number(row.analysisConfidence ?? 0),
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    locationName: row.address?.trim() || row.title || "Unknown location",
    description: row.description?.trim() || null,
    status: mapDashboardStatus(row.status) as AdminReport["status"],
    severity: (row.severity as AdminReport["severity"]) ?? null,
    reporterName: row.reporterName ?? null,
    reporterEmail: row.reporterEmail ?? null,
    assignedToId: row.assignedToId ?? null,
    assignedToName: row.assignedToName ?? null,
    assignedWorkerNames: row.assignedWorkerNames ?? null,
    assignedWorkers,
    reportedAt: row.reportedAt,
    updatedAt: row.updatedAt,
    analyzedAt: row.analyzedAt ?? null,
    aiCategories: Array.isArray(row.aiCategories) ? row.aiCategories : null,
    aiReason: row.aiReason ?? null,
    aiModel: row.aiModel ?? null,
    aiProcessingMs: row.aiProcessingMs ?? null,
    aiGeminiMs: row.aiGeminiMs ?? null,
  };
}

export async function getDashboardReports(limit: number) {
  const reports = await prisma.$queryRaw<DashboardReportRow[]>`
    SELECT
      r.id,
      r.title,
      r.description,
      r.category,
      r.status,
      r.latitude,
      r.longitude,
      r.address,
      r."analysisConfidence",
      r."analysisStatus",
      r.severity,
      r."createdAt" AS "reportedAt",
      r."updatedAt",
      r."analyzedAt",
      r."aiCategories",
      r."aiReason",
      r."aiModel",
      r."aiProcessingMs",
      r."aiGeminiMs",
      COALESCE(image."imageUrl", null) AS "imageUrl",
      COALESCE(images.images, '[]'::json) AS images,
      r."reporterId",
      CASE WHEN r."isAnonymous" THEN 'Anonymous Citizen' ELSE COALESCE(rep."firstName" || ' ' || rep."lastName", 'Anonymous Citizen') END AS "reporterName",
      CASE WHEN r."isAnonymous" THEN NULL ELSE rep.email END AS "reporterEmail",
      r."assignedToId",
      COALESCE(u."firstName" || ' ' || u."lastName", null) AS "assignedToName",
      COALESCE(rep_workers."assignedWorkers", '[]'::json) AS "assignedWorkers",
      COALESCE(rep_workers."reportWorkerNames", schedule_workers."assignedWorkerNames", u."firstName" || ' ' || u."lastName", null) AS "assignedWorkerNames"
    FROM "Report" r
    LEFT JOIN "User" rep ON rep.id = r."reporterId"
    LEFT JOIN "User" u ON u.id = r."assignedToId"
    LEFT JOIN LATERAL (
      SELECT ri."imageUrl"
      FROM "ReportImage" ri
      WHERE ri."reportId" = r.id
        AND ri.type = 'REPORT'
      ORDER BY ri."createdAt" ASC
      LIMIT 1
    ) image ON TRUE
    LEFT JOIN LATERAL (
      SELECT json_agg(
        json_build_object(
          'id', ri.id,
          'imageUrl', ri."imageUrl",
          'publicId', ri."publicId",
          'type', ri.type,
          'createdAt', ri."createdAt"
        ) ORDER BY ri."createdAt" ASC
      ) AS images
      FROM "ReportImage" ri
      WHERE ri."reportId" = r.id
    ) images ON TRUE
    LEFT JOIN LATERAL (
      SELECT
        json_agg(
          json_build_object(
            'id', rw_u.id,
            'firstName', rw_u."firstName",
            'lastName', rw_u."lastName",
            'email', rw_u.email
          ) ORDER BY rw."assignedAt" ASC
        ) AS "assignedWorkers",
        string_agg(
          rw_u."firstName" || ' ' || rw_u."lastName",
          ', '
          ORDER BY rw."assignedAt" ASC
        ) AS "reportWorkerNames"
      FROM "ReportWorker" rw
      JOIN "User" rw_u ON rw_u.id = rw."workerId"
      WHERE rw."reportId" = r.id
    ) rep_workers ON TRUE
    LEFT JOIN LATERAL (
      SELECT string_agg(
        sw."firstName" || ' ' || sw."lastName",
        ', '
        ORDER BY csw."assignedAt" ASC
      ) AS "assignedWorkerNames"
      FROM "CleanupSchedule" cs
      JOIN "CleanupScheduleWorker" csw ON csw."scheduleId" = cs.id
      JOIN "User" sw ON sw.id = csw."workerId"
      WHERE cs.id = r."cleanupScheduleId"
    ) schedule_workers ON TRUE
    WHERE r."isDeleted" = false
      AND r."isSpam" = false
    ORDER BY r."createdAt" DESC
    LIMIT ${limit}
  `;

  return reports.map(mapDashboardReport);
}

export async function getDashboardReportById(id: string) {
  const reports = await prisma.$queryRaw<DashboardReportRow[]>`
    SELECT
      r.id,
      r.title,
      r.description,
      r.category,
      r.status,
      r.latitude,
      r.longitude,
      r.address,
      r."analysisConfidence",
      r."analysisStatus",
      r.severity,
      r."createdAt" AS "reportedAt",
      r."updatedAt",
      r."analyzedAt",
      r."aiCategories",
      r."aiReason",
      r."aiModel",
      r."aiProcessingMs",
      r."aiGeminiMs",
      COALESCE(image."imageUrl", null) AS "imageUrl",
      COALESCE(images.images, '[]'::json) AS images,
      r."reporterId",
      CASE WHEN r."isAnonymous" THEN 'Anonymous Citizen' ELSE COALESCE(rep."firstName" || ' ' || rep."lastName", 'Anonymous Citizen') END AS "reporterName",
      CASE WHEN r."isAnonymous" THEN NULL ELSE rep.email END AS "reporterEmail",
      r."assignedToId",
      COALESCE(u."firstName" || ' ' || u."lastName", null) AS "assignedToName",
      COALESCE(rep_workers."assignedWorkers", '[]'::json) AS "assignedWorkers",
      COALESCE(rep_workers."reportWorkerNames", schedule_workers."assignedWorkerNames", u."firstName" || ' ' || u."lastName", null) AS "assignedWorkerNames"
    FROM "Report" r
    LEFT JOIN "User" rep ON rep.id = r."reporterId"
    LEFT JOIN "User" u ON u.id = r."assignedToId"
    LEFT JOIN LATERAL (
      SELECT ri."imageUrl"
      FROM "ReportImage" ri
      WHERE ri."reportId" = r.id
        AND ri.type = 'REPORT'
      ORDER BY ri."createdAt" ASC
      LIMIT 1
    ) image ON TRUE
    LEFT JOIN LATERAL (
      SELECT json_agg(
        json_build_object(
          'id', ri.id,
          'imageUrl', ri."imageUrl",
          'publicId', ri."publicId",
          'type', ri.type,
          'createdAt', ri."createdAt"
        ) ORDER BY ri."createdAt" ASC
      ) AS images
      FROM "ReportImage" ri
      WHERE ri."reportId" = r.id
    ) images ON TRUE
    LEFT JOIN LATERAL (
      SELECT
        json_agg(
          json_build_object(
            'id', rw_u.id,
            'firstName', rw_u."firstName",
            'lastName', rw_u."lastName",
            'email', rw_u.email
          ) ORDER BY rw."assignedAt" ASC
        ) AS "assignedWorkers",
        string_agg(
          rw_u."firstName" || ' ' || rw_u."lastName",
          ', '
          ORDER BY rw."assignedAt" ASC
        ) AS "reportWorkerNames"
      FROM "ReportWorker" rw
      JOIN "User" rw_u ON rw_u.id = rw."workerId"
      WHERE rw."reportId" = r.id
    ) rep_workers ON TRUE
    LEFT JOIN LATERAL (
      SELECT string_agg(
        sw."firstName" || ' ' || sw."lastName",
        ', '
        ORDER BY csw."assignedAt" ASC
      ) AS "assignedWorkerNames"
      FROM "CleanupSchedule" cs
      JOIN "CleanupScheduleWorker" csw ON csw."scheduleId" = cs.id
      JOIN "User" sw ON sw.id = csw."workerId"
      WHERE cs.id = r."cleanupScheduleId"
    ) schedule_workers ON TRUE
    WHERE r.id = ${id}
    LIMIT 1
  `;

  return reports[0] ? mapDashboardReport(reports[0]) : null;
}

export async function getDashboardStats() {
  const rows = await prisma.$queryRaw<DashboardStatsRow[]>`
    SELECT
      COUNT(*)::bigint AS "totalReports",
      COUNT(*) FILTER (WHERE r."status" = 'PENDING')::bigint AS "pendingCount",
      COUNT(*) FILTER (WHERE r."status" = 'IN_PROGRESS')::bigint AS "inProgressCount",
      COUNT(*) FILTER (WHERE r."status" = 'CLEANED')::bigint AS "cleanedCount"
    FROM "Report" r
  `;

  const stats = rows[0];

  return {
    totalReports: toNumber(stats?.totalReports),
    pendingCount: toNumber(stats?.pendingCount),
    inProgressCount: toNumber(stats?.inProgressCount),
    cleanedCount: toNumber(stats?.cleanedCount),
  };
}

export async function getDashboardTrend(days = 30) {
  const rows = await prisma.$queryRaw<DashboardTrendRow[]>`
    WITH day_series AS (
      SELECT generate_series(
        CURRENT_DATE - (${days}::int - 1) * interval '1 day',
        CURRENT_DATE,
        interval '1 day'
      )::date AS day
    ),
    report_counts AS (
      SELECT
        DATE_TRUNC('day', r."createdAt")::date AS day,
        COUNT(*)::bigint AS count
      FROM "Report" r
      GROUP BY 1
    )
    SELECT
      day_series.day,
      COALESCE(report_counts.count, 0)::bigint AS count
    FROM day_series
    LEFT JOIN report_counts ON report_counts.day = day_series.day
    ORDER BY day_series.day ASC
  `;

  return rows.map((row: DashboardTrendRow) => ({
    day: row.day,
    count: toNumber(row.count),
  }));
}

export async function getDashboardCategoryDistribution() {
  const rows = await prisma.$queryRaw<DashboardCategoryRow[]>`
    WITH bucketed AS (
      SELECT
        CASE
          WHEN COALESCE(r."analysisStatus", 'DIRTY') = 'CLEAN' THEN 'no_waste'
          ELSE 'with_waste'
        END AS bucket,
        COUNT(*)::bigint AS count
      FROM "Report" r
      GROUP BY 1
    )
    SELECT
      base.bucket,
      COALESCE(bucketed.count, 0)::bigint AS count
    FROM (VALUES ('with_waste'), ('no_waste')) AS base(bucket)
    LEFT JOIN bucketed ON bucketed.bucket = base.bucket
    ORDER BY CASE WHEN base.bucket = 'with_waste' THEN 1 ELSE 2 END
  `;

  return rows.map((row: DashboardCategoryRow) => ({
    key: row.bucket,
    label: WASTE_BUCKET_LABELS[row.bucket] ?? row.bucket,
    count: toNumber(row.count),
  }));
}

type PrismaTransactionClient = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

async function notifyReporterStatusChange(
  tx: PrismaTransactionClient,
  reporterId: string,
  title: string,
  reportId: string,
  status: string,
) {
  const message = `Your report "${title}" status changed to ${status.replace(/_/g, " ")}`;
  const nid = randomUUID();

  await tx.$executeRaw`
    INSERT INTO "Notification" (id, "userId", title, message, type, "reportId")
    VALUES (
      ${nid},
      ${reporterId},
      ${"Report Status Updated"},
      ${message},
      ${"STATUS_CHANGE"}::"NotificationType",
      ${reportId}
    )
  `;
}

async function tryAutoCompleteCleanupSchedule(
  tx: PrismaTransactionClient,
  cleanupScheduleId: string,
) {
  const totals = await tx.$queryRaw<
    { total: bigint; cleaned: bigint }[]
  >`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'CLEANED') AS cleaned
    FROM "Report"
    WHERE "cleanupScheduleId" = ${cleanupScheduleId}
      AND "isDeleted" = false
  `;

  const total = Number(totals?.[0]?.total ?? 0);
  const cleaned = Number(totals?.[0]?.cleaned ?? 0);

  if (total > 0 && cleaned === total) {
    await tx.$executeRaw`
      UPDATE "CleanupSchedule"
      SET status = 'COMPLETED'::"CleanupScheduleStatus",
          "verifiedAt" = NOW()
      WHERE id = ${cleanupScheduleId}
        AND status != 'COMPLETED'
    `;
  }
}

export async function updateDashboardReportStatus(
  id: string,
  status: AdminReport["status"],
) {
  await prisma.$transaction(async (tx) => {
    // Read reporter id, title, and cleanupScheduleId first (avoid Prisma model mismatches)
    const rows = await tx.$queryRaw<
      { reporterId: string | null; title: string; cleanupScheduleId: string | null }[]
    >`
      SELECT r."reporterId", r.title, r."cleanupScheduleId"
      FROM "Report" r
      WHERE r.id = ${id}
      LIMIT 1
    `;

    const reporterId = rows?.[0]?.reporterId ?? null;
    const title = rows?.[0]?.title ?? "";
    const cleanupScheduleId = rows?.[0]?.cleanupScheduleId ?? null;

    // Update status (cast to DB enum)
    await tx.$executeRaw`
      UPDATE "Report"
      SET status = ${status}::"ReportStatus"
      WHERE id = ${id}
    `;

    // Create a notification for the reporter if they exist
    if (reporterId) {
      await notifyReporterStatusChange(tx, reporterId, title, id, status);
    }

    // Auto-complete the linked CleanupSchedule if ALL its reports are now CLEANED
    if (status === "CLEANED" && cleanupScheduleId) {
      await tryAutoCompleteCleanupSchedule(tx, cleanupScheduleId);
    }
  });

  return getDashboardReportById(id);
}

