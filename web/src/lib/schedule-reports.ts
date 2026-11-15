import type { ReportStatus } from "@/types";

export function canScheduleReport(report: {
  status: ReportStatus;
  cleanupScheduleId?: string | null;
  isSpam?: boolean;
  isDeleted?: boolean;
}) {
  return report.status === "VERIFIED" && !report.cleanupScheduleId && !report.isSpam && !report.isDeleted;
}
