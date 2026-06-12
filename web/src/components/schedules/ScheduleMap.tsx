"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CleanupSchedule, SCHEDULE_STATUS_COLORS, SCHEDULE_STATUS_LABELS } from "@/types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface ScheduleMapProps {
  schedules: CleanupSchedule[];
  onScheduleClick?: (schedule: CleanupSchedule) => void;
}

// Custom icons based on status
const getIconForStatus = (status: CleanupSchedule["status"]) => {
  const color = SCHEDULE_STATUS_COLORS[status];
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="36" height="36" stroke="white" stroke-width="2" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); transition: all 0.2s ease;">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="white"></circle>
    </svg>
  `;
  return L.divIcon({
    className: "custom-leaflet-icon bg-transparent border-none",
    html: svgIcon,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

export default function ScheduleMap({ schedules, onScheduleClick }: ScheduleMapProps) {
  const center: [number, number] =
    schedules.length > 0
      ? [schedules[0].latitude, schedules[0].longitude]
      : [7.3032, 125.6811];

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 p-4 h-[650px] w-full transition-all">
      <div className="h-full w-full rounded-2xl overflow-hidden shadow-inner border border-gray-100/50 relative z-0">
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {schedules.map((schedule) => (
          <Marker
            key={schedule.id}
            position={[schedule.latitude, schedule.longitude]}
            icon={getIconForStatus(schedule.status)}
          >
            <Popup className="schedule-map-popup">
              <div className="p-2 min-w-[220px]">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm"
                    style={{ backgroundColor: `${SCHEDULE_STATUS_COLORS[schedule.status]}15`, color: SCHEDULE_STATUS_COLORS[schedule.status], border: `1px solid ${SCHEDULE_STATUS_COLORS[schedule.status]}30` }}
                  >
                    {SCHEDULE_STATUS_LABELS[schedule.status]}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-2">{schedule.title}</h3>
                <p className="text-sm text-gray-600 mb-2.5 font-medium flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  {schedule.barangay}
                </p>
                <div className="bg-gray-50 rounded-lg p-2.5 mb-3 border border-gray-100/50">
                  <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    {format(new Date(schedule.scheduledAt), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
                {onScheduleClick && (
                  <Button
                    size="sm"
                    className="w-full text-xs font-semibold h-9 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none shadow-sm"
                    onClick={() => onScheduleClick(schedule)}
                  >
                    View Details
                  </Button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        </MapContainer>
      </div>
    </div>
  );
}
