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
import { Inbox } from "lucide-react";
import { ChartBarsSkeleton } from "@/components/skeletons/page-skeletons";
import type { MonthlyTrendPoint } from "@/lib/dashboard-reports";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

type CategoryPoint = {
  key: string;
  label: string;
  count: number;
};

type DashboardInsightsProps = {
  trendData: MonthlyTrendPoint[];
  categories: CategoryPoint[];
  showDaily: boolean;
};

const CATEGORY_COLORS = ["#3b82f6", "#84cc16"];

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
  trendData,
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

  const totalReports = categories.reduce((sum, item) => sum + item.count, 0);
  const donutGradient = toDonutGradient(categories);

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
              {totalReports === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No reports for the selected date range.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
