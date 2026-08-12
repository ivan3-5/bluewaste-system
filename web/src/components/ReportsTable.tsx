"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, Loader2 } from "lucide-react";
import {
  ADMIN_REPORT_STATUS_LABELS,
  type AdminReport,
  type AdminReportStatus,
} from "@/lib/admin-report";
import { CategoryBadge } from "@/components/CategoryBadge";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLiveNotifications } from "@/contexts/LiveNotificationContext";


type ReportsTableProps = {
  reports: AdminReport[];
  compact?: boolean;
  showControls?: boolean;
};

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

export function ReportsTable({
  reports,
  compact = false,
  showControls = true,
}: ReportsTableProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { pushToast } = useLiveNotifications();
  const [statusFilter, setStatusFilter] = useState<AdminReportStatus | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusDrafts, setStatusDrafts] = useState<
    Record<string, AdminReportStatus>
  >({});
  const [savingStatusReportId, setSavingStatusReportId] = useState<
    string | null
  >(null);

  const isLGUAdmin = user?.role === "LGU_ADMIN";

  const visibleReports = useMemo(() => {
    return reports.filter((report) => {
      // SPAM severity reports are automatically routed to /dashboard/spam
      if (report.severity === "SPAM") return false;

      if (statusFilter && report.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matches = [
          report.reporterName,
          report.reporterEmail,
          report.assignedToName,
          report.locationName,
          report.description,
          report.status,
          report.category,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q));

        if (!matches) return false;
      }

      return true;
    });
  }, [reports, searchQuery, statusFilter]);

  const handleSaveStatus = async (
    report: AdminReport,
    nextStatus: AdminReportStatus,
  ) => {
    if (!nextStatus || nextStatus === report.status) return;

    const allowedStatuses = STATUS_FLOW[report.status] || [];
    if (!allowedStatuses.includes(nextStatus)) return;

    setSavingStatusReportId(report.id);
    try {
      const response = await fetch(`/api/reports/${report.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message || "Failed to update status.");
      }

      pushToast({
        id: `status-${report.id}-${Date.now()}`,
        title: "Status Updated",
        message: `Report status changed to ${ADMIN_REPORT_STATUS_LABELS[nextStatus]}.`,
        type: "STATUS_CHANGE",
        variant: "success",
        isRead: true,
        createdAt: new Date().toISOString(),
      });

      router.refresh();
    } catch (error) {
      pushToast({
        id: `status-err-${report.id}-${Date.now()}`,
        title: "Update Failed",
        message: error instanceof Error ? error.message : "Failed to update status.",
        type: "STATUS_CHANGE",
        variant: "error",
        isRead: true,
        createdAt: new Date().toISOString(),
      });
      setStatusDrafts((current) => {
        const next = { ...current };
        delete next[report.id];
        return next;
      });
    } finally {
      setSavingStatusReportId(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {showControls && (
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200/80 p-4 bg-slate-50/40">

          <Select
            value={statusFilter || "all"}
            onValueChange={(val) =>
              setStatusFilter(val === "all" ? "" : (val as AdminReportStatus))
            }
          >
            <SelectTrigger
              className={cn(
                "w-[180px] rounded-xl font-semibold transition-all shadow-xs",
                statusFilter
                  ? STATUS_TRIGGER_STYLES[statusFilter]
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50/80"
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full shrink-0",
                    statusFilter ? STATUS_DOT_COLORS[statusFilter] : "bg-slate-400"
                  )}
                />
                <SelectValue placeholder="All Statuses" />
              </div>
            </SelectTrigger>
            <SelectContent className="w-[210px]">
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  <span>All Statuses</span>
                </div>
              </SelectItem>
              {Object.entries(ADMIN_REPORT_STATUS_LABELS).map(
                ([key, label]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full shrink-0",
                          STATUS_DOT_COLORS[key as AdminReportStatus]
                        )}
                      />
                      <span>{label}</span>
                    </div>
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>

          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search reports..."
              aria-label="Search reports"
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Image
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Severity
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reporter
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Assigned
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reported
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleReports.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-sm text-slate-500"
                >
                  No reports match the current filters.
                </td>
              </tr>
            ) : (
              visibleReports.map((report) => {
                const currentStatus = statusDrafts[report.id] ?? report.status;
                const isSaving = savingStatusReportId === report.id;
                const allowedStatuses = STATUS_FLOW[report.status] || [];

                return (
                  <tr key={report.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <Image
                        src={report.imageUrl}
                        alt={report.locationName}
                        width={56}
                        height={56}
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <CategoryBadge category={report.category} />
                    </td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={report.severity} showFallback />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <p className="max-w-[240px] truncate text-sm font-semibold text-slate-900">
                          {report.reporterName || "Anonymous Citizen"}
                        </p>
                      </div>
                      {report.reporterEmail ? (
                        <p className="max-w-[240px] truncate text-xs text-slate-500">
                          {report.reporterEmail}
                        </p>
                      ) : (
                        <p className="max-w-[240px] truncate text-xs text-slate-400 italic">
                          Identity hidden
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      <ReportAssignmentCell report={report} />
                    </td>
                    <td className="px-4 py-3">
                      {isLGUAdmin ? (
                        <Select
                          value={currentStatus}
                          disabled={isSaving}
                          onValueChange={(nextValue) => {
                            const nextStatus = nextValue as AdminReportStatus;
                            setStatusDrafts((current) => ({
                              ...current,
                              [report.id]: nextStatus,
                            }));
                            void handleSaveStatus(report, nextStatus);
                          }}
                        >
                          <SelectTrigger
                            className={cn(
                              "h-9 w-[170px] rounded-full px-3 text-xs font-semibold shadow-xs transition-all duration-150 border",
                              STATUS_TRIGGER_STYLES[currentStatus]
                            )}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {isSaving ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500 shrink-0" />
                              ) : (
                                <span
                                  className={cn(
                                    "h-2 w-2 rounded-full shrink-0",
                                    STATUS_DOT_COLORS[currentStatus]
                                  )}
                                />
                              )}
                              <span className="truncate">
                                {ADMIN_REPORT_STATUS_LABELS[currentStatus]}
                              </span>
                            </div>
                          </SelectTrigger>
                          <SelectContent className="w-[210px]">
                            {Object.entries(ADMIN_REPORT_STATUS_LABELS).map(
                              ([value, label]) => {
                                const isCurrent = value === report.status;
                                const isAllowed = allowedStatuses.includes(
                                  value as AdminReportStatus
                                );
                                const disabled = !isCurrent && !isAllowed;

                                return (
                                  <SelectItem
                                    key={value}
                                    value={value}
                                    disabled={disabled}
                                    className={cn(
                                      "py-2 text-xs",
                                      isCurrent && "font-semibold text-blue-600 bg-blue-50/70"
                                    )}
                                  >
                                    <div className="flex items-center justify-between w-full gap-2">
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={cn(
                                            "h-2 w-2 rounded-full shrink-0",
                                            STATUS_DOT_COLORS[
                                              value as AdminReportStatus
                                            ]
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
                              }
                            )}
                          </SelectContent>
                        </Select>
                      ) : (
                        <StatusBadge status={report.status} />
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {new Date(report.reportedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/reports/${report.id}`}
                        className="inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-primary/90"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportAssignmentCell({ report }: { report: AdminReport }) {
  const currentWorkers = useMemo(() => {
    if (report.assignedWorkers && report.assignedWorkers.length > 0) {
      return report.assignedWorkers.map((w) => ({
        id: w.id,
        name: `${w.firstName} ${w.lastName}`.trim(),
      }));
    }
    if (report.assignedWorkerNames) {
      return report.assignedWorkerNames.split(", ").map((name, i) => ({
        id: `name-${i}`,
        name: name.trim(),
      }));
    }
    if (report.assignedToId && report.assignedToName) {
      return [{ id: report.assignedToId, name: report.assignedToName.trim() }];
    }
    return [];
  }, [report.assignedWorkers, report.assignedWorkerNames, report.assignedToId, report.assignedToName]);

  if (currentWorkers.length === 0) {
    return <span className="text-sm text-slate-400 italic">Unassigned</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {currentWorkers.map((w, i) => (
        <div key={w.id || i} className="group relative inline-flex">
          <span
            title={w.name}
            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-xs transition-transform duration-150 group-hover:scale-105 group-hover:bg-blue-700"
          >
            {w.name.charAt(0).toUpperCase()}
          </span>
          {/* Tooltip on hover */}
          <div className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 opacity-0 transition-all duration-150 group-hover:opacity-100 z-30">
            <div className="whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-medium text-white shadow-md">
              {w.name}
            </div>
            <div className="mx-auto -mt-1 h-1.5 w-1.5 rotate-45 bg-slate-900" />
          </div>
        </div>
      ))}
    </div>
  );
}

