"use client";

import { useMemo, useState } from "react";
import { useReports, useDeleteSpamReport } from "@/hooks/useReports";
import { Button } from "@/components/ui/button";
import { WASTE_CATEGORY_LABELS } from "@/types";
import { formatDateTime } from "@/lib/utils";
import {
  DataTableSkeleton,
  FilterToolbarSkeleton,
  PageHeadingSkeleton,
} from "@/components/skeletons/page-skeletons";

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
    return { label: "Citizen flagged", color: "bg-orange-100 text-orange-700" };
  }
  return { label: "Auto-detected", color: "bg-blue-100 text-blue-700" };
}

export default function SpamReportsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useReports({
    page,
    limit: 15,
    isSpam: true,
  });

  const deleteSpam = useDeleteSpamReport();

  const reports = data?.data || [];
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
          <h1 className="text-2xl font-bold text-gray-800">Spam Reports</h1>
          {pagination && (
            <p className="mt-0.5 text-sm text-gray-500">
              {pagination.total} spam report{pagination.total !== 1 ? "s" : ""}
              {" — "}reports flagged as having no waste detected; excluded from
              the main reports list.
            </p>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Image
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Report
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Source
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                YOLO Confidence
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Reason
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Marked Spam
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Auto Delete
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-gray-400"
                >
                  No spam reports
                </td>
              </tr>
            ) : (
              records.map((report) => {
                const source = getSpamSource(report);
                return (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {report.images?.[0]?.imageUrl ? (
                        <img
                          src={report.images[0].imageUrl}
                          alt={report.title}
                          className="h-14 w-14 rounded-md border border-gray-200 object-cover"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-md border border-gray-200 bg-gray-100" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="max-w-[240px] truncate text-sm font-medium text-gray-800">
                        {report.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
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
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-gray-700">
                      {formatConfidence(report.analysisConfidence)}
                    </td>
                    <td className="max-w-[260px] px-4 py-3 text-sm text-gray-600">
                      {report.spamReason ||
                        "No visible waste or pollution detected in the submitted image."}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {report.spamMarkedAt
                        ? formatDateTime(report.spamMarkedAt)
                        : "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
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

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1 || pendingAction}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={
                pagination.page >= pagination.totalPages || pendingAction
              }
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
