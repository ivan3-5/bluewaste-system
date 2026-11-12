"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useReports, useDeleteSpamReport } from "@/hooks/useReports";
import { Button } from "@/components/ui/button";
import { WASTE_CATEGORY_LABELS } from "@/types";
import { cn, formatDateTime } from "@/lib/utils";
import { SpamPageSkeleton } from "@/components/skeletons/page-skeletons";
import { PageHeader } from "@/components/layout/PageHeader";
import { PaginationControls } from "@/components/ui/pagination";

const RETENTION_DAYS = 3;

const TH_CLASS =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400";

function getAutoDeleteAt(spamMarkedAt?: string | null) {
  if (!spamMarkedAt) return null;
  const base = new Date(spamMarkedAt);
  if (Number.isNaN(base.getTime())) return null;
  return new Date(base.getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000);
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
    return <SpamPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Spam Reports"
        description={
          <>
            Reports flagged as having no waste detected;
            excluded from the main reports list.
            {pagination && (
              <>
                {" "}
                {pagination.total} spam report{pagination.total !== 1 ? "s" : ""}.
              </>
            )}
          </>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/60">
              <tr>
                <th className={TH_CLASS}>Image</th>
                <th className={TH_CLASS}>Report</th>
                <th className={TH_CLASS}>Source</th>
                <th className={TH_CLASS}>Reason</th>
                <th className={TH_CLASS}>Marked Spam</th>
                <th className={TH_CLASS}>Auto Delete</th>
                <th className={TH_CLASS}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {records.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    No spam reports
                  </td>
                </tr>
              ) : (
                records.map((report) => {
                  const source = getSpamSource(report);
                  return (
                    <tr
                      key={report.id}
                      className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3">
                        {report.images?.[0]?.imageUrl ? (
                          <Image
                            src={report.images[0].imageUrl}
                            alt={report.title}
                            width={56}
                            height={56}
                            className="h-14 w-14 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-xl bg-slate-100 dark:bg-slate-800" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="max-w-[240px] truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {report.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {WASTE_CATEGORY_LABELS[report.category]}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                            source.color,
                          )}
                        >
                          {source.label}
                        </span>
                      </td>
                      <td className="max-w-[260px] px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {report.spamReason ||
                          "No visible waste or pollution detected in the submitted image."}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {report.spamMarkedAt
                          ? formatDateTime(report.spamMarkedAt)
                          : "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {report.autoDeleteAt
                          ? formatDateTime(report.autoDeleteAt.toISOString())
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          className="rounded-lg bg-red-600 font-semibold text-white hover:bg-red-700"
                          disabled={pendingAction}
                          onClick={async () => {
                            await deleteSpam.mutateAsync(report.id);
                          }}
                        >
                          Delete Now
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pb-3">
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
            />
          </div>
        )}
      </div>
    </div>
  );
}
