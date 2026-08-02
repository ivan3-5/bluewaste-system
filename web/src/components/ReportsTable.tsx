"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useRef, useEffect } from "react";
import Image from "next/image";
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
import { EyeOff, ChevronDown, Check, UserPlus, X } from "lucide-react";

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
                      {(report.reporterName === "Anonymous Citizen" || report.reporterName === "Anonymous" || !report.reporterEmail) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          <EyeOff className="h-3 w-3" /> Anonymous
                        </span>
                      )}
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
                    <ReportAssignmentCell
                      report={report}
                      workers={workers}
                      isLGUAdmin={isLGUAdmin}
                    />
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

function ReportAssignmentCell({
  report,
  workers,
  isLGUAdmin,
}: {
  report: AdminReport;
  workers: Array<{ id: string; firstName: string; lastName: string; email?: string }>;
  isLGUAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const assignWorker = useAssignWorker();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Derived current assigned workers
  const currentWorkers = useMemo(() => {
    if (report.assignedWorkers && report.assignedWorkers.length > 0) {
      return report.assignedWorkers.map((w) => ({
        id: w.id,
        name: `${w.firstName} ${w.lastName}`.trim(),
      }));
    }
    if (report.assignedWorkerNames) {
      return report.assignedWorkerNames.split(", ").map((name) => {
        const found = workers.find(
          (wk) => `${wk.firstName} ${wk.lastName}`.trim().toLowerCase() === name.trim().toLowerCase()
        );
        return {
          id: found ? found.id : name,
          name: name.trim(),
        };
      });
    }
    if (report.assignedToId && report.assignedToName) {
      return [{ id: report.assignedToId, name: report.assignedToName.trim() }];
    }
    return [];
  }, [report.assignedWorkers, report.assignedWorkerNames, report.assignedToId, report.assignedToName, workers]);

  const assignedWorkerIds = useMemo(() => {
    return currentWorkers
      .map((w) => w.id)
      .filter((id) => workers.some((wk) => wk.id === id));
  }, [currentWorkers, workers]);

  const handleToggleWorker = async (workerId: string) => {
    const nextIds = assignedWorkerIds.includes(workerId)
      ? assignedWorkerIds.filter((id) => id !== workerId)
      : [...assignedWorkerIds, workerId];

    setSaving(true);
    try {
      await assignWorker.mutateAsync({ reportId: report.id, workerIds: nextIds });
      router.refresh();
    } catch (err) {
      console.error("Failed to update worker assignment:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveWorker = async (workerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIds = assignedWorkerIds.filter((id) => id !== workerId);
    setSaving(true);
    try {
      await assignWorker.mutateAsync({ reportId: report.id, workerIds: nextIds });
      router.refresh();
    } catch (err) {
      console.error("Failed to remove worker assignment:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!isLGUAdmin) {
    if (currentWorkers.length > 0) {
      return (
        <div className="flex flex-wrap gap-1">
          {currentWorkers.map((w, i) => (
            <span
              key={w.id || i}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                {w.name.charAt(0)}
              </span>
              {w.name}
            </span>
          ))}
        </div>
      );
    }
    return <span className="text-sm text-slate-500">Unassigned</span>;
  }

  return (
    <div className="relative space-y-1" ref={dropdownRef}>
      <div className="flex flex-wrap items-center gap-1 min-w-[140px]">
        {currentWorkers.map((w, i) => {
          const isRemovable = workers.some((wk) => wk.id === w.id);
          return (
            <span
              key={w.id || i}
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-semibold text-blue-800"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                {w.name.charAt(0)}
              </span>
              <span>{w.name}</span>
              {isRemovable && (
                <button
                  type="button"
                  onClick={(e) => handleRemoveWorker(w.id, e)}
                  disabled={saving}
                  className="ml-0.5 rounded-full p-0.5 text-blue-500 hover:bg-blue-200 hover:text-blue-900 transition disabled:opacity-50"
                  title={`Remove ${w.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          );
        })}

        <button
          type="button"
          onClick={() => setOpen(!open)}
          disabled={saving}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-sm disabled:opacity-50"
          title="Assign field workers"
        >
          <UserPlus className="h-3.5 w-3.5 text-blue-600" />
          {currentWorkers.length === 0 ? "Unassigned" : "+ Add"}
          <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {saving && (
        <p className="text-[11px] font-medium text-blue-600 animate-pulse">
          Saving...
        </p>
      )}

      {open && (
        <div className="absolute left-0 z-30 mt-1 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 mb-1.5 px-1">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
              Select Workers
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold hover:underline"
            >
              Done
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {workers.length === 0 ? (
              <p className="p-2 text-xs text-slate-400">No field workers available</p>
            ) : (
              workers.map((worker) => {
                const isSelected = assignedWorkerIds.includes(worker.id);
                return (
                  <label
                    key={worker.id}
                    className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-xs font-medium cursor-pointer transition select-none ${
                      isSelected
                        ? "bg-blue-50 text-blue-900 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleWorker(worker.id)}
                        disabled={saving}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <span>
                        {worker.firstName} {worker.lastName}
                      </span>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-blue-600" />}
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

