"use client";

import React from "react";
import {
  CleanupSchedule,
  SCHEDULE_STATUS_COLORS,
  SCHEDULE_STATUS_LABELS,
} from "@/types";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import {
  MapPin,
  CalendarDays,
  Users,
  Clock,
  Wrench,
  FileText,
  ChevronRight,
  AlertTriangle,
  ArrowUpRight,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScheduleListProps {
  schedules: CleanupSchedule[];
  onRowClick: (schedule: CleanupSchedule) => void;
  onEditClick?: (schedule: CleanupSchedule) => void;
}

export function ScheduleList({
  schedules,
  onRowClick,
  onEditClick,
}: ScheduleListProps) {
  if (schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 bg-white/70 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100 shadow-inner">
          <CalendarDays className="w-8 h-8 text-indigo-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">
          No Cleanup Operations Found
        </h3>
        <p className="text-gray-500 text-sm mt-1 max-w-sm">
          No operations match the selected criteria. Adjust your search or create
          a new cleanup schedule.
        </p>
      </div>
    );
  }

  // Helper for human-friendly timing tag
  const getRelativeTimeBadge = (dateString: string) => {
    try {
      const d = new Date(dateString);
      if (isToday(d)) {
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Today
          </span>
        );
      }
      if (isTomorrow(d)) {
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Tomorrow
          </span>
        );
      }
      if (isPast(d)) {
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
            Past
          </span>
        );
      }
      return null;
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Desktop / Tablet Enterprise Table View (hidden on small mobile) */}
      <div className="hidden md:block bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50/80 text-gray-500 font-bold border-b border-gray-100 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Operation & Site</th>
                <th className="px-6 py-4">Scheduled Window</th>
                <th className="px-6 py-4">Assigned Workers</th>
                <th className="px-6 py-4">Equipment & Reports</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80">
              {schedules.map((schedule) => {
                const reportCount = schedule.reports?.length || 0;
                const equipmentCount = schedule.equipment?.length || 0;
                const workerCount = schedule.workers?.length || 0;

                return (
                  <tr
                    key={schedule.id}
                    onClick={() => onRowClick(schedule)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-all duration-200 group relative"
                  >
                    {/* Operation Title & Location */}
                    <td className="px-6 py-4.5">
                      <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors text-sm mb-1 line-clamp-1 flex items-center gap-2">
                        {schedule.title}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-600 font-medium bg-gray-100/80 px-2 py-0.5 rounded-md">
                          <MapPin className="w-3 h-3 text-blue-500" />
                          {schedule.barangay || "Panabo Coastal Zone"}
                        </span>
                        {reportCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/60">
                            <FileText className="w-3 h-3" />
                            {reportCount} {reportCount === 1 ? "report" : "reports"}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Scheduled Window */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 text-gray-900 font-semibold text-xs">
                          <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                          {format(
                            new Date(schedule.scheduledAt),
                            "MMM d, yyyy",
                          )}
                          {getRelativeTimeBadge(schedule.scheduledAt)}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {format(new Date(schedule.scheduledAt), "h:mm a")}
                        </div>
                      </div>
                    </td>

                    {/* Field Crew */}
                    <td className="px-6 py-4.5">
                      {workerCount === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/60 text-xs font-semibold">
                          <AlertTriangle className="w-3 h-3" />
                          Unassigned
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center -space-x-2 overflow-hidden">
                            {schedule.workers.slice(0, 3).map((w, idx) => (
                              <div
                                key={w.workerId}
                                className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 border-2 border-white flex items-center justify-center text-white font-bold text-[11px] shadow-sm z-10"
                                style={{ zIndex: 30 - idx }}
                                title={`${w.worker.firstName} ${w.worker.lastName}`}
                              >
                                {w.worker.firstName[0]}
                              </div>
                            ))}
                            {workerCount > 3 && (
                              <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-600 font-bold text-[10px] shadow-sm z-0">
                                +{workerCount - 3}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-600 font-medium">
                            {workerCount} {workerCount === 1 ? "worker" : "workers"}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Equipment & Scope */}
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {equipmentCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold">
                            <Wrench className="w-3 h-3 text-blue-600" />
                            {equipmentCount} gear items
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            Standard kit
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
                        style={{
                          backgroundColor: `${SCHEDULE_STATUS_COLORS[schedule.status]}12`,
                          color: SCHEDULE_STATUS_COLORS[schedule.status],
                          border: `1px solid ${SCHEDULE_STATUS_COLORS[schedule.status]}30`,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor:
                              SCHEDULE_STATUS_COLORS[schedule.status],
                          }}
                        />
                        {SCHEDULE_STATUS_LABELS[schedule.status]}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRowClick(schedule);
                          }}
                          className="h-8 px-3 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        >
                          Details
                          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Optimized Cards (< md screens) */}
      <div className="md:hidden space-y-3">
        {schedules.map((schedule) => {
          const reportCount = schedule.reports?.length || 0;
          const equipmentCount = schedule.equipment?.length || 0;
          const workerCount = schedule.workers?.length || 0;

          return (
            <div
              key={schedule.id}
              onClick={() => onRowClick(schedule)}
              className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-gray-100 shadow-sm active:scale-[0.99] transition-all space-y-3"
            >
              {/* Header: Title and Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-sm leading-snug truncate">
                    {schedule.title}
                  </h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-blue-500" />
                    {schedule.barangay || "Panabo Coastal Zone"}
                  </p>
                </div>
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0"
                  style={{
                    backgroundColor: `${SCHEDULE_STATUS_COLORS[schedule.status]}15`,
                    color: SCHEDULE_STATUS_COLORS[schedule.status],
                    border: `1px solid ${SCHEDULE_STATUS_COLORS[schedule.status]}30`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: SCHEDULE_STATUS_COLORS[schedule.status],
                    }}
                  />
                  {SCHEDULE_STATUS_LABELS[schedule.status]}
                </span>
              </div>

              {/* Schedule time */}
              <div className="flex items-center justify-between text-xs text-gray-700 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-1.5 font-medium">
                  <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                  {format(new Date(schedule.scheduledAt), "MMM d, yyyy")} •{" "}
                  {format(new Date(schedule.scheduledAt), "h:mm a")}
                </div>
                {getRelativeTimeBadge(schedule.scheduledAt)}
              </div>

              {/* Crew and gear summary */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  {workerCount === 0 ? (
                    <span className="text-amber-600 font-semibold">
                      Unassigned
                    </span>
                  ) : (
                    <span className="text-gray-600 font-medium">
                      {workerCount} workers
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {equipmentCount > 0 && (
                    <span className="text-blue-700 font-medium bg-blue-50 px-2 py-0.5 rounded-md">
                      {equipmentCount} gear
                    </span>
                  )}
                  {reportCount > 0 && (
                    <span className="text-indigo-700 font-medium bg-indigo-50 px-2 py-0.5 rounded-md">
                      {reportCount} reports
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
