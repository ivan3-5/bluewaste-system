"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
// leaflet-draw is imported dynamically inside the map useEffect (client-only)
// to ensure L is fully initialised before the plugin patches it.
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import {
  type AdminReport,
  type IncidentMapData,
} from "@/lib/admin-report";
import { getStatusColor, CleanupRadiusGroup } from "@/types";
import { useAuth } from "@/providers/AuthProvider";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  groupReportsByRadius,
  formatDistance,
  DEFAULT_RADIUS_METERS,
} from "@/lib/geo-grouping";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Trash2,
  Layers,
  Circle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Compass,
} from "lucide-react";

type MapViewProps = {
  reports: AdminReport[];
  center?: [number, number];
  zoom?: number;
  hideControls?: boolean;
  showLegend?: boolean;
  className?: string;
  mapHeightClassName?: string;
};

const DEFAULT_CENTER: [number, number] = [7.3132, 125.6844];
const PLACEHOLDER_IMAGE = "https://placehold.co/400x300?text=No+Image";

// ─── Icon builders ────────────────────────────────────────────────────────────

function buildIcon(color: string) {
  return L.divIcon({
    className: "incident-marker-icon",
    html: `
      <div style="position:relative;width:34px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.35));transition:transform 0.15s ease;transform-origin:50% 100%;">
        <svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44" fill="none">
          <path d="M17 1C8.16 1 1 8.16 1 17c0 11.25 16 26 16 26S33 28.25 33 17C33 8.16 25.84 1 17 1z"
                fill="${color}" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
          <circle cx="17" cy="17" r="6.5" fill="#ffffff"/>
          <circle cx="17" cy="17" r="3.5" fill="${color}"/>
        </svg>
      </div>
    `,
    iconSize: [34, 44],
    iconAnchor: [17, 43],
    popupAnchor: [0, -42],
  });
}

/**
 * Small pinpoint marker for individual report locations within a 50m group
 */
