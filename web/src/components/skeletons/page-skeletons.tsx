import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ── Layout Skeletons ──────────────────────────────────────────────────────────

export function DashboardLayoutSkeleton({
  children,
}: {
  children?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-40">
        <div className="h-16 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-7 w-7 rounded-lg" />
        </div>
        <div className="flex-1 space-y-2 px-3 py-4">
          {Array.from({ length: 7 }).map((_, idx) => (
            <Skeleton key={idx} className="h-10 w-full rounded-lg" />
          ))}
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-6 flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </header>

        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export function FieldWorkerLayoutSkeleton({
  children,
}: {
  children?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-40">
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 h-16 justify-between px-4">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-7 w-7 rounded-lg" />
        </div>
        <div className="flex-1 px-3 py-4 space-y-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-10 w-full rounded-lg" />
          ))}
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            <Skeleton className="h-6 w-36" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </div>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export function CitizenLayoutSkeleton({
  children,
}: {
  children?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-lg" />
            <Skeleton className="hidden sm:block h-6 w-28" />
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}

// ── Generic Elements ──────────────────────────────────────────────────────────

export function PageHeadingSkeleton({
  withSubtitle = true,
}: {
  withSubtitle?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-56" />
      {withSubtitle && <Skeleton className="h-4 w-72 max-w-full" />}
    </div>
  );
}

export function StatsCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

export function ChartPanelsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {Array.from({ length: 2 }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-28 rounded-xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function ChartBarsSkeleton() {
  const barHeights = [45, 70, 30, 85, 55, 95, 60, 40, 75, 50, 80, 65];
  return (
    <div className="relative h-64 sm:h-72 w-full flex items-end gap-2 sm:gap-3 px-4 pb-4 pt-8">
      {barHeights.map((height, idx) => (
        <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
          <Skeleton
            className="w-full rounded-t-md"
            style={{ height: `${height}%` }}
          />
        </div>
      ))}
    </div>
  );
}

export function FilterToolbarSkeleton({
  blocks = 3,
  withSearch = true,
}: {
  blocks?: number;
  withSearch?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      {Array.from({ length: blocks }).map((_, idx) => (
        <div key={idx} className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>
      ))}
      {withSearch && (
        <div className="flex items-end gap-2 flex-1 min-w-[200px]">
          <div className="space-y-1 flex-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-full max-w-sm rounded-md" />
          </div>
          <Skeleton className="h-10 w-20 rounded-md" />
        </div>
      )}
    </div>
  );
}

export function DataTableSkeleton({
  rows = 6,
  cols = 6,
  className,
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm",
        className,
      )}
    >
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
        <thead className="bg-gray-50 dark:bg-slate-800/60">
          <tr>
            {Array.from({ length: cols }).map((_, idx) => (
              <th key={idx} className="px-4 py-3">
                <Skeleton className="h-3 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              {Array.from({ length: cols }).map((__, colIdx) => (
                <td key={colIdx} className="px-4 py-3.5">
                  <Skeleton
                    className={cn(
                      "h-4",
                      colIdx === 0
                        ? "w-28"
                        : colIdx === 1
                          ? "w-36"
                          : colIdx === cols - 1
                            ? "w-20"
                            : "w-24",
                    )}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TableRowsSkeleton({
  rows = 6,
  cols = 6,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={rowIdx}>
          {Array.from({ length: cols }).map((__, colIdx) => (
            <td key={colIdx} className="px-4 py-3.5">
              <Skeleton
                className={cn(
                  "h-4",
                  colIdx === 0
                    ? "w-28"
                    : colIdx === 1
                      ? "w-36"
                      : colIdx === cols - 1
                        ? "w-20"
                        : "w-24",
                )}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function NotificationListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="flex items-start gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm"
        >
          <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-4 w-48 max-w-[60%]" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListCardsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 shadow-sm overflow-hidden">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex items-start gap-4 px-5 py-4">
          <Skeleton className="mt-1 h-2.5 w-2.5 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
            <div className="flex gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-4 w-4" />
        </div>
      ))}
    </div>
  );
}

export function MapPanelSkeleton({
  heightClassName = "h-[500px] sm:h-[600px]",
}: {
  heightClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-32 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>
      </div>
      <div className={cn("relative bg-slate-100 dark:bg-slate-950 flex items-center justify-center", heightClassName)}>
        <Skeleton className="h-full w-full rounded-none" />
      </div>
    </div>
  );
}

// ── Specialized Page Skeletons ────────────────────────────────────────────────

export function AdminOverviewSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <Skeleton className="h-10 w-16" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trend Bar Chart */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-6 w-52" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-8 w-32 rounded-xl" />
          </div>
          <ChartBarsSkeleton />
        </div>

        {/* Categories Donut Chart */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
          <div className="space-y-1">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-3 w-56" />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-6">
            <Skeleton className="h-44 w-44 rounded-full shrink-0" />
            <div className="space-y-3 w-full sm:w-48">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-3 w-8" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReportsTableSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 p-4 bg-slate-50/40 dark:bg-slate-950/40">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <Skeleton className="h-10 w-44 rounded-xl" />
            <Skeleton className="h-10 w-64 rounded-xl" />
          </div>
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>

        {/* Table with 9 Columns */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/60">
              <tr>
                {["ID", "Reporter", "Category", "Severity", "Status", "Location", "Worker", "Date", "Action"].map(
                  (header, idx) => (
                    <th key={idx} className="px-4 py-3 text-left">
                      <Skeleton className="h-3 w-16" />
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {Array.from({ length: 8 }).map((_, rowIdx) => (
                <tr key={rowIdx}>
                  <td className="px-4 py-3.5"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-5 w-24 rounded-full" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-5 w-20 rounded-full" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-6 w-28 rounded-lg" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-4 w-36" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-4 w-12" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ReportDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-36 rounded-xl" />
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Info Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-7 w-3/4" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>

          {/* Photos Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <Skeleton className="h-6 w-36" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="aspect-video w-full rounded-xl" />
              ))}
            </div>
          </div>

          {/* Map Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Stepper Status Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Worker Assignment Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScheduleCalendarSkeleton() {
  return (
    <div className="rounded-3xl border border-gray-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 overflow-hidden shadow-sm">
      <div className="border-b border-gray-100 dark:border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="grid grid-cols-7 divide-x divide-gray-100 dark:divide-slate-800 bg-gray-50/50 dark:bg-slate-800/40">
        {Array.from({ length: 7 }).map((_, idx) => (
          <div key={idx} className="p-3 text-center">
            <Skeleton className="h-3 w-8 mx-auto" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 divide-x divide-y divide-gray-100 dark:divide-slate-800">
        {Array.from({ length: 35 }).map((_, idx) => (
          <div key={idx} className="h-24 p-2 space-y-1.5">
            <Skeleton className="h-3 w-4 ml-auto" />
            {(idx % 7 === 1 || idx % 7 === 4) && (
              <Skeleton className="h-5 w-full rounded-md" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScheduleListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-5 w-52 max-w-[70%]" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-20 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SchedulePageSkeleton() {
  return (
    <div className="space-y-7 pb-12 max-w-[1600px] mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/40 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-800 rounded-3xl border border-gray-200/80 dark:border-slate-800 p-6 md:p-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-52 rounded-full" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>
            <Skeleton className="h-10 w-80 rounded-xl" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-2xl" />
            <Skeleton className="h-11 w-48 rounded-2xl" />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-2"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="w-10 h-10 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/70 p-3.5 rounded-3xl border border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5 flex-1">
          <Skeleton className="h-10 flex-1 max-w-sm rounded-2xl" />
          <Skeleton className="h-10 w-36 rounded-2xl" />
          <Skeleton className="h-10 w-36 rounded-2xl" />
        </div>
        <Skeleton className="h-10 w-48 rounded-2xl" />
      </div>

      {/* Calendar Grid Placeholder */}
      <ScheduleCalendarSkeleton />
    </div>
  );
}

export function UsersPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200/80 dark:border-slate-800 p-4 bg-slate-50/40 dark:bg-slate-950/40">
          <Skeleton className="h-10 w-[180px] rounded-xl" />
          <Skeleton className="h-10 w-64 max-w-sm flex-1 rounded-xl" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/60">
              <tr>
                {["Name", "Email", "Role", "Phone", "Status", "Joined", "Actions"].map(
                  (header, idx) => (
                    <th key={idx} className="px-4 py-3 text-left">
                      <Skeleton className="h-3 w-16" />
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {Array.from({ length: 8 }).map((_, rowIdx) => (
                <tr key={rowIdx}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><Skeleton className="h-4 w-44" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-5 w-24 rounded-full" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-5 w-20 rounded-full" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-8 w-16 rounded-lg" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function SpamPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/60">
              <tr>
                {["Photo", "Location", "Category", "Reason", "Flagged At", "Auto-Delete", "Actions"].map(
                  (header, idx) => (
                    <th key={idx} className="px-4 py-3 text-left">
                      <Skeleton className="h-3 w-16" />
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {Array.from({ length: 8 }).map((_, rowIdx) => (
                <tr key={rowIdx}>
                  <td className="px-4 py-3.5"><Skeleton className="h-12 w-12 rounded-lg" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-4 w-36" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-5 w-24 rounded-full" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-4 w-48" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-4 py-3.5"><Skeleton className="h-8 w-20 rounded-lg" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function DashboardNotificationsSkeleton() {
  return (
    <div className="space-y-7 pb-12 max-w-[1600px] mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 rounded-3xl border border-gray-200/80 dark:border-slate-800 p-6 md:p-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-48 rounded-full" />
              <Skeleton className="h-6 w-36 rounded-full" />
            </div>
            <Skeleton className="h-10 w-72 rounded-xl" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <Skeleton className="h-11 w-40 rounded-2xl" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-2"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-9 w-28 rounded-xl shrink-0" />
          ))}
        </div>
        <Skeleton className="h-9 w-56 rounded-xl" />
      </div>

      {/* Notification Cards */}
      <NotificationListSkeleton rows={6} />
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>

        {/* User Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <Skeleton className="h-24 w-24 rounded-full shrink-0" />
          <div className="space-y-2 flex-1 text-center sm:text-left">
            <Skeleton className="h-6 w-48 mx-auto sm:mx-0" />
            <Skeleton className="h-4 w-60 mx-auto sm:mx-0" />
            <Skeleton className="h-6 w-28 rounded-full mx-auto sm:mx-0" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>

        {/* Form Fields */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
          <Skeleton className="h-5 w-40" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function TaskCardsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex flex-col bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden p-5 gap-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-lg" />
          </div>

          <div className="flex gap-4 sm:gap-5">
            <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <Skeleton className="h-6 w-24 rounded-md" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FieldWorkerTasksSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <Skeleton className="h-12 w-28 rounded-lg" />
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Skeleton key={idx} className="h-9 w-28 rounded-full shrink-0" />
        ))}
      </div>

      {/* Task Cards Grid */}
      <TaskCardsGridSkeleton count={6} />
    </div>
  );
}

export function FieldWorkerTaskDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-4 pb-8">
      {/* Top navigation skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-28 rounded-xl" />
        <Skeleton className="h-7 w-36 rounded-xl" />
      </div>

      {/* Header card skeleton */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-6 w-3/5" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <Skeleton className="h-9 rounded-lg" />
          <Skeleton className="h-9 rounded-lg" />
          <Skeleton className="h-9 rounded-lg" />
        </div>
      </div>

      {/* 2-column grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left column (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="border-b border-slate-100 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <Skeleton className="h-64 sm:h-[320px] w-full rounded-none" />
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-44 rounded-xl" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} className="aspect-square rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Right column (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MyReportsCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900 p-5 shadow-sm space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/5" />
              <Skeleton className="h-4 w-4/5" />
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-md" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
            <Skeleton className="h-20 w-20 rounded-xl shrink-0 self-start sm:self-center" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MyReportsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 5 }).map((_, idx) => (
          <Skeleton key={idx} className="h-8 w-24 rounded-full shrink-0" />
        ))}
      </div>

      {/* Cards List */}
      <MyReportsCardsSkeleton count={4} />
    </div>
  );
}

export function ReportFormSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <div className="space-y-2 text-center sm:text-left">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      {/* Photo Upload Box */}
      <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-4">
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <div className="space-y-2 max-w-sm mx-auto">
          <Skeleton className="h-5 w-48 mx-auto" />
          <Skeleton className="h-3 w-64 mx-auto" />
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* Location Picker Box */}
      <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-8 w-28 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>

      {/* Form Fields */}
      <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}
