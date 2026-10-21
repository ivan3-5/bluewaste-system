"use client";

import React, { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import {
  CleanupSchedule,
  SCHEDULE_STATUS_COLORS,
  SCHEDULE_STATUS_LABELS,
} from "@/types";
import { format } from "date-fns";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Info,
  Sparkles,
} from "lucide-react";

interface ScheduleCalendarProps {
  schedules: CleanupSchedule[];
  onEventClick: (schedule: CleanupSchedule) => void;
  onDateClick?: (date: Date) => void;
}

export function ScheduleCalendar({
  schedules,
  onEventClick,
  onDateClick,
}: ScheduleCalendarProps) {
  const events = useMemo(() => {
    return schedules.map((schedule) => ({
      id: schedule.id,
      title: schedule.title,
      start: schedule.scheduledAt,
      backgroundColor: SCHEDULE_STATUS_COLORS[schedule.status] || "#3b82f6",
      borderColor: "transparent",
      textColor: "#ffffff",
      extendedProps: {
        schedule,
      },
    }));
  }, [schedules]);

  // Status breakdown for the calendar header banner
  const statusCounts = useMemo(() => {
    return {
      upcoming: schedules.filter((s) => s.status === "UPCOMING").length,
      ongoing: schedules.filter((s) => s.status === "ONGOING").length,
      completed: schedules.filter((s) => s.status === "COMPLETED").length,
      cancelled: schedules.filter((s) => s.status === "CANCELLED").length,
    };
  }, [schedules]);

  return (
    <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-8 transition-all hover:shadow-[0_16px_40px_rgb(0,0,0,0.06)]">
      {/* Calendar Top Operational Legend & Guidance Banner */}
      <div className="mb-6 pb-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-100 text-indigo-600 flex items-center justify-center font-bold shadow-inner">
            <CalendarDays className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              Monthly Operational Timeline
            </h3>
            <p className="text-xs text-gray-500">
              Click any future date to deploy a new cleanup mission, or select an event to view briefing
            </p>
          </div>
        </div>

        {/* Status Legend Pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-semibold">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100/70">
            <span className="w-2 h-2 rounded-full bg-blue-500 ring-2 ring-blue-200" />
            Upcoming ({statusCounts.upcoming})
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100/70">
            <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-amber-200" />
            Ongoing ({statusCounts.ongoing})
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100/70">
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
            Completed ({statusCounts.completed})
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100/70">
            <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-200" />
            Cancelled ({statusCounts.cancelled})
          </div>
        </div>
      </div>

      <div
        className="calendar-container
        [&_.fc]:font-sans
        
        /* Grid and Borders */
        [&_.fc-theme-standard_.fc-scrollgrid]:border-transparent
        [&_.fc-theme-standard_td]:border-gray-100
        [&_.fc-theme-standard_th]:border-gray-100
        [&_.fc-theme-standard_th]:border-b-gray-200
        
        /* Header Cells */
        [&_.fc-col-header-cell]:py-3.5 [&_.fc-col-header-cell]:bg-gray-50/50
        [&_.fc-col-header-cell-cushion]:font-bold [&_.fc-col-header-cell-cushion]:text-gray-500 [&_.fc-col-header-cell-cushion]:uppercase [&_.fc-col-header-cell-cushion]:text-[11px] [&_.fc-col-header-cell-cushion]:tracking-wider [&_.fc-col-header-cell-cushion]:hover:no-underline
        
        /* Day Numbers */
        [&_.fc-daygrid-day-number]:text-sm [&_.fc-daygrid-day-number]:text-gray-700 [&_.fc-daygrid-day-number]:font-semibold [&_.fc-daygrid-day-number]:hover:no-underline
        [&_.fc-daygrid-day-number]:w-8 [&_.fc-daygrid-day-number]:h-8 [&_.fc-daygrid-day-number]:flex [&_.fc-daygrid-day-number]:items-center [&_.fc-daygrid-day-number]:justify-center [&_.fc-daygrid-day-number]:rounded-full [&_.fc-daygrid-day-number]:m-2 [&_.fc-daygrid-day-number]:transition-colors
        [&_.fc-daygrid-day-number:hover]:bg-indigo-50 [&_.fc-daygrid-day-number:hover]:text-indigo-600
        
        /* Today Cell */
        [&_.fc-day-today_.fc-daygrid-day-number]:!bg-indigo-600 [&_.fc-day-today_.fc-daygrid-day-number]:!text-white [&_.fc-day-today_.fc-daygrid-day-number]:shadow-md [&_.fc-day-today_.fc-daygrid-day-number]:shadow-indigo-500/25
        [&_.fc-day-today]:!bg-indigo-50/30
        
        /* Toolbar */
        [&_.fc-toolbar]:gap-4 [&_.fc-toolbar]:flex-col [&_.fc-toolbar]:md:flex-row [&_.fc-toolbar]:mb-6!
        [&_.fc-toolbar-title]:text-2xl [&_.fc-toolbar-title]:font-black [&_.fc-toolbar-title]:text-gray-900 [&_.fc-toolbar-title]:tracking-tight
        
        /* Button Base */
        [&_.fc-button]:!outline-none [&_.fc-button]:!shadow-none [&_.fc-button]:!border-transparent [&_.fc-button]:!bg-transparent
        
        /* Toolbar Chunks */
        [&_.fc-toolbar-chunk]:flex [&_.fc-toolbar-chunk]:items-center [&_.fc-toolbar-chunk]:gap-3
        
        /* Button Groups (Segmented Control style) */
        [&_.fc-button-group]:bg-gray-100/90 [&_.fc-button-group]:p-1 [&_.fc-button-group]:rounded-2xl [&_.fc-button-group]:gap-1 [&_.fc-button-group]:border [&_.fc-button-group]:border-gray-200/50
        
        /* Primary Buttons */
        [&_.fc-button-primary]:!text-gray-600 [&_.fc-button-primary]:!rounded-xl [&_.fc-button-primary]:!px-4 [&_.fc-button-primary]:!py-1.5 [&_.fc-button-primary]:capitalize [&_.fc-button-primary]:font-semibold [&_.fc-button-primary]:text-xs [&_.fc-button-primary]:transition-all [&_.fc-button-primary]:duration-200
        [&_.fc-button-primary:hover]:!text-gray-900 [&_.fc-button-primary:hover]:!bg-white/60
        
        /* Active Buttons */
        [&_.fc-button-active]:!bg-white [&_.fc-button-active]:!text-indigo-700 [&_.fc-button-active]:!shadow-sm [&_.fc-button-active:hover]:!bg-white
        
        /* Prev/Next Icon Alignment */
        [&_.fc-icon]:!text-lg
        
        /* Today Button Specific */
        [&_.fc-today-button]:!bg-white [&_.fc-today-button]:!border [&_.fc-today-button]:!border-gray-200 [&_.fc-today-button]:!shadow-sm [&_.fc-today-button]:hover:!bg-gray-50 [&_.fc-today-button]:!text-gray-800 [&_.fc-today-button]:!rounded-xl [&_.fc-today-button]:!font-bold [&_.fc-today-button]:!px-4
        
        /* Events Container */
        [&_.fc-event]:!rounded-xl [&_.fc-event]:!border-none [&_.fc-event]:!shadow-sm [&_.fc-event]:!px-2 [&_.fc-event]:!py-1 [&_.fc-event]:!mx-1.5 [&_.fc-event]:!mt-1.5
        [&_.fc-event-main]:!text-white [&_.fc-event-main]:!overflow-hidden
        
        /* Day Frame */
        [&_.fc-daygrid-day-frame]:min-h-[125px] [&_.fc-daygrid-day-frame]:transition-colors
        [&_.fc-daygrid-day-frame:hover]:bg-blue-50/20
        
        /* More Link */
        [&_.fc-daygrid-more-link]:!text-xs [&_.fc-daygrid-more-link]:!font-bold [&_.fc-daygrid-more-link]:!text-indigo-600 [&_.fc-daygrid-more-link]:!bg-indigo-50 [&_.fc-daygrid-more-link]:!px-2 [&_.fc-daygrid-more-link]:!py-0.5 [&_.fc-daygrid-more-link]:!rounded-md [&_.fc-daygrid-more-link]:!mx-1.5 [&_.fc-daygrid-more-link]:!mt-1 [&_.fc-daygrid-more-link:hover]:!bg-indigo-100
      "
      >
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          eventClick={(info) => {
            onEventClick(info.event.extendedProps.schedule as CleanupSchedule);
          }}
          dateClick={(info) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (info.date < today) return;

            if (onDateClick) {
              onDateClick(info.date);
            }
          }}
          dayCellClassNames={(arg) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (arg.date < today) {
              return "!bg-gray-50/40 !opacity-60 cursor-not-allowed";
            }
            return "cursor-pointer";
          }}
          eventContent={(eventInfo) => {
            const schedule = eventInfo.event.extendedProps
              .schedule as CleanupSchedule;
            const timeStr = schedule?.scheduledAt
              ? format(new Date(schedule.scheduledAt), "h:mm a")
              : "";

            return (
              <div
                className="flex items-center gap-1.5 w-full overflow-hidden px-1 py-0.5"
                title={`${schedule?.title || eventInfo.event.title} (${timeStr}) - ${schedule?.barangay || "Panabo"}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 shadow-sm" />
                <span className="text-[10px] font-bold text-white/90 shrink-0">
                  {timeStr}
                </span>
                <span className="text-xs font-semibold text-white truncate flex-1">
                  {schedule?.title || eventInfo.event.title}
                </span>
              </div>
            );
          }}
          height="auto"
          eventDisplay="block"
          eventClassNames="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md hover:brightness-105 active:scale-95"
        />
      </div>
    </div>
  );
}
