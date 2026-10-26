"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  ADMIN_REPORT_STATUS_LABELS,
  type AdminReportStatus,
} from "@/lib/admin-report";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLiveNotifications } from "@/contexts/LiveNotificationContext";

const STATUS_FLOW: Record<AdminReportStatus, AdminReportStatus[]> = {
  PENDING: ["VERIFIED"],
  VERIFIED: ["CLEANUP_SCHEDULED"],
  CLEANUP_SCHEDULED: ["IN_PROGRESS"],
  IN_PROGRESS: ["CLEANED", "REJECTED"],
  CLEANED: [],
  REJECTED: [],
};

const STATUS_TRIGGER_STYLES: Record<AdminReportStatus, string> = {
  PENDING: "border-amber-200/90 bg-amber-50/80 text-amber-700 hover:bg-amber-100/70 focus:ring-amber-400 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/60",
  VERIFIED: "border-blue-200/90 bg-blue-50/80 text-blue-700 hover:bg-blue-100/70 focus:ring-blue-400 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-950/60",
  CLEANUP_SCHEDULED: "border-violet-200/90 bg-violet-50/80 text-violet-700 hover:bg-violet-100/70 focus:ring-violet-400 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300 dark:hover:bg-violet-950/60",
  IN_PROGRESS: "border-orange-200/90 bg-orange-50/80 text-orange-700 hover:bg-orange-100/70 focus:ring-orange-400 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300 dark:hover:bg-orange-950/60",
  CLEANED: "border-emerald-200/90 bg-emerald-50/80 text-emerald-700 hover:bg-emerald-100/70 focus:ring-emerald-400 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60",
  REJECTED: "border-rose-200/90 bg-rose-50/80 text-rose-700 hover:bg-rose-100/70 focus:ring-rose-400 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/60",
};

const STATUS_DOT_COLORS: Record<AdminReportStatus, string> = {
  PENDING: "bg-amber-500",
  VERIFIED: "bg-blue-500",
  CLEANUP_SCHEDULED: "bg-violet-500",
  IN_PROGRESS: "bg-orange-500",
  CLEANED: "bg-emerald-500",
  REJECTED: "bg-rose-500",
};

export function ReportStatusUpdater({
  reportId,
  initialStatus,
  compact = false,
  className = "",
}: {
  reportId: string;
  initialStatus: AdminReportStatus;
  compact?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const { pushToast } = useLiveNotifications();
  const [status, setStatus] = useState<AdminReportStatus>(initialStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const allowedStatuses = useMemo(
    () => STATUS_FLOW[initialStatus] ?? [],
    [initialStatus],
  );
  const isFinalStatus = allowedStatuses.length === 0;

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const saveStatus = async (nextStatus: AdminReportStatus) => {
    if (!allowedStatuses.includes(nextStatus) || nextStatus === initialStatus) {
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to update status.");
      }

      const successMsg = `Report status updated to ${ADMIN_REPORT_STATUS_LABELS[nextStatus]}.`;
      setMessage(successMsg);
      pushToast({
        id: `status-${reportId}-${Date.now()}`,
        title: "Status Updated",
        message: successMsg,
        type: "STATUS_CHANGE",
        variant: "success",
        isRead: true,
        createdAt: new Date().toISOString(),
      });
      router.refresh();
    } catch (error) {
      setStatus(initialStatus);
      const errorMsg =
        error instanceof Error ? error.message : "Failed to update status.";
      setMessage(errorMsg);
      pushToast({
        id: `status-err-${reportId}-${Date.now()}`,
        title: "Update Failed",
        message: errorMsg,
        type: "STATUS_CHANGE",
        variant: "error",
        isRead: true,
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const selectElement = (
    <div className="flex items-center gap-2">
      <Select
        value={status}
        disabled={isFinalStatus || isSaving}
        onValueChange={(nextVal) => {
          const nextStatus = nextVal as AdminReportStatus;
          setStatus(nextStatus);
          void saveStatus(nextStatus);
        }}
      >
        <SelectTrigger
          className={cn(
            "h-9 w-[190px] rounded-lg px-2.5 text-xs font-semibold shadow-2xs transition-all duration-150 border",
            STATUS_TRIGGER_STYLES[status]
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500 shrink-0" />
            ) : (
              <span
                className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  STATUS_DOT_COLORS[status]
                )}
              />
            )}
            <span className="truncate">{ADMIN_REPORT_STATUS_LABELS[status]}</span>
          </div>
        </SelectTrigger>
        <SelectContent className="w-[210px]">
          {Object.entries(ADMIN_REPORT_STATUS_LABELS).map(([value, label]) => {
            const isCurrent = value === initialStatus;
            const isAllowed = allowedStatuses.includes(value as AdminReportStatus);
            const disabled = !isCurrent && !isAllowed;

            return (
              <SelectItem
                key={value}
                value={value}
                disabled={disabled}
                className={cn(
                  "py-2 text-xs font-medium",
                  isCurrent && "font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/40"
                )}
              >
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full shrink-0",
                        STATUS_DOT_COLORS[value as AdminReportStatus]
                      )}
                    />
                    <span>{label}</span>
                  </div>
                  {isCurrent && (
                    <span className="text-[9px] uppercase font-bold text-blue-600 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-950/80 px-1 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {isSaving && (
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
          Updating...
        </span>
      )}
    </div>
  );

  if (compact) {
    return (
      <div className={cn("inline-flex items-center", className)}>
        {selectElement}
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-xs", className)}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
          Update Report Status
        </label>
        {isFinalStatus && (
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            Final status reached
          </span>
        )}
      </div>
      {selectElement}
      {message && <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300">{message}</p>}
    </div>
  );
}
