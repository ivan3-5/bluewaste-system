"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CleanupSchedule, User } from "@/types";
import api from "@/lib/api";
import { ScheduleCalendar } from "@/components/schedules/ScheduleCalendar";
import { ScheduleList } from "@/components/schedules/ScheduleList";
import { ScheduleForm } from "@/components/schedules/ScheduleForm";
import { ScheduleDetail } from "@/components/schedules/ScheduleDetail";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Calendar,
  List,
  Clock,
  CheckCircle2,
  XCircle,
  LayoutList,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export default function SchedulesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<CleanupSchedule | null>(null);
  const [editingSchedule, setEditingSchedule] =
    useState<CleanupSchedule | null>(null);

  const { data: schedulesData, isLoading } = useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      const res = await api.get("/schedules?limit=1000"); // fetch all for calendar/map
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

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post("/schedules", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/schedules/${id}`, data);
      return res.data as CleanupSchedule;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["reports", "eligible-for-schedule"] });
      // Refresh the detail modal with the latest data
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

  const stats = useMemo(() => {
    if (!schedulesData)
      return { total: 0, upcoming: 0, completed: 0, cancelled: 0 };
    return {
      total: schedulesData.length,
      upcoming: schedulesData.filter(
        (s) => s.status === "UPCOMING" || s.status === "ONGOING",
      ).length,
      completed: schedulesData.filter((s) => s.status === "COMPLETED").length,
      cancelled: schedulesData.filter((s) => s.status === "CANCELLED").length,
    };
  }, [schedulesData]);

  return (
    <div className="space-y-8 pb-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            Cleanup Schedules
            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold border border-indigo-100/50">
              {stats.total} Total
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">
            Coordinate and manage coastal cleanup operations efficiently.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={() => {
              setEditingSchedule(null);
              setIsFormOpen(true);
            }}
            className="flex-1 sm:flex-none h-11 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-95 rounded-xl font-semibold border-none"
          >
            <Plus className="w-5 h-5" /> New Schedule
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow duration-300">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <LayoutList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-0.5">
              Total Operations
            </p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow duration-300">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-0.5">
              Upcoming & Ongoing
            </p>
            <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow duration-300">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-0.5">
              Completed
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.completed}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow duration-300">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-0.5">
              Cancelled
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.cancelled}
            </p>
          </div>
        </div>
      </div>

      {/* Controls & View Toggle */}
      <div className="flex justify-center sm:justify-start">
        <div className="bg-gray-100/80 backdrop-blur-md rounded-2xl p-1.5 inline-flex shadow-inner border border-gray-200/50">
          <button
            onClick={() => setView("calendar")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              view === "calendar"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            <Calendar className="w-4 h-4" /> Calendar
          </button>
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              view === "list"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            <List className="w-4 h-4" /> List
          </button>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[500px] bg-white/50 rounded-3xl border border-gray-100 backdrop-blur-sm">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-4 font-medium text-indigo-600/80 animate-pulse">
            Loading operations...
          </p>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {view === "calendar" && (
            <ScheduleCalendar
              schedules={schedulesData || []}
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
              schedules={schedulesData || []}
              onRowClick={(schedule) => {
                setSelectedSchedule(schedule);
                setIsDetailOpen(true);
              }}
            />
          )}
        </div>
      )}

      {/* Modals */}
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
