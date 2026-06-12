"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CleanupSchedule } from "@/types";
import api from "@/lib/api";
import { ScheduleCalendar } from "@/components/schedules/ScheduleCalendar";
import { ScheduleList } from "@/components/schedules/ScheduleList";
import { ScheduleDetail } from "@/components/schedules/ScheduleDetail";
import { Calendar, List } from "lucide-react";

export default function WorkerSchedulesPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"list" | "calendar">("list");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<CleanupSchedule | null>(null);

  const { data: schedulesData, isLoading } = useQuery({
    queryKey: ["my-schedules"],
    queryFn: async () => {
      const res = await api.get("/schedules/my-schedules?limit=100");
      return res.data.data as CleanupSchedule[];
    },
    refetchInterval: 15000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: string;
      notes?: string;
    }) => {
      await api.put(`/schedules/${id}/status`, { status, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-schedules"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Schedules</h1>
          <p className="text-gray-500 text-sm">
            View your assigned cleanup activities and update progress.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-1 inline-flex shadow-sm border">
        <button
          onClick={() => setView("list")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            view === "list"
              ? "bg-gray-100 text-gray-900"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <List className="w-4 h-4" /> List
        </button>
        <button
          onClick={() => setView("calendar")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            view === "calendar"
              ? "bg-gray-100 text-gray-900"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <Calendar className="w-4 h-4" /> Calendar
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          Loading schedules...
        </div>
      ) : (
        <>
          {view === "list" && (
            <ScheduleList
              schedules={schedulesData || []}
              onRowClick={(schedule) => {
                setSelectedSchedule(schedule);
                setIsDetailOpen(true);
              }}
            />
          )}
          {view === "calendar" && (
            <ScheduleCalendar
              schedules={schedulesData || []}
              onEventClick={(schedule) => {
                setSelectedSchedule(schedule);
                setIsDetailOpen(true);
              }}
            />
          )}
        </>
      )}

      {selectedSchedule && (
        <ScheduleDetail
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          schedule={selectedSchedule}
          onEdit={() => {}} // Workers can't edit
          onDelete={async () => {}} // Workers can't delete
          onVerify={async () => {}} // Workers can't verify
          onWorkerUpdateStatus={async (id, status, notes) => {
            await updateStatusMutation.mutateAsync({ id, status, notes });
          }}
          isAdmin={false}
        />
      )}
    </div>
  );
}
