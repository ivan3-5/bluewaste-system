"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { Inbox } from "lucide-react";
import { ChartBarsSkeleton } from "@/components/skeletons/page-skeletons";
import type { MonthlyTrendPoint } from "@/lib/dashboard-reports";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

export type SeverityPoint = {
  key: string;
  label: "Low" | "Medium" | "High" | string;
  count: number;
  percentage?: number;
};

type DashboardInsightsProps = {
  trendData: MonthlyTrendPoint[];
  severities?: SeverityPoint[];
  categories?: SeverityPoint[];
  showDaily: boolean;
};

const SEVERITY_COLORS: Record<string, { bg: string; hover: string }> = {
  low: {
    bg: "#22C55E", // Green
    hover: "#16A34A",
  },
  medium: {
    bg: "#F97316", // Orange
    hover: "#EA580C",
  },
  high: {
    bg: "#EF4444", // Red
    hover: "#DC2626",
  },
};

const SEVERITY_ORDER: Record<string, number> = { low: 1, medium: 2, high: 3 };

export function DashboardInsights({
  trendData,
  severities,
  categories,
  showDaily,
}: DashboardInsightsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

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

  const items = useMemo(() => {
    const rawItems = severities ?? categories ?? [];
    if (rawItems.length === 0) {
      return [
        { key: "low", label: "Low" as const, count: 0, percentage: 0 },
        { key: "medium", label: "Medium" as const, count: 0, percentage: 0 },
        { key: "high", label: "High" as const, count: 0, percentage: 0 },
      ];
    }
    return [...rawItems].sort((a, b) => {
      const orderA = SEVERITY_ORDER[a.key.toLowerCase()] ?? 99;
      const orderB = SEVERITY_ORDER[b.key.toLowerCase()] ?? 99;
      return orderA - orderB;
    });
  }, [severities, categories]);

  const totalReports = useMemo(
    () => items.reduce((sum, item) => sum + item.count, 0),
    [items],
  );

  const doughnutData: ChartData<"doughnut"> = useMemo(() => {
    if (totalReports === 0) {
      return {
        labels: ["No Reports"],
        datasets: [
          {
            data: [1],
            backgroundColor: [isDark ? "#334155" : "#e2e8f0"],
            hoverBackgroundColor: [isDark ? "#334155" : "#e2e8f0"],
            borderWidth: 0,
          },
        ],
      };
    }

    return {
      labels: items.map((item) => item.label),
      datasets: [
        {
          data: items.map((item) => item.count),
          backgroundColor: items.map(
            (item) => SEVERITY_COLORS[item.key.toLowerCase()]?.bg ?? "#94a3b8",
          ),
          hoverBackgroundColor: items.map(
            (item) => SEVERITY_COLORS[item.key.toLowerCase()]?.hover ?? "#64748b",
          ),
          borderColor: isDark ? "#0f172a" : "#ffffff",
          borderWidth: 2,
          hoverOffset: 4,
        },
      ],
    };
  }, [items, totalReports, isDark]);

  const doughnutOptions: ChartOptions<"doughnut"> = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: true,
      cutout: "70%",
      animation: {
        duration: 400,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: totalReports > 0,
          backgroundColor: isDark ? "#0f172a" : "#1e293b",
          titleColor: "#f8fafc",
          bodyColor: "#e2e8f0",
          borderColor: isDark ? "#334155" : "#475569",
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          usePointStyle: true,
          callbacks: {
            label: (context) => {
              const label = context.label || "";
              const val = Number(context.parsed) || 0;
              const pct = totalReports > 0 ? ((val / totalReports) * 100).toFixed(1) : "0";
              return `  ${label}: ${val} ${val === 1 ? "report" : "reports"} (${pct}%)`;
            },
          },
        },
      },
    };
  }, [isDark, totalReports]);

  const totalInPeriod = useMemo(
    () => trendData.reduce((sum, item) => sum + item.totalCount, 0),
    [trendData],
  );

  const chartData: ChartData<"bar"> = useMemo(() => {
    return {
      labels: trendData.map((item) =>
        showDaily ? `${item.monthName.slice(0, 3)} ${item.dayOfMonth}` : item.monthName,
      ),
      datasets: [
        {
          label: "Pending",
          data: trendData.map((item) => item.pendingCount),
          backgroundColor: "#F59E0B",
          hoverBackgroundColor: "#D97706",
          borderRadius: 4,
          borderSkipped: false,
          maxBarThickness: 24,
        },
        {
          label: "In Progress",
          data: trendData.map((item) => item.inProgressCount),
          backgroundColor: "#A855F7",
          hoverBackgroundColor: "#9333EA",
          borderRadius: 4,
          borderSkipped: false,
          maxBarThickness: 24,
        },
        {
          label: "Cleaned",
          data: trendData.map((item) => item.cleanedCount),
          backgroundColor: "#22C55E",
          hoverBackgroundColor: "#16A34A",
          borderRadius: 4,
          borderSkipped: false,
          maxBarThickness: 24,
        },
      ],
    };
  }, [trendData, showDaily]);

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
              const point = trendData[item.dataIndex];
              if (!point) return item.label;
              return showDaily
                ? `${point.monthName} ${point.dayOfMonth}, ${point.year}`
                : `${point.monthName} ${point.year}`;
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
            autoSkip: showDaily,
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
  }, [isDark, trendData, showDaily]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Waste Reports by Date */}
      <section className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Waste Reports by Date
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {showDaily ? "Daily breakdown by report status" : "Monthly breakdown by report status"}
          </p>
        </div>

        {/* Chart Area */}
        <div className="relative min-h-[260px] h-64 sm:h-72 w-full">
          {!isMounted ? (
            <ChartBarsSkeleton />
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

      {/* Waste Severity Distribution Section */}
      <section className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div>
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Waste Severity Distribution
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Breakdown by severity level
            </p>
          </div>

          <div className="space-y-6">
            {/* Doughnut Chart */}
            <div className="relative mx-auto flex h-48 w-48 sm:h-52 sm:w-52 items-center justify-center">
              {!isMounted ? (
                <div className="h-44 w-44 rounded-full border-4 border-dashed border-slate-200 dark:border-slate-800 animate-pulse" />
              ) : (
                <Doughnut
                  data={doughnutData}
                  options={doughnutOptions}
                  aria-label="Waste severity distribution doughnut chart"
                />
              )}
              {/* Total Report Count in Center */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                  {totalReports}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {totalReports === 1 ? "report" : "reports"}
                </span>
              </div>
            </div>

            {/* Severity Breakdown List */}
            <div className="space-y-2">
              {items.map((item) => {
                const colorConfig =
                  SEVERITY_COLORS[item.key.toLowerCase()] ?? {
                    bg: "#94a3b8",
                    hover: "#64748b",
                  };
                const percentage =
                  item.percentage !== undefined
                    ? item.percentage
                    : totalReports > 0
                    ? Math.round((item.count / totalReports) * 1000) / 10
                    : 0;
                const formattedPct = Number.isInteger(percentage)
                  ? `${percentage}%`
                  : `${percentage.toFixed(1)}%`;

                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between py-1.5 px-2.5 rounded-lg transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      <span
                        className="inline-block h-3 w-3 rounded-full shadow-sm"
                        style={{ backgroundColor: colorConfig.bg }}
                        aria-hidden="true"
                      />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-sans">
                        {item.count} {item.count === 1 ? "report" : "reports"}
                      </span>
                      <span className="inline-flex min-w-[3.5rem] justify-end text-xs font-medium text-slate-500 dark:text-slate-400">
                        ({formattedPct})
                      </span>
                    </div>
                  </div>
                );
              })}
              {totalReports === 0 && (
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-1">
                  No waste reports for the selected date range.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
