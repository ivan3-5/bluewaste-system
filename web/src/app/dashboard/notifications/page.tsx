"use client";

import { useState, useMemo } from "react";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { cn, timeAgo } from "@/lib/utils";
import Link from "next/link";
import {
  Bell,
  ClipboardList,
  RefreshCw,
  HardHat,
  Settings,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
  Eye,
  Radio,
} from "lucide-react";
import {
  NotificationListSkeleton,
  PageHeadingSkeleton,
} from "@/components/skeletons/page-skeletons";

/* ── Type-based icon & colour config ── */
const typeConfig: Record<
  string,
  { icon: React.ReactNode; bg: string; ring: string }
> = {
  NEW_REPORT: {
    icon: <ClipboardList className="w-4 h-4 text-white" />,
    bg: "bg-blue-500",
    ring: "ring-blue-500/20",
  },
  STATUS_CHANGE: {
    icon: <RefreshCw className="w-4 h-4 text-white" />,
    bg: "bg-amber-500",
    ring: "ring-amber-500/20",
  },
  ASSIGNMENT: {
    icon: <HardHat className="w-4 h-4 text-white" />,
    bg: "bg-emerald-500",
    ring: "ring-emerald-500/20",
  },
  SYSTEM: {
    icon: <Settings className="w-4 h-4 text-white" />,
    bg: "bg-slate-500",
    ring: "ring-slate-500/20",
  },
};

const TypeBadgeLabel: Record<string, string> = {
  NEW_REPORT: "New Report",
  STATUS_CHANGE: "Status Update",
  ASSIGNMENT: "Assignment",
  SYSTEM: "System",
};

/* ── Type filter options ── */
const FILTER_OPTIONS = [
  { key: "ALL", label: "All" },
  { key: "NEW_REPORT", label: "Reports" },
  { key: "STATUS_CHANGE", label: "Updates" },
  { key: "ASSIGNMENT", label: "Assignments" },
  { key: "SYSTEM", label: "System" },
] as const;

/* ── Date grouping helper ── */
function groupDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  if (d >= startOfToday) return "Today";
  if (d >= startOfWeek) return "This Week";
  const month = d.toLocaleDateString("en-PH", { month: "long", year: "numeric" });
  return month;
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const { data, isLoading } = useNotifications(page);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = data?.data || [];
  const pagination = data?.pagination;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  /* ── Filtered notifications ── */
  const filtered = useMemo(() => {
    if (typeFilter === "ALL") return notifications;
    return notifications.filter((n) => n.type === typeFilter);
  }, [notifications, typeFilter]);

  /* ── Group by date ── */
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const n of filtered) {
      const label = groupDateLabel(n.createdAt);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(n);
    }
    return Array.from(map.entries());
  }, [filtered]);

  /* ── Loading skeleton ── */
  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <PageHeadingSkeleton />
        <NotificationListSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            {unreadCount > 0 ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                </span>
                <span>
                  {unreadCount} unread notification
                  {unreadCount !== 1 ? "s" : ""}
                </span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5 text-gray-400" />
                <span>All caught up</span>
              </>
            )}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
            className="gap-1.5 border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* ─── REAL-TIME INDICATOR ─── */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Radio className="w-3 h-3 text-green-500" />
        <span>Live</span>
        <span className="w-1 h-1 rounded-full bg-gray-300" />
        <span>Updates every 5s</span>
      </div>

      {/* ─── FILTER CHIPS ─── */}
      <div className="flex flex-wrap items-center gap-1.5">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => {
              setTypeFilter(opt.key);
              setPage(1);
            }}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
              typeFilter === opt.key
                ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
            )}
          >
            {opt.label}
            {opt.key !== "ALL" &&
              notifications.filter((n) => n.type === opt.key).length > 0 && (
                <span
                  className={cn(
                    "ml-1.5 tabular-nums",
                    typeFilter === opt.key ? "text-blue-200" : "text-gray-400"
                  )}
                >
                  {notifications.filter((n) => n.type === opt.key).length}
                </span>
              )}
          </button>
        ))}
      </div>

      {/* ─── NOTIFICATIONS LIST ─── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="mb-5 relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 ring-8 ring-blue-50/50">
              <Bell className="h-9 w-9 text-blue-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-700">
            {typeFilter === "ALL"
              ? "No notifications yet"
              : "No notifications of this type"}
          </h3>
          <p className="mt-2 max-w-xs text-sm text-gray-400 leading-relaxed">
            {typeFilter === "ALL"
              ? "You're all caught up! When new reports are submitted or waste reports get updates, you'll see them here."
              : "Try switching to a different filter to see more notifications."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([groupLabel, items]) => (
            <section key={groupLabel}>
              {/* Group heading */}
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {groupLabel}
                </h2>
                <span className="h-px flex-1 bg-gray-100" />
                <span className="text-xs text-gray-400 tabular-nums">
                  {items.length}
                </span>
              </div>

              {/* Notification cards */}
              <div className="space-y-2">
                {items.map((n, idx) => {
                  const config = typeConfig[n.type] || typeConfig.SYSTEM;
                  return (
                    <div
                      key={n.id}
                      className={cn(
                        "group relative flex items-start gap-4 rounded-xl border p-4 transition-all duration-200",
                        n.isRead
                          ? "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
                          : "bg-blue-50/60 border-blue-200 hover:border-blue-300 hover:shadow-sm hover:shadow-blue-100"
                      )}
                    >
                      {/* Unread indicator dot */}
                      {!n.isRead && (
                        <span className="absolute top-4 left-3.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                      )}

                      {/* Type icon */}
                      <div
                        className={cn(
                          "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-4 transition-transform group-hover:scale-105",
                          config.bg,
                          config.ring
                        )}
                      >
                        {config.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <h3
                            className={cn(
                              "text-sm leading-snug",
                              n.isRead
                                ? "text-gray-700 font-medium"
                                : "text-gray-900 font-semibold"
                            )}
                          >
                            {n.title}
                          </h3>
                          <span className="shrink-0 text-xs text-gray-400 whitespace-nowrap mt-0.5">
                            {timeAgo(n.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 leading-relaxed line-clamp-2">
                          {n.message}
                        </p>

                        {/* Badge + Actions */}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {/* Type badge */}
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider",
                              n.type === "NEW_REPORT" && "text-blue-600 bg-blue-50",
                              n.type === "STATUS_CHANGE" && "text-amber-600 bg-amber-50",
                              n.type === "ASSIGNMENT" && "text-emerald-600 bg-emerald-50",
                              n.type === "SYSTEM" && "text-slate-600 bg-slate-50"
                            )}
                          >
                            {TypeBadgeLabel[n.type] || n.type}
                          </span>

                          {/* Action buttons */}
                          <div className="flex items-center gap-1.5 ml-auto">
                            {n.reportId && (
                              <Link href={`/dashboard/reports/${n.reportId}`}>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="h-7 text-xs gap-1 px-2.5"
                                >
                                  <Eye className="w-3 h-3" />
                                  View Report
                                </Button>
                              </Link>
                            )}
                            {!n.isRead && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs gap-1 px-2.5 text-gray-500 hover:text-blue-600"
                                onClick={() => markAsRead.mutate(n.id)}
                                disabled={markAsRead.isPending}
                              >
                                <CheckCheck className="w-3 h-3" />
                                Dismiss
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* ─── PAGINATION ─── */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Page {pagination.page} of {pagination.totalPages} &middot;{" "}
            {pagination.total} notification{pagination.total !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 gap-1 text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 gap-1 text-xs"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
