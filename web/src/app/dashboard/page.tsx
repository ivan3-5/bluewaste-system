import { Suspense } from "react";
import { DashboardDateFilter } from "@/components/DashboardDateFilter";
import { DashboardInsights } from "@/components/DashboardInsights";
import { StatsCards } from "@/components/StatsCards";
import { AdminOverviewChartsSkeleton } from "@/components/skeletons/page-skeletons";
import { DEFAULT_DASHBOARD_RANGE, getDashboardPeriod, isDashboardRange, type DashboardRange } from "@/lib/dashboard-period";
import {
  getDashboardCategoryDistribution,
  getDashboardMonthlyTrend,
  getDashboardStats,
} from "@/lib/dashboard-reports";

export const dynamic = "force-dynamic";

async function DashboardStatsSection() {
  const stats = await getDashboardStats();
  return <StatsCards {...stats} />;
}

async function DashboardChartsData({ range }: { range: DashboardRange }) {
  const period = getDashboardPeriod(range);
  const [trend, categories] = await Promise.allSettled([
    getDashboardMonthlyTrend(period),
    getDashboardCategoryDistribution(period),
  ]);

  if (trend.status === "rejected" || categories.status === "rejected") {
    return (
      <p role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200">
        Couldn’t load dashboard data for this date range. Refresh the page to try again.
      </p>
    );
  }

  return (
    <DashboardInsights
      trendData={trend.value}
      categories={categories.value}
      showDaily={period.bucket === "day"}
    />
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string | string[] }>;
}) {
  const { range: requestedRange } = await searchParams;
  const range = isDashboardRange(requestedRange) ? requestedRange : DEFAULT_DASHBOARD_RANGE;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Dashboard Overview
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Waste management for Panabo City coastal areas.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <DashboardDateFilter range={range} />
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Live Updates
          </span>
        </div>
      </div>

      <DashboardStatsSection />

      <Suspense key={range} fallback={<AdminOverviewChartsSkeleton />}>
        <DashboardChartsData range={range} />
      </Suspense>
    </div>
  );
}
