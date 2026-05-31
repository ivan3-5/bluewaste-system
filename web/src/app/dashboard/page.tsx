import { StatsCards } from "@/components/StatsCards";
import { DashboardInsights } from "@/components/DashboardInsights";
import {
  getDashboardCategoryDistribution,
  getDashboardStats,
  getDashboardTrend,
} from "@/lib/dashboard-reports";

export default async function DashboardPage() {
  const [statsResult, trendResult, categoriesResult] = await Promise.allSettled(
    [
      getDashboardStats(),
      getDashboardTrend(30),
      getDashboardCategoryDistribution(),
    ],
  );

  const stats =
    statsResult.status === "fulfilled"
      ? statsResult.value
      : {
          totalReports: 0,
          pendingCount: 0,
          inProgressCount: 0,
          cleanedCount: 0,
        };

  const trend = trendResult.status === "fulfilled" ? trendResult.value : [];
  const categories =
    categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
  const hasDatabaseError =
    statsResult.status === "rejected" ||
    trendResult.status === "rejected" ||
    categoriesResult.status === "rejected";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Dashboard Overview
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Waste management statistics for Panabo City.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Live Updates
        </span>
      </div>

      {hasDatabaseError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Dashboard data is unavailable because Prisma cannot reach the database
          right now. Check `DATABASE_URL`, confirm the Neon server is online,
          and reload after the connection is restored.
        </div>
      ) : null}

      <StatsCards
        totalReports={stats.totalReports}
        pendingCount={stats.pendingCount}
        inProgressCount={stats.inProgressCount}
        cleanedCount={stats.cleanedCount}
      />

      <DashboardInsights trend={trend} categories={categories} />
    </div>
  );
}
