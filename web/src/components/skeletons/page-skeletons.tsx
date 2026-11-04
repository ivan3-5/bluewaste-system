import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function DashboardLayoutSkeleton({
  children,
}: {
  children?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="h-16 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center">
          <Skeleton className="h-8 w-36" />
        </div>
        <div className="flex-1 space-y-2 px-3 py-4">
          {Array.from({ length: 7 }).map((_, idx) => (
            <Skeleton key={idx} className="h-10 w-full rounded-lg" />
          ))}
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
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="mx-auto flex h-[73px] max-w-5xl items-center justify-between px-4 py-3">
          <Skeleton className="h-11 w-36" />
          <div className="hidden md:flex items-center gap-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-9 w-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}

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
        <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-14" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartPanelsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {Array.from({ length: 2 }).map((_, idx) => (
        <div key={idx} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <Skeleton className="mb-4 h-6 w-48" />
          <Skeleton className="h-64 w-full rounded-lg" />
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
    <div className="mb-6 flex flex-wrap items-end gap-3">
      {Array.from({ length: blocks }).map((_, idx) => (
        <div key={idx} className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>
      ))}
      {withSearch && (
        <div className="flex items-end gap-2">
          <div className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-56 rounded-md" />
          </div>
          <Skeleton className="h-9 w-20 rounded-md" />
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
        "overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm",
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
                <td key={colIdx} className="px-4 py-3">
                  <Skeleton
                    className={cn(
                      "h-4",
                      colIdx === 0
                        ? "w-40"
                        : colIdx === cols - 1
                          ? "w-24"
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

export function NotificationListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="flex items-start gap-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
        >
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-4 w-56 max-w-[70%]" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-7 w-20 rounded-md" />
              <Skeleton className="h-7 w-24 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListCardsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
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
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 p-4">
        <Skeleton className="h-4 w-24" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-7 w-20 rounded-full" />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-40 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="ml-auto h-4 w-24" />
        </div>
      </div>
      <div className={cn("relative", heightClassName)}>
        <Skeleton className="h-full w-full rounded-none" />
      </div>
    </div>
  );
}

export function AdminOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeadingSkeleton />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-12 rounded-2xl" />
            </div>
            <Skeleton className="mt-7 h-10 w-12" />
            <Skeleton className="mt-3 h-4 w-28" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div key={idx} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <Skeleton className="mb-4 h-6 w-52" />
            <Skeleton className="h-[280px] w-full rounded-lg" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3">
          <Skeleton className="h-6 w-36" />
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-3"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3">
          <Skeleton className="h-6 w-48" />
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ReportDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center gap-4">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-8 w-64 max-w-[55%]" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-9/12" />
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-9 w-40 rounded-md" />
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton
                  key={idx}
                  className="aspect-square w-full rounded-lg"
                />
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3">
            <Skeleton className="h-6 w-36" />
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3"
            >
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SchedulePageSkeleton() {
  return (
    <div className="space-y-7 pb-12 max-w-[1600px] mx-auto animate-pulse">
      {/* Header Banner Skeleton */}
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
          <Skeleton className="h-10 flex-1 rounded-2xl" />
          <Skeleton className="h-10 w-36 rounded-2xl" />
          <Skeleton className="h-10 w-36 rounded-2xl" />
        </div>
        <Skeleton className="h-10 w-72 rounded-2xl" />
      </div>

      {/* Calendar/List placeholder */}
      <div className="rounded-3xl border border-gray-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 overflow-hidden">
        <div className="border-b border-gray-100 dark:border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="grid grid-cols-7 divide-x divide-gray-100 dark:divide-slate-800">
          {Array.from({ length: 7 }).map((_, idx) => (
            <div key={idx} className="p-3 space-y-2">
              <Skeleton className="h-4 w-8 mx-auto" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 divide-x divide-y divide-gray-100 dark:divide-slate-800">
          {Array.from({ length: 35 }).map((_, idx) => (
            <div key={idx} className="h-24 p-2 space-y-1.5">
              {(idx % 9 === 2 || idx % 11 === 3 || idx % 13 === 5) && (
                <Skeleton className="h-6 w-full rounded-md" />
              )}
            </div>
          ))}
        </div>
      </div>
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
