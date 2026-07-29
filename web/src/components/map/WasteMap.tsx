"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import type { FeatureCollection, Polygon } from "geojson";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
// Barangay boundaries removed from map - no-op imports
import {
  MapReport,
  ReportingZone,
  ZonePoint,
  WASTE_CATEGORY_LABELS,
  WASTE_CATEGORY_COLORS,
  REPORT_STATUS_LABELS,
  STATUS_COLORS,
} from "@/types";

interface WasteMapProps {
  reports: MapReport[];
  center?: [number, number];
  zoom?: number;
  showHeatmap?: boolean;
  autoFit?: boolean;
  onReportClick?: (report: MapReport) => void;
  onMapReady?: (map: L.Map | null) => void;
  canDraw?: boolean;
  drawMode?: boolean;
  onDrawRectangle?: (bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }) => void;
  showBarangayBoundaries?: boolean;
  reportingZones?: ReportingZone[];
  canDrawZone?: boolean;
  drawZoneMode?: boolean;
  onDrawZone?: (points: ZonePoint[]) => void;
}

const DEFAULT_CENTER: [number, number] = [7.3056, 125.6839];

function parseCoordinate(val: any): number | null {
  if (val === null || val === undefined) return null;
  const num = typeof val === "number" ? val : parseFloat(String(val));
  if (Number.isNaN(num)) return null;
  return num;
}

