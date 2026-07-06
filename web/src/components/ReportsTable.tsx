"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ADMIN_REPORT_CATEGORY_LABELS,
  ADMIN_REPORT_STATUS_LABELS,
  type AdminReport,
  type AdminReportCategory,
  type AdminReportStatus,
} from "@/lib/admin-report";
import { CategoryBadge } from "@/components/CategoryBadge";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/providers/AuthProvider";
import { useAssignWorker } from "@/hooks/useReports";
import { useUsers } from "@/hooks/useUsers";

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

const STATUS_SELECT_STYLES: Record<AdminReportStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700 focus:ring-amber-500",
  VERIFIED: "border-blue-200 bg-blue-50 text-blue-700 focus:ring-blue-500",
  CLEANUP_SCHEDULED: "border-violet-200 bg-violet-50 text-violet-700 focus:ring-violet-500",
  IN_PROGRESS: "border-orange-200 bg-orange-50 text-orange-700 focus:ring-orange-500",
  CLEANED: "border-emerald-200 bg-emerald-50 text-emerald-700 focus:ring-emerald-500",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700 focus:ring-rose-500",
};

export function ReportsTable({
  reports,
  compact = false,
  showControls = true,
}: ReportsTableProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState<
    AdminReportCategory | ""
  >("");
  const [statusFilter, setStatusFilter] = useState<AdminReportStatus | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [assignmentDrafts, setAssignmentDrafts] = useState<
    Record<string, string>
  >({});
  const [savingReportId, setSavingReportId] = useState<string | null>(null);
  const [statusDrafts, setStatusDrafts] = useState<
    Record<string, AdminReportStatus>
  >({});
  const [savingStatusReportId, setSavingStatusReportId] = useState<
    string | null
  >(null);

  const { data: workersData } = useUsers({ role: "FIELD_WORKER", limit: 100 });
  const assignWorker = useAssignWorker();
  const isLGUAdmin = user?.role === "LGU_ADMIN";
  const workers = workersData?.data || [];

  const visibleReports = useMemo(() => {
    return reports.filter((report) => {
      // SPAM severity reports are automatically routed to /dashboard/spam
      if (report.severity === "SPAM") return false;

      if (categoryFilter && report.category !== categoryFilter) return false;
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
  }, [categoryFilter, reports, searchQuery, statusFilter]);

  const handleAssignWorker = async (reportId: string, assignedToId: string) => {
    if (!assignedToId) return;

    setSavingReportId(reportId);
    try {
      await assignWorker.mutateAsync({ reportId, assignedToId });
      router.refresh();
      setAssignmentDrafts((current) => {
        const next = { ...current };
        delete next[reportId];
        return next;
      });
    } catch {
      setAssignmentDrafts((current) => {
        const next = { ...current };
        delete next[reportId];
        return next;
      });
    } finally {
      setSavingReportId(null);
    }
  };

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

      router.refresh();
    } catch {
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
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value as AdminReportCategory | "")
            }
            aria-label="Filter reports by category"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            {Object.entries(ADMIN_REPORT_CATEGORY_LABELS).map(
              ([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ),
            )}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as AdminReportStatus | "")
            }
            aria-label="Filter reports by status"
            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              statusFilter
                ? STATUS_SELECT_STYLES[statusFilter]
                : "border-slate-200 bg-white text-slate-900 focus:ring-blue-500"
            }`}
          >
            <option value="" className="bg-white text-slate-900 font-normal">All Statuses</option>
            {Object.entries(ADMIN_REPORT_STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key} className="bg-white text-slate-900 font-normal">
                {label}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search reports..."
            aria-label="Search reports"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          />
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
              visibleReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <img
                      src={report.imageUrl}
                      alt={report.locationName}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <CategoryBadge category={report.category} />
                  </td>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={report.severity} />
                  </td>
                  <td className="px-4 py-3">
                    <p className="max-w-[240px] truncate text-sm font-semibold text-slate-900">
                      {report.reporterName || "Anonymous"}
                    </p>
                    <p className="max-w-[240px] truncate text-xs text-slate-500">
                      {report.reporterEmail || "No email available."}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {isLGUAdmin ? (
                      <div className="space-y-2">
                        {/* If schedule workers exist, show them as read-only pills */}
                        {report.assignedWorkerNames ? (
                          <div className="flex flex-wrap gap-1">
                            {report.assignedWorkerNames.split(", ").map((name, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800"
                              >
                                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                                  {name.trim().charAt(0)}
                                </span>
                                {name.trim()}
                              </span>
                            ))}
                          </div>
                        ) : report.assignedToName ? (
                          /* Directly assigned (not via schedule) — show single pill */
                          <div className="flex flex-wrap gap-1">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                                {report.assignedToName.trim().charAt(0)}
                              </span>
                              {report.assignedToName.trim()}
                            </span>
                          </div>
                        ) : (
                          /* No assignment yet — show dropdown to assign manually */
                          <select
                            value={assignmentDrafts[report.id] ?? ""}
                            onChange={(event) => {
                              const nextAssignedToId = event.target.value;
                              if (!nextAssignedToId) return;
                              setAssignmentDrafts((current) => ({
                                ...current,
                                [report.id]: nextAssignedToId,
                              }));
                              void handleAssignWorker(report.id, nextAssignedToId);
                            }}
                            aria-label={`Assign field worker for report ${report.id}`}
                            disabled={savingReportId === report.id}
                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-medium text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <option value="">Unassigned</option>
                            {workers.map((worker) => (
                              <option key={worker.id} value={worker.id}>
                                {worker.firstName} {worker.lastName}
                              </option>
                            ))}
                          </select>
                        )}
                        {savingReportId === report.id && (
                          <p className="text-xs text-primary animate-pulse">
                            Saving assignment…
                          </p>
                        )}
                      </div>
                    ) : (
                      // Non-admin view
                      report.assignedWorkerNames ?? report.assignedToName ?? "Unassigned"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isLGUAdmin ? (
                      <div className="space-y-2">
                        <select
                          value={statusDrafts[report.id] ?? report.status}
                          onChange={(event) => {
                            const nextStatus = event.target
                              .value as AdminReportStatus;

                            setStatusDrafts((current) => ({
                              ...current,
                              [report.id]: nextStatus,
                            }));

                            void handleSaveStatus(report, nextStatus);
                          }}
                          aria-label={`Update status for report ${report.id}`}
                          disabled={savingStatusReportId === report.id}
                          className={`w-full rounded-lg border px-2 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                            STATUS_SELECT_STYLES[statusDrafts[report.id] ?? report.status]
                          }`}
                        >
                          {Object.entries(ADMIN_REPORT_STATUS_LABELS).map(
                            ([value, label]) => {
                              const isCurrent = value === report.status;
                              const isAllowed = STATUS_FLOW[
                                report.status
                              ].includes(value as AdminReportStatus);

                              return (
                                <option
                                  key={value}
                                  value={value}
                                  disabled={!isCurrent && !isAllowed}
                                  className="bg-white text-slate-900 font-normal"
                                >
                                  {label}
                                </option>
                              );
                            },
                          )}
                        </select>
                      </div>
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
