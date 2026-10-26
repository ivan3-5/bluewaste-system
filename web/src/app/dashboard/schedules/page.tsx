"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CleanupSchedule, User } from "@/types";
import api from "@/lib/api";
import { ScheduleCalendar } from "@/components/schedules/ScheduleCalendar";
import { ScheduleList } from "@/components/schedules/ScheduleList";
import { ScheduleForm } from "@/components/schedules/ScheduleForm";
import { ScheduleDetail } from "@/components/schedules/ScheduleDetail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Calendar,
  List,
  Clock,
  CheckCircle2,
  XCircle,
  LayoutList,
  MapPin,
  Map as MapIcon,
  Search,
  Filter,
  RotateCw,
  X,
  Sparkles,
  ShieldCheck,
  Radio,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { SchedulePageSkeleton } from "@/components/skeletons/page-skeletons";


// Dynamically load Leaflet Map without SSR to prevent window errors
const ScheduleMap = dynamic(
  () => import("@/components/schedules/ScheduleMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[620px] w-full rounded-3xl bg-white/70 backdrop-blur-xl border border-gray-100 flex flex-col items-center justify-center text-gray-400 gap-3 shadow-sm animate-pulse">
        <MapIcon className="w-10 h-10 text-indigo-400 animate-bounce" />
        <p className="text-sm font-semibold text-gray-600">
          Loading Coastal GIS Map & Deployment Pins...
        </p>
      </div>
    ),
  },
);

