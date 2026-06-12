"use client";

import React from "react";
import { CleanupSchedule, SCHEDULE_STATUS_COLORS, SCHEDULE_STATUS_LABELS } from "@/types";
import { format } from "date-fns";
import { MapPin, CalendarDays, Users } from "lucide-react";

interface ScheduleListProps {
  schedules: CleanupSchedule[];
  onRowClick: (schedule: CleanupSchedule) => void;
}

export function ScheduleList({ schedules, onRowClick }: ScheduleListProps) {
  if (schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100/60 shadow-sm">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
          <CalendarDays className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium text-lg">No cleanup schedules found.</p>
        <p className="text-gray-400 text-sm mt-1">Check back later or create a new one.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 overflow-hidden transition-all">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-50/50 text-gray-500 font-semibold border-b border-gray-100 uppercase text-[11px] tracking-wider">
            <tr>
              <th className="px-6 py-5 whitespace-nowrap">Title & Location</th>
              <th className="px-6 py-5 whitespace-nowrap">Date & Time</th>
              <th className="px-6 py-5 whitespace-nowrap">Workers</th>
              <th className="px-6 py-5 whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50/80">
            {schedules.map((schedule) => (
              <tr
                key={schedule.id}
                onClick={() => onRowClick(schedule)}
                className="hover:bg-white cursor-pointer transition-all duration-300 group hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 relative"
              >
                <td className="px-6 py-5">
                  <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors text-base mb-1 line-clamp-1">
                    {schedule.title}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    {schedule.barangay || "No location specified"}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-900 font-medium">
                      {format(new Date(schedule.scheduledAt), "MMM d, yyyy")}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {format(new Date(schedule.scheduledAt), "h:mm a")}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center">
                    {schedule.workers.length === 0 ? (
                      <span className="text-gray-400 text-xs italic">Unassigned</span>
                    ) : (
                      <div className="flex items-center -space-x-2">
                        {schedule.workers.slice(0, 3).map((w, idx) => (
                          <div 
                            key={w.workerId} 
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 border-2 border-white flex items-center justify-center text-indigo-700 font-bold text-xs shadow-sm z-10"
                            style={{ zIndex: 30 - idx }}
                            title={`${w.worker.firstName} ${w.worker.lastName}`}
                          >
                            {w.worker.firstName[0]}
                          </div>
                        ))}
                        {schedule.workers.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-600 font-bold text-xs shadow-sm z-0">
                            +{schedule.workers.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm"
                    style={{
                      backgroundColor: `${SCHEDULE_STATUS_COLORS[schedule.status]}15`,
                      color: SCHEDULE_STATUS_COLORS[schedule.status],
                      border: `1px solid ${SCHEDULE_STATUS_COLORS[schedule.status]}30`,
                    }}
                  >
                    {SCHEDULE_STATUS_LABELS[schedule.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
