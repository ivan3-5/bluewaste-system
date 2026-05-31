type TrendPoint = {
  day: Date;
  count: number;
};

type CategoryPoint = {
  key: string;
  label: string;
  count: number;
};

type DashboardInsightsProps = {
  trend: TrendPoint[];
  categories: CategoryPoint[];
};

const CATEGORY_COLORS = ["#3b82f6", "#84cc16"];

function formatDayLabel(day: Date) {
  return day.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function toDonutGradient(categories: CategoryPoint[]) {
  const total = categories.reduce((sum, item) => sum + item.count, 0);
  if (total <= 0) {
    return "conic-gradient(#cbd5e1 0deg 360deg)";
  }

  let cursor = 0;
  const segments = categories.map((item, index) => {
    const sweep = (item.count / total) * 360;
    const start = cursor;
    cursor += sweep;
    return `${CATEGORY_COLORS[index % CATEGORY_COLORS.length]} ${start}deg ${cursor}deg`;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

export function DashboardInsights({
  trend,
  categories,
}: DashboardInsightsProps) {
  const maxTrend = Math.max(1, ...trend.map((item) => item.count));
  const totalReports = categories.reduce((sum, item) => sum + item.count, 0);
  const donutGradient = toDonutGradient(categories);
  const prevRangeTotal = trend
    .slice(0, Math.max(1, Math.floor(trend.length / 2)))
    .reduce((sum, item) => sum + item.count, 0);
  const latestRangeTotal = trend
    .slice(Math.max(1, Math.floor(trend.length / 2)))
    .reduce((sum, item) => sum + item.count, 0);
  const trendDeltaPct =
    prevRangeTotal > 0
      ? Math.round(((latestRangeTotal - prevRangeTotal) / prevRangeTotal) * 100)
      : latestRangeTotal > 0
        ? 100
        : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Report Trends (Last 30 Days)
            </h2>
            <p className="text-sm text-slate-500">
              Daily submissions across the city
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-500">
            <span aria-hidden="true">↗</span>+{trendDeltaPct}% from last period
          </span>
        </div>

        <div className="relative h-56 overflow-hidden rounded-xl border border-slate-100 bg-slate-50/70 px-3 pb-4 pt-3">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:28px_28px]" />
          <span className="pointer-events-none absolute left-5 top-3 text-xs text-slate-400">
            30 days
          </span>
          <div
            className="relative grid h-full items-end gap-1"
            style={{
              gridTemplateColumns: `repeat(${Math.max(1, trend.length)}, minmax(0, 1fr))`,
            }}
          >
            {trend.map((item, index) => {
              const normalized =
                maxTrend > 0 ? Math.min(1, item.count / maxTrend) : 0;
              const barHeightPercent =
                item.count <= 0
                  ? 0
                  : Math.max(8, Math.round((item.count / maxTrend) * 100));
              const isLast = index === trend.length - 1;
              const barOpacity =
                item.count <= 0 ? 0 : Math.max(0.3, 0.45 + normalized * 0.55);
              return (
                <div
                  key={`${item.day.toISOString()}-${index}`}
                  className="flex h-full flex-col items-center justify-end"
                >
                  <div
                    className={`w-full min-w-[8px] rounded-t-md transition-all ${isLast ? "bg-gradient-to-t from-[#2f71e6] via-[#4096ef] to-[#5fdbf5] shadow-[0_0_16px_rgba(90,214,245,0.55)]" : "bg-gradient-to-t from-[#77b6ff] via-[#92ccff] to-[#c2ecff]"}`}
                    style={{
                      height: `${barHeightPercent}%`,
                      opacity: barOpacity,
                    }}
                    title={`${formatDayLabel(item.day)}: ${item.count}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-900">
            Waste Category Distribution
          </h2>
          <p className="text-sm text-slate-500">Breakdown by classification</p>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-center">
            <div
              className="relative h-40 w-40 rounded-full"
              style={{ backgroundImage: donutGradient }}
              aria-label="Waste category distribution donut chart"
            >
              <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-center text-sm font-semibold text-slate-700 shadow-inner">
                {totalReports} reports
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {categories.map((item, index) => {
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-1"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                      }}
                    />
                    {item.label}
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {item.count}
                  </span>
                </div>
              );
            })}
            {categories.length === 0 && (
              <p className="text-sm text-slate-500">
                No reports yet for distribution.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
