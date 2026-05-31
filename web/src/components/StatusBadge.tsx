import {
  ADMIN_REPORT_STATUS_LABELS,
  type AdminReportStatus,
} from "@/lib/admin-report";
import type { ReportStatus } from "@/types";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: AdminReportStatus }) {
  const STATUS_STYLES: Record<ReportStatus, string> = {
    PENDING: "border-amber-200 bg-amber-50 text-amber-700",
    VERIFIED: "border-blue-200 bg-blue-50 text-blue-700",
    CLEANUP_SCHEDULED: "border-violet-200 bg-violet-50 text-violet-700",
    IN_PROGRESS: "border-orange-200 bg-orange-50 text-orange-700",
    CLEANED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
  };

  const STATUS_DOT: Record<ReportStatus, string> = {
    PENDING: "bg-amber-500",
    VERIFIED: "bg-blue-500",
    CLEANUP_SCHEDULED: "bg-violet-500",
    IN_PROGRESS: "bg-orange-500",
    CLEANED: "bg-emerald-500",
    REJECTED: "bg-rose-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        STATUS_STYLES[status],
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[status])} />
      {ADMIN_REPORT_STATUS_LABELS[status]}
    </span>
  );
}
