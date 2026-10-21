"use client";

import React, { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import {
  CleanupSchedule,
  CleanupScheduleStatus,
} from "@/types";
import { format } from "date-fns";
import {
  CalendarDays,
  MapPin,
  Users,
  FileText,
} from "lucide-react";

interface ScheduleCalendarProps {
  schedules: CleanupSchedule[];
  onEventClick: (schedule: CleanupSchedule) => void;
  onDateClick?: (date: Date) => void;
}

// ── Status Design System Tokens ──────────────────────────────────────────────
const STATUS_CONFIG: Record<
  CleanupScheduleStatus,
  {
    label: string;
    dotBg: string;
    isPulsing?: boolean;
    borderLeft: string;
    cardBg: string;
    border: string;
    hoverBorder: string;
    textColor: string;
    pillBg: string;
    pillText: string;
    pillBorder: string;
  }
> = {
  UPCOMING: {
    label: "Upcoming",
    dotBg: "bg-blue-600",
    borderLeft: "border-l-blue-600",
    cardBg: "bg-gradient-to-r from-blue-50/95 via-indigo-50/40 to-white",
    border: "border-blue-200/80",
    hoverBorder: "hover:border-blue-400 hover:shadow-blue-500/10",
    textColor: "text-blue-950",
    pillBg: "bg-blue-50",
    pillText: "text-blue-700",
    pillBorder: "border-blue-200",
  },
  ONGOING: {
    label: "Ongoing",
    dotBg: "bg-amber-500",
    isPulsing: true,
    borderLeft: "border-l-amber-500",
    cardBg: "bg-gradient-to-r from-amber-50/95 via-orange-50/40 to-white",
    border: "border-amber-300",
    hoverBorder: "hover:border-amber-500 hover:shadow-amber-500/10",
    textColor: "text-amber-950",
    pillBg: "bg-amber-50",
    pillText: "text-amber-800",
    pillBorder: "border-amber-300",
  },
  COMPLETED: {
    label: "Completed",
    dotBg: "bg-emerald-600",
    borderLeft: "border-l-emerald-600",
    cardBg: "bg-gradient-to-r from-emerald-50/95 via-teal-50/40 to-white",
    border: "border-emerald-200/80",
    hoverBorder: "hover:border-emerald-400 hover:shadow-emerald-500/10",
    textColor: "text-emerald-950",
    pillBg: "bg-emerald-50",
    pillText: "text-emerald-700",
    pillBorder: "border-emerald-200",
  },
  CANCELLED: {
    label: "Cancelled",
    dotBg: "bg-rose-500",
    borderLeft: "border-l-rose-400",
    cardBg: "bg-rose-50/60",
    border: "border-rose-200/70",
    hoverBorder: "hover:border-rose-300 hover:shadow-rose-500/10",
    textColor: "text-rose-900 line-through opacity-75",
    pillBg: "bg-rose-50",
    pillText: "text-rose-700",
    pillBorder: "border-rose-200",
  },
};

export function ScheduleCalendar({
  schedules,
  onEventClick,
  onDateClick,
}: ScheduleCalendarProps) {
  // Events transformed for FullCalendar
  const events = useMemo(() => {
    return schedules.map((schedule) => ({
      id: schedule.id,
      title: schedule.title,
      start: schedule.scheduledAt,
      backgroundColor: "transparent",
      borderColor: "transparent",
      textColor: "inherit",
      extendedProps: {
        schedule,
      },
    }));
  }, [schedules]);

  return (
    <div className="bg-white/85 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-8 transition-all hover:shadow-[0_16px_40px_rgb(0,0,0,0.06)]">
      {/* ── Calendar Operational Top Banner ─────── */}
      <div className="mb-6 pb-6 border-b border-gray-100 flex items-center justify-between gap-4">
        {/* Left: Branding & Context */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-gray-900 tracking-tight">
                Monthly Operational Timeline
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold">
                {schedules.length} Scheduled
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {onDateClick
                ? "Click any future date to create a cleanup operation, or select an event for full briefing"
                : "Select any scheduled cleanup operation to view full briefing"}
            </p>
          </div>
        </div>
      </div>

      {/* ── FullCalendar Enhanced Container ───────────────────────────── */}
      <div
        className="calendar-container
        [&_.fc]:font-sans
        
        /* Grid and Borders */
        [&_.fc-theme-standard_.fc-scrollgrid]:!border-gray-100
        [&_.fc-theme-standard_td]:!border-gray-100
        [&_.fc-theme-standard_th]:!border-gray-100
        [&_.fc-theme-standard_th]:!border-b-gray-200
        
        /* Header Cells */
        [&_.fc-col-header-cell]:!py-3.5 [&_.fc-col-header-cell]:!bg-gray-50/60
        [&_.fc-col-header-cell-cushion]:!font-black [&_.fc-col-header-cell-cushion]:!text-gray-500 [&_.fc-col-header-cell-cushion]:!uppercase [&_.fc-col-header-cell-cushion]:!text-[11px] [&_.fc-col-header-cell-cushion]:!tracking-wider [&_.fc-col-header-cell-cushion]:hover:!no-underline
        
        /* Weekend columns soft distinction */
        [&_.fc-day-sun]:!bg-slate-50/25
        [&_.fc-day-sat]:!bg-slate-50/25
        
        /* Day Numbers */
        [&_.fc-daygrid-day-number]:!text-xs [&_.fc-daygrid-day-number]:!text-gray-700 [&_.fc-daygrid-day-number]:!font-bold [&_.fc-daygrid-day-number]:hover:!no-underline
        [&_.fc-daygrid-day-number]:!w-7 [&_.fc-daygrid-day-number]:!h-7 [&_.fc-daygrid-day-number]:!flex [&_.fc-daygrid-day-number]:!items-center [&_.fc-daygrid-day-number]:!justify-center [&_.fc-daygrid-day-number]:!rounded-full [&_.fc-daygrid-day-number]:!m-2 [&_.fc-daygrid-day-number]:!transition-colors
        [&_.fc-daygrid-day-number:hover]:!bg-indigo-50 [&_.fc-daygrid-day-number:hover]:!text-indigo-600
        
        /* Today Cell Accent */
        [&_.fc-day-today_.fc-daygrid-day-number]:!bg-gradient-to-tr [&_.fc-day-today_.fc-daygrid-day-number]:!from-blue-600 [&_.fc-day-today_.fc-daygrid-day-number]:!to-indigo-600 [&_.fc-day-today_.fc-daygrid-day-number]:!text-white [&_.fc-day-today_.fc-daygrid-day-number]:!shadow-md [&_.fc-day-today_.fc-daygrid-day-number]:!shadow-blue-500/30
        [&_.fc-day-today]:!bg-blue-50/25
        
        /* Toolbar */
        [&_.fc-toolbar]:!gap-4 [&_.fc-toolbar]:!flex-col [&_.fc-toolbar]:md:!flex-row [&_.fc-toolbar]:!mb-6
        [&_.fc-toolbar-title]:!text-2xl [&_.fc-toolbar-title]:!font-black [&_.fc-toolbar-title]:!text-gray-900 [&_.fc-toolbar-title]:!tracking-tight
        
        /* Button Base */
        [&_.fc-button]:!outline-none [&_.fc-button]:!shadow-none [&_.fc-button]:!border-transparent [&_.fc-button]:!bg-transparent
        
        /* Toolbar Chunks */
        [&_.fc-toolbar-chunk]:!flex [&_.fc-toolbar-chunk]:!items-center [&_.fc-toolbar-chunk]:!gap-3
        
        /* Button Groups (Segmented Control style) */
        [&_.fc-button-group]:!bg-gray-100/90 [&_.fc-button-group]:!p-1 [&_.fc-button-group]:!rounded-2xl [&_.fc-button-group]:!gap-1 [&_.fc-button-group]:!border [&_.fc-button-group]:!border-gray-200/60 [&_.fc-button-group]:!shadow-inner
        
        /* Primary Buttons */
        [&_.fc-button-primary]:!text-gray-600 [&_.fc-button-primary]:!rounded-xl [&_.fc-button-primary]:!px-4 [&_.fc-button-primary]:!py-1.5 [&_.fc-button-primary]:!capitalize [&_.fc-button-primary]:!font-bold [&_.fc-button-primary]:!text-xs [&_.fc-button-primary]:!transition-all [&_.fc-button-primary]:!duration-200
        [&_.fc-button-primary:hover]:!text-gray-900 [&_.fc-button-primary:hover]:!bg-white/60
        
        /* Active Buttons */
        [&_.fc-button-active]:!bg-white [&_.fc-button-active]:!text-indigo-700 [&_.fc-button-active]:!shadow-sm [&_.fc-button-active:hover]:!bg-white
        
        /* Prev/Next Icon Buttons */
        [&_.fc-prev-button]:!bg-white [&_.fc-prev-button]:!border [&_.fc-prev-button]:!border-gray-200 [&_.fc-prev-button]:!shadow-2xs [&_.fc-prev-button]:hover:!bg-gray-50 [&_.fc-prev-button]:!text-gray-700 [&_.fc-prev-button]:!rounded-xl [&_.fc-prev-button]:!w-9 [&_.fc-prev-button]:!h-9 [&_.fc-prev-button]:!p-0 [&_.fc-prev-button]:!flex [&_.fc-prev-button]:!items-center [&_.fc-prev-button]:!justify-center
        [&_.fc-next-button]:!bg-white [&_.fc-next-button]:!border [&_.fc-next-button]:!border-gray-200 [&_.fc-next-button]:!shadow-2xs [&_.fc-next-button]:hover:!bg-gray-50 [&_.fc-next-button]:!text-gray-700 [&_.fc-next-button]:!rounded-xl [&_.fc-next-button]:!w-9 [&_.fc-next-button]:!h-9 [&_.fc-next-button]:!p-0 [&_.fc-next-button]:!flex [&_.fc-next-button]:!items-center [&_.fc-next-button]:!justify-center
        
        /* Today Button */
        [&_.fc-today-button]:!bg-white [&_.fc-today-button]:!border [&_.fc-today-button]:!border-gray-200 [&_.fc-today-button]:!shadow-2xs [&_.fc-today-button]:hover:!bg-gray-50 [&_.fc-today-button]:!text-gray-800 [&_.fc-today-button]:!rounded-xl [&_.fc-today-button]:!font-bold [&_.fc-today-button]:!px-4 [&_.fc-today-button]:!h-9
        
        /* Events Container Reset */
        [&_.fc-event]:!rounded-xl [&_.fc-event]:!border-none [&_.fc-event]:!shadow-none [&_.fc-event]:!bg-transparent [&_.fc-event]:!p-0 [&_.fc-event]:!mx-1.5 [&_.fc-event]:!my-0.5
        [&_.fc-event-main]:!p-0 [&_.fc-event-main]:!overflow-visible
        
        /* Day Frame */
        [&_.fc-daygrid-day-frame]:!min-h-[135px] [&_.fc-daygrid-day-frame]:!transition-colors
        [&_.fc-daygrid-day-frame:hover]:!bg-blue-50/15
        
        /* More Link */
        [&_.fc-daygrid-more-link]:!text-xs [&_.fc-daygrid-more-link]:!font-bold [&_.fc-daygrid-more-link]:!text-indigo-600 [&_.fc-daygrid-more-link]:!bg-indigo-50 [&_.fc-daygrid-more-link]:!px-2 [&_.fc-daygrid-more-link]:!py-0.5 [&_.fc-daygrid-more-link]:!rounded-md [&_.fc-daygrid-more-link]:!mx-1.5 [&_.fc-daygrid-more-link]:!mt-1 [&_.fc-daygrid-more-link:hover]:!bg-indigo-100
        
        /* Popover for More events */
        [&_.fc-popover]:!rounded-2xl [&_.fc-popover]:!border-gray-200 [&_.fc-popover]:!shadow-2xl [&_.fc-popover]:!backdrop-blur-xl [&_.fc-popover]:!bg-white/95 [&_.fc-popover]:!overflow-hidden
        [&_.fc-popover-header]:!bg-gray-50/90 [&_.fc-popover-header]:!p-3 [&_.fc-popover-header]:!border-b [&_.fc-popover-header]:!border-gray-100
        [&_.fc-popover-title]:!text-sm [&_.fc-popover-title]:!font-black [&_.fc-popover-title]:!text-gray-900
        [&_.fc-popover-close]:!text-gray-400 [&_.fc-popover-close:hover]:!text-gray-700
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
          dayMaxEvents={3}
          moreLinkClick="popover"
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
            return "cursor-pointer group/cell";
          }}
          moreLinkContent={(arg) => (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50/90 hover:bg-indigo-100 border border-indigo-200/70 px-2 py-0.5 rounded-md transition-colors shadow-2xs">
              +{arg.num} more operations
            </span>
          )}
          eventContent={(eventInfo) => {
            const schedule = eventInfo.event.extendedProps
              .schedule as CleanupSchedule;
            const config =
              STATUS_CONFIG[schedule?.status] || STATUS_CONFIG.UPCOMING;
            const timeStr = schedule?.scheduledAt
              ? format(new Date(schedule.scheduledAt), "h:mm a")
              : "";
            const workerCount = schedule?.workers?.length || 0;
            const reportCount = schedule?.reports?.length || 0;

            const isWeekOrDayView =
              eventInfo.view.type === "timeGridWeek" ||
              eventInfo.view.type === "timeGridDay";

            const tooltipSummary = [
              `Operation: ${schedule?.title || "Cleanup"}`,
              `Status: ${config.label}`,
              `Time: ${timeStr}`,
              schedule?.barangay ? `Barangay: ${schedule.barangay}` : null,
              workerCount > 0
                ? `Crew: ${workerCount} assigned`
                : "Crew: Unassigned",
              reportCount > 0 ? `Reports: ${reportCount} linked` : null,
              schedule?.equipment?.length
                ? `Equipment: ${schedule.equipment.join(", ")}`
                : null,
            ]
              .filter(Boolean)
              .join("\n");

            // Week & Day views: Expanded vertical card
            if (isWeekOrDayView) {
              return (
                <div
                  className={`w-full h-full rounded-xl border ${config.border} ${config.cardBg} ${config.hoverBorder} p-2 text-left transition-all duration-150 shadow-2xs hover:shadow-md cursor-pointer border-l-4 ${config.borderLeft} flex flex-col justify-between overflow-hidden`}
                  title={tooltipSummary}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${config.pillBg} ${config.pillText} ${config.pillBorder}`}
                      >
                        <span className="relative flex h-1.5 w-1.5">
                          {config.isPulsing && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                          )}
                          <span
                            className={`relative inline-flex rounded-full h-1.5 w-1.5 ${config.dotBg}`}
                          />
                        </span>
                        {config.label}
                      </span>
                      <span className="text-[10px] font-bold text-gray-500">
                        {timeStr}
                      </span>
                    </div>

                    <h4
                      className={`text-xs font-bold leading-tight truncate ${config.textColor}`}
                    >
                      {schedule?.title || "Untitled Operation"}
                    </h4>

                    {schedule?.barangay && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500 font-medium truncate">
                        <MapPin className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                        <span className="truncate">{schedule.barangay}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-2 pt-1 border-t border-gray-100/60 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-blue-600" />
                      <span className="font-semibold">{workerCount} Crew</span>
                    </span>
                    {reportCount > 0 && (
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-indigo-600" />
                        <span className="font-semibold">
                          {reportCount} Reports
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            // Month view: Compact, sleek operational card
            return (
              <div
                className={`w-full relative rounded-lg border ${config.border} ${config.cardBg} ${config.hoverBorder} text-left pl-2.5 pr-2 py-1.5 transition-all duration-150 shadow-2xs hover:shadow-md cursor-pointer border-l-[3.5px] ${config.borderLeft} overflow-hidden group/card`}
                title={tooltipSummary}
              >
                {/* Top Row: Status Dot + Time + Badges */}
                <div className="flex items-center justify-between gap-1 mb-0.5 leading-none">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="relative flex h-2 w-2 shrink-0">
                      {config.isPulsing && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      )}
                      <span
                        className={`relative inline-flex rounded-full h-2 w-2 ${config.dotBg}`}
                      />
                    </span>
                    <span className="text-[10px] font-bold text-gray-700 tracking-tight shrink-0">
                      {timeStr}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {workerCount > 0 && (
                      <span
                        className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-white/90 border border-gray-200/80 text-[9px] font-bold text-gray-700 shadow-2xs"
                        title={`${workerCount} assigned worker${workerCount > 1 ? "s" : ""}`}
                      >
                        <Users className="w-2.5 h-2.5 text-blue-600" />
                        <span>{workerCount}</span>
                      </span>
                    )}
                    {reportCount > 0 && (
                      <span
                        className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-white/90 border border-gray-200/80 text-[9px] font-bold text-gray-700 shadow-2xs"
                        title={`${reportCount} linked waste report${reportCount > 1 ? "s" : ""}`}
                      >
                        <FileText className="w-2.5 h-2.5 text-indigo-600" />
                        <span>{reportCount}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Operation Title */}
                <div
                  className={`text-xs font-bold leading-snug truncate ${config.textColor}`}
                >
                  {schedule?.title || "Untitled Operation"}
                </div>

                {/* Coastal Barangay Location */}
                {schedule?.barangay && (
                  <div className="flex items-center gap-1 mt-0.5 text-[10px] text-gray-500 font-medium truncate">
                    <MapPin className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                    <span className="truncate">{schedule.barangay}</span>
                  </div>
                )}
              </div>
            );
          }}
          height="auto"
          eventDisplay="block"
          eventClassNames="cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
        />
      </div>
    </div>
  );
}

