"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ADMIN_REPORT_STATUS_LABELS,
  type AdminReportStatus,
} from "@/lib/admin-report";

const STATUS_FLOW: Record<AdminReportStatus, AdminReportStatus[]> = {
  PENDING: ["VERIFIED"],
  VERIFIED: ["CLEANUP_SCHEDULED"],
  CLEANUP_SCHEDULED: ["IN_PROGRESS"],
  IN_PROGRESS: ["CLEANED", "REJECTED"],
  CLEANED: [],
  REJECTED: [],
};

const STATUS_SELECT_STYLES: Record<AdminReportStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700 focus:ring-amber-500",
  VERIFIED: "border-blue-200 bg-blue-50 text-blue-700 focus:ring-blue-500",
  CLEANUP_SCHEDULED: "border-violet-200 bg-violet-50 text-violet-700 focus:ring-violet-500",
  IN_PROGRESS: "border-orange-200 bg-orange-50 text-orange-700 focus:ring-orange-500",
  CLEANED: "border-emerald-200 bg-emerald-50 text-emerald-700 focus:ring-emerald-500",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700 focus:ring-rose-500",
};

export function ReportStatusUpdater({
  reportId,
  initialStatus,
}: {
  reportId: string;
  initialStatus: AdminReportStatus;
}) {
  const router = useRouter();
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

      setMessage("Status updated successfully.");
      router.refresh();
    } catch (error) {
      setStatus(initialStatus);
      setMessage(
        error instanceof Error ? error.message : "Failed to update status.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <label className="mb-2 block text-sm font-semibold text-slate-800">
        Update Status
      </label>
      <div className="flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(event) => {
            const nextStatus = event.target.value as AdminReportStatus;
            setStatus(nextStatus);
            void saveStatus(nextStatus);
          }}
          disabled={isFinalStatus}
          className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${STATUS_SELECT_STYLES[status]}`}
        >
          {Object.entries(ADMIN_REPORT_STATUS_LABELS).map(([value, label]) => (
            <option
              key={value}
              value={value}
              disabled={!allowedStatuses.includes(value as AdminReportStatus)}
              className="bg-white text-slate-900 font-normal"
            >
              {label}
            </option>
          ))}
        </select>
        {isSaving && (
          <span className="self-center text-sm font-semibold text-slate-500">
            Saving...
          </span>
        )}
      </div>
      {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
    </div>
  );
}
