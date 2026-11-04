"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useReports, useDeleteSpamReport } from "@/hooks/useReports";
import { Button } from "@/components/ui/button";
import { WASTE_CATEGORY_LABELS } from "@/types";
import { formatDateTime } from "@/lib/utils";
import {
  DataTableSkeleton,
  FilterToolbarSkeleton,
  PageHeadingSkeleton,
} from "@/components/skeletons/page-skeletons";
import { PaginationControls } from "@/components/ui/pagination";

const RETENTION_DAYS = 3;

function getAutoDeleteAt(spamMarkedAt?: string | null) {
  if (!spamMarkedAt) return null;
  const base = new Date(spamMarkedAt);
  if (Number.isNaN(base.getTime())) return null;
  return new Date(base.getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000);
}

/** Returns a formatted confidence string (e.g. "12.5%") or "—" if unknown. */
function formatConfidence(value?: number | null): string {
  if (value === null || value === undefined) return "—";
  // analysisConfidence is stored as 0.0–1.0 fraction
  const pct = value <= 1 ? value * 100 : value;
  return `${pct.toFixed(1)}%`;
}

/** Determines whether spam originated from the citizen (client-side YOLO)
 *  or was auto-flagged by the backend after image upload. */
function getSpamSource(report: {
  spamReason?: string | null;
}): { label: string; color: string } {
  const reason = (report.spamReason ?? "").toLowerCase();
  if (reason.includes("yolov8") || reason.includes("no waste detected by")) {
    return { label: "Citizen flagged", color: "bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300" };
  }
  return { label: "Auto-detected", color: "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300" };
}

export default function SpamReportsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useReports({
    page,
    limit: pageSize,
    isSpam: true,
  });

  const deleteSpam = useDeleteSpamReport();

  const reports = useMemo(() => data?.data || [], [data?.data]);
  const pagination = data?.pagination;

  const pendingAction = deleteSpam.isPending;

  const records = useMemo(
    () =>
      reports.map((report) => {
        const autoDeleteAt = getAutoDeleteAt(report.spamMarkedAt);
        return {
          ...report,
          autoDeleteAt,
        };
      }),
    [reports],
  );

  if (isLoading) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <PageHeadingSkeleton withSubtitle={false} />
        </div>
        <FilterToolbarSkeleton blocks={2} />
        <DataTableSkeleton rows={8} cols={7} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Spam Reports</h1>
          {pagination && (
            <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">
              {pagination.total} spam report{pagination.total !== 1 ? "s" : ""}
              {" — "}reports flagged as having no waste detected; excluded from
              the main reports list.
            </p>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
          <thead className="bg-gray-50 dark:bg-slate-800/80">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
                Image
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
                Report
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
                Source
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
                Confidence
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
                Reason
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
                Marked Spam
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
                Auto Delete
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {records.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-gray-400 dark:text-slate-500"
                >
                  No spam reports
                </td>
              </tr>
            ) : (
              records.map((report) => {
                const source = getSpamSource(report);
                return (
                  <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      {report.images?.[0]?.imageUrl ? (
                        <Image
                          src={report.images[0].imageUrl}
                          alt={report.title}
                          width={56}
                          height={56}
                          className="h-14 w-14 rounded-md border border-gray-200 dark:border-slate-700 object-cover"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-md border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="max-w-[240px] truncate text-sm font-medium text-gray-800 dark:text-slate-200">
                        {report.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                        {WASTE_CATEGORY_LABELS[report.category]}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${source.color}`}
                      >
                        {source.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-gray-700 dark:text-slate-300">
                      {formatConfidence(report.analysisConfidence)}
                    </td>
                    <td className="max-w-[260px] px-4 py-3 text-sm text-gray-600 dark:text-slate-400">
                      {report.spamReason ||
                        "No visible waste or pollution detected in the submitted image."}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-slate-400">
                      {report.spamMarkedAt
                        ? formatDateTime(report.spamMarkedAt)
                        : "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-slate-400">
                      {report.autoDeleteAt
                        ? formatDateTime(report.autoDeleteAt.toISOString())
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          className="bg-red-600 text-white hover:bg-red-700"
                          disabled={pendingAction}
                          onClick={async () => {
                            await deleteSpam.mutateAsync(report.id);
                          }}
                        >
                          Delete Now
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <PaginationControls
          currentPage={page}
          totalRecords={pagination.total}
          pageSize={pageSize}
          totalPages={pagination.totalPages}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          disabled={pendingAction}
          itemName="spam reports"
          className="mt-4 bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-gray-200 dark:border-slate-800"
        />
      )}
    </div>
  );
}
