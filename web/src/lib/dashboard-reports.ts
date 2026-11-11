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
  analysisWasteCount: number | null;
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
  cleanedByName?: string | null;
  cleanedAt?: Date | null;
  cleanupScheduleId?: string | null;
  cleanupScheduledAt?: Date | null;
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

export type MonthlyTrendRange = "thisYear" | "thisMonth" | "6months" | "12months";

type DashboardMonthlyTrendRow = {
  month_date: Date;
  month_name: string;
  month_key: string;
  year: number;
  month_num: number;
  day_of_month: number;
  pendingCount: bigint | number;
  inProgressCount: bigint | number;
  cleanedCount: bigint | number;
  totalCount: bigint | number;
};

export type MonthlyTrendPoint = {
  monthDate: string;
  monthName: string;
  monthKey: string;
  year: number;
  monthNum: number;
  dayOfMonth?: number;
  pendingCount: number;
  inProgressCount: number;
  cleanedCount: number;
  totalCount: number;
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
    wasteCount: row.analysisWasteCount ?? null,
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
    cleanedByName: row.cleanedByName ?? null,
    cleanedAt: row.cleanedAt ?? null,
    reportedAt: row.reportedAt,
    updatedAt: row.updatedAt,
    analyzedAt: row.analyzedAt ?? null,
    cleanupScheduleId: row.cleanupScheduleId ?? null,
    cleanupScheduledAt: row.cleanupScheduledAt ?? null,
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
      (SELECT cs."scheduledAt" FROM "CleanupSchedule" cs WHERE cs.id = r."cleanupScheduleId") AS "cleanupScheduledAt",
      r.title,
      r.description,
      r.category,
      r.status,
      r.latitude,
      r.longitude,
      r.address,
      r."analysisWasteCount",
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
      r."cleanupScheduleId",
      COALESCE(image."imageUrl", null) AS "imageUrl",
      COALESCE(images.images, '[]'::json) AS images,
      r."reporterId",
      CASE WHEN r."isAnonymous" THEN 'Anonymous Citizen' ELSE COALESCE(rep."firstName" || ' ' || rep."lastName", 'Anonymous Citizen') END AS "reporterName",
      CASE WHEN r."isAnonymous" THEN NULL ELSE rep.email END AS "reporterEmail",
      r."assignedToId",
      COALESCE(u."firstName" || ' ' || u."lastName", null) AS "assignedToName",
      COALESCE(rep_workers."assignedWorkers", '[]'::json) AS "assignedWorkers",
      COALESCE(rep_workers."reportWorkerNames", schedule_workers."assignedWorkerNames", u."firstName" || ' ' || u."lastName", null) AS "assignedWorkerNames",
      cleaned_by."cleanedByName" AS "cleanedByName",
      cleaned_by."cleanedAt" AS "cleanedAt"
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
    LEFT JOIN LATERAL (
      SELECT
        cb."firstName" || ' ' || cb."lastName" AS "cleanedByName",
        sh."createdAt" AS "cleanedAt"
      FROM "StatusHistory" sh
      JOIN "User" cb ON cb.id = sh."changedById"
      WHERE sh."reportId" = r.id AND sh."newStatus" = 'CLEANED'
      ORDER BY sh."createdAt" DESC
      LIMIT 1
    ) cleaned_by ON TRUE
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
      (SELECT cs."scheduledAt" FROM "CleanupSchedule" cs WHERE cs.id = r."cleanupScheduleId") AS "cleanupScheduledAt",
      r.title,
      r.description,
      r.category,
      r.status,
      r.latitude,
      r.longitude,
      r.address,
      r."analysisWasteCount",
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
      r."cleanupScheduleId",
      COALESCE(image."imageUrl", null) AS "imageUrl",
      COALESCE(images.images, '[]'::json) AS images,
      r."reporterId",
      CASE WHEN r."isAnonymous" THEN 'Anonymous Citizen' ELSE COALESCE(rep."firstName" || ' ' || rep."lastName", 'Anonymous Citizen') END AS "reporterName",
      CASE WHEN r."isAnonymous" THEN NULL ELSE rep.email END AS "reporterEmail",
      r."assignedToId",
      COALESCE(u."firstName" || ' ' || u."lastName", null) AS "assignedToName",
      COALESCE(rep_workers."assignedWorkers", '[]'::json) AS "assignedWorkers",
      COALESCE(rep_workers."reportWorkerNames", schedule_workers."assignedWorkerNames", u."firstName" || ' ' || u."lastName", null) AS "assignedWorkerNames",
      cleaned_by."cleanedByName" AS "cleanedByName",
      cleaned_by."cleanedAt" AS "cleanedAt"
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
    LEFT JOIN LATERAL (
      SELECT
        cb."firstName" || ' ' || cb."lastName" AS "cleanedByName",
        sh."createdAt" AS "cleanedAt"
      FROM "StatusHistory" sh
      JOIN "User" cb ON cb.id = sh."changedById"
      WHERE sh."reportId" = r.id AND sh."newStatus" = 'CLEANED'
      ORDER BY sh."createdAt" DESC
      LIMIT 1
    ) cleaned_by ON TRUE
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
    WHERE r."isDeleted" = false
      AND r."isSpam" = false
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
      WHERE r."isDeleted" = false
        AND r."isSpam" = false
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

export async function getDashboardMonthlyTrend(
  range: MonthlyTrendRange = "thisYear",
): Promise<MonthlyTrendPoint[]> {
  const rows = await prisma.$queryRaw<DashboardMonthlyTrendRow[]>`
    WITH settings AS (
      SELECT ${range}::text AS range,
        (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Manila')::date AS today
    ), bounds AS (
      SELECT
        CASE range
          WHEN 'thisYear' THEN DATE_TRUNC('year', today::timestamp)
          WHEN 'thisMonth' THEN DATE_TRUNC('month', today::timestamp)
          WHEN '6months' THEN DATE_TRUNC('month', today::timestamp) - interval '5 months'
          ELSE DATE_TRUNC('month', today::timestamp) - interval '11 months'
        END AS start_date,
        CASE range
          WHEN 'thisYear' THEN DATE_TRUNC('year', today::timestamp) + interval '1 year'
          WHEN 'thisMonth' THEN today + interval '1 day'
          ELSE DATE_TRUNC('month', today::timestamp) + interval '1 month'
        END AS end_date,
        CASE WHEN range = 'thisMonth' THEN 'day' ELSE 'month' END AS bucket_unit,
        CASE WHEN range = 'thisMonth' THEN interval '1 day' ELSE interval '1 month' END AS step
      FROM settings
    ), buckets AS (
      SELECT generate_series(start_date, end_date - step, step)::date AS bucket_date
      FROM bounds
    ), aggregated AS (
      SELECT
        DATE_TRUNC(bounds.bucket_unit, (r."createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Manila')::date AS bucket_date,
        COUNT(*) FILTER (WHERE r."status" = 'PENDING')::bigint AS "pendingCount",
        COUNT(*) FILTER (WHERE r."status" = 'IN_PROGRESS')::bigint AS "inProgressCount",
        COUNT(*) FILTER (WHERE r."status" = 'CLEANED')::bigint AS "cleanedCount",
        COUNT(*)::bigint AS "totalCount"
      FROM "Report" r
      CROSS JOIN bounds
      WHERE r."isDeleted" = false
        AND r."isSpam" = false
        AND r."createdAt" >= (bounds.start_date AT TIME ZONE 'Asia/Manila') AT TIME ZONE 'UTC'
        AND r."createdAt" < (bounds.end_date AT TIME ZONE 'Asia/Manila') AT TIME ZONE 'UTC'
      GROUP BY 1
    )
    SELECT
      b.bucket_date AS month_date,
      TO_CHAR(b.bucket_date, 'FMMonth') AS month_name,
      TO_CHAR(b.bucket_date, 'YYYY-MM') AS month_key,
      EXTRACT(YEAR FROM b.bucket_date)::int AS year,
      EXTRACT(MONTH FROM b.bucket_date)::int AS month_num,
      EXTRACT(DAY FROM b.bucket_date)::int AS day_of_month,
      COALESCE(a."pendingCount", 0)::bigint AS "pendingCount",
      COALESCE(a."inProgressCount", 0)::bigint AS "inProgressCount",
      COALESCE(a."cleanedCount", 0)::bigint AS "cleanedCount",
      COALESCE(a."totalCount", 0)::bigint AS "totalCount"
    FROM buckets b
    LEFT JOIN aggregated a ON a.bucket_date = b.bucket_date
    ORDER BY b.bucket_date ASC
  `;

  return rows.map((row) => ({
    monthDate:
      row.month_date instanceof Date
        ? row.month_date.toISOString()
        : String(row.month_date),
    monthName: row.month_name?.trim() || "",
    monthKey: row.month_key,
    year: Number(row.year),
    monthNum: Number(row.month_num),
    ...(range === "thisMonth" && { dayOfMonth: Number(row.day_of_month) }),
    pendingCount: toNumber(row.pendingCount),
    inProgressCount: toNumber(row.inProgressCount),
    cleanedCount: toNumber(row.cleanedCount),
    totalCount: toNumber(row.totalCount),
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
      WHERE r."isDeleted" = false
        AND r."isSpam" = false
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
  cleanupScheduleId?: string | null,
) {
  if (cleanupScheduleId) {
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
            "updatedAt" = NOW(),
            "verifiedAt" = COALESCE("verifiedAt", NOW()),
            notes = CASE
              WHEN notes IS NULL OR notes = '' THEN 'Automatically completed: all associated waste reports have been cleaned.'
              ELSE notes
            END
        WHERE id = ${cleanupScheduleId}
          AND status != 'COMPLETED'
      `;
    }
  }

  // Universal reconciliation: Auto-complete any UPCOMING or ONGOING schedule whose active reports are all CLEANED
  await tx.$executeRaw`
    UPDATE "CleanupSchedule" cs
    SET status = 'COMPLETED'::"CleanupScheduleStatus",
        "updatedAt" = NOW(),
        "verifiedAt" = COALESCE("verifiedAt", NOW()),
        notes = CASE 
          WHEN notes IS NULL OR notes = '' THEN 'Automatically completed: all associated waste reports have been cleaned.'
          ELSE notes
        END
    WHERE cs.status IN ('UPCOMING', 'ONGOING')
      AND EXISTS (
        SELECT 1 FROM "Report" r
        WHERE r."cleanupScheduleId" = cs.id
          AND r."isDeleted" = false
      )
      AND NOT EXISTS (
        SELECT 1 FROM "Report" r
        WHERE r."cleanupScheduleId" = cs.id
          AND r."isDeleted" = false
          AND r.status != 'CLEANED'
      )
  `;
}

export async function updateDashboardReportStatus(
  id: string,
  status: AdminReport["status"],
) {
  await prisma.$transaction(async (tx) => {
    // Read reporter id, title, cleanupScheduleId, and incidentId first
    const rows = await tx.$queryRaw<
      { reporterId: string | null; title: string; cleanupScheduleId: string | null; incidentId: string | null }[]
    >`
      SELECT r."reporterId", r.title, r."cleanupScheduleId", r."incidentId"
      FROM "Report" r
      WHERE r.id = ${id}
      LIMIT 1
    `;

    const reporterId = rows?.[0]?.reporterId ?? null;
    const title = rows?.[0]?.title ?? "";
    const cleanupScheduleId = rows?.[0]?.cleanupScheduleId ?? null;
    const incidentId = rows?.[0]?.incidentId ?? null;

    // Update status (cast to DB enum)
    await tx.$executeRaw`
      UPDATE "Report"
      SET status = ${status}::"ReportStatus"
      WHERE id = ${id}
    `;

    // If report belongs to an incident, propagate to active sibling reports
    if (incidentId) {
      await tx.$executeRaw`
        UPDATE "Report"
        SET status = ${status}::"ReportStatus"
        WHERE "incidentId" = ${incidentId}
          AND id != ${id}
          AND "isDeleted" = false
      `;
    }

    // Create a notification for the reporter if they exist
    if (reporterId) {
      await notifyReporterStatusChange(tx, reporterId, title, id, status);
    }

    // Auto-complete any linked CleanupSchedule if ALL its reports are now CLEANED
    if (status === "CLEANED") {
      await tryAutoCompleteCleanupSchedule(tx, cleanupScheduleId);
    }
  });

  return getDashboardReportById(id);
}

