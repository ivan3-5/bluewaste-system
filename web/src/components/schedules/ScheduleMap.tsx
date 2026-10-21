"use client";

import React, { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  CleanupSchedule,
  SCHEDULE_STATUS_COLORS,
  SCHEDULE_STATUS_LABELS,
} from "@/types";
import { format } from "date-fns";
import { MapPin, Users, Wrench, Calendar, Clock, ArrowRight } from "lucide-react";

interface ScheduleMapProps {
  schedules: CleanupSchedule[];
  onScheduleClick?: (schedule: CleanupSchedule) => void;
}

const getIconForStatus = (status: CleanupSchedule["status"]) => {
  const color = SCHEDULE_STATUS_COLORS[status] || "#3b82f6";
  const svgIcon = `
    <div style="position:relative; width:40px; height:48px; display:flex; align-items:center; justify-content:center; filter: drop-shadow(0 6px 12px rgba(0,0,0,0.25)); transition: transform 0.2s ease;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48" width="40" height="48" fill="none">
        <path d="M20 0C8.954 0 0 8.954 0 20c0 13.5 17.5 26.5 19.1 27.7a1.5 1.5 0 0 0 1.8 0C22.5 46.5 40 33.5 40 20 40 8.954 31.046 0 20 0z" fill="${color}"/>
        <circle cx="20" cy="18" r="9" fill="white" />
        <circle cx="20" cy="18" r="5" fill="${color}" />
      </svg>
    </div>
  `;
  return L.divIcon({
    className: "custom-schedule-marker bg-transparent border-none",
    html: svgIcon,
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    popupAnchor: [0, -48],
  });
};

export default function ScheduleMap({
  schedules,
  onScheduleClick,
}: ScheduleMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Filter schedules that have valid coordinates
  const validSchedules = useMemo(
    () =>
      schedules.filter(
        (s) =>
          typeof s.latitude === "number" &&
          typeof s.longitude === "number" &&
          !isNaN(s.latitude) &&
          !isNaN(s.longitude) &&
          (s.latitude !== 0 || s.longitude !== 0),
      ),
    [schedules],
  );

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const container = containerRef.current as HTMLDivElement & {
      _leaflet_id?: number;
    };
    if (container._leaflet_id) {
      delete container._leaflet_id;
    }

    const initialCenter: [number, number] =
      validSchedules.length > 0
        ? [validSchedules[0].latitude, validSchedules[0].longitude]
        : [7.3032, 125.6811];

    const map = L.map(container, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView(initialCenter, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, []); // Run once on mount

  // Sync Markers whenever validSchedules or onScheduleClick changes
  useEffect(() => {
    const map = mapRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    if (validSchedules.length === 0) return;

    const bounds: [number, number][] = [];

    validSchedules.forEach((schedule) => {
      bounds.push([schedule.latitude, schedule.longitude]);

      const marker = L.marker([schedule.latitude, schedule.longitude], {
        icon: getIconForStatus(schedule.status),
      });

      marker.bindPopup(() => {
        const popupDiv = document.createElement("div");
        popupDiv.className = "p-3 min-w-[260px] max-w-[290px] font-sans";

        const statusColor = SCHEDULE_STATUS_COLORS[schedule.status] || "#3b82f6";
        const statusLabel = SCHEDULE_STATUS_LABELS[schedule.status] || schedule.status;
        const timeFormatted = format(new Date(schedule.scheduledAt), "MMM d, yyyy • h:mm a");
        const crewCount = schedule.workers?.length || 0;
        const gearCount = schedule.equipment?.length || 0;

        popupDiv.innerHTML = `
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
            <span style="display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:999px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; background:${statusColor}18; color:${statusColor}; border:1px solid ${statusColor}35;">
              <span style="width:6px; height:6px; border-radius:999px; background:${statusColor};"></span>
              ${statusLabel}
            </span>
            <span style="font-size:11px; font-weight:600; color:#6b7280;">
              👥 ${crewCount} crew
            </span>
          </div>

          <h4 style="font-weight:800; color:#111827; font-size:14px; line-height:1.3; margin:0 0 4px 0;">
            ${schedule.title}
          </h4>

          <p style="font-size:12px; color:#4b5563; display:flex; align-items:center; gap:5px; margin:0 0 10px 0;">
            📍 ${schedule.barangay || "Panabo Coastal Zone"}
          </p>

          <div style="background:#f9fafb; border:1px solid #f3f4f6; border-radius:12px; padding:8px 10px; margin-bottom:10px; font-size:11px; color:#374151;">
            📅 ${timeFormatted}
            ${gearCount > 0 ? `<div style="margin-top:4px; color:#4f46e5; font-weight:600;">🛠️ ${gearCount} gear items allocated</div>` : ""}
          </div>

          <button id="btn-view-briefing-${schedule.id}" style="width:100%; height:34px; font-size:12px; font-weight:700; color:#ffffff; background:linear-gradient(to right, #2563eb, #4f46e5); border:none; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; box-shadow:0 2px 6px rgba(79,70,229,0.25);">
            View Operational Briefing →
          </button>
        `;

        // Attach click listener to button
        setTimeout(() => {
          const btn = popupDiv.querySelector(`#btn-view-briefing-${schedule.id}`);
          if (btn && onScheduleClick) {
            btn.addEventListener("click", () => {
              onScheduleClick(schedule);
            });
          }
        }, 10);

        return popupDiv;
      }, {
        closeButton: false,
        className: "schedule-map-popup",
      });

      markersLayer.addLayer(marker);
    });

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 13);
    }
  }, [validSchedules, onScheduleClick]);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/90 overflow-hidden transition-all duration-300">
      {/* Map Control / Status Legend Banner */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-gray-50/80 via-white to-blue-50/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              Coastal Operations GIS Map
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {validSchedules.length} Plotted{" "}
                {validSchedules.length === 1 ? "Site" : "Sites"}
              </span>
            </h3>
            <p className="text-xs text-gray-500">
              Panabo City coastal cleanup deployments and operational perimeters
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 flex-wrap text-xs font-semibold">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100/60">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-200" />
            Upcoming
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-100/60">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
            Ongoing
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100/60">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
            Completed
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-100/60">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200" />
            Cancelled
          </div>
        </div>
      </div>

      {/* Leaflet Mount Container */}
      <div
        ref={containerRef}
        className="h-[620px] w-full relative z-0"
        style={{ minHeight: "620px" }}
      />
    </div>
  );
}
