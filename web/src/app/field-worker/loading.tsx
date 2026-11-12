import {
  PageHeadingSkeleton,
  StatsCardsSkeleton,
  ChartBarsSkeleton,
} from "@/components/skeletons/page-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeadingSkeleton />
        <Skeleton className="h-7 w-32 rounded-full" />
      </div>

      <StatsCardsSkeleton count={4} />

      {/* Operations Box */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-6 w-52" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
        <div className="space-y-3 pt-2">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-64" />
            </div>
          ))}
        </div>
      </div>

      {/* Insight Cards */}
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3 w-32" />
          <ChartBarsSkeleton />
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-36" />
          <div className="flex items-center justify-center py-2">
            <Skeleton className="h-40 w-40 rounded-full" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2.5 w-2.5 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-3 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
