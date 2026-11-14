"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getStatusColor, REPORT_STATUS_LABELS } from "@/types";

interface ReadOnlyMapProps {
  lat: number;
  lng: number;
  status?: string;
  radius?: number;
  locationName?: string;
  className?: string;
}

function buildMarkerIcon(statusColor: string) {
  return L.divIcon({
    html: `<div style="position:relative;width:34px;height:44px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.35));transition:transform 0.15s ease;">
      <svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
        <filter id="rsm" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.35)"/>
        </filter>
        <path d="M17 1C8.16 1 1 8.16 1 17c0 11.25 16 26 16 26S33 28.25 33 17C33 8.16 25.84 1 17 1z"
              fill="${statusColor}" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round" filter="url(#rsm)"/>
        <circle cx="17" cy="17" r="6.5" fill="white"/>
        <circle cx="17" cy="17" r="3.5" fill="${statusColor}"/>
      </svg>
    </div>`,
    className: "custom-status-marker-pin",
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -44],
  });
}

export default function ReadOnlyMap({
  lat,
  lng,
  status,
  radius = 50,
  locationName,
  className,
}: ReadOnlyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const legendRef = useRef<L.Control | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    const statusColor = getStatusColor(status);
    const radiusMeters = radius ?? 50;

    const map = L.map(container, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: false,
      dragging: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    const RecenterControl = L.Control.extend({
      options: { position: "topright" },
      onAdd() {
        const btn = L.DomUtil.create("button", "leaflet-recenter-btn");
        btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>`;
        btn.title = "Recenter on Report Location";
        btn.setAttribute("aria-label", "Recenter on Report Location");
        L.DomEvent.on(btn, "click", (e) => {
          L.DomEvent.stopPropagation(e);
          map.setView([lat, lng], 16, { animate: true });
        });
        return btn;
      },
    });
    new RecenterControl().addTo(map);

    // Draw radius circle
    const circle = L.circle([lat, lng], {
      radius: radiusMeters,
      color: statusColor,
      fillColor: statusColor,
      fillOpacity: 0.18,
      weight: 2,
      dashArray: "5, 5",
    }).addTo(map);

    circle.bindTooltip(
      `<strong>⭕ ${radiusMeters}m Cleanup Area Radius</strong><br/><span style="color:#64748b;">GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}</span>`,
      { direction: "top", offset: [0, -10] }
    );
    circleRef.current = circle;

    // Draw marker with status color
    const marker = L.marker([lat, lng], {
      icon: buildMarkerIcon(statusColor),
    }).addTo(map);

    const statusLabel =
      (REPORT_STATUS_LABELS as Record<string, string>)[status?.toUpperCase() || ""] ||
      status ||
      "Waste Report";

    marker.bindTooltip(
      `<strong>${statusLabel}</strong><br/>${locationName || `${lat.toFixed(6)}, ${lng.toFixed(6)}`}`,
      { direction: "top", offset: [0, -42] }
    );

    marker.bindPopup(`
      <div style="font-family:system-ui,-apple-system,sans-serif;min-width:200px;padding:2px;">
        <div style="background-color:${statusColor};color:#ffffff;padding:6px 10px;border-radius:6px;font-weight:700;font-size:11px;letter-spacing:0.04em;display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <span>${statusLabel}</span>
          <span style="font-size:10px;opacity:0.9;">${radiusMeters}m Radius</span>
        </div>
        ${locationName ? `<div style="font-weight:600;font-size:12px;color:#0f172a;margin-bottom:4px;line-height:1.3;">${locationName}</div>` : ""}
        <div style="font-size:11px;color:#64748b;font-family:monospace;">${lat.toFixed(6)}, ${lng.toFixed(6)}</div>
        <div style="font-size:10px;color:${statusColor};margin-top:6px;font-weight:600;display:flex;align-items:center;gap:4px;">
          <span>⭕</span> <span>${radiusMeters}-meter GPS cleanup radius</span>
        </div>
      </div>
    `);
    markerRef.current = marker;

    // Legend badge in bottom-left
    const RadiusLegend = L.Control.extend({
      options: { position: "bottomleft" },
      onAdd() {
        const div = L.DomUtil.create("div", "leaflet-bar");
        div.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
        div.style.backdropFilter = "blur(6px)";
        div.style.padding = "5px 9px";
        div.style.borderRadius = "6px";
        div.style.border = "1px solid rgba(0, 0, 0, 0.12)";
        div.style.boxShadow = "0 2px 6px rgba(0,0,0,0.08)";
        div.style.fontSize = "11px";
        div.style.fontWeight = "600";
        div.style.display = "flex";
        div.style.alignItems = "center";
        div.style.gap = "6px";
        div.style.color = "#1e293b";
        div.innerHTML = `
          <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background-color:${statusColor};border:1.5px solid #ffffff;box-shadow:0 0 0 1px ${statusColor};"></span>
          <span>${radiusMeters}m Area Radius</span>
        `;
        return div;
      },
    });
    const legend = new RadiusLegend();
    legend.addTo(map);
    legendRef.current = legend;

    mapRef.current = map;
    requestAnimationFrame(() => map.invalidateSize());

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      circleRef.current = null;
      legendRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker and circle if props change
  useEffect(() => {
    if (!mapRef.current) return;
    const statusColor = getStatusColor(status);
    const radiusMeters = radius ?? 50;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      markerRef.current.setIcon(buildMarkerIcon(statusColor));
      const statusLabel =
        (REPORT_STATUS_LABELS as Record<string, string>)[status?.toUpperCase() || ""] ||
        status ||
        "Waste Report";
      markerRef.current.setTooltipContent(
        `<strong>${statusLabel}</strong><br/>${locationName || `${lat.toFixed(6)}, ${lng.toFixed(6)}`}`
      );
      markerRef.current.setPopupContent(`
        <div style="font-family:system-ui,-apple-system,sans-serif;min-width:200px;padding:2px;">
          <div style="background-color:${statusColor};color:#ffffff;padding:6px 10px;border-radius:6px;font-weight:700;font-size:11px;letter-spacing:0.04em;display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <span>${statusLabel}</span>
            <span style="font-size:10px;opacity:0.9;">${radiusMeters}m Radius</span>
          </div>
          ${locationName ? `<div style="font-weight:600;font-size:12px;color:#0f172a;margin-bottom:4px;line-height:1.3;">${locationName}</div>` : ""}
          <div style="font-size:11px;color:#64748b;font-family:monospace;">${lat.toFixed(6)}, ${lng.toFixed(6)}</div>
          <div style="font-size:10px;color:${statusColor};margin-top:6px;font-weight:600;display:flex;align-items:center;gap:4px;">
            <span>⭕</span> <span>${radiusMeters}-meter GPS cleanup radius</span>
          </div>
        </div>
      `);
    }

    if (circleRef.current) {
      circleRef.current.setLatLng([lat, lng]);
      circleRef.current.setRadius(radiusMeters);
      circleRef.current.setStyle({
        color: statusColor,
        fillColor: statusColor,
      });
      circleRef.current.setTooltipContent(
        `<strong>⭕ ${radiusMeters}m Cleanup Area Radius</strong><br/><span style="color:#64748b;">GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}</span>`
      );
    }
  }, [lat, lng, status, radius, locationName]);

  return <div ref={containerRef} className={className || "h-full w-full"} />;
}
