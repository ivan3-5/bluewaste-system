import { REPORT_STATUS_LABELS, ReportStatus } from "@/types";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: ReportStatus;
  className?: string;
  showDot?: boolean;
};

const STATUS_STYLES: Record<ReportStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300",
  VERIFIED: "bg-blue-50 text-blue-700 border-blue-200 dark:border-blue-500/30 dark:bg-blue-950/40 dark:text-blue-300",
  CLEANUP_SCHEDULED: "bg-violet-50 text-violet-700 border-violet-200 dark:border-violet-500/30 dark:bg-violet-950/40 dark:text-violet-300",
  IN_PROGRESS: "bg-orange-50 text-orange-700 border-orange-200 dark:border-orange-500/30 dark:bg-orange-950/40 dark:text-orange-300",
  CLEANED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300",
};

const STATUS_DOT: Record<ReportStatus, string> = {
  PENDING: "bg-amber-500",
  VERIFIED: "bg-blue-500",
  CLEANUP_SCHEDULED: "bg-violet-500",
  IN_PROGRESS: "bg-orange-500",
  CLEANED: "bg-emerald-500",
  REJECTED: "bg-rose-500",
};

export function StatusBadge({
  status,
  className,
  showDot = true,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        STATUS_STYLES[status],
        className,
      )}
    >
      {showDot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[status])} />
      )}
      {REPORT_STATUS_LABELS[status]}
    </span>
  );
}
