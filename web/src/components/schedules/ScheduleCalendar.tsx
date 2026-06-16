"use client";

import React, { useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { CleanupSchedule, SCHEDULE_STATUS_COLORS } from "@/types";
import { useRouter } from "next/navigation";

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
    borderColor: SCHEDULE_STATUS_COLORS[schedule.status],
    textColor: "#ffffff",
    extendedProps: {
      schedule,
    },
  }));

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 p-6 transition-all">
      <div className="calendar-container
        [&_.fc]:font-sans
        [&_.fc-theme-standard_.fc-scrollgrid]:border-gray-100
        [&_.fc-theme-standard_td]:border-gray-100
        [&_.fc-theme-standard_th]:border-gray-100
        [&_.fc-col-header-cell]:py-3 [&_.fc-col-header-cell]:bg-gray-50/50
        [&_.fc-col-header-cell-cushion]:font-semibold [&_.fc-col-header-cell-cushion]:text-gray-500 [&_.fc-col-header-cell-cushion]:uppercase [&_.fc-col-header-cell-cushion]:text-xs [&_.fc-col-header-cell-cushion]:tracking-wider [&_.fc-col-header-cell-cushion]:hover:no-underline
        [&_.fc-daygrid-day-number]:text-sm [&_.fc-daygrid-day-number]:text-gray-600 [&_.fc-daygrid-day-number]:font-medium [&_.fc-daygrid-day-number]:p-2 [&_.fc-daygrid-day-number]:hover:no-underline
        [&_.fc-day-today]:!bg-indigo-50/30
        [&_.fc-button-primary]:!bg-white [&_.fc-button-primary]:!text-gray-700 [&_.fc-button-primary]:!border-gray-200 [&_.fc-button-primary]:shadow-sm [&_.fc-button-primary]:capitalize [&_.fc-button-primary]:font-medium [&_.fc-button-primary]:transition-all
        [&_.fc-button-primary:hover]:!bg-gray-50 [&_.fc-button-primary:hover]:!border-gray-300 [&_.fc-button-primary:hover]:!text-gray-900
        [&_.fc-button-active]:!bg-indigo-50 [&_.fc-button-active]:!text-indigo-700 [&_.fc-button-active]:!border-indigo-200
        [&_.fc-toolbar-title]:text-xl [&_.fc-toolbar-title]:font-bold [&_.fc-toolbar-title]:text-gray-900
        [&_.fc-event]:rounded-md [&_.fc-event]:border-none [&_.fc-event]:shadow-sm [&_.fc-event]:px-1.5 [&_.fc-event]:py-0.5 [&_.fc-event]:font-medium [&_.fc-event]:text-xs
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
              return "!bg-gray-50/50 !opacity-60 cursor-not-allowed";
            }
            return "";
          }}
          height="auto"
          eventDisplay="block"
          eventClassNames="cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-md hover:brightness-105"
        />
      </div>
    </div>
  );
}
