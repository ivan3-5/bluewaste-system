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
import {
  format,
  subDays,
  startOfDay,
  endOfDay,
  isSameDay,
} from "date-fns";
import {
  TrendingUp,
  Inbox,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Report } from "@/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export interface DailyActivityPoint {
  date: Date;
  dateKey: string;
  shortLabel: string;
  weekdayLabel: string;
  fullLabel: string;
  count: number;
  completed: number;
}

export interface Activity12DayStats {
  days: DailyActivityPoint[];
  totalIn12Days: number;
  completedIn12Days: number;
  avgPerDay: number;
  maxCount: number;
  busiestDays: DailyActivityPoint[];
  firstHalfCount: number;
  secondHalfCount: number;
  trendType: "up" | "down" | "steady";
  trendLabel: string;
  trendPercentage: number;
}

/**
 * Computes exact 12-calendar-day task activity metrics from real report records.
 * The 12-day window spans from 11 days ago up to the end of today in local time.
 */
export function compute12DayActivity(
  reports: Report[],
  baseDate = new Date(),
): Activity12DayStats {
  const today = startOfDay(baseDate);

  // Generate 12 calendar days: [today - 11 days, ..., today]
  const days: DailyActivityPoint[] = Array.from({ length: 12 }, (_, i) => {
    const d = subDays(today, 11 - i);
    return {
      date: d,
      dateKey: format(d, "yyyy-MM-dd"),
      shortLabel: format(d, "MMM d"),
      weekdayLabel: format(d, "EEE"),
      fullLabel: format(d, "EEEE, MMMM d, yyyy"),
      count: 0,
      completed: 0,
    };
  });

  const windowStart = days[0].date;
  const windowEnd = endOfDay(today);

  reports.forEach((report) => {
    if (!report.createdAt) return;
    const createdAt = new Date(report.createdAt);
    if (!Number.isFinite(createdAt.getTime())) return;

    // Filter within the 12-day calendar span
    if (createdAt < windowStart || createdAt > windowEnd) return;

    const dayIndex = days.findIndex((day) => isSameDay(day.date, createdAt));
    if (dayIndex !== -1) {
      days[dayIndex].count += 1;
      if (report.status === "CLEANED") {
        days[dayIndex].completed += 1;
      }
    }
  });

  const totalIn12Days = days.reduce((sum, d) => sum + d.count, 0);
  const completedIn12Days = days.reduce((sum, d) => sum + d.completed, 0);
  const avgPerDay = totalIn12Days / 12;

  const maxCount = Math.max(...days.map((d) => d.count), 0);
  const busiestDays = days.filter((d) => d.count === maxCount && maxCount > 0);

  // 6-day split comparison for trend indicator
  const firstHalfCount = days.slice(0, 6).reduce((s, d) => s + d.count, 0);
  const secondHalfCount = days.slice(6).reduce((s, d) => s + d.count, 0);

  let trendType: "up" | "down" | "steady" = "steady";
  let trendLabel = "Steady flow";
  let trendPercentage = 0;

  if (totalIn12Days === 0) {
    trendType = "steady";
    trendLabel = "No recent activity";
  } else if (secondHalfCount > firstHalfCount) {
    trendType = "up";
    if (firstHalfCount === 0) {
      trendLabel = `+${secondHalfCount} new vs prev 6d`;
      trendPercentage = 100;
    } else {
      trendPercentage = Math.round(
        ((secondHalfCount - firstHalfCount) / firstHalfCount) * 100,
      );
      trendLabel = `+${trendPercentage}% vs prev 6d`;
    }
  } else if (secondHalfCount < firstHalfCount) {
    trendType = "down";
    trendPercentage = Math.round(
      ((firstHalfCount - secondHalfCount) / firstHalfCount) * 100,
    );
    trendLabel = `-${trendPercentage}% vs prev 6d`;
  } else {
    trendType = "steady";
    trendLabel = "Even volume vs prev 6d";
  }

  return {
    days,
    totalIn12Days,
    completedIn12Days,
    avgPerDay,
    maxCount,
    busiestDays,
    firstHalfCount,
    secondHalfCount,
    trendType,
    trendLabel,
    trendPercentage,
  };
}

export function TaskActivitySkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 shadow-sm space-y-4 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-3.5 w-48" />
        </div>
        <Skeleton className="h-5 w-24" />
      </div>

      {/* Chart skeleton */}
      <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 h-72 sm:h-80 flex items-end gap-2 sm:gap-3 justify-between">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
          >
            <Skeleton
              className="w-full rounded-t-md"
              style={{ height: `${20 + ((i * 17) % 65)}%` }}
            />
            <Skeleton className="h-2.5 w-5 sm:w-7" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface TaskActivityAnalyticsProps {
  reports: Report[];
  isLoading?: boolean;
  className?: string;
}

