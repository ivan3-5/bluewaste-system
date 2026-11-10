"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Calendar, Inbox, Loader2 } from "lucide-react";
import type {
  MonthlyTrendPoint,
  MonthlyTrendRange,
} from "@/lib/dashboard-reports";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

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
  initialMonthlyTrend?: MonthlyTrendPoint[];
  trend?: TrendPoint[];
  categories: CategoryPoint[];
};

const CATEGORY_COLORS = ["#3b82f6", "#84cc16"];

const RANGE_OPTIONS: Array<{ value: MonthlyTrendRange; label: string }> = [
  { value: "thisYear", label: "This Year" },
  { value: "6months", label: "Last 6 Months" },
  { value: "12months", label: "Last 12 Months" },
];

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
  initialMonthlyTrend = [],
  categories,
}: DashboardInsightsProps) {
  const [selectedRange, setSelectedRange] =
    useState<MonthlyTrendRange>("thisYear");
  const [monthlyData, setMonthlyData] =
    useState<MonthlyTrendPoint[]>(initialMonthlyTrend);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [cache, setCache] = useState<Record<string, MonthlyTrendPoint[]>>(() => {
    const initialCache: Record<string, MonthlyTrendPoint[]> = {};
    if (initialMonthlyTrend.length > 0) {
      initialCache.thisYear = initialMonthlyTrend;
    }
    return initialCache;
  });

  // Watch for theme changes and client mounting
  useEffect(() => {
    setIsMounted(true);
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Fetch initial data if not provided
  useEffect(() => {
    if (initialMonthlyTrend.length === 0 && !cache.thisYear) {
      void handleRangeChange("thisYear");
    }
  }, []);

  const handleRangeChange = async (newRange: MonthlyTrendRange) => {
    setSelectedRange(newRange);
    if (cache[newRange]) {
      setMonthlyData(cache[newRange]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/dashboard/trend?range=${newRange}`);
      if (!res.ok) {
        throw new Error("Failed to fetch monthly trend data");
      }
      const data: MonthlyTrendPoint[] = await res.json();
      setMonthlyData(data);
      setCache((prev) => ({ ...prev, [newRange]: data }));
    } catch (err) {
      console.error("Error fetching monthly trend:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalReports = categories.reduce((sum, item) => sum + item.count, 0);
  const donutGradient = toDonutGradient(categories);

  const totalInPeriod = useMemo(
    () => monthlyData.reduce((sum, item) => sum + item.totalCount, 0),
    [monthlyData],
  );

  const chartData: ChartData<"bar"> = useMemo(() => {
    return {
      labels: monthlyData.map((item) => item.monthName),
      datasets: [
        {
          label: "Pending",
          data: monthlyData.map((item) => item.pendingCount),
          backgroundColor: "#F59E0B",
          hoverBackgroundColor: "#D97706",
          borderRadius: 4,
          borderSkipped: false,
          maxBarThickness: 24,
        },
        {
          label: "In Progress",
          data: monthlyData.map((item) => item.inProgressCount),
          backgroundColor: "#A855F7",
          hoverBackgroundColor: "#9333EA",
          borderRadius: 4,
          borderSkipped: false,
          maxBarThickness: 24,
        },
        {
          label: "Cleaned",
          data: monthlyData.map((item) => item.cleanedCount),
          backgroundColor: "#22C55E",
          hoverBackgroundColor: "#16A34A",
          borderRadius: 4,
          borderSkipped: false,
          maxBarThickness: 24,
        },
      ],
    };
  }, [monthlyData]);

  const chartOptions: ChartOptions<"bar"> = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 400,
      },
      interaction: {
        mode: "index" as const,
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: "top" as const,
          align: "end" as const,
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            boxWidth: 8,
            boxHeight: 8,
            padding: 14,
            font: {
              family: "inherit",
              size: 12,
              weight: 500,
            },
            color: isDark ? "#cbd5e1" : "#475569",
          },
        },
        tooltip: {
          backgroundColor: isDark ? "#0f172a" : "#1e293b",
          titleColor: "#f8fafc",
          bodyColor: "#e2e8f0",
          borderColor: isDark ? "#334155" : "#475569",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
          usePointStyle: true,
          boxPadding: 4,
          callbacks: {
            title: (items) => {
              if (!items.length) return "";
              const item = items[0];
              const point = monthlyData[item.dataIndex];
              return point ? `${point.monthName} ${point.year}` : item.label;
            },
            label: (context) => {
              const label = context.dataset.label || "";
              const val = context.parsed.y ?? 0;
              return `  ${label}: ${val} ${val === 1 ? "report" : "reports"}`;
            },
            afterBody: (items) => {
              const sum = items.reduce(
                (acc, item) => acc + (item.parsed.y || 0),
                0,
              );
              return `\nTotal: ${sum} ${sum === 1 ? "report" : "reports"}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: isDark ? "#94a3b8" : "#64748b",
            font: {
              family: "inherit",
              size: 11,
              weight: 500,
            },
            maxRotation: 45,
            minRotation: 0,
            autoSkip: false,
          },
          border: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: isDark
              ? "rgba(148, 163, 184, 0.08)"
              : "rgba(148, 163, 184, 0.15)",
          },
          ticks: {
            color: isDark ? "#94a3b8" : "#64748b",
            font: {
              family: "inherit",
              size: 11,
            },
            precision: 0,
            stepSize: 2,
          },
          border: {
            display: false,
          },
          title: {
            display: true,
            text: "Number of Reports",
            color: isDark ? "#94a3b8" : "#64748b",
            font: {
              family: "inherit",
              size: 11,
              weight: 600,
            },
          },
        },
      },
    };
  }, [isDark, monthlyData]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Monthly Report Trends Section */}
      <section className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                Monthly Report Trends
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Monthly breakdown by report status
              </p>
            </div>

            {/* Date-range Filter */}
            <div className="flex items-center gap-2">
              <label htmlFor="trend-range-select" className="sr-only">
                Filter date range
              </label>
              <div className="relative inline-flex items-center">
                <Calendar className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                <select
                  id="trend-range-select"
                  value={selectedRange}
                  onChange={(e) =>
                    handleRangeChange(e.target.value as MonthlyTrendRange)
                  }
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-8 pr-8 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  disabled={isLoading}
                >
                  {RANGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="relative min-h-[260px] h-64 sm:h-72 w-full">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-[1px]">
              <div className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-700">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                Updating trends...
              </div>
            </div>
          )}

          {!isMounted ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className="h-full w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            </div>
          ) : totalInPeriod === 0 ? (
            <div className="flex h-full w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                <Inbox className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                No Report Data Available
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                There are no waste report records found for the selected date range.
              </p>
            </div>
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>
      </section>

      {/* Waste Category Distribution Section */}
      <section className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div>
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Waste Category Distribution
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Breakdown by classification
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-center">
              <div
                className="relative h-40 w-40 rounded-full"
                style={{ backgroundImage: donutGradient }}
                aria-label="Waste category distribution donut chart"
              >
                <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white dark:bg-slate-900 text-center text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-inner">
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
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                        }}
                      />
                      {item.label}
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {item.count}
                    </span>
                  </div>
                );
              })}
              {categories.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No reports yet for distribution.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
