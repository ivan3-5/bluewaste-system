"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { format } from "date-fns";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers,
  MapPin,
  CalendarDays,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useAssignedReports } from "@/hooks/useReports";
import { useUnreadCount } from "@/hooks/useNotifications";
import { StatusBadge } from "@/components/reports/StatusBadge";
import { SeverityBadge } from "@/components/SeverityBadge";
import { timeAgo } from "@/lib/utils";
import {
  ListCardsSkeleton,
  PageHeadingSkeleton,
  StatsCardsSkeleton,
} from "@/components/skeletons/page-skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CleanupSchedule, SCHEDULE_STATUS_COLORS, SCHEDULE_STATUS_LABELS } from "@/types";
import { ScheduleDetail } from "@/components/schedules/ScheduleDetail";

export default function FieldWorkerDashboard() {
  const [selectedSchedule, setSelectedSchedule] = useState<CleanupSchedule | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [expandedSchedules, setExpandedSchedules] = useState<Record<string, boolean>>({});

  const toggleScheduleExpand = (id: string) => {
    setExpandedSchedules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const { data: allData, isLoading: loadingAll } = useAssignedReports({});
  const { data: inProgressData } = useAssignedReports({
    status: "IN_PROGRESS",
  });
  const { data: unreadData } = useUnreadCount();

  const { data: mySchedules = [], isLoading: loadingSchedules } = useQuery({
    queryKey: ["my-schedules"],
    queryFn: async () => {
      const res = await api.get("/schedules/my-schedules?limit=50");
      return (res.data.data as CleanupSchedule[]) || [];
    },
    staleTime: 30000,
  });

  const allReports = useMemo(() => allData?.data || [], [allData?.data]);
  const totalAssigned = allData?.pagination?.total || 0;
  const inProgressCount = inProgressData?.pagination?.total || 0;
  const completedCount = allReports.filter(
    (r) => r.status === "CLEANED",
  ).length;

  const statusCounts = useMemo(() => {
    return allReports.reduce(
      (acc, report) => {
        if (report.status in acc) {
          acc[report.status as keyof typeof acc] += 1;
        }
        return acc;
      },
      {
        VERIFIED: 0,
        CLEANUP_SCHEDULED: 0,
        IN_PROGRESS: 0,
        CLEANED: 0,
        REJECTED: 0,
      },
    );
  }, [allReports]);

  const statusSegments = [
    {
      label: "Verified",
      value: statusCounts.VERIFIED,
      dot: "bg-blue-500",
    },
    {
      label: "Scheduled",
      value: statusCounts.CLEANUP_SCHEDULED,
      dot: "bg-violet-500",
    },
    {
      label: "In Progress",
      value: statusCounts.IN_PROGRESS,
      dot: "bg-orange-500",
    },
    {
      label: "Cleaned",
      value: statusCounts.CLEANED,
      dot: "bg-emerald-500",
    },
    {
      label: "Rejected",
      value: statusCounts.REJECTED,
      dot: "bg-rose-500",
    },
  ];

  const statusTotal = statusSegments.reduce((sum, item) => sum + item.value, 0);
  const statusGradient = statusTotal > 0
    ? `conic-gradient(#3b82f6 0deg ${(statusCounts.VERIFIED / statusTotal) * 360}deg, #8b5cf6 ${(statusCounts.VERIFIED / statusTotal) * 360}deg ${((statusCounts.VERIFIED + statusCounts.CLEANUP_SCHEDULED) / statusTotal) * 360}deg, #f97316 ${((statusCounts.VERIFIED + statusCounts.CLEANUP_SCHEDULED) / statusTotal) * 360}deg ${((statusCounts.VERIFIED + statusCounts.CLEANUP_SCHEDULED + statusCounts.IN_PROGRESS) / statusTotal) * 360}deg, #10b981 ${((statusCounts.VERIFIED + statusCounts.CLEANUP_SCHEDULED + statusCounts.IN_PROGRESS) / statusTotal) * 360}deg ${((statusCounts.VERIFIED + statusCounts.CLEANUP_SCHEDULED + statusCounts.IN_PROGRESS + statusCounts.CLEANED) / statusTotal) * 360}deg, #f43f5e ${((statusCounts.VERIFIED + statusCounts.CLEANUP_SCHEDULED + statusCounts.IN_PROGRESS + statusCounts.CLEANED) / statusTotal) * 360}deg 360deg)`
    : `conic-gradient(#3b82f6 0deg 360deg)`;

  const trendBuckets = useMemo(() => {
    const buckets = Array.from({ length: 12 }, () => 0);
    const now = Date.now();

    allReports.forEach((report) => {
      const createdAt = new Date(report.createdAt).getTime();
      if (!Number.isFinite(createdAt)) return;
      const diffDays = Math.floor((now - createdAt) / 86400000);
      if (diffDays >= 0 && diffDays < buckets.length) {
        buckets[buckets.length - 1 - diffDays] += 1;
      }
    });

    return buckets;
  }, [allReports]);

  const trendMax = Math.max(...trendBuckets, 1);
  const hasTrendData = trendBuckets.some((value) => value > 0);
  const unreadCount = unreadData?.count || 0;

  const statCards = [
    {
      label: "Total Assigned",
      value: totalAssigned,
      caption: "All tasks assigned to you",
      icon: ClipboardList,
      gradient: "from-blue-500 via-blue-500 to-indigo-500",
    },
    {
      label: "Active Tasks",
      value: Math.max(0, totalAssigned - completedCount),
      caption: "Open tasks assigned to you",
      icon: Activity,
      gradient: "from-indigo-500 via-purple-500 to-pink-500",
    },
    {
      label: "In Progress",
      value: inProgressCount,
      caption: "Currently being handled",
      icon: Clock,
      gradient: "from-orange-400 via-amber-400 to-yellow-400",
    },
    {
      label: "Completed",
      value: completedCount,
      caption: "Cleanups marked done",
      icon: CheckCircle2,
      gradient: "from-emerald-500 via-green-500 to-lime-500",
    },
  ];

  const stats = [
    {
      label: "Total Assigned",
      value: totalAssigned,
      icon: ClipboardList,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "In Progress",
      value: inProgressCount,
      icon: Clock,
      color: "text-orange-600 bg-orange-50",
    },
    {
      label: "Completed",
      value: completedCount,
      icon: CheckCircle2,
      color: "text-green-600 bg-green-50",
    },
  ];

  if (loadingAll) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <PageHeadingSkeleton />
          <Skeleton className="h-7 w-32 rounded-full" />
        </div>
        <StatsCardsSkeleton count={4} />
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
        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-44 w-full rounded-xl" />
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

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-6 h-56 w-56 rounded-full bg-blue-100/70 dark:bg-blue-950/20 blur-3xl" />
        <div className="absolute right-8 top-16 h-40 w-40 rounded-full bg-emerald-100/70 dark:bg-emerald-950/20 blur-3xl" />
        <div className="absolute left-1/3 top-72 h-56 w-56 rounded-full bg-orange-100/50 dark:bg-amber-950/20 blur-3xl" />
      </div>

      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
              Field Worker Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Assigned tasks and cleanup progress overview
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 shadow-sm">
            <span
              className={`h-2 w-2 rounded-full ${
                unreadCount > 0 ? "bg-orange-500" : "bg-emerald-500"
              }`}
            />
            {unreadCount > 0 ? `${unreadCount} unread alerts` : "All caught up"}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-5 text-white shadow-[0_16px_30px_rgba(15,23,42,0.18)] dark:shadow-[0_16px_30px_rgba(0,0,0,0.4)] dark:border dark:border-white/10 transition-all duration-300 hover:-translate-y-1 ${
                  index < 2
                    ? "animate-in fade-in slide-in-from-bottom-4"
                    : "animate-in fade-in slide-in-from-bottom-6"
                }`}
              >
                {/* Subtle horizontal & vertical grid background (clean, non-distracting) */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-[0.14]"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, rgba(255, 255, 255, 0.45) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(255, 255, 255, 0.45) 1px, transparent 1px)
                    `,
                    backgroundSize: "22px 22px",
                    maskImage: "linear-gradient(to bottom right, black 35%, transparent 85%)",
                    WebkitMaskImage: "linear-gradient(to bottom right, black 35%, transparent 85%)",
                  }}
                />

                <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/20" />
                <div className="pointer-events-none absolute -right-4 -bottom-12 h-32 w-32 rounded-full bg-white/10" />
                <div className="flex items-start justify-between">
                  <p className="text-sm font-semibold text-white/90">
                    {card.label}
                  </p>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/30 bg-white/15 backdrop-blur">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-8 text-4xl font-semibold leading-none">
                  {card.value}
                </p>
                <p className="mt-2 text-sm text-white/80">{card.caption}</p>
              </div>
            );
          })}
        </div>

        {/* ── Active Consolidated Cleanup Assignments ──────────────────────── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Cleanup Assignments (Consolidated Schedules)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Unified cleanup operations grouping multiple coastal waste locations scheduled for deployment
              </p>
            </div>
            <Link
              href="/field-worker/schedules"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              View Full Calendar & Schedules <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingSchedules ? (
            <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-xs text-slate-500 animate-pulse">
              Loading assigned cleanup schedules...
            </div>
          ) : mySchedules.length === 0 ? (
            <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-2">
              <CalendarDays className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No active cleanup operations assigned
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                When LGU Admins assign cleanup operations to your team, consolidated multi-report schedules will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {mySchedules.slice(0, 5).map((sched) => {
                const reports = sched.reports || [];
                const totalLocs = reports.length;
                const cleanedLocs = reports.filter(
                  (r) => r.status === "CLEANED",
                ).length;
                const progressPct =
                  totalLocs > 0 ? Math.round((cleanedLocs / totalLocs) * 100) : 0;
                const isExpanded = expandedSchedules[sched.id] ?? true;

                return (
                  <div
                    key={sched.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 shadow-sm overflow-hidden transition-all hover:border-indigo-300 dark:hover:border-indigo-800"
                  >
                    {/* Card Header Banner */}
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-indigo-50/20 dark:from-slate-800/60 dark:via-slate-900 dark:to-indigo-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                            style={{
                              backgroundColor: `${SCHEDULE_STATUS_COLORS[sched.status]}15`,
                              color: SCHEDULE_STATUS_COLORS[sched.status],
                              border: `1px solid ${SCHEDULE_STATUS_COLORS[sched.status]}35`,
                            }}
                          >
                            {SCHEDULE_STATUS_LABELS[sched.status]}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            <MapPin className="w-3 h-3 text-blue-500" />
                            {sched.barangay}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            <CalendarDays className="w-3 h-3 text-indigo-500" />
                            {format(new Date(sched.scheduledAt), "MMM d, yyyy")}
                          </span>
                          {totalLocs > 1 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                              <Layers className="w-3 h-3" />
                              {totalLocs} Consolidated Reports
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                          {sched.title}
                        </h3>

                        {/* Progress Bar */}
                        <div className="space-y-1 pt-1 max-w-md">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                            <span>
                              Cleanup Progress: {cleanedLocs} of {totalLocs} locations cleaned
                            </span>
                            <span>{progressPct}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSchedule(sched);
                            setIsDetailOpen(true);
                          }}
                          className="rounded-xl border-slate-200 dark:border-slate-700 dark:text-slate-200 text-xs font-bold h-9 px-3"
                        >
                          Briefing
                        </Button>
                        <button
                          type="button"
                          onClick={() => toggleScheduleExpand(sched.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title={isExpanded ? "Collapse locations" : "Expand locations"}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Grouped Reports Breakdown */}
                    {isExpanded && (
                      <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Associated Waste Locations — Inspect and complete each independently
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {reports.map((r) => (
                            <div
                              key={r.id}
                              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-sm flex flex-col justify-between space-y-2"
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-start justify-between gap-1">
                                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                                    {r.title}
                                  </p>
                                  <StatusBadge status={r.status} />
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                                  <span className="truncate">{r.address || sched.barangay}</span>
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  GPS: {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                                </p>
                                {r.severity && (
                                  <div className="pt-0.5">
                                    <SeverityBadge severity={r.severity} />
                                  </div>
                                )}
                              </div>

                              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                                <span className="text-[10px] font-mono text-slate-400">
                                  #{r.id.slice(0, 8)}
                                </span>
                                <Link
                                  href={`/field-worker/tasks/${r.id}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-[11px] font-bold transition-colors"
                                >
                                  Inspect Location &rarr;
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:shadow-none">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Task Activity (Last 12 Days)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Assignments received over time
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <TrendingUp className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                {totalAssigned > 0 ? "Active flow" : "No recent activity"}
              </div>
            </div>

            <div className="relative mt-6 h-56 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[size:36px_36px]" />
              <div className="absolute inset-x-6 bottom-6 flex h-40 items-end gap-3">
                {trendBuckets.map((value, idx) => (
                  <div
                    key={`bar-${idx}`}
                    className="flex-1 rounded-full bg-gradient-to-t from-blue-500 via-blue-400 to-cyan-300 shadow-[0_6px_14px_rgba(37,99,235,0.25)]"
                    style={{
                      height: `${Math.round((value / trendMax) * 100)}%`,
                    }}
                  />
                ))}
              </div>
              {!hasTrendData && (
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-slate-400 dark:text-slate-500">
                  No activity yet
                </div>
              )}
              <div className="absolute left-6 top-4 text-xs font-medium text-slate-400 dark:text-slate-500">
                12 days
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:shadow-none">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Status Breakdown
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current task distribution
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-6">
              <div className="relative mx-auto h-44 w-44">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: statusGradient }}
                />
                <div className="absolute inset-6 rounded-full bg-white dark:bg-slate-900 shadow-[inset_0_0_0_10px_rgba(241,245,249,0.8)] dark:shadow-[inset_0_0_0_10px_rgba(30,41,59,0.8)]" />
                <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate-500 dark:text-slate-300">
                  {statusTotal === 0 ? "0 tasks" : `${statusTotal} tasks`}
                </div>
              </div>

              <div className="space-y-3">
                {statusSegments.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${item.dot}`}
                      />
                      {item.label}
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-100">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Detail Modal */}
      {selectedSchedule && (
        <ScheduleDetail
          schedule={selectedSchedule}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedSchedule(null);
          }}
          onEdit={() => {}}
          onDelete={async () => {}}
          isAdmin={false}
        />
      )}
    </div>
  );
}
