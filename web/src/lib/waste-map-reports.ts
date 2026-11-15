import type { AdminReportStatus } from "@/lib/admin-report";
import { groupReportsByRadius, type GeoPoint } from "@/lib/geo-grouping";

export const WASTE_MAP_STATUS_OPTIONS = {
  ACTIVE: "Active",
  ALL: "All",
  CLEANUP_SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  CLEANED: "Cleaned",
} as const;

export type WasteMapStatusFilter = keyof typeof WASTE_MAP_STATUS_OPTIONS;
export const DEFAULT_WASTE_MAP_STATUS: WasteMapStatusFilter = "ACTIVE";

type ReportWithStatus = { status: AdminReportStatus };

export function filterWasteMapReports<T extends ReportWithStatus>(
  reports: T[],
  filter: WasteMapStatusFilter,
): T[] {
  if (filter === "ALL") return reports;
  if (filter === "ACTIVE") return reports.filter(({ status }) => status !== "CLEANED");
  return reports.filter(({ status }) => status === filter);
}

export function groupWasteMapReports<T extends GeoPoint & ReportWithStatus>(
  reports: T[],
  radiusMeters: number,
) {
  const active: T[] = [];
  const cleaned: T[] = [];
  for (const report of reports) {
    (report.status === "CLEANED" ? cleaned : active).push(report);
  }
  return [
    ...groupReportsByRadius(active, radiusMeters),
    ...groupReportsByRadius(cleaned, radiusMeters),
  ];
}
