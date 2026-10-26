"use client";

import { useState, useMemo } from "react";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { cn, timeAgo } from "@/lib/utils";
import Link from "next/link";
import {
  Bell,
  BellRing,
  RefreshCw,
  HardHat,
  Settings,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
  Eye,
  Radio,
  Search,
  X,
  Filter,
  ShieldCheck,
  FileText,
  Activity,
  ArrowRight,
  Inbox,
  Sparkles,
  Layers,
  Clock,
} from "lucide-react";
import {
  NotificationListSkeleton,
  PageHeadingSkeleton,
} from "@/components/skeletons/page-skeletons";
import { format } from "date-fns";

/* ── Type Configuration & Visual Tokens ───────────────────────────────────────── */
const typeConfig: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    gradientBg: string;
    borderAccent: string;
    pillBg: string;
    pillText: string;
    pillBorder: string;
  }
> = {
  NEW_REPORT: {
    icon: FileText,
    label: "New Report",
    gradientBg: "from-blue-600 via-indigo-600 to-blue-700 shadow-blue-500/20",
    borderAccent: "border-l-blue-600",
    pillBg: "bg-blue-50 dark:bg-blue-950/50",
    pillText: "text-blue-700 dark:text-blue-300",
    pillBorder: "border-blue-200/80 dark:border-blue-900/60",
  },
  STATUS_CHANGE: {
    icon: RefreshCw,
    label: "Status Update",
    gradientBg: "from-amber-500 via-orange-500 to-amber-600 shadow-amber-500/20",
    borderAccent: "border-l-amber-500",
    pillBg: "bg-amber-50 dark:bg-amber-950/50",
    pillText: "text-amber-800 dark:text-amber-300",
    pillBorder: "border-amber-200/80 dark:border-amber-900/60",
  },
  ASSIGNMENT: {
    icon: HardHat,
    label: "Assignment",
    gradientBg: "from-emerald-500 via-teal-600 to-emerald-700 shadow-emerald-500/20",
    borderAccent: "border-l-emerald-600",
    pillBg: "bg-emerald-50 dark:bg-emerald-950/50",
    pillText: "text-emerald-800 dark:text-emerald-300",
    pillBorder: "border-emerald-200/80 dark:border-emerald-900/60",
  },
  SYSTEM: {
    icon: Settings,
    label: "System Alert",
    gradientBg: "from-slate-600 via-gray-700 to-slate-800 shadow-slate-500/20",
    borderAccent: "border-l-slate-500",
    pillBg: "bg-slate-50 dark:bg-slate-800",
    pillText: "text-slate-700 dark:text-slate-300",
    pillBorder: "border-slate-200/80 dark:border-slate-700",
  },
};

/* ── Type Filter Tabs Configuration ────────────────────────────────────────── */
const FILTER_OPTIONS = [
  { key: "ALL", label: "All Alerts" },
  { key: "NEW_REPORT", label: "Waste Reports" },
  { key: "STATUS_CHANGE", label: "Status Updates" },
  { key: "ASSIGNMENT", label: "Crew Assignments" },
  { key: "SYSTEM", label: "System Alerts" },
] as const;

