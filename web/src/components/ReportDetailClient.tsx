"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, MapPin, CheckCircle2, Circle, AlertCircle, CalendarDays, FileText } from "lucide-react";
import type { AdminReportStatus } from "@/lib/admin-report";
import { ReportStatusUpdater } from "@/components/ReportStatusUpdater";
import { CombinedReportButton } from "@/components/GenerateReportButton";

export { CombinedReportButton };

export function CopyButton({
  text,
  label = "Copy",
  className = "",
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Copy ${label}`}
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium transition-colors ${
        copied
          ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300"
          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold text-emerald-700 dark:text-emerald-300">Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3 text-slate-500 dark:text-slate-400" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

const STEPS: Array<{ key: AdminReportStatus; label: string }> = [
  { key: "PENDING", label: "Reported" },
  { key: "VERIFIED", label: "Verified" },
  { key: "CLEANUP_SCHEDULED", label: "Scheduled" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "CLEANED", label: "Cleaned" },
];

const STATUS_ORDER: Record<string, number> = {
  PENDING: 0,
  VERIFIED: 1,
  CLEANUP_SCHEDULED: 2,
  IN_PROGRESS: 3,
  CLEANED: 4,
  REJECTED: -1,
};

export function StatusWorkflowStepper({ status }: { status: AdminReportStatus }) {
  if (status === "REJECTED") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-rose-200 dark:border-rose-500/30 bg-rose-50/70 dark:bg-rose-950/40 px-3 py-1.5 text-xs font-medium text-rose-800 dark:text-rose-200">
        <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
        <span>This report has been flagged as <strong>Rejected / Invalid</strong> and removed from the active cleanup queue.</span>
      </div>
    );
  }

  const currentIndex = STATUS_ORDER[status] ?? 0;

  return (
    <div className="w-full">
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {STEPS.map((step, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center text-center">
              <div className="flex items-center w-full">
                <div
                  className={`h-1 flex-1 rounded-full transition-all ${
                    idx === 0
                      ? "invisible"
                      : idx <= currentIndex
                      ? "bg-primary"
                      : "bg-slate-200 dark:bg-slate-800"
                  }`}
                />
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                    isCurrent
                      ? "bg-primary text-white ring-2 ring-primary/20 shadow-xs"
                      : isPassed
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {isPassed ? (
                    <Check className="h-3 w-3 stroke-[3]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <div
                  className={`h-1 flex-1 rounded-full transition-all ${
                    idx === STEPS.length - 1
                      ? "invisible"
                      : idx < currentIndex
                      ? "bg-primary"
                      : "bg-slate-200 dark:bg-slate-800"
                  }`}
                />
              </div>
              <span
                className={`mt-1 text-[11px] leading-tight truncate w-full ${
                  isCurrent
                    ? "font-bold text-primary"
                    : isPassed
                    ? "font-medium text-slate-700 dark:text-slate-300"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function GoogleMapsLink({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition"
    >
      <ExternalLink className="h-3 w-3 text-slate-400" />
      <span>Google Maps</span>
    </a>
  );
}

export function ScheduleCleanupButton({
  reportId,
  status,
  isAlreadyScheduled,
  className = "",
}: {
  reportId: string;
  status: AdminReportStatus;
  isAlreadyScheduled: boolean;
  className?: string;
}) {
  if (isAlreadyScheduled) {
    return (
      <Link
        href="/dashboard/schedules"
        className={`inline-flex items-center gap-1.5 rounded-lg border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition shadow-2xs ${className}`}
        title="View schedule details"
      >
        <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        <span>Scheduled</span>
      </Link>
    );
  }

  const isEligible = status === "VERIFIED";

  if (!isEligible) {
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        title={
          status === "PENDING"
            ? "Report status is Pending. Verify report before scheduling cleanup."
            : "Only verified reports can be scheduled for cleanup."
        }
        className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 opacity-60 cursor-not-allowed shadow-none select-none transition ${className}`}
      >
        <CalendarDays className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
        <span>Schedule Cleanup</span>
      </button>
    );
  }

  return (
    <Link
      href={`/dashboard/schedules?reportId=${encodeURIComponent(reportId)}`}
      className={`inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-primary/90 transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 cursor-pointer ${className}`}
    >
      <CalendarDays className="h-3.5 w-3.5 text-white/90" />
      <span>Schedule Cleanup</span>
    </Link>
  );
}

export function ReportDetailActionHub({
  reportId,
  initialStatus,
  isAlreadyScheduled,
  children,
}: {
  reportId: string;
  initialStatus: AdminReportStatus;
  isAlreadyScheduled: boolean;
  children?: React.ReactNode;
}) {
  const [currentStatus, setCurrentStatus] =
    useState<AdminReportStatus>(initialStatus);

  useEffect(() => {
    setCurrentStatus(initialStatus);
  }, [initialStatus]);

  const isScheduled =
    isAlreadyScheduled ||
    ["CLEANUP_SCHEDULED", "IN_PROGRESS", "CLEANED"].includes(currentStatus);

  return (
    <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t border-slate-100 dark:border-slate-800 lg:border-t-0">
      <ReportStatusUpdater
        reportId={reportId}
        initialStatus={initialStatus}
        compact
        onStatusChange={setCurrentStatus}
      />

      {children}

      <ScheduleCleanupButton
        reportId={reportId}
        status={currentStatus}
        isAlreadyScheduled={isScheduled}
      />
    </div>
  );
}