export default function SchedulesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // View state
  const [view, setView] = useState<"calendar" | "list" | "map">("calendar");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<CleanupSchedule | null>(null);
  const [editingSchedule, setEditingSchedule] =
    useState<CleanupSchedule | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Queries
  const {
    data: schedulesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      const res = await api.get("/schedules?limit=1000");
      return res.data.data as CleanupSchedule[];
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  const { data: workers = [] } = useQuery({
    queryKey: ["workers"],
    queryFn: async () => {
      const res = await api.get("/users?role=FIELD_WORKER&limit=100");
      return res.data.data as User[];
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post("/schedules", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({
        queryKey: ["reports", "eligible-for-schedule"],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/schedules/${id}`, data);
      return res.data as CleanupSchedule;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({
        queryKey: ["reports", "eligible-for-schedule"],
      });
      setSelectedSchedule(updated);
      setIsDetailOpen(true);
      setIsFormOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/schedules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({
        queryKey: ["reports", "eligible-for-schedule"],
      });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      await api.put(`/schedules/${id}/status`, { status: "COMPLETED", notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleFormSubmit = async (data: any) => {
    if (editingSchedule?.id) {
      await updateMutation.mutateAsync({ id: editingSchedule.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (schedule: CleanupSchedule) => {
    setEditingSchedule(schedule);
    setIsFormOpen(true);
    setIsDetailOpen(false);
  };

  const handleRefresh = (schedule: CleanupSchedule) => {
    setSelectedSchedule(schedule);
    setIsDetailOpen(true);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    if (!schedulesData) {
      return {
        total: 0,
        upcoming: 0,
        completed: 0,
        cancelled: 0,
        completionRate: 0,
      };
    }
    const total = schedulesData.length;
    const upcoming = schedulesData.filter(
      (s) => s.status === "UPCOMING" || s.status === "ONGOING",
    ).length;
    const completed = schedulesData.filter(
      (s) => s.status === "COMPLETED",
    ).length;
    const cancelled = schedulesData.filter(
      (s) => s.status === "CANCELLED",
    ).length;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, upcoming, completed, cancelled, completionRate };
  }, [schedulesData]);

  // Filtered schedules for views
  const filteredSchedules = useMemo(() => {
    if (!schedulesData) return [];

    return schedulesData.filter((schedule) => {
      // Search filter (title, barangay, description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = schedule.title?.toLowerCase().includes(q);
        const matchesBarangay = schedule.barangay?.toLowerCase().includes(q);
        const matchesDesc = schedule.description?.toLowerCase().includes(q);
        const matchesWorker = schedule.workers?.some((w) =>
          `${w.worker.firstName} ${w.worker.lastName}`.toLowerCase().includes(q),
        );
        if (!matchesTitle && !matchesBarangay && !matchesDesc && !matchesWorker) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "ALL") {
        if (statusFilter === "UPCOMING_OR_ONGOING") {
          if (schedule.status !== "UPCOMING" && schedule.status !== "ONGOING") {
            return false;
          }
        } else if (schedule.status !== statusFilter) {
          return false;
        }
      }

      return true;
    });
  }, [schedulesData, searchQuery, statusFilter]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    statusFilter !== "ALL";

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
  };

  return (
    <div className="space-y-7 pb-12 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* ── Top Hero Command Banner ─────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/40 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-800 rounded-3xl border border-gray-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-100 dark:border-blue-900/40">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                LGU Coastal Care & Resource Management
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-100 dark:border-emerald-900/40">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Sync Active
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
              Cleanup Operations & Schedules
            </h1>
            <p className="text-gray-600 dark:text-slate-400 text-sm md:text-base max-w-2xl font-normal leading-relaxed">
              Coordinate municipal beach sweeps, assign field workers, allocate
              protective equipment, and monitor verified waste clearance across
              Panabo City shorelines.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={handleManualRefresh}
              title="Refresh operational data"
              disabled={isRefreshing}
              className="h-11 w-11 rounded-2xl border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 shadow-sm transition-transform active:scale-95"
            >
              <RotateCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin text-indigo-600 dark:text-indigo-400" : ""}`}
              />
            </Button>

            <Button
              onClick={() => {
                setEditingSchedule(null);
                setIsFormOpen(true);
              }}
              className="flex-1 sm:flex-none h-11 px-6 gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-95 rounded-2xl font-bold text-sm border-none"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              Create Cleanup Schedule
            </Button>
          </div>
        </div>
      </div>

      {/* ── Executive KPI Cards (With Click-to-Filter) ─────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total */}
        <div
          onClick={() => setStatusFilter("ALL")}
          className={`p-5 rounded-2xl transition-all duration-200 cursor-pointer relative overflow-hidden group border ${
            statusFilter === "ALL" && !hasActiveFilters
              ? "bg-white dark:bg-slate-900 shadow-[0_12px_30px_rgba(99,102,241,0.22)] border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-500/20 -translate-y-1"
              : "bg-white dark:bg-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.14)] hover:-translate-y-1 border-gray-200/80 dark:border-slate-800"
          }`}
        >
          {/* Subtle horizontal & vertical grid background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
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
              Total Operations
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <LayoutList className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-3xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
              {stats.total}
            </span>
            <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">all time</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 relative z-10">
            Registered coastal missions
          </p>
        </div>

        {/* Card 2: Upcoming & Ongoing */}
        <div
          onClick={() =>
            setStatusFilter(
              statusFilter === "UPCOMING_OR_ONGOING" ? "ALL" : "UPCOMING_OR_ONGOING",
            )
          }
          className={`p-5 rounded-2xl transition-all duration-200 cursor-pointer relative overflow-hidden group border ${
            statusFilter === "UPCOMING_OR_ONGOING"
              ? "bg-white dark:bg-slate-900 shadow-[0_12px_30px_rgba(245,158,11,0.22)] border-amber-400 dark:border-amber-500 ring-2 ring-amber-500/20 -translate-y-1"
              : "bg-white dark:bg-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.14)] hover:-translate-y-1 border-gray-200/80 dark:border-slate-800"
          }`}
        >
          {/* Subtle horizontal & vertical grid background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
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
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Upcoming & Ongoing
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-3xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
              {stats.upcoming}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">active</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 relative z-10">
            Pending crew mobilization
          </p>
        </div>

        {/* Card 3: Completed */}
        <div
          onClick={() =>
            setStatusFilter(statusFilter === "COMPLETED" ? "ALL" : "COMPLETED")
          }
          className={`p-5 rounded-2xl transition-all duration-200 cursor-pointer relative overflow-hidden group border ${
            statusFilter === "COMPLETED"
              ? "bg-white dark:bg-slate-900 shadow-[0_12px_30px_rgba(16,185,129,0.22)] border-emerald-400 dark:border-emerald-500 ring-2 ring-emerald-500/20 -translate-y-1"
              : "bg-white dark:bg-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.14)] hover:-translate-y-1 border-gray-200/80 dark:border-slate-800"
          }`}
        >
          {/* Subtle horizontal & vertical grid background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
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
              Completed & Verified
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-3xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
              {stats.completed}
            </span>
            {stats.total > 0 && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/40">
                {stats.completionRate}% cleared
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 relative z-10">
            Shoreline verified clean
          </p>
        </div>

        {/* Card 4: Cancelled */}
        <div
          onClick={() =>
            setStatusFilter(statusFilter === "CANCELLED" ? "ALL" : "CANCELLED")
          }
          className={`p-5 rounded-2xl transition-all duration-200 cursor-pointer relative overflow-hidden group border ${
            statusFilter === "CANCELLED"
              ? "bg-white dark:bg-slate-900 shadow-[0_12px_30px_rgba(244,63,94,0.22)] border-rose-400 dark:border-rose-500 ring-2 ring-rose-500/20 -translate-y-1"
              : "bg-white dark:bg-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.14)] hover:-translate-y-1 border-gray-200/80 dark:border-slate-800"
          }`}
        >
          {/* Subtle horizontal & vertical grid background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
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
              Cancelled / Deferred
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-3xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
              {stats.cancelled}
            </span>
            <span className="text-xs text-gray-400 dark:text-slate-500">deferred</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 relative z-10">Called off or rescheduled</p>
        </div>
      </div>

      {/* ── Toolbar: Search, Filters & 3-Way View Switcher ────────── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-3.5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
        {/* Search & Dropdown Filters */}
        <div className="flex items-center gap-2.5 flex-1 flex-wrap">
          {/* Live Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by operation title, location, worker..."
              className="pl-9 pr-8 h-10 text-xs rounded-2xl border-gray-200/90 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus-visible:ring-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-2xl border border-gray-200/90 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800 px-3.5 text-xs font-semibold text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="UPCOMING_OR_ONGOING">Upcoming & Ongoing</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Reset Filters Chip */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="h-10 px-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200/60 dark:border-indigo-800/60 flex items-center gap-1.5 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>

        {/* 3-Way View Switcher */}
        <div className="bg-gray-100/90 dark:bg-slate-800 p-1 rounded-2xl inline-flex self-start lg:self-auto gap-1 border border-gray-200/50 dark:border-slate-700 shadow-inner">
          <button
            onClick={() => setView("calendar")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              view === "calendar"
                ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-sm"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-slate-700/40"
            }`}
          >
            <Calendar className="w-4 h-4" /> Calendar
          </button>
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              view === "list"
                ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-sm"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-slate-700/40"
            }`}
          >
            <List className="w-4 h-4" /> List
          </button>
          <button
            onClick={() => setView("map")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              view === "map"
                ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-sm"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-slate-700/40"
            }`}
          >
            <MapIcon className="w-4 h-4" /> Coastal Map
          </button>
        </div>
      </div>

      {/* ── Active Filters Summary Indicator ───────────────────────── */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between px-2 text-xs text-gray-500 dark:text-slate-400">
          <span>
            Showing{" "}
            <span className="font-bold text-gray-900 dark:text-slate-100">
              {filteredSchedules.length}
            </span>{" "}
            of {schedulesData?.length || 0} operations matching filters
          </span>
          <button
            onClick={clearAllFilters}
            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* ── Content View Area ─────────────────────────────────────── */}
      {isLoading ? (
        <SchedulePageSkeleton />
      ) : (
        <div className="animate-in fade-in duration-300">
          {view === "calendar" && (
            <ScheduleCalendar
              schedules={filteredSchedules}
              onEventClick={(schedule) => {
                setSelectedSchedule(schedule);
                setIsDetailOpen(true);
              }}
              onDateClick={(date) => {
                const tzOffset = date.getTimezoneOffset() * 60000;
                const localISOTime = new Date(date.getTime() - tzOffset)
                  .toISOString()
                  .slice(0, -1);
                setEditingSchedule({ scheduledAt: localISOTime } as any);
                setIsFormOpen(true);
              }}
            />
          )}

          {view === "list" && (
            <ScheduleList
              schedules={filteredSchedules}
              onRowClick={(schedule) => {
                setSelectedSchedule(schedule);
                setIsDetailOpen(true);
              }}
              onEditClick={(schedule) => {
                handleEdit(schedule);
              }}
            />
          )}

          {view === "map" && (
            <ScheduleMap
              schedules={filteredSchedules}
              onScheduleClick={(schedule) => {
                setSelectedSchedule(schedule);
                setIsDetailOpen(true);
              }}
            />
          )}
        </div>
      )}

      {/* ── Create / Edit Schedule Modal ──────────────────────────── */}
      {isFormOpen && (
        <ScheduleForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingSchedule(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingSchedule}
          workers={workers}
          isEditing={!!editingSchedule && !!editingSchedule.id}
        />
      )}

      {/* ── Schedule Detail Mission Briefing Modal ────────────────── */}
      {selectedSchedule && (
        <ScheduleDetail
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          schedule={selectedSchedule}
          onEdit={handleEdit}
          onRefresh={handleRefresh}
          onDelete={async (id) => {
            await deleteMutation.mutateAsync(id);
          }}
          onVerify={async (id, notes) => {
            await verifyMutation.mutateAsync({ id, notes });
          }}
          isAdmin={user?.role === "LGU_ADMIN"}
        />
      )}
    </div>
  );
}
