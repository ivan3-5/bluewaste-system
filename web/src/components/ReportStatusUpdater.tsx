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
  PENDING: "border-amber-200/90 bg-amber-50/80 text-amber-700 hover:bg-amber-100/70 focus:ring-amber-400",
  VERIFIED: "border-blue-200/90 bg-blue-50/80 text-blue-700 hover:bg-blue-100/70 focus:ring-blue-400",
  CLEANUP_SCHEDULED: "border-violet-200/90 bg-violet-50/80 text-violet-700 hover:bg-violet-100/70 focus:ring-violet-400",
  IN_PROGRESS: "border-orange-200/90 bg-orange-50/80 text-orange-700 hover:bg-orange-100/70 focus:ring-orange-400",
  CLEANED: "border-emerald-200/90 bg-emerald-50/80 text-emerald-700 hover:bg-emerald-100/70 focus:ring-emerald-400",
  REJECTED: "border-rose-200/90 bg-rose-50/80 text-rose-700 hover:bg-rose-100/70 focus:ring-rose-400",
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
}: {
  reportId: string;
  initialStatus: AdminReportStatus;
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

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <label className="mb-2 block text-sm font-semibold text-slate-800">
        Update Status
      </label>
      <div className="flex flex-wrap items-center gap-3">
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
              "h-10 w-[200px] rounded-xl px-3 text-sm font-semibold shadow-xs transition-all duration-150 border",
              STATUS_TRIGGER_STYLES[status]
            )}
          >
            <div className="flex items-center gap-2 truncate">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-500 shrink-0" />
              ) : (
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full shrink-0",
                    STATUS_DOT_COLORS[status]
                  )}
                />
              )}
              <span className="truncate">{ADMIN_REPORT_STATUS_LABELS[status]}</span>
            </div>
          </SelectTrigger>
          <SelectContent className="w-[220px]">
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
                    "py-2.5 text-xs font-medium",
                    isCurrent && "font-semibold text-blue-600 bg-blue-50/70"
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
                      <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-100/80 px-1.5 py-0.5 rounded-full">
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
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            Saving...
          </span>
        )}
      </div>
      {message && <p className="mt-3 text-xs font-medium text-slate-600">{message}</p>}
    </div>
  );
}