function isValidCoordinate(lat?: any, lng?: any): boolean {
  const parsedLat = parseCoordinate(lat);
  const parsedLng = parseCoordinate(lng);
  if (parsedLat === null || parsedLng === null) return false;
  if (parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180)
    return false;
  if (parsedLat === 0 && parsedLng === 0) return false;
  return true;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function createMarkerIcon(category: string, status: string) {
  const color =
    (WASTE_CATEGORY_COLORS as Record<string, string>)[category] || "#3b82f6";
  const statusColor =
    (STATUS_COLORS as Record<string, string>)[status] || "#3b82f6";
  const size = 16;

  return L.divIcon({
    html: `<div class="waste-marker waste-marker--pulse" style="--mc:${color};width:${size + 8}px;height:${size + 8}px;background:${color};border:3px solid #ffffff;border-radius:50%;box-shadow:0 3px 10px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;cursor:pointer;"><div style="width:${Math.max(5, Math.round(size * 0.4))}px;height:${Math.max(5, Math.round(size * 0.4))}px;background:${statusColor};border-radius:50%;border:1.5px solid rgba(255,255,255,0.9);"></div></div>`,
    className: "custom-waste-marker-icon",
    iconSize: [size + 8, size + 8],
    iconAnchor: [(size + 8) / 2, (size + 8) / 2],
    popupAnchor: [0, -((size + 8) / 2)],
  });
}

export default function WasteMap({
  reports,
  center = DEFAULT_CENTER,
  zoom = 13,
  showHeatmap = false,
  autoFit = false,
  onReportClick,
  onMapReady,
  canDraw = false,
  drawMode = false,
  onDrawRectangle,
  showBarangayBoundaries = true,
  reportingZones = [],
  canDrawZone = false,
  drawZoneMode = false,
  onDrawZone,
}: WasteMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const markerClusterGroupRef = useRef<any>(null);
  const zoneLayersRef = useRef<L.Polygon[]>([]);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const zoneDrawControlRef = useRef<any>(null);
  const zoneDrawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const onDrawZoneRef = useRef(onDrawZone);

  useEffect(() => {
    onDrawZoneRef.current = onDrawZone;
  }, [onDrawZone]);
  const drawControlRef = useRef<any>(null);
  const heatLayerRef = useRef<any>(null);
  const boundaryLayerRef = useRef<L.GeoJSON | null>(null);
  const boundaryBoundsRef = useRef<L.LatLngBounds | null>(null);
  const onMapReadyRef = useRef(onMapReady);
  const onDrawRectangleRef = useRef(onDrawRectangle);
  const centerRef = useRef(center);
  const zoomRef = useRef(zoom);

  useEffect(() => {
    onMapReadyRef.current = onMapReady;
  }, [onMapReady]);

  useEffect(() => {
    onDrawRectangleRef.current = onDrawRectangle;
  }, [onDrawRectangle]);

  useEffect(() => {
    centerRef.current = center;
  }, [center]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: false }).setView(
      centerRef.current,
      zoomRef.current,
    );

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
        btn.title = "Recenter on Panabo City";
        L.DomEvent.on(btn, "click", (e) => {
          L.DomEvent.stopPropagation(e);
          map.setView(centerRef.current, 13.5, { animate: true });
        });
        return btn;
      },
    });
    new RecenterControl().addTo(map);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;

    const zoneDrawnItems = new L.FeatureGroup();
    map.addLayer(zoneDrawnItems);
    zoneDrawnItemsRef.current = zoneDrawnItems;

    const handleDrawCreated = (event: any) => {
      if (event.layerType === "rectangle") {
        const layer = event.layer as L.Rectangle;
        const bounds = layer.getBounds();
        drawnItems.clearLayers();
        drawnItems.addLayer(layer);
        onDrawRectangleRef.current?.({
          minLat: bounds.getSouth(),
          maxLat: bounds.getNorth(),
          minLng: bounds.getWest(),
          maxLng: bounds.getEast(),
        });
        return;
      }
      if (event.layerType === "polygon") {
        const layer = event.layer as L.Polygon;
        zoneDrawnItems.clearLayers();
        zoneDrawnItems.addLayer(layer);
        const latlngs = (layer.getLatLngs()[0] as L.LatLng[]).map((ll) => ({
          lat: ll.lat,
          lng: ll.lng,
        }));
        onDrawZoneRef.current?.(latlngs);
      }
    };
    map.on("draw:created", handleDrawCreated);

    mapRef.current = map;
    onMapReadyRef.current?.(map);

    const rafId = requestAnimationFrame(() => {
      if (mapRef.current === map) {
        map.invalidateSize({ pan: false });
      }
    });
    const t = window.setTimeout(() => {
      if (mapRef.current === map) {
        map.invalidateSize({ pan: false });
      }
    }, 200);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(t);
      map.off("draw:created", handleDrawCreated);

      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
        drawControlRef.current = null;
      }

      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }

      if (boundaryLayerRef.current) {
        boundaryLayerRef.current.remove();
        boundaryLayerRef.current = null;
        boundaryBoundsRef.current = null;
      }

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      zoneLayersRef.current.forEach((layer) => layer.remove());
      zoneLayersRef.current = [];

      if (zoneDrawControlRef.current) {
        map.removeControl(zoneDrawControlRef.current);
        zoneDrawControlRef.current = null;
      }

      map.stop();
      map.remove();
      mapRef.current = null;
      drawnItemsRef.current = null;
      onMapReadyRef.current?.(null);
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const currentCenter = map.getCenter();
    const hasCenterChanged =
      Math.abs(currentCenter.lat - center[0]) > 0.000001 ||
      Math.abs(currentCenter.lng - center[1]) > 0.000001;
    const hasZoomChanged = map.getZoom() !== zoom;

    if (hasCenterChanged || hasZoomChanged) {
      map.setView(center, zoom, { animate: false });
    }
  }, [center, zoom]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (boundaryLayerRef.current) {
      boundaryLayerRef.current.remove();
      boundaryLayerRef.current = null;
    }
    boundaryBoundsRef.current = null;
    return;
  }, [showBarangayBoundaries]);

  useEffect(() => {
    if (!mapRef.current || !autoFit) return;
    const map = mapRef.current;

    const validCoords: [number, number][] = reports
      .filter((r) => isValidCoordinate(r.latitude, r.longitude))
      .map((r) => [r.latitude, r.longitude] as [number, number]);

    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords);
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [60, 60],
          maxZoom: 15,
          animate: false,
        });
      }
    }
  }, [reports, autoFit]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (drawControlRef.current) {
      map.removeControl(drawControlRef.current);
      drawControlRef.current = null;
    }

    if (!canDraw || !drawMode) {
      drawnItemsRef.current?.clearLayers();
      return;
    }

    const DrawControl = (L as any).Control?.Draw;
    if (!DrawControl || !drawnItemsRef.current) {
      return;
    }

    drawControlRef.current = new DrawControl({
      position: "topright",
      draw: {
        rectangle: {
          shapeOptions: { color: "#1d4ed8", weight: 2 },
        },
        polyline: false,
        polygon: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: drawnItemsRef.current,
        edit: false,
        remove: false,
      },
    });

    map.addControl(drawControlRef.current);

    return () => {
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
        drawControlRef.current = null;
      }
    };
  }, [canDraw, drawMode]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (zoneDrawControlRef.current) {
      map.removeControl(zoneDrawControlRef.current);
      zoneDrawControlRef.current = null;
    }

    if (!canDrawZone || !drawZoneMode) {
      zoneDrawnItemsRef.current?.clearLayers();
      return;
    }

    const DrawControl = (L as any).Control?.Draw;
    if (!DrawControl || !zoneDrawnItemsRef.current) return;

    zoneDrawControlRef.current = new DrawControl({
      position: "topright",
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: {
            color: "#2563eb",
            fillColor: "#3b82f6",
            fillOpacity: 0.2,
            weight: 2,
          },
          icon: new L.DivIcon({
            iconSize: new L.Point(8, 8),
            className: "leaflet-div-icon leaflet-editing-icon",
          }),
        },
        rectangle: false,
        polyline: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: zoneDrawnItemsRef.current,
        edit: false,
        remove: false,
      },
    });

    map.addControl(zoneDrawControlRef.current);

    return () => {
      if (zoneDrawControlRef.current) {
        map.removeControl(zoneDrawControlRef.current);
        zoneDrawControlRef.current = null;
      }
    };
  }, [canDrawZone, drawZoneMode]);

  useEffect(() => {
    if (!mapRef.current) return;
    zoneLayersRef.current.forEach((l) => l.remove());
    zoneLayersRef.current = [];
  }, [reportingZones]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clean up existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Remove existing cluster group if any
    if (markerClusterGroupRef.current) {
      try {
        map.removeLayer(markerClusterGroupRef.current);
      } catch (e) {
        // ignore
      }
      markerClusterGroupRef.current = null;
    }

    // Create marker cluster group or layer group
    let clusterGroup: L.LayerGroup;
    if (typeof (L as any).markerClusterGroup === "function") {
      clusterGroup = (L as any).markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 40,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 16,
      });
    } else {
      clusterGroup = L.featureGroup();
    }

    markerClusterGroupRef.current = clusterGroup;
    map.addLayer(clusterGroup);

    const validCoords: [number, number][] = [];

    reports.forEach((report) => {
      const lat = parseCoordinate(report.latitude);
      const lng = parseCoordinate(report.longitude);

      if (lat === null || lng === null || !isValidCoordinate(lat, lng)) {
        return;
      }

      validCoords.push([lat, lng]);

      const marker = L.marker([lat, lng], {
        icon: createMarkerIcon(report.category, report.status),
      });

      const catColor =
        (WASTE_CATEGORY_COLORS as Record<string, string>)[report.category] ||
        "#3b82f6";
      const statusColor =
        (STATUS_COLORS as Record<string, string>)[report.status] || "#3b82f6";
      const catLabel =
        (WASTE_CATEGORY_LABELS as Record<string, string>)[report.category] ||
        report.category;
      const statusLabel =
        (REPORT_STATUS_LABELS as Record<string, string>)[report.status] ||
        report.status;

      const severity = report.severity;
      const severityColors: Record<string, { bg: string; color: string }> = {
        CRITICAL: { bg: "#fef2f2", color: "#dc2626" },
        HIGH: { bg: "#fff7ed", color: "#ea580c" },
        MODERATE: { bg: "#fefce8", color: "#ca8a04" },
        SPAM: { bg: "#f3f4f6", color: "#6b7280" },
      };
      const sevBadge = severity
        ? `<span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;background:${
            severityColors[severity]?.bg || "#f3f4f6"
          };color:${
            severityColors[severity]?.color || "#4b5563"
          };border:1px solid ${
            severityColors[severity]?.color || "#9ca3af"
          }40;">⚡ ${severity}</span>`
        : "";

      const imgHtml = report.images?.[0]?.imageUrl
        ? `<img src="${report.images[0].imageUrl}" alt="${report.title}" style="width:100%;height:110px;object-fit:cover;border-radius:8px;margin-bottom:8px;" loading="lazy" />`
        : `<div style="width:100%;height:70px;background:#f3f4f6;border-radius:8px;margin-bottom:8px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:11px;font-weight:500;">No photo available</div>`;

      const safeTitle = report.title.replace(/</g, "&lt;");
      const safeAddress = report.address?.replace(/</g, "&lt;") || "";
      const dateStr = new Date(report.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const popupContent = `
        <div class="waste-popup">
          <div class="waste-popup-header" style="background:${catColor};">
            <span class="waste-popup-cat">${catLabel}</span>
          </div>
          <div class="waste-popup-body" style="padding:12px;">
            ${imgHtml}
            <h3 class="waste-popup-title">${safeTitle}</h3>
            <div class="waste-popup-meta" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
              <span class="waste-popup-status" style="background:${statusColor}18;color:${statusColor};border:1px solid ${statusColor}44;">${statusLabel}</span>
              ${sevBadge}
              <span class="waste-popup-time" style="font-size:10px;color:#6b7280;margin-left:auto;">📅 ${dateStr}</span>
            </div>
            ${
              safeAddress
                ? `<p class="waste-popup-addr" style="font-size:11px;color:#4b5563;margin-bottom:10px;">📍 ${safeAddress}</p>`
                : `<p class="waste-popup-addr" style="font-size:11px;color:#6b7280;margin-bottom:10px;">📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}</p>`
            }
            <button type="button" class="waste-popup-btn" data-report-id="${report.id}" style="width:100%;padding:7px 12px;background:#2563eb;color:#ffffff;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;transition:background 0.15s ease;display:flex;align-items:center;justify-content:center;gap:4px;">
              View Details &rarr;
            </button>
          </div>
        </div>`;

      marker.bindPopup(popupContent, {
        maxWidth: 260,
        minWidth: 220,
        className: "waste-popup-wrapper",
      });

      const tooltipContent = `
        <div style="font-size:12px;line-height:1.4;">
          <strong style="display:block;margin-bottom:3px;color:#1f2937;">${safeTitle}</strong>
          <span style="font-size:10px;color:#6b7280;">${catLabel}</span>
          <span style="margin:0 5px;color:#d1d5db;">·</span>
          <span style="font-size:10px;color:${statusColor};font-weight:600;">${statusLabel}</span>
        </div>`;
      marker.bindTooltip(tooltipContent, {
        direction: "top",
        offset: [0, -10],
        opacity: 0.95,
        className: "waste-marker-tooltip",
      });

      marker.on("popupopen", (e: any) => {
        const popupEl = e.popup?.getElement();
        if (!popupEl) return;
        const btn = popupEl.querySelector(".waste-popup-btn");
        if (btn) {
          btn.addEventListener("click", (evt: Event) => {
            evt.preventDefault();
            if (onReportClick) {
              onReportClick(report);
            }
          });
        }
      });

      if (onReportClick) {
        marker.on("click", () => onReportClick(report));
      }

      clusterGroup.addLayer(marker);
      markersRef.current.push(marker);
    });

    // Ensure all report markers are centered and displayed within the current viewport
    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords);
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 15,
          animate: false,
        });
      }
    } else {
      map.setView(centerRef.current, zoomRef.current, { animate: false });
    }

    map.invalidateSize({ pan: false });
  }, [reports, onReportClick]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (!showHeatmap || reports.length === 0) return;

    const validReports = reports.filter((r) =>
      isValidCoordinate(r.latitude, r.longitude),
    );
    const heatData: [number, number, number][] = validReports.map((r) => [
      r.latitude,
      r.longitude,
      0.5,
    ]);

    if (typeof (L as any).heatLayer === "function") {
      heatLayerRef.current = (L as any)
        .heatLayer(heatData, {
          radius: 35,
          blur: 25,
          maxZoom: 17,
          max: 1.0,
          gradient: {
            0.0: "#3b82f6",
            0.3: "#06b6d4",
            0.5: "#22c55e",
            0.7: "#f59e0b",
            0.85: "#f97316",
            1.0: "#ef4444",
          },
        })
        .addTo(map);
    }
  }, [reports, showHeatmap]);

  return <div ref={containerRef} className="h-full w-full" />;
}