/* ── Date Grouping Helper ─────────────────────────────────────────────────── */
function groupDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  if (d >= startOfToday) return "Today";
  if (d >= startOfYesterday) return "Yesterday";
  if (d >= startOfWeek) return "This Week";
  return d.toLocaleDateString("en-PH", { month: "long", year: "numeric" });
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [readFilter, setReadFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useNotifications(page, pageSize);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = useMemo(() => data?.data || [], [data?.data]);
  const pagination = data?.pagination;

  // KPI Statistics
  const stats = useMemo(() => {
    const total = pagination?.total || notifications.length;
    const unread = notifications.filter((n) => !n.isRead).length;
    const reports = notifications.filter((n) => n.type === "NEW_REPORT").length;
    const operations = notifications.filter(
      (n) => n.type === "STATUS_CHANGE" || n.type === "ASSIGNMENT"
    ).length;
    return { total, unread, reports, operations };
  }, [notifications, pagination?.total]);

  // Filtered Notifications based on Type, Read state, and Search Query
  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      // Type Filter
      if (typeFilter !== "ALL" && n.type !== typeFilter) {
        return false;
      }
      // Read/Unread Filter
      if (readFilter === "UNREAD" && n.isRead) {
        return false;
      }
      if (readFilter === "READ" && !n.isRead) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = n.title?.toLowerCase().includes(q);
        const matchesMsg = n.message?.toLowerCase().includes(q);
        const matchesReport = n.report?.title?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesMsg && !matchesReport) {
          return false;
        }
      }
      return true;
    });
  }, [notifications, typeFilter, readFilter, searchQuery]);

  // Group by Date for Timeline View
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const n of filtered) {
      const label = groupDateLabel(n.createdAt);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(n);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const hasActiveFilters =
    typeFilter !== "ALL" || readFilter !== "ALL" || searchQuery.trim() !== "";

  const handleResetFilters = () => {
    setTypeFilter("ALL");
    setReadFilter("ALL");
    setSearchQuery("");
  };

  /* ── Loading Skeleton ─────────────────────────────────────────────────────── */
  if (isLoading && !data) {
    return (
      <div className="space-y-6 max-w-[1600px] mx-auto pb-12 animate-in fade-in duration-300">
        <PageHeadingSkeleton />
        <NotificationListSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-12 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* ── 1. Top Hero Command Banner ────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 rounded-3xl border border-gray-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-100 dark:border-blue-900/60 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Panabo City Operations & Coastal Care
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-100 dark:border-emerald-900/60 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Sync Active (5s)
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
                <BellRing className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              Notifications Center
            </h1>

            <p className="text-sm text-gray-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Stay informed on real-time waste report submissions, coastal cleanup schedules, crew assignments, and verification milestones.
            </p>
          </div>

          {/* Quick Mark All Read Action */}
          <div className="flex items-center gap-3 self-stretch sm:self-auto shrink-0">
            <Button
              variant={stats.unread > 0 ? "default" : "outline"}
              onClick={() => markAllAsRead.mutate()}
              disabled={stats.unread === 0 || markAllAsRead.isPending}
              className={cn(
                "w-full sm:w-auto h-11 px-5 rounded-2xl font-bold text-xs gap-2 transition-all duration-200 shadow-sm",
                stats.unread > 0
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-95"
                  : "bg-white dark:bg-slate-800 text-gray-400 dark:text-slate-500 border-gray-200 dark:border-slate-700 cursor-not-allowed"
              )}
            >
              <CheckCheck className="w-4 h-4" />
              {markAllAsRead.isPending
                ? "Marking as Read..."
                : stats.unread > 0
                ? `Mark All Read (${stats.unread})`
                : "All Caught Up"}
            </Button>
          </div>
        </div>
      </div>

      {/* ── 2. Executive Metric KPI Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Alerts */}
        <div
          onClick={() => {
            setTypeFilter("ALL");
            setReadFilter("ALL");
          }}
          className={cn(
            "p-5 rounded-3xl border transition-all duration-200 cursor-pointer relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.14)] hover:-translate-y-1",
            typeFilter === "ALL" && readFilter === "ALL"
              ? "bg-white dark:bg-slate-900 shadow-[0_12px_30px_rgba(59,130,246,0.25)] border-blue-400 dark:border-blue-500 ring-2 ring-blue-500/25 -translate-y-1"
              : "bg-white dark:bg-slate-900 border-gray-200/90 dark:border-slate-800"
          )}
        >
          {/* Subtle horizontal & vertical grid background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0, 0, 0, 0.5) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 1px, transparent 1px)
              `,
              backgroundSize: "22px 22px",
              maskImage: "linear-gradient(to bottom right, black 35%, transparent 85%)",
              WebkitMaskImage: "linear-gradient(to bottom right, black 35%, transparent 85%)",
            }}
          />

          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Total Alerts
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-3xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
              {stats.total}
            </span>
            <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">all time</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 relative z-10">Full operational log</p>
        </div>

        {/* Card 2: Unread / Action Required */}
        <div
          onClick={() =>
            setReadFilter(readFilter === "UNREAD" ? "ALL" : "UNREAD")
          }
          className={cn(
            "p-5 rounded-3xl border transition-all duration-200 cursor-pointer relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.14)] hover:-translate-y-1",
            readFilter === "UNREAD"
              ? "bg-white dark:bg-slate-900 shadow-[0_12px_30px_rgba(245,158,11,0.25)] border-amber-400 dark:border-amber-500 ring-2 ring-amber-500/25 -translate-y-1"
              : "bg-white dark:bg-slate-900 border-gray-200/90 dark:border-slate-800"
          )}
        >
          {/* Subtle horizontal & vertical grid background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0, 0, 0, 0.5) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 1px, transparent 1px)
              `,
              backgroundSize: "22px 22px",
              maskImage: "linear-gradient(to bottom right, black 35%, transparent 85%)",
              WebkitMaskImage: "linear-gradient(to bottom right, black 35%, transparent 85%)",
            }}
          />

          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              {stats.unread > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
              Action Required
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <BellRing className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-3xl font-black text-amber-950 dark:text-amber-200 tracking-tight">
              {stats.unread}
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-900/60">
              unread
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 relative z-10">Pending review & review</p>
        </div>

        {/* Card 3: Waste Reports */}
        <div
          onClick={() =>
            setTypeFilter(typeFilter === "NEW_REPORT" ? "ALL" : "NEW_REPORT")
          }
          className={cn(
            "p-5 rounded-3xl border transition-all duration-200 cursor-pointer relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.14)] hover:-translate-y-1",
            typeFilter === "NEW_REPORT"
              ? "bg-white dark:bg-slate-900 shadow-[0_12px_30px_rgba(99,102,241,0.25)] border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-500/25 -translate-y-1"
              : "bg-white dark:bg-slate-900 border-gray-200/90 dark:border-slate-800"
          )}
        >
          {/* Subtle horizontal & vertical grid background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0, 0, 0, 0.5) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 1px, transparent 1px)
              `,
              backgroundSize: "22px 22px",
              maskImage: "linear-gradient(to bottom right, black 35%, transparent 85%)",
              WebkitMaskImage: "linear-gradient(to bottom right, black 35%, transparent 85%)",
            }}
          />

          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
              Waste Submissions
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-3xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
              {stats.reports}
            </span>
            <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">on this page</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 relative z-10">Citizen & field submissions</p>
        </div>

        {/* Card 4: Operations & Updates */}
        <div
          onClick={() =>
            setTypeFilter(
              typeFilter === "STATUS_CHANGE" ? "ALL" : "STATUS_CHANGE"
            )
          }
          className={cn(
            "p-5 rounded-3xl border transition-all duration-200 cursor-pointer relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.14)] hover:-translate-y-1",
            typeFilter === "STATUS_CHANGE"
              ? "bg-white dark:bg-slate-900 shadow-[0_12px_30px_rgba(16,185,129,0.25)] border-emerald-400 dark:border-emerald-500 ring-2 ring-emerald-500/25 -translate-y-1"
              : "bg-white dark:bg-slate-900 border-gray-200/90 dark:border-slate-800"
          )}
        >
          {/* Subtle horizontal & vertical grid background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0, 0, 0, 0.5) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 1px, transparent 1px)
              `,
              backgroundSize: "22px 22px",
              maskImage: "linear-gradient(to bottom right, black 35%, transparent 85%)",
              WebkitMaskImage: "linear-gradient(to bottom right, black 35%, transparent 85%)",
            }}
          />

          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Crew & Milestones
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-3xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
              {stats.operations}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">active updates</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 relative z-10">Cleanup progress & verified sites</p>
        </div>
      </div>

      {/* ── 3. Search & Interactive Filter Toolbar ────────────────────────────── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
        {/* Left: Search input & Read status toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Live Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search notifications by title, report ID, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 h-10 rounded-2xl border-gray-200 dark:border-slate-700 text-xs font-medium bg-gray-50/50 dark:bg-slate-800/50 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Read Status Segmented Control */}
          <div className="bg-gray-100/90 dark:bg-slate-800/90 p-1 rounded-2xl inline-flex gap-1 border border-gray-200/60 dark:border-slate-700 shadow-inner self-start sm:self-auto shrink-0">
            <button
              onClick={() => setReadFilter("ALL")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200",
                readFilter === "ALL"
                  ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-sm"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
              )}
            >
              All Alerts
            </button>
            <button
              onClick={() => setReadFilter("UNREAD")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5",
                readFilter === "UNREAD"
                  ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-sm"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
              )}
            >
              <span>Unread</span>
              {stats.unread > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-blue-600 text-white">
                  {stats.unread}
                </span>
              )}
            </button>
            <button
              onClick={() => setReadFilter("READ")}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200",
                readFilter === "READ"
                  ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-sm"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
              )}
            >
              Read
            </button>
          </div>
        </div>

        {/* Right: Type Category Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto pb-1 lg:pb-0">
          {FILTER_OPTIONS.map((opt) => {
            const isSelected = typeFilter === opt.key;
            const count =
              opt.key === "ALL"
                ? notifications.length
                : notifications.filter((n) => n.type === opt.key).length;

            return (
              <button
                key={opt.key}
                onClick={() => {
                  setTypeFilter(opt.key);
                  setPage(1);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shrink-0 border",
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20"
                    : "bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700 shadow-2xs hover:shadow-xs"
                )}
              >
                <span>{opt.label}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-extrabold",
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 4. Active Filter Indicator Bar ──────────────────────────────────── */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between px-2 text-xs text-gray-500 dark:text-slate-400">
          <span>
            Showing <strong className="text-gray-900 dark:text-slate-100">{filtered.length}</strong>{" "}
            of {notifications.length} notifications matching active criteria
          </span>
          <button
            onClick={handleResetFilters}
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            Reset all filters
          </button>
        </div>
      )}

      {/* ── 5. Notifications Timeline List ──────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-dashed border-gray-200 dark:border-slate-800 shadow-xs p-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-50 to-indigo-100/70 dark:from-slate-800 dark:to-indigo-950/60 border border-blue-100 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner mb-4">
            <Inbox className="w-10 h-10 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 tracking-tight">
            {hasActiveFilters
              ? "No matching notifications found"
              : "All Caught Up!"}
          </h3>
          <p className="mt-1.5 max-w-sm text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
            {hasActiveFilters
              ? "We could not find any alerts matching your search keyword or selected filters. Try broadening your criteria."
              : "There are no pending alerts in the operations center. New report submissions and cleanup milestones will stream in live."}
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="mt-5 rounded-xl text-xs font-bold gap-1.5 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 dark:text-slate-300"
            >
              Clear Search & Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([groupLabel, items]) => (
            <section key={groupLabel} className="space-y-3">
              {/* Group Timeline Header */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 shadow-xs" />
                  <h2 className="text-xs font-black text-gray-700 dark:text-slate-300 uppercase tracking-widest">
                    {groupLabel}
                  </h2>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-gray-200 via-gray-100 to-transparent dark:from-slate-800 dark:via-slate-850 dark:to-transparent" />
                <span className="text-[11px] font-bold text-gray-400 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-gray-200/60 dark:border-slate-700">
                  {items.length} {items.length === 1 ? "alert" : "alerts"}
                </span>
              </div>

              {/* Notification Cards */}
              <div className="space-y-3">
                {items.map((n) => {
                  const config = typeConfig[n.type] || typeConfig.SYSTEM;
                  const Icon = config.icon;
                  const exactTime = format(new Date(n.createdAt), "PPpp");

                  return (
                    <div
                      key={n.id}
                      className={cn(
                        "group relative flex flex-col sm:flex-row sm:items-start gap-4 p-5 rounded-2xl border transition-all duration-200 overflow-hidden",
                        !n.isRead
                          ? `bg-gradient-to-r from-blue-50/85 via-indigo-50/25 to-white dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900 border-blue-200/90 dark:border-blue-900/50 shadow-2xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800 border-l-[4px] ${config.borderAccent}`
                          : "bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800/80 border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 shadow-2xs hover:shadow-sm border-l-[4px] border-l-transparent"
                      )}
                    >
                      {/* Left: Type Icon Container */}
                      <div
                        className={cn(
                          "w-11 h-11 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-200",
                          config.gradientBg
                        )}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>

                      {/* Middle: Content Information Architecture */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        {/* Top Line: Badge, Title, Timestamp */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Type Pill */}
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-2xs",
                                config.pillBg,
                                config.pillText,
                                config.pillBorder
                              )}
                            >
                              {config.label}
                            </span>

                            {/* Unread Indicator Badge */}
                            {!n.isRead && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100/90 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                                New
                              </span>
                            )}
                          </div>

                          {/* Relative Timestamp with tooltip */}
                          <div
                            className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500 font-medium whitespace-nowrap"
                            title={exactTime}
                          >
                            <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                            <span>{timeAgo(n.createdAt)}</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3
                          className={cn(
                            "text-sm tracking-tight leading-snug",
                            !n.isRead
                              ? "font-extrabold text-gray-900 dark:text-slate-100"
                              : "font-semibold text-gray-800 dark:text-slate-200"
                          )}
                        >
                          {n.title}
                        </h3>

                        {/* Message Body */}
                        <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed font-normal">
                          {n.message}
                        </p>

                        {/* Bottom Metadata & Action Buttons */}
                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-gray-100/60 dark:border-slate-800 mt-2">
                          {/* Left: Linked Entity Info */}
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                            {n.reportId && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 text-[11px] font-mono">
                                <FileText className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                                ID: {n.reportId.slice(0, 8)}...
                              </span>
                            )}
                            {n.report?.title && (
                              <span className="text-[11px] text-gray-500 dark:text-slate-400 truncate max-w-[200px]">
                                &ldquo;{n.report.title}&rdquo;
                              </span>
                            )}
                          </div>

                          {/* Right: Quick Action Controls */}
                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            {n.reportId && (
                              <Link href={`/dashboard/reports/${n.reportId}`}>
                                <Button
                                  size="sm"
                                  className="h-8 rounded-xl text-xs font-bold gap-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white shadow-2xs shadow-blue-500/20 active:scale-95 transition-all"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  View Report
                                </Button>
                              </Link>
                            )}

                            {!n.isRead && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => markAsRead.mutate(n.id)}
                                disabled={markAsRead.isPending}
                                className="h-8 rounded-xl text-xs font-bold gap-1.5 px-3 text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-950/50 border-gray-200 dark:border-slate-700 transition-all"
                                title="Mark this notification as read"
                              >
                                <CheckCheck className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
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

      {/* ── 6. Modern Pagination Controls ───────────────────────────────────── */}
      {pagination && pagination.total > 0 && (
        <PaginationControls
          currentPage={pagination.page}
          totalRecords={pagination.total}
          pageSize={pagination.limit || pageSize}
          totalPages={pagination.totalPages}
          onPageChange={(newPage) => {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          itemName="notifications"
          className="mt-6 border-t border-gray-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl"
        />
      )}
    </div>
  );
}

