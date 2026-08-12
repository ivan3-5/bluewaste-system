"use client";

import React, { useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { CleanupSchedule, SCHEDULE_STATUS_COLORS } from "@/types";

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
  const events = schedules.map((schedule) => ({
    id: schedule.id,
    title: schedule.title,
    start: schedule.scheduledAt,
    backgroundColor: SCHEDULE_STATUS_COLORS[schedule.status],
    borderColor: "transparent",
    textColor: "#ffffff",
    extendedProps: {
      schedule,
    },
  }));

  return (
    <div className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-xl shadow-indigo-100/20 border border-white p-6 md:p-8 transition-all hover:shadow-2xl hover:shadow-indigo-100/40">
      <div className="calendar-container
        [&_.fc]:font-sans
        
        /* Grid and Borders */
        [&_.fc-theme-standard_.fc-scrollgrid]:border-transparent
        [&_.fc-theme-standard_td]:border-gray-100/50
        [&_.fc-theme-standard_th]:border-gray-100/50
        [&_.fc-theme-standard_th]:border-b-gray-200/50
        
        /* Header Cells */
        [&_.fc-col-header-cell]:py-4 [&_.fc-col-header-cell]:bg-transparent
        [&_.fc-col-header-cell-cushion]:font-semibold [&_.fc-col-header-cell-cushion]:text-gray-400 [&_.fc-col-header-cell-cushion]:uppercase [&_.fc-col-header-cell-cushion]:text-xs [&_.fc-col-header-cell-cushion]:tracking-widest [&_.fc-col-header-cell-cushion]:hover:no-underline
        
        /* Day Numbers */
        [&_.fc-daygrid-day-number]:text-sm [&_.fc-daygrid-day-number]:text-gray-700 [&_.fc-daygrid-day-number]:font-semibold [&_.fc-daygrid-day-number]:hover:no-underline
        [&_.fc-daygrid-day-number]:w-8 [&_.fc-daygrid-day-number]:h-8 [&_.fc-daygrid-day-number]:flex [&_.fc-daygrid-day-number]:items-center [&_.fc-daygrid-day-number]:justify-center [&_.fc-daygrid-day-number]:rounded-full [&_.fc-daygrid-day-number]:m-2 [&_.fc-daygrid-day-number]:transition-colors
        [&_.fc-daygrid-day-number:hover]:bg-gray-100
        
        /* Today */
        [&_.fc-day-today_.fc-daygrid-day-number]:!bg-indigo-600 [&_.fc-day-today_.fc-daygrid-day-number]:!text-white [&_.fc-day-today_.fc-daygrid-day-number]:shadow-md [&_.fc-day-today_.fc-daygrid-day-number]:shadow-indigo-500/30
        [&_.fc-day-today]:!bg-indigo-50/20
        
        /* Toolbar */
        [&_.fc-toolbar]:gap-4 [&_.fc-toolbar]:flex-col [&_.fc-toolbar]:md:flex-row [&_.fc-toolbar]:mb-8!
        [&_.fc-toolbar-title]:text-2xl [&_.fc-toolbar-title]:font-extrabold [&_.fc-toolbar-title]:text-gray-900 [&_.fc-toolbar-title]:tracking-tight
        
        /* Button Base */
        [&_.fc-button]:!outline-none [&_.fc-button]:!shadow-none [&_.fc-button]:!border-transparent [&_.fc-button]:!bg-transparent
        
        /* Toolbar Chunks */
        [&_.fc-toolbar-chunk]:flex [&_.fc-toolbar-chunk]:items-center [&_.fc-toolbar-chunk]:gap-3
        
        /* Button Groups (Segmented Control style) */
        [&_.fc-button-group]:bg-gray-100/80 [&_.fc-button-group]:backdrop-blur-sm [&_.fc-button-group]:p-1 [&_.fc-button-group]:rounded-2xl [&_.fc-button-group]:gap-1
        
        /* Primary Buttons (Inside groups) */
        [&_.fc-button-primary]:!text-gray-500 [&_.fc-button-primary]:!rounded-xl [&_.fc-button-primary]:!px-4 [&_.fc-button-primary]:!py-2 [&_.fc-button-primary]:capitalize [&_.fc-button-primary]:font-semibold [&_.fc-button-primary]:text-sm [&_.fc-button-primary]:transition-all [&_.fc-button-primary]:duration-300
        [&_.fc-button-primary:hover]:!text-gray-900 [&_.fc-button-primary:hover]:!bg-gray-200/50
        
        /* Active Buttons */
        [&_.fc-button-active]:!bg-white [&_.fc-button-active]:!text-indigo-700 [&_.fc-button-active]:!shadow-sm [&_.fc-button-active:hover]:!bg-white
        
        /* Prev/Next Icon Alignment */
        [&_.fc-icon]:!text-lg
        
        /* Today Button Specific */
        [&_.fc-today-button]:!bg-white [&_.fc-today-button]:!border [&_.fc-today-button]:!border-gray-200/60 [&_.fc-today-button]:!shadow-sm [&_.fc-today-button]:hover:!bg-gray-50 [&_.fc-today-button]:!text-gray-700
        
        /* Events */
        [&_.fc-event]:!rounded-lg [&_.fc-event]:!border-none [&_.fc-event]:!shadow-sm [&_.fc-event]:!px-2.5 [&_.fc-event]:!py-1.5 [&_.fc-event]:!font-semibold [&_.fc-event]:!text-xs [&_.fc-event]:!mx-1.5 [&_.fc-event]:!mt-1.5
        [&_.fc-event-main]:!text-white
        
        /* Time Grid */
        [&_.fc-timegrid-slot-label-cushion]:text-xs [&_.fc-timegrid-slot-label-cushion]:font-medium [&_.fc-timegrid-slot-label-cushion]:text-gray-500
        [&_.fc-timegrid-axis-cushion]:text-xs [&_.fc-timegrid-axis-cushion]:font-medium [&_.fc-timegrid-axis-cushion]:text-gray-500
        
        /* More Link (+X more) */
        [&_.fc-daygrid-more-link]:!text-xs [&_.fc-daygrid-more-link]:!font-bold [&_.fc-daygrid-more-link]:!text-indigo-600 [&_.fc-daygrid-more-link]:!bg-indigo-50 [&_.fc-daygrid-more-link]:!px-2 [&_.fc-daygrid-more-link]:!py-1 [&_.fc-daygrid-more-link]:!rounded-md [&_.fc-daygrid-more-link]:!mx-1.5 [&_.fc-daygrid-more-link]:!mt-1.5 [&_.fc-daygrid-more-link:hover]:!bg-indigo-100 [&_.fc-daygrid-more-link]:transition-colors
        
        /* View specific adjustments */
        [&_.fc-daygrid-day-frame]:min-h-[120px]
      ">
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
              return "!bg-gray-50/30 !opacity-60 cursor-not-allowed";
            }
            return "";
          }}
          height="auto"
          eventDisplay="block"
          eventClassNames="cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:brightness-110"
        />
      </div>
    </div>
  );
}