export function TaskActivityAnalytics({
  reports,
  isLoading = false,
  className = "",
}: TaskActivityAnalyticsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

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

  const activity = useMemo(() => compute12DayActivity(reports), [reports]);

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
          display: false,
        },
        tooltip: {
          backgroundColor: isDark ? "#0f172a" : "#1e293b",
          titleColor: "#f8fafc",
          bodyColor: "#e2e8f0",
          borderColor: isDark ? "#334155" : "#475569",
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          usePointStyle: true,
          boxPadding: 4,
          callbacks: {
            title: (items) => {
              if (!items.length) return "";
              const item = items[0];
              const point = activity.days[item.dataIndex];
              return point ? point.fullLabel : item.label;
            },
            label: (context) => {
              const count = context.parsed.y ?? 0;
              const point = activity.days[context.dataIndex];
              const isPeak =
                point &&
                point.count === activity.maxCount &&
                activity.maxCount > 0;
              return `  Assignments: ${count} ${
                count === 1 ? "task" : "tasks"
              }${isPeak ? " (Peak Day ⭐)" : ""}`;
            },
            afterBody: (items) => {
              if (!items.length) return "";
              const point = activity.days[items[0].dataIndex];
              if (!point) return "";
              const lines: string[] = [];
              if (point.completed > 0) {
                lines.push(`  Completed: ${point.completed} cleaned`);
              }
              if (point.count === 0) {
                lines.push("  Zero task assignments on this day");
              }
              return lines.length ? "\n" + lines.join("\n") : "";
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
          suggestedMax: Math.max(activity.maxCount + 1, 4),
          grid: {
            color: isDark
              ? "rgba(148, 163, 184, 0.08)"
              : "rgba(148, 163, 184, 0.15)",
          },
          title: {
            display: true,
            text: "Task Count",
            color: isDark ? "#94a3b8" : "#64748b",
            font: {
              family: "inherit",
              size: 11,
              weight: 600,
            },
            padding: { bottom: 6 },
          },
          ticks: {
            color: isDark ? "#94a3b8" : "#64748b",
            font: {
              family: "inherit",
              size: 11,
            },
            precision: 0,
            stepSize: activity.maxCount > 8 ? undefined : 1,
          },
          border: {
            display: false,
          },
        },
      },
    };
  }, [activity, isDark]);

  const chartData: ChartData<"bar"> = useMemo(() => {
    return {
      labels: activity.days.map((d) => d.shortLabel),
      datasets: [
        {
          label: "Assignments",
          data: activity.days.map((d) => d.count),
          backgroundColor: activity.days.map((d) => {
            if (d.count === activity.maxCount && activity.maxCount > 0) {
              return isDark ? "#3b82f6" : "#2563eb";
            }
            return isDark
              ? "rgba(96, 165, 250, 0.45)"
              : "rgba(59, 130, 246, 0.55)";
          }),
          borderColor: activity.days.map((d) => {
            if (d.count === activity.maxCount && activity.maxCount > 0) {
              return isDark ? "#60a5fa" : "#1d4ed8";
            }
            return isDark
              ? "rgba(96, 165, 250, 0.65)"
              : "rgba(59, 130, 246, 0.75)";
          }),
          borderWidth: activity.days.map((d) => {
            if (d.count === activity.maxCount && activity.maxCount > 0) {
              return 2;
            }
            return 1;
          }),
          hoverBackgroundColor: activity.days.map((d) => {
            if (d.count === activity.maxCount && activity.maxCount > 0) {
              return isDark ? "#60a5fa" : "#1d4ed8";
            }
            return isDark
              ? "rgba(96, 165, 250, 0.85)"
              : "rgba(37, 99, 235, 0.85)";
          }),
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 32,
        },
      ],
    };
  }, [activity, isDark]);

  if (isLoading || !isMounted) {
    return <TaskActivitySkeleton />;
  }

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:shadow-none flex flex-col justify-between space-y-5 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Task Activity
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Assignments received over time
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <TrendingUp className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          {activity.totalIn12Days > 0 ? "Active flow" : "No recent activity"}
        </div>
      </div>

      {/* Chart Legend Bar */}
      <div className="flex items-center justify-between text-xs px-1 text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-blue-500/60 dark:bg-blue-400/50" />
            Daily Tasks
          </span>
          {activity.maxCount > 0 && (
            <span className="inline-flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-600 dark:bg-blue-500" />
              Peak Activity ({activity.maxCount})
            </span>
          )}
        </div>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
          Hover bars for daily breakdown
        </span>
      </div>

      {/* Modern Interactive Chart Container */}
      <div className="relative h-72 sm:h-80 w-full rounded-xl border border-slate-100 dark:border-slate-800 bg-gradient-to-br from-slate-50/50 via-white to-slate-50/50 dark:from-slate-950/60 dark:via-slate-900 dark:to-slate-950/60 p-3 pt-4">
        <Bar data={chartData} options={chartOptions} />
        {activity.totalIn12Days === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1px] rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400">
            <Inbox className="h-6 w-6 text-slate-400" />
            <span>No task assignments recorded in the last 12 days</span>
          </div>
        )}
      </div>
    </div>
  );
}