function buildSmallMemberIcon(color: string) {
  return L.divIcon({
    className: "group-member-marker-icon",
    html: `
      <div style="position:relative;width:22px;height:22px;display:flex;align-items:center;justify-content:center;cursor:pointer;filter:drop-shadow(0 2px 5px rgba(0,0,0,0.35));">
        <div style="width:16px;height:16px;border-radius:999px;background:${color};border:2.5px solid #ffffff;box-shadow:0 0 0 2px rgba(37,99,235,0.45);"></div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
}

/**
 * Incident icon — location pin + badge when count > 1.
 * Single-contributor incidents look identical to regular report icons.
 */
function buildIncidentIcon(color: string, count: number) {
  if (count <= 1) {
    return buildIcon(color);
  }

  const badgeCount = count > 99 ? "99+" : String(count);
  return L.divIcon({
    className: "incident-marker-icon",
    html: `
      <div style="position:relative;width:38px;height:48px;display:flex;align-items:center;justify-content:center;cursor:pointer;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.38));transition:transform 0.15s ease;transform-origin:50% 100%;">
        <svg xmlns="http://www.w3.org/2000/svg" width="38" height="48" viewBox="0 0 34 44" fill="none">
          <path d="M17 1C8.16 1 1 8.16 1 17c0 11.25 16 26 16 26S33 28.25 33 17C33 8.16 25.84 1 17 1z"
                fill="${color}" stroke="#ffffff" stroke-width="2.2" stroke-linejoin="round"/>
          <circle cx="17" cy="17" r="6.5" fill="#ffffff"/>
          <circle cx="17" cy="17" r="3.5" fill="${color}"/>
        </svg>
        <div style="
          position:absolute;
          top:-6px;right:-10px;
          min-width:22px;height:22px;
          background:#1e3a5f;
          color:#fff;
          font-size:11px;font-weight:800;
          border-radius:999px;
          border:2px solid white;
          display:flex;align-items:center;justify-content:center;
          padding:0 5px;
          box-shadow:0 3px 8px rgba(0,0,0,0.35);
          font-family:system-ui,-apple-system,sans-serif;
          letter-spacing:-0.3px;
          z-index:10;
        ">
          <span style="margin-top:-0.5px">${badgeCount}</span>
        </div>
      </div>
    `,
    iconSize: [38, 48],
    iconAnchor: [19, 47],
    popupAnchor: [0, -46],
  });
}

// ─── HTML helpers ─────────────────────────────────────────────────────────────

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "\x26amp;")
    .replace(/</g, "\x26lt;")
    .replace(/>/g, "\x26gt;")
    .replace(/"/g, "\x26quot;")
    .replace(/'/g, "\x26#39;");
}

function getCategoryPill(category: AdminReport["category"]) {
  if (category === "with_waste") {
    return '<span style="display:inline-flex;align-items:center;padding:3px 8px;border-radius:999px;background:#fee2e2;color:#b91c1c;font-size:11px;font-weight:700">With Waste</span>';
  }

  return '<span style="display:inline-flex;align-items:center;padding:3px 8px;border-radius:999px;background:#dcfce7;color:#166534;font-size:11px;font-weight:700">No Waste</span>';
}

function getStatusPill(status: AdminReport["status"]) {
  const pills: Record<AdminReport["status"], string> = {
    PENDING:
      '<span style="display:inline-flex;align-items:center;padding:3px 8px;border-radius:999px;background:#fef3c7;color:#92400e;font-size:11px;font-weight:700">Pending</span>',
    VERIFIED:
      '<span style="display:inline-flex;align-items:center;padding:3px 8px;border-radius:999px;background:#dbeafe;color:#1d4ed8;font-size:11px;font-weight:700">Verified</span>',
    CLEANUP_SCHEDULED:
      '<span style="display:inline-flex;align-items:center;padding:3px 8px;border-radius:999px;background:#ede9fe;color:#7c3aed;font-size:11px;font-weight:700">Cleanup Scheduled</span>',
    IN_PROGRESS:
      '<span style="display:inline-flex;align-items:center;padding:3px 8px;border-radius:999px;background:#ffedd5;color:#c2410c;font-size:11px;font-weight:700">In Progress</span>',
    CLEANED:
      '<span style="display:inline-flex;align-items:center;padding:3px 8px;border-radius:999px;background:#dcfce7;color:#166534;font-size:11px;font-weight:700">Cleaned</span>',
    REJECTED:
      '<span style="display:inline-flex;align-items:center;padding:3px 8px;border-radius:999px;background:#ffe4e6;color:#be123c;font-size:11px;font-weight:700">Rejected</span>',
  };

  return pills[status] || `<span style="font-size:11px;">${status}</span>`;
}

function buildPopupHtml(report: AdminReport) {
  const imageUrl = escapeHtml(report.imageUrl || PLACEHOLDER_IMAGE);
  const detailHref = `/dashboard/reports/${encodeURIComponent(report.id)}`;
  const scheduleHref = `/dashboard/schedules?scheduleReports=${encodeURIComponent(report.id)}&lat=${report.latitude}&lng=${report.longitude}&barangay=${encodeURIComponent(report.locationName || "")}`;
  const isSchedulable = report.status !== "CLEANED" && report.status !== "REJECTED";

  return `
    <div style="display:flex;flex-direction:column;gap:10px;min-width:220px;max-width:260px;font-family:system-ui,-apple-system,sans-serif;">
      <img src="${imageUrl}" alt="Report image" loading="lazy" style="height:110px;width:100%;border-radius:10px;object-fit:cover" />
      <div style="display:flex;flex-direction:column;gap:6px">
        <h4 style="margin:0;font-size:13px;font-weight:800;color:#0f172a;line-height:1.2;">${escapeHtml(report.locationName || "Waste Report")}</h4>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${getCategoryPill(report.category)}
          ${getStatusPill(report.status)}
        </div>
        <p style="margin:0;font-size:11px;color:#64748b;line-height:1.3;">📍 ${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}</p>
        <div style="display:flex;gap:6px;margin-top:4px;">
          <a href="${detailHref}" style="${isSchedulable ? "flex:1" : "width:100%"};display:inline-flex;align-items:center;justify-content:center;height:32px;border-radius:8px;background:#f1f5f9;color:#334155;font-size:11px;font-weight:700;text-decoration:none;">Details</a>
          ${isSchedulable ? `
          <a href="${scheduleHref}" style="flex:1;display:inline-flex;align-items:center;justify-content:center;height:32px;border-radius:8px;background:hsl(var(--primary));color:#ffffff;font-size:11px;font-weight:700;text-decoration:none;">Schedule</a>
          ` : ""}
        </div>
      </div>
    </div>
  `;
}

/** Popup HTML for a 50-meter radius grouped cleanup area */
function buildRadiusGroupPopupHtml(group: CleanupRadiusGroup<AdminReport>) {
  const isMulti = group.reportCount > 1;
  const firstReport = group.reports[0];
  const imageUrl = escapeHtml(firstReport?.imageUrl || PLACEHOLDER_IMAGE);
  const locationLabel = group.barangay || firstReport?.locationName || "Panabo Coastal Zone";
  const reportIds = group.reports.map((r) => r.id).join(",");
  const scheduleHref = `/dashboard/schedules?scheduleReports=${encodeURIComponent(reportIds)}&lat=${group.center.latitude}&lng=${group.center.longitude}&barangay=${encodeURIComponent(locationLabel)}`;
  const hasSchedulableReports = group.reports.some(
    (r) => r.status !== "CLEANED" && r.status !== "REJECTED",
  );

  // Pairwise distance breakdown
  let distanceHtml = "";
  if (isMulti) {
    const pairRows = group.pairwiseDistances
      .slice(0, 4)
      .map((p, idx) => {
        const fromRep = group.reports.find((r) => r.id === p.fromId);
        const toRep = group.reports.find((r) => r.id === p.toId);
        const fromTitle = escapeHtml(fromRep?.locationName || `Report ${idx + 1}`);
        const toTitle = escapeHtml(toRep?.locationName || `Report ${idx + 2}`);
        return `<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;font-size:11px;color:#334155;padding:2px 0;">
          <span style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${fromTitle} ↔ ${toTitle}</span>
          <span style="font-weight:700;color:#2563eb;white-space:nowrap;background:#eff6ff;padding:1px 6px;border-radius:999px;">📏 ${p.distanceMeters} m</span>
        </div>`;
      })
      .join("");

    distanceHtml = `
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:8px;margin-top:6px;">
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;font-weight:700;color:#1e293b;margin-bottom:4px;">
          <span>Geographical Distances:</span>
          <span style="color:#059669;background:#d1fae5;padding:1px 6px;border-radius:999px;font-size:10px;">Within ${group.radiusMeters}m Radius</span>
        </div>
        <div style="font-size:11px;color:#475569;margin-bottom:4px;">
          Max distance between reports: <strong style="color:#1e293b;">${group.maxDistanceMeters} m</strong>
        </div>
        ${pairRows}
        ${group.pairwiseDistances.length > 4 ? `<div style="font-size:10px;color:#64748b;margin-top:3px;">+ ${group.pairwiseDistances.length - 4} more distance pairs</div>` : ""}
      </div>
    `;
  }

  // Reports mini-list
  const reportsList = group.reports
    .slice(0, 3)
    .map((r) => {
      const distInfo = group.distancesFromCenter.find((d) => d.reportId === r.id);
      const distStr = distInfo ? ` • ${distInfo.distanceMeters}m from center` : "";
      return `<div style="display:flex;align-items:center;justify-content:space-between;font-size:11px;padding:3.5px 0;border-bottom:1px dashed #e2e8f0;">
        <span style="font-weight:600;color:#1e293b;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(r.locationName || r.description || "Report")}</span>
        <span style="color:#64748b;font-size:10px;white-space:nowrap;">${getStatusPill(r.status)}${distStr}</span>
      </div>`;
    })
    .join("");

  return `
    <div style="display:flex;flex-direction:column;gap:10px;min-width:260px;max-width:300px;font-family:system-ui,-apple-system,sans-serif;">
      <div style="position:relative;border-radius:12px;overflow:hidden;">
        <img src="${imageUrl}" alt="Cleanup area image" loading="lazy" style="height:112px;width:100%;object-fit:cover;" />
        <div style="position:absolute;top:6px;left:6px;background:rgba(15,23,42,0.88);backdrop-filter:blur(4px);color:#fff;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;display:flex;align-items:center;gap:4px;">
          <span>⭕</span>
          <span>${group.radiusMeters}m Cleanup Area</span>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:6px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
          <span style="font-size:13px;font-weight:800;color:#0f172a;line-height:1.2;">${escapeHtml(locationLabel)}</span>
          <span style="font-size:11px;font-weight:700;color:#1e3a5f;background:#e0f2fe;padding:2px 8px;border-radius:999px;white-space:nowrap;">
            ${group.reportCount} ${group.reportCount === 1 ? "Report" : "Reports"}
          </span>
        </div>

        <div style="font-size:11px;color:#64748b;">
          👥 ${group.citizenCount} citizen ${group.citizenCount === 1 ? "submission" : "submissions"} in this ${group.radiusMeters}m sector
        </div>

        ${distanceHtml}

        <div style="margin-top:4px;">
          <div style="font-size:11px;font-weight:700;color:#475569;margin-bottom:2px;">Contained Waste Reports:</div>
          ${reportsList}
          ${group.reportCount > 3 ? `<div style="font-size:10px;color:#64748b;margin-top:2px;">+ ${group.reportCount - 3} more reports in this 50m area</div>` : ""}
        </div>

        ${hasSchedulableReports ? `
        <a href="${scheduleHref}" style="display:flex;align-items:center;justify-content:center;gap:6px;height:38px;margin-top:6px;padding:0 14px;border-radius:10px;background:linear-gradient(to right,#2563eb,#4f46e5);color:#ffffff;font-size:12px;font-weight:700;text-decoration:none;box-shadow:0 4px 12px rgba(79,70,229,0.3);">
          <span>📅 Schedule ${isMulti ? "Grouped" : ""} Cleanup Operation →</span>
        </a>
        ` : ""}
      </div>
    </div>
  `;
}

// ─── Status-Aware 50m Radius Visual Theme ─────────────────────────────────────
// Soft, harmonious perimeter tints that indicate cleanup and operation status
// while maintaining low opacity so map terrain, coastlines, and roads remain clear.
const RADIUS_THEME_BY_STATUS: Record<string, { stroke: string; fill: string; titleColor: string }> = {
  CLEANED: { stroke: "#059669", fill: "#10b981", titleColor: "#047857" }, // Soft emerald green (Cleaned sector)
  VERIFIED: { stroke: "#0284c7", fill: "#38bdf8", titleColor: "#0369a1" }, // Ocean cyan / Azure (Verified waste)
  CLEANUP_SCHEDULED: { stroke: "#7c3aed", fill: "#a855f7", titleColor: "#6d28d9" }, // Violet / Purple (Scheduled operation)
  IN_PROGRESS: { stroke: "#d97706", fill: "#f59e0b", titleColor: "#b45309" }, // Warm amber (In progress)
  PENDING: { stroke: "#ea580c", fill: "#f97316", titleColor: "#c2410c" }, // Orange (Pending review)
  REJECTED: { stroke: "#dc2626", fill: "#ef4444", titleColor: "#b91c1c" }, // Rose / Red
};

function getRadiusCircleStyle(group: CleanupRadiusGroup<AdminReport>) {
  const isMulti = group.isGrouped;
  const isAllCleaned = group.reports.every((r) => r.status === "CLEANED");

  if (isMulti) {
    if (isAllCleaned) {
      return {
        color: "#059669",
        fillColor: "#10b981",
        fillOpacity: 0.16,
        weight: 2,
        dashArray: "6, 6",
        opacity: 0.9,
        titleColor: "#047857",
      };
    }
    return {
      color: "#4f46e5",
      fillColor: "#6366f1",
      fillOpacity: 0.16,
      weight: 2,
      dashArray: "6, 6",
      opacity: 0.9,
      titleColor: "#4338ca",
    };
  }

  const primaryStatus = (group.reports[0]?.status || "VERIFIED").toUpperCase();
  const theme = RADIUS_THEME_BY_STATUS[primaryStatus] || {
    stroke: "#0284c7",
    fill: "#38bdf8",
    titleColor: "#0369a1",
  };

  return {
    color: theme.stroke,
    fillColor: theme.fill,
    fillOpacity: 0.13,
    weight: 1.5,
    dashArray: "4, 4",
    opacity: 0.85,
    titleColor: theme.titleColor,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MapView({
  reports,
  center = DEFAULT_CENTER,
  zoom = 12,
  hideControls = false,
  showLegend,
  className = "",
  mapHeightClassName,
}: MapViewProps) {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [isEditingZone, setIsEditingZone] = useState(false);
  const [isDrawingZone, setIsDrawingZone] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [groupedMode] = useState(true); // default: 50m radius-grouped view
  const [radiusMeters] = useState<number>(50); // default: 50 meters
  const [showRadiusCircles, setShowRadiusCircles] = useState<boolean>(true);
  const [showMapLegend, setShowMapLegend] = useState<boolean>(
    showLegend !== undefined ? showLegend : !hideControls,
  );
  const [isLegendExpanded, setIsLegendExpanded] = useState<boolean>(true);
  const [incidents, setIncidents] = useState<IncidentMapData[]>([]);
  const [incidentsLoading, setIncidentsLoading] = useState(false);
  const { isAdmin, isLguAdmin } = useAuth();

  // lazy import hooks to avoid RSC issues from server components
  let reportingZonesHook: any = null;
  try {
    // require inside client to avoid server import errors
    // eslint-disable-next-line @typescript-eslint/no-var-requires,global-require
    reportingZonesHook = require("@/hooks/useReportingZones");
  } catch (e) {
    reportingZonesHook = null;
  }

  const {
    useReportingZones,
    useUpdateReportingZone,
    useCreateReportingZone,
    useDeleteReportingZone,
  } = reportingZonesHook || {};
  const zonesQuery = useReportingZones
    ? useReportingZones(false)
    : { data: [] };
  const zonesData = zonesQuery?.data;
  const zones = useMemo(() => zonesData || [], [zonesData]);

  const selectedZone = useMemo(
    () => (zones || []).find((z: any) => z.id === selectedZoneId) || null,
    [zones, selectedZoneId],
  );

  // Default to "Panabo Coastal Area" (or first zone) as soon as zones load
  useEffect(() => {
    if (!selectedZoneId && zones.length > 0) {
      const panaboZone = zones.find((z: any) =>
        z.name?.toLowerCase().includes("panabo coastal area")
      );
      setSelectedZoneId(panaboZone ? panaboZone.id : zones[0].id);
    }
  }, [zones, selectedZoneId]);

  const updateZoneMutation = useUpdateReportingZone
    ? useUpdateReportingZone()
    : null;
  const createZoneMutation = useCreateReportingZone
    ? useCreateReportingZone()
    : null;
  const deleteZoneMutation = useDeleteReportingZone
    ? useDeleteReportingZone()
    : null;

  const handleDeleteZone = async () => {
    if (!selectedZoneId) return;
    setIsDeleting(true);
    try {
      if (deleteZoneMutation) {
        await deleteZoneMutation.mutateAsync(selectedZoneId);
      } else {
        await api.delete(`/reporting-zones/${selectedZoneId}`);
      }
      setIsEditingZone(false);
      setIsDrawingZone(false);
      const remainingZones = (zones || []).filter((z: any) => z.id !== selectedZoneId);
      const panaboZone = remainingZones.find((z: any) =>
        z.name?.toLowerCase().includes("panabo coastal area")
      );
      setSelectedZoneId(panaboZone ? panaboZone.id : remainingZones[0]?.id || null);
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete coastal zone. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const radiusCirclesLayerRef = useRef<L.LayerGroup | null>(null);
  const connectionsLayerRef = useRef<L.LayerGroup | null>(null);
  const zoneLayersRef = useRef<L.LayerGroup | null>(null);
  const zoneEditableGroupRef = useRef<L.FeatureGroup | null>(null);
  const editControlRef = useRef<any>(null);
  const drawControlRef = useRef<any>(null);
  const zoneDrawnGroupRef = useRef<L.FeatureGroup | null>(null);

  // ── Fetch grouped incident data ─────────────────────────────────────────────

  useEffect(() => {
    if (!groupedMode) {
      setIncidents([]);
      return;
    }

    let cancelled = false;
    setIncidentsLoading(true);

    api
      .get<IncidentMapData[]>("/reports/incidents/map")
      .then((res) => {
        if (!cancelled) setIncidents(res.data);
      })
      .catch(() => {
        if (!cancelled) setIncidents([]);
      })
      .finally(() => {
        if (!cancelled) setIncidentsLoading(false);
      });

    return () => { cancelled = true; };
  }, [groupedMode]);

  // ── Filtered data ────────────────────────────────────────────────────────────

  const filteredReports = useMemo(() => {
    return reports;
  }, [reports]);

  // ── 50-Meter Radius Grouping ─────────────────────────────────────────────────
  const radiusGroups = useMemo(() => {
    return groupReportsByRadius(filteredReports, radiusMeters);
  }, [filteredReports, radiusMeters]);

  const groupedAreasCount = useMemo(
    () => radiusGroups.filter((g) => g.isGrouped).length,
    [radiusGroups],
  );

  const isolatedReportsCount = useMemo(
    () => radiusGroups.filter((g) => !g.isGrouped).length,
    [radiusGroups],
  );

  // ── Map init ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const container = containerRef.current as HTMLDivElement & {
      _leaflet_id?: number;
    };

    if (container._leaflet_id) {
      delete container._leaflet_id;
    }

    const map = L.map(container, { zoomControl: true }).setView(center, zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const radiusCirclesLayer = L.layerGroup().addTo(map);
    const connectionsLayer = L.layerGroup().addTo(map);
    const markersLayer = L.layerGroup().addTo(map);
    const zoneLayerGroup = L.layerGroup().addTo(map);
    const zoneEditableGroup = new L.FeatureGroup();
    map.addLayer(zoneEditableGroup);
    const zoneDrawnGroup = new L.FeatureGroup();
    map.addLayer(zoneDrawnGroup);

    radiusCirclesLayerRef.current = radiusCirclesLayer;
    connectionsLayerRef.current = connectionsLayer;
    markersLayerRef.current = markersLayer;
    zoneLayersRef.current = zoneLayerGroup;
    zoneEditableGroupRef.current = zoneEditableGroup;
    zoneDrawnGroupRef.current = zoneDrawnGroup;
    mapRef.current = map;

    Promise.all([
      import("leaflet-draw"),
      import("leaflet-draw/dist/leaflet.draw.css" as any),
    ]).catch(() => {
      console.warn("leaflet-draw failed to load — zone drawing will be unavailable.");
    });

    // Handle responsive container resizing & dimension recalculations cleanly
    let rafId: number | null = null;
    const triggerInvalidate = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize({ pan: false });
        }
      });
    };

    // Initial triggers after DOM painting and after sidebar/layout transitions
    requestAnimationFrame(triggerInvalidate);
    const timer1 = setTimeout(triggerInvalidate, 100);
    const timer2 = setTimeout(triggerInvalidate, 350);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        triggerInvalidate();
      });
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", triggerInvalidate);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (rafId) cancelAnimationFrame(rafId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener("resize", triggerInvalidate);
      radiusCirclesLayer.clearLayers();
      connectionsLayer.clearLayers();
      markersLayer.clearLayers();
      map.remove();
      mapRef.current = null;
      radiusCirclesLayerRef.current = null;
      connectionsLayerRef.current = null;
      markersLayerRef.current = null;
      if (zoneEditableGroupRef.current) {
        zoneEditableGroupRef.current.clearLayers();
        zoneEditableGroupRef.current = null;
      }
      if (zoneLayersRef.current) {
        zoneLayersRef.current.clearLayers();
        zoneLayersRef.current = null;
      }
      if (zoneDrawnGroupRef.current) {
        zoneDrawnGroupRef.current.clearLayers();
        zoneDrawnGroupRef.current = null;
      }

      if (container._leaflet_id) {
        delete container._leaflet_id;
      }
    };
  }, [center, zoom]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (editControlRef.current) {
      map.removeControl(editControlRef.current);
      editControlRef.current = null;
    }

    if (!isEditingZone) return;

    const DrawControl = (L as any).Control?.Draw;
    if (!DrawControl || !zoneEditableGroupRef.current) return;

    editControlRef.current = new DrawControl({
      position: "topright",
      draw: false,
      edit: {
        featureGroup: zoneEditableGroupRef.current,
        edit: true,
        remove: true,
      },
    });

    map.addControl(editControlRef.current);

    const handleEdited = (ev: any) => {
      const layers: L.Layer[] = [];
      ev.layers.eachLayer((layer: L.Layer) => {
        layers.push(layer);
      });

      if (!selectedZoneId || layers.length === 0) return;

      const layer = layers[0] as L.Polygon;
      const latlngs = (layer.getLatLngs()[0] as L.LatLng[]).map((ll) => ({
        lat: ll.lat,
        lng: ll.lng,
      }));

      if (updateZoneMutation) {
        updateZoneMutation.mutate({ id: selectedZoneId, coordinates: latlngs });
      } else {
        fetch(`/reporting-zones/${selectedZoneId}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ coordinates: latlngs }),
        });
      }
    };

    map.on("draw:edited", handleEdited);

    return () => {
      map.off("draw:edited", handleEdited);
      if (editControlRef.current) {
        map.removeControl(editControlRef.current);
        editControlRef.current = null;
      }
    };
  }, [isEditingZone, selectedZoneId, updateZoneMutation]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (drawControlRef.current) {
      map.removeControl(drawControlRef.current);
      drawControlRef.current = null;
    }

    if (!isDrawingZone) return;

    const DrawControl = (L as any).Control?.Draw;
    if (!DrawControl) return;

    drawControlRef.current = new DrawControl({
      position: "topright",
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: {
            color: "#0ea5e9",
            weight: 2,
            fillColor: "#38bdf8",
            fillOpacity: 0.12,
          },
        },
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
      },
      edit: false,
    });

    map.addControl(drawControlRef.current);

    const handleCreated = async (ev: any) => {
      if (ev.layerType !== "polygon") return;

      const layer = ev.layer as L.Polygon;
      if (zoneDrawnGroupRef.current) {
        zoneDrawnGroupRef.current.clearLayers();
        zoneDrawnGroupRef.current.addLayer(layer);
      }

      const latlngs = (layer.getLatLngs()[0] as L.LatLng[]).map((ll) => ({
        lat: ll.lat,
        lng: ll.lng,
      }));

      const zoneName = window.prompt("Enter a name for this coastal zone");
      if (!zoneName || !zoneName.trim()) {
        zoneDrawnGroupRef.current?.clearLayers();
        return;
      }

      try {
        if (createZoneMutation) {
          const created = await createZoneMutation.mutateAsync({
            name: zoneName.trim(),
            coordinates: latlngs,
          });
          if (created?.id) {
            setSelectedZoneId(created.id);
          }
        } else {
          const response = await fetch("/reporting-zones", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              name: zoneName.trim(),
              coordinates: latlngs,
            }),
          });
          const created = await response.json();
          if (created?.id) {
            setSelectedZoneId(created.id);
          }
        }

        setIsDrawingZone(false);
        zoneDrawnGroupRef.current?.clearLayers();
      } catch {
        window.alert("Failed to create coastal zone. Please try again.");
      }
    };

    map.on("draw:created", handleCreated);

    return () => {
      map.off("draw:created", handleCreated);
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
        drawControlRef.current = null;
      }
    };
  }, [isDrawingZone, createZoneMutation]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView(center, zoom, { animate: false });
  }, [center, zoom]);

  // ── Markers, Circles & Distances Effect ─────────────────────────────────────

  useEffect(() => {
    if (!markersLayerRef.current) return;

    const markersLayer = markersLayerRef.current;
    const radiusCirclesLayer = radiusCirclesLayerRef.current;
    const connectionsLayer = connectionsLayerRef.current;

    markersLayer.clearLayers();
    if (radiusCirclesLayer) radiusCirclesLayer.clearLayers();
    if (connectionsLayer) connectionsLayer.clearLayers();

    const positions: [number, number][] = [];

    if (groupedMode) {
      // ── 50-Meter Radius Grouped View Mode ──────────────────────────────────
      radiusGroups.forEach((group) => {
        const isMulti = group.isGrouped;
        const primaryReport = group.reports[0];
        const color = getStatusColor(primaryReport?.status || "VERIFIED");

        positions.push([group.center.latitude, group.center.longitude]);

        // 1. Draw Visible 50-Meter Radius Circle with status-aware aesthetic tint
        if (showRadiusCircles && radiusCirclesLayer) {
          const circleStyle = getRadiusCircleStyle(group);
          const circle = L.circle([group.center.latitude, group.center.longitude], {
            radius: group.radiusMeters,
            color: circleStyle.color,
            fillColor: circleStyle.fillColor,
            fillOpacity: circleStyle.fillOpacity,
            weight: circleStyle.weight,
            dashArray: circleStyle.dashArray,
            opacity: circleStyle.opacity,
          });

          circle.bindTooltip(
            `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:11px;line-height:1.3;">
              <strong style="color:${circleStyle.titleColor};">⭕ ${group.radiusMeters}m Cleanup Area</strong><br/>
              <span style="font-weight:600;color:#0f172a;">${group.reportCount} ${group.reportCount === 1 ? "report" : "reports"}</span>
              <span style="color:#64748b;">(${group.citizenCount} citizen${group.citizenCount === 1 ? "" : "s"})</span>
            </div>`,
            { direction: "top", offset: [0, -10] },
          );

          radiusCirclesLayer.addLayer(circle);
        }

        if (isMulti) {
          // 2. Multi-report Group:
          // A. Draw inter-report dashed connector lines with distance badges
          if (connectionsLayer && group.pairwiseDistances.length > 0) {
            group.pairwiseDistances.forEach((pair) => {
              const repA = group.reports.find((r) => r.id === pair.fromId);
              const repB = group.reports.find((r) => r.id === pair.toId);
              if (repA && repB) {
                const line = L.polyline(
                  [
                    [repA.latitude, repA.longitude],
                    [repB.latitude, repB.longitude],
                  ],
                  {
                    color: "#6366f1",
                    weight: 2,
                    dashArray: "4, 6",
                    opacity: 0.65,
                  },
                );
                line.bindTooltip(`📏 ${pair.distanceMeters} m`, {
                  permanent: false,
                  direction: "center",
                  className: "distance-polyline-tooltip",
                });
                connectionsLayer.addLayer(line);
              }
            });
          }

          // B. Draw individual member markers at their exact GPS locations
          group.reports.forEach((report) => {
            positions.push([report.latitude, report.longitude]);
            const smallIcon = buildSmallMemberIcon(getStatusColor(report.status));
            const subMarker = L.marker([report.latitude, report.longitude], {
              icon: smallIcon,
              title: report.locationName || (report as any).title || "Waste Report",
            });
            subMarker.bindPopup(buildPopupHtml(report), { maxWidth: 260 });
            markersLayer.addLayer(subMarker);
          });

          // C. Draw primary Group Cluster Pin at centroid with report count badge
          const groupMarker = L.marker(
            [group.center.latitude, group.center.longitude],
            {
              icon: buildIncidentIcon(color, group.reportCount),
              zIndexOffset: 500,
            },
          );
          groupMarker.bindPopup(buildRadiusGroupPopupHtml(group), {
            maxWidth: 300,
          });
          markersLayer.addLayer(groupMarker);
        } else {
          // 3. Isolated Single Report outside radius
          const singleReport = group.reports[0];
          const singleMarker = L.marker(
            [singleReport.latitude, singleReport.longitude],
            {
              icon: buildIcon(color),
            },
          );
          singleMarker.bindPopup(buildRadiusGroupPopupHtml(group), {
            maxWidth: 290,
          });
          markersLayer.addLayer(singleMarker);
        }
      });
    } else {
      // ── Raw Individual Reports Mode ─────────────────────────────────────────
      filteredReports.forEach((report) => {
        positions.push([report.latitude, report.longitude]);
        const color = getStatusColor(report.status);
        const icon = buildIcon(color);
        const marker = L.marker([report.latitude, report.longitude], { icon });
        marker.bindPopup(buildPopupHtml(report), { maxWidth: 260 });
        markersLayer.addLayer(marker);
      });
    }

    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      if (bounds.isValid()) {
        mapRef.current?.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      }
    }
  }, [filteredReports, radiusGroups, groupedMode, showRadiusCircles, radiusMeters]);

  // render reporting zones as polygon layers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (zoneEditableGroupRef.current) {
      zoneEditableGroupRef.current.clearLayers();
    }
    if (zoneLayersRef.current) {
      zoneLayersRef.current.clearLayers();
    }

    if (isAdmin && !hideControls) {
      (zones || []).forEach((zone: any) => {
        const latlngs = zone.coordinates.map(
          (p: any) => [p.lat, p.lng] as [number, number],
        );
        const polygon = L.polygon(latlngs, {
          color: zone.id === selectedZoneId ? "#1d4ed8" : "#2563eb",
          weight: 2,
          fillColor: zone.id === selectedZoneId ? "#3b82f6" : "#3b82f6",
          fillOpacity: zone.id === selectedZoneId ? 0.2 : 0.12,
        });
        polygon.bindTooltip(zone.name, { permanent: false, direction: "center" });

        if (zone.id === selectedZoneId && zoneEditableGroupRef.current) {
          zoneEditableGroupRef.current.addLayer(polygon);
        } else if (zoneLayersRef.current) {
          zoneLayersRef.current.addLayer(polygon);
        } else {
          polygon.addTo(map);
        }
      });
    }
  }, [zones, selectedZoneId, isAdmin, hideControls]);

  // Fit bounds to selected zone when selected
  useEffect(() => {
    if (!selectedZoneId || !mapRef.current) return;
    const zone = (zones || []).find((z: any) => z.id === selectedZoneId);
    if (!zone || !zone.coordinates || zone.coordinates.length === 0) return;
    const latlngs = zone.coordinates.map((p: any) => [Number(p.lat), Number(p.lng)] as [number, number]);
    const bounds = L.latLngBounds(latlngs);
    if (bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [selectedZoneId, zones]);

  // ── Render ──────────────────────────────────────────────────────────────────

  const activeCount = groupedMode ? radiusGroups.length : filteredReports.length;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col",
        !mapHeightClassName && "h-[calc(100dvh-6.5rem)] md:h-[calc(100dvh-7.5rem)] min-h-[540px]",
        className,
      )}
    >
      {isAdmin && !hideControls && (
        <div className="shrink-0 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap lg:w-auto">
              <div className="w-full sm:w-56 lg:w-64">
                <label
                  htmlFor="coastal-zone-select"
                  className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400"
                >
                  Coastal Zone
                </label>
                <select
                  id="coastal-zone-select"
                  className="w-full appearance-none rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/30 [&::-ms-expand]:hidden"
                  value={selectedZoneId || ""}
                  onChange={(e) => setSelectedZoneId(e.target.value)}
                >
                  {zones.map((z: any) => (
                    <option key={z.id} value={z.id} className="dark:bg-slate-900 dark:text-slate-200">
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Radius Circles Toggle */}
              {groupedMode && (
                <button
                  onClick={() => setShowRadiusCircles((v) => !v)}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-semibold transition border ${showRadiusCircles
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                      : "bg-white dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700"
                    }`}
                  title="Toggle display of 50-meter radius circles around cleanup locations"
                >
                  <Circle className="w-3.5 h-3.5" />
                  <span>Circles: {showRadiusCircles ? "On" : "Off"}</span>
                </button>
              )}

              {/* Legend Toggle */}
              <button
                onClick={() => setShowMapLegend((v) => !v)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-semibold transition border ${showMapLegend
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                    : "bg-white dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700"
                  }`}
                title="Toggle map legend visibility"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Legend</span>
              </button>

              {/* Draw / Edit zone controls — LGU_ADMIN only */}
              {isLguAdmin && (
                <>
                  <button
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${isDrawingZone
                        ? "bg-[hsl(var(--primary))] text-white hover:opacity-90"
                        : "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    onClick={() => {
                      setIsEditingZone(false);
                      setIsDrawingZone((v) => !v);
                    }}
                  >
                    {isDrawingZone ? "Stop Drawing" : "Draw Zone"}
                  </button>
                  <button
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${isEditingZone
                        ? "bg-amber-500 text-white hover:bg-amber-600"
                        : "border border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                      }`}
                    onClick={() => {
                      setIsDrawingZone(false);
                      setIsEditingZone((v) => !v);
                    }}
                  >
                    {isEditingZone ? "Stop Editing" : "Edit Zone"}
                  </button>
                  <button
                    disabled={!selectedZoneId}
                    className="flex items-center gap-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 transition hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => {
                      if (selectedZoneId) {
                        setIsDeleteModalOpen(true);
                      }
                    }}
                    title={selectedZone ? `Delete zone "${selectedZone.name}"` : "Select a zone to delete"}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Zone</span>
                  </button>
                </>
              )}
              <button
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => {
                  const panaboZone = (zones || []).find((z: any) =>
                    z.name?.toLowerCase().includes("panabo coastal area")
                  );
                  setSelectedZoneId(panaboZone ? panaboZone.id : zones[0]?.id || null);
                  setIsEditingZone(false);
                  setIsDrawingZone(false);
                  const positions = filteredReports.map((r) => [r.latitude, r.longitude] as [number, number]);
                  if (positions.length > 0) {
                    const bounds = L.latLngBounds(positions);
                    if (bounds.isValid()) {
                      mapRef.current?.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
                    }
                  }
                }}
              >
                Reset
              </button>
            </div>
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {isDrawingZone
              ? "Drawing mode enabled: click to plot polygon vertices on the map."
              : isEditingZone
                ? "Editing mode enabled: drag vertices to adjust the selected zone boundary."
                : groupedMode
                  ? `50m Radius Grouping Active: ${filteredReports.length} reports organized into ${radiusGroups.length} cleanup areas (${groupedAreasCount} grouped areas, ${isolatedReportsCount} isolated reports).`
                  : `Showing ${activeCount} individual report locations.`}
          </p>
        </div>
      )}

      <div
        className={cn(
          "relative w-full",
          mapHeightClassName ? mapHeightClassName : "flex-1 min-h-[420px] h-full",
        )}
      >
        <div ref={containerRef} className="h-full w-full" />

        {/* ── Interactive Map Legend (Bottom-Left) ───────────────────────── */}
        {showMapLegend && !hideControls && (
          <div className="absolute bottom-5 left-5 z-[999] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-xl max-w-[270px] text-xs pointer-events-auto transition-all duration-200">
            <div className="flex items-center justify-between gap-3 font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                Map Legend & 50m Radius
              </span>
              <button
                type="button"
                onClick={() => setIsLegendExpanded((v) => !v)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded"
              >
                {isLegendExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>

            {isLegendExpanded && (
              <div className="pt-2 space-y-2 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <svg width="14" height="18" viewBox="0 0 34 44" fill="none">
                        <path d="M17 1C8.16 1 1 8.16 1 17c0 11.25 16 26 16 26S33 28.25 33 17C33 8.16 25.84 1 17 1z" fill="#2563eb" stroke="#fff" strokeWidth="2" />
                      </svg>
                    </div>
                    <span>Single Report Location (Outside Radius)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
                      <svg width="14" height="18" viewBox="0 0 34 44" fill="none">
                        <path d="M17 1C8.16 1 1 8.16 1 17c0 11.25 16 26 16 26S33 28.25 33 17C33 8.16 25.84 1 17 1z" fill="#4f46e5" stroke="#fff" strokeWidth="2" />
                      </svg>
                      <span className="absolute -top-1 -right-1 bg-slate-900 text-white rounded-full text-[8px] font-bold px-1 border border-white">2+</span>
                    </div>
                    <span>Grouped Area (2+ Reports in 50m)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <div className="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-xs"></div>
                    </div>
                    <span>Report Pinpoint inside 50m Group</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <div className="w-4 h-4 rounded-full border-2 border-dashed border-emerald-500 bg-emerald-500/20"></div>
                    </div>
                    <span>50-Meter Radius Cleanup Area</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      <div className="w-4 h-0 border-t-2 border-dashed border-indigo-500"></div>
                    </div>
                    <span>Distance Connector between reports</span>
                  </div>
                </div>

                {/* Status Dot Summary */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>Verified</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>Scheduled</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>In Progress</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>Cleaned</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Zone Confirmation Warning Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Delete Coastal Zone
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="py-2">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                &ldquo;{selectedZone?.name || "this zone"}&rdquo;
              </span>
              ?
            </p>
            <p className="mt-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
              ⚠️ <strong>Warning:</strong> This action cannot be undone. The zone polygon and boundaries will be permanently removed.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setIsDeleteModalOpen(false)}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteZone}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Zone</span>
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
