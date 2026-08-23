"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import {
  ADMIN_REPORT_STATUS_LABELS,
  type AdminReport,
  type IncidentMapData,
} from "@/lib/admin-report";
import { useAuth } from "@/providers/AuthProvider";
import api from "@/lib/api";

type MapViewProps = {
  reports: AdminReport[];
  center?: [number, number];
  zoom?: number;
  hideControls?: boolean;
};

const DEFAULT_CENTER: [number, number] = [7.3132, 125.6844];
const PLACEHOLDER_IMAGE = "https://placehold.co/400x300?text=No+Image";

// ─── Icon builders ────────────────────────────────────────────────────────────

function buildIcon(color: string) {
  return L.divIcon({
    className: "marker-pulse",
    html: `
      <div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:999px;background:${color};border:3px solid white;box-shadow:0 8px 20px rgba(0,0,0,0.25)">
        <div style="width:8px;height:8px;border-radius:999px;background:white"></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -12],
  });
}

/**
 * Incident icon — larger + badge when count > 1.
 * Single-contributor incidents look identical to regular report icons.
 */
function buildIncidentIcon(color: string, count: number) {
  if (count <= 1) {
    return buildIcon(color);
  }

  const badgeCount = count > 99 ? "99+" : String(count);
  return L.divIcon({
    className: "incident-marker",
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:999px;background:${color};border:3px solid white;box-shadow:0 8px 24px rgba(0,0,0,0.32)">
        <div style="width:9px;height:9px;border-radius:999px;background:white"></div>
        <div style="
          position:absolute;
          top:-6px;right:-8px;
          min-width:18px;height:18px;
          background:#1e3a5f;
          color:#fff;
          font-size:10px;font-weight:800;
          border-radius:999px;
          border:2px solid white;
          display:flex;align-items:center;justify-content:center;
          padding:0 4px;
          box-shadow:0 2px 6px rgba(0,0,0,0.28);
          font-family:system-ui,sans-serif;
          letter-spacing:-0.3px;
        ">
          <span style="margin-top:-0.5px">${badgeCount}</span>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -14],
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
    return '<span style="display:inline-flex;align-items:center;padding:4px 10px;border-radius:999px;background:#fee2e2;color:#b91c1c;font-size:12px;font-weight:700">With Waste</span>';
  }

  return '<span style="display:inline-flex;align-items:center;padding:4px 10px;border-radius:999px;background:#dcfce7;color:#166534;font-size:12px;font-weight:700">No Waste</span>';
}

function getStatusPill(status: AdminReport["status"]) {
  const pills: Record<AdminReport["status"], string> = {
    PENDING:
      '<span style="display:inline-flex;align-items:center;padding:4px 10px;border-radius:999px;background:#fef3c7;color:#92400e;font-size:12px;font-weight:700">Pending</span>',
    VERIFIED:
      '<span style="display:inline-flex;align-items:center;padding:4px 10px;border-radius:999px;background:#dbeafe;color:#1d4ed8;font-size:12px;font-weight:700">Verified</span>',
    CLEANUP_SCHEDULED:
      '<span style="display:inline-flex;align-items:center;padding:4px 10px;border-radius:999px;background:#ede9fe;color:#7c3aed;font-size:12px;font-weight:700">Cleanup Scheduled</span>',
    IN_PROGRESS:
      '<span style="display:inline-flex;align-items:center;padding:4px 10px;border-radius:999px;background:#ffedd5;color:#c2410c;font-size:12px;font-weight:700">In Progress</span>',
    CLEANED:
      '<span style="display:inline-flex;align-items:center;padding:4px 10px;border-radius:999px;background:#dcfce7;color:#166534;font-size:12px;font-weight:700">Cleaned</span>',
    REJECTED:
      '<span style="display:inline-flex;align-items:center;padding:4px 10px;border-radius:999px;background:#ffe4e6;color:#be123c;font-size:12px;font-weight:700">Rejected</span>',
  };

  return pills[status];
}

function buildPopupHtml(report: AdminReport) {
  const imageUrl = escapeHtml(report.imageUrl);
  const detailHref = `/dashboard/reports/${encodeURIComponent(report.id)}`;

  return `
    <div style="display:flex;flex-direction:column;gap:12px;min-width:220px">
      <img src="${imageUrl}" alt="Report image" loading="lazy" style="height:112px;width:100%;border-radius:12px;object-fit:cover" />
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${getCategoryPill(report.category)}
          ${getStatusPill(report.status)}
        </div>
        <a href="${detailHref}" style="display:inline-flex;align-items:center;justify-content:center;height:36px;padding:0 14px;border-radius:10px;background:hsl(var(--primary));color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;box-shadow:0 6px 14px rgba(0,102,204,0.28)">View details</a>
      </div>
    </div>
  `;
}

/** Popup HTML for a grouped waste incident marker */
function buildIncidentPopupHtml(incident: IncidentMapData) {
  const imageUrl = escapeHtml(incident.imageUrl || PLACEHOLDER_IMAGE);
  const hasMultiple = incident.contributorCount > 1;

  // If incident has a single report, link directly to it; otherwise show generic page
  const primaryId = incident.reportIds[0];
  const detailHref = primaryId
    ? `/dashboard/reports/${encodeURIComponent(primaryId)}`
    : `/dashboard/reports`;

  const contributorBadge = hasMultiple
    ? `<div style="display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:999px;background:#1e3a5f;color:#fff;font-size:12px;font-weight:700;margin-bottom:2px">
        <span style="font-size:14px">👥</span>
        <span>${incident.contributorCount} citizens reported this</span>
       </div>`
    : "";

  const addressLine = incident.address
    ? `<p style="margin:0;font-size:11px;color:#64748b;line-height:1.3">${escapeHtml(incident.address)}</p>`
    : "";

  const viewLabel = hasMultiple
    ? `View incident (${incident.reportIds.length} report${incident.reportIds.length !== 1 ? "s" : ""})`
    : "View details";

  return `
    <div style="display:flex;flex-direction:column;gap:10px;min-width:230px">
      <img src="${imageUrl}" alt="Incident image" loading="lazy" style="height:112px;width:100%;border-radius:12px;object-fit:cover" />
      <div style="display:flex;flex-direction:column;gap:7px">
        ${contributorBadge}
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${getCategoryPill(incident.category)}
          ${getStatusPill(incident.status)}
        </div>
        ${addressLine}
        <a href="${detailHref}" style="display:inline-flex;align-items:center;justify-content:center;height:36px;padding:0 14px;border-radius:10px;background:hsl(var(--primary));color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;box-shadow:0 6px 14px rgba(0,102,204,0.28)">${viewLabel}</a>
      </div>
    </div>
  `;
}

function isPointInPolygon(point: [number, number], vs: [number, number][]) {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MapView({
  reports,
  center = DEFAULT_CENTER,
  zoom = 12,
  hideControls = false,
}: MapViewProps) {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<
    "ALL" | AdminReport["status"]
  >("ALL");
  const [isEditingZone, setIsEditingZone] = useState(false);
  const [isDrawingZone, setIsDrawingZone] = useState(false);
  const [groupedMode, setGroupedMode] = useState(true); // default: incident-grouped view
  const [incidents, setIncidents] = useState<IncidentMapData[]>([]);
  const [incidentsLoading, setIncidentsLoading] = useState(false);
  const { isAdmin } = useAuth();

  // lazy import hooks to avoid RSC issues from server components
  let reportingZonesHook: any = null;
  try {
    // require inside client to avoid server import errors
    // eslint-disable-next-line @typescript-eslint/no-var-requires,global-require
    reportingZonesHook = require("@/hooks/useReportingZones");
  } catch (e) {
    reportingZonesHook = null;
  }

  const { useReportingZones, useUpdateReportingZone, useCreateReportingZone } =
    reportingZonesHook || {};
  const zonesQuery = useReportingZones
    ? useReportingZones(false)
    : { data: [] };
  const zonesData = zonesQuery?.data;
  const zones = useMemo(() => zonesData || [], [zonesData]);
  const updateZoneMutation = useUpdateReportingZone
    ? useUpdateReportingZone()
    : null;
  const createZoneMutation = useCreateReportingZone
    ? useCreateReportingZone()
    : null;
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const zoneLayersRef = useRef<L.LayerGroup | null>(null);
  const zoneEditableGroupRef = useRef<L.FeatureGroup | null>(null);
  const editControlRef = useRef<any>(null);
  const drawControlRef = useRef<any>(null);
  const zoneDrawnGroupRef = useRef<L.FeatureGroup | null>(null);

  const icons = useMemo(
    () => ({
      withWaste: buildIcon("#ef4444"),
      noWaste: buildIcon("#22c55e"),
    }),
    [],
  );

  // ── Fetch grouped incident data ─────────────────────────────────────────────

  useEffect(() => {
    if (!groupedMode) {
      setIncidents([]);
      return;
    }

    let cancelled = false;
    setIncidentsLoading(true);

    const params: Record<string, string> = {};
    if (selectedStatus !== "ALL") params.status = selectedStatus;

    api
      .get<IncidentMapData[]>("/reports/incidents/map", { params })
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
  }, [groupedMode, selectedStatus]);

  // ── Filtered data ────────────────────────────────────────────────────────────

  const filteredReports = useMemo(() => {
    // Always hide cleaned reports from the map
    let result = reports.filter((report) => report.status !== "CLEANED");

    if (selectedStatus !== "ALL") {
      result = result.filter((report) => report.status === selectedStatus);
    }

    if (selectedZoneId) {
      const zone = zones.find((z: any) => z.id === selectedZoneId);
      if (zone) {
        const polygonCoords = zone.coordinates.map((c: any) => [Number(c.lat), Number(c.lng)] as [number, number]);
        result = result.filter((r) => isPointInPolygon([Number(r.latitude), Number(r.longitude)], polygonCoords));
      }
    }

    console.log("MapView debug:", {
      reportsCount: reports.length,
      filteredCount: result.length,
      selectedZoneId,
      zonesCount: zones.length,
      sampleReport: reports[0],
      isInside: reports.length > 0 && zones.length > 0 ? isPointInPolygon([reports[0].latitude, reports[0].longitude], zones[0].coordinates.map((c: any) => [c.lat, c.lng] as [number, number])) : null
    });

    return result;
  }, [reports, selectedStatus, selectedZoneId, zones]);

  const filteredIncidents = useMemo(() => {
    let result = incidents.filter((inc) => inc.status !== "CLEANED");

    if (selectedStatus !== "ALL") {
      result = result.filter((inc) => inc.status === selectedStatus);
    }

    if (selectedZoneId) {
      const zone = zones.find((z: any) => z.id === selectedZoneId);
      if (zone) {
        const polygonCoords = zone.coordinates.map((c: any) => [Number(c.lat), Number(c.lng)] as [number, number]);
        result = result.filter((inc) =>
          isPointInPolygon([Number(inc.latitude), Number(inc.longitude)], polygonCoords),
        );
      }
    }
    return result;
  }, [incidents, selectedStatus, selectedZoneId, zones]);

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

    const markersLayer = L.layerGroup().addTo(map);
    const zoneLayerGroup = L.layerGroup().addTo(map);
    const zoneEditableGroup = new L.FeatureGroup();
    map.addLayer(zoneEditableGroup);
    const zoneDrawnGroup = new L.FeatureGroup();
    map.addLayer(zoneDrawnGroup);
    zoneEditableGroupRef.current = zoneEditableGroup;
    zoneDrawnGroupRef.current = zoneDrawnGroup;
    mapRef.current = map;
    markersLayerRef.current = markersLayer;
    zoneLayersRef.current = zoneLayerGroup;
    requestAnimationFrame(() => map.invalidateSize({ pan: false }));

    return () => {
      markersLayer.clearLayers();
      map.remove();
      mapRef.current = null;
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

    // remove previous editable control if any
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

      // persist edits for the selected zone only
      if (!selectedZoneId || layers.length === 0) return;

      // assume polygon layer
      const layer = layers[0] as L.Polygon;
      const latlngs = (layer.getLatLngs()[0] as L.LatLng[]).map((ll) => ({
        lat: ll.lat,
        lng: ll.lng,
      }));

      if (updateZoneMutation) {
        updateZoneMutation.mutate({ id: selectedZoneId, coordinates: latlngs });
      } else {
        // fallback: POST directly
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
    if (!mapRef.current) {
      return;
    }

    mapRef.current.setView(center, zoom, { animate: false });
  }, [center, zoom]);

  // ── Markers effect ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!markersLayerRef.current) {
      return;
    }

    const markersLayer = markersLayerRef.current as any;
    markersLayer.clearLayers();

    const newMarkers: L.Marker[] = [];

    if (groupedMode) {
      // ── Incident-grouped mode ──────────────────────────────────────────────
      filteredIncidents.forEach((incident) => {
        const color = incident.category === "with_waste" ? "#ef4444" : "#22c55e";
        const icon = buildIncidentIcon(color, incident.contributorCount);
        const marker = L.marker([incident.latitude, incident.longitude], { icon });
        marker.bindPopup(buildIncidentPopupHtml(incident), { maxWidth: 280 });
        newMarkers.push(marker);
      });
    } else {
      // ── Raw per-report mode (original behaviour) ───────────────────────────
      filteredReports.forEach((report) => {
        const marker = L.marker([report.latitude, report.longitude], {
          icon:
            report.category === "with_waste" ? icons.withWaste : icons.noWaste,
        });
        marker.bindPopup(buildPopupHtml(report), { maxWidth: 260 });
        newMarkers.push(marker);
      });
    }

    newMarkers.forEach((marker) => markersLayer.addLayer(marker));

    const positions = groupedMode
      ? filteredIncidents.map((i) => [i.latitude, i.longitude] as [number, number])
      : filteredReports.map((r) => [r.latitude, r.longitude] as [number, number]);

    if (newMarkers.length > 0) {
      const bounds = L.latLngBounds(positions);
      if (bounds.isValid()) {
        mapRef.current?.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      }
    }
  }, [filteredReports, filteredIncidents, icons, groupedMode]);

  // render reporting zones as polygon layers (and put the selected one into editable group)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // clear prior
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

  // ── Render ──────────────────────────────────────────────────────────────────

  const activeCount = groupedMode ? filteredIncidents.length : filteredReports.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {isAdmin && !hideControls && (
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap lg:w-auto">
              <div className="w-full sm:w-56 lg:w-64">
                <label
                  htmlFor="coastal-zone-select"
                  className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  Coastal Zone
                </label>
                <select
                  id="coastal-zone-select"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  value={selectedZoneId || ""}
                  onChange={(e) => setSelectedZoneId(e.target.value || null)}
                >
                  <option value="">Select a zone</option>
                  {zones.map((z: any) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-56 lg:w-64">
                <label
                  htmlFor="status-filter-select"
                  className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  All Status
                </label>
                <select
                  id="status-filter-select"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(
                      e.target.value as "ALL" | AdminReport["status"],
                    )
                  }
                >
                  <option value="ALL">All Status</option>
                  {Object.entries(ADMIN_REPORT_STATUS_LABELS).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Incident grouping toggle */}
              <button
                id="incident-group-toggle"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  groupedMode
                    ? "bg-[hsl(var(--primary))] text-white shadow-md"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => setGroupedMode((v) => !v)}
                title={
                  groupedMode
                    ? "Currently showing grouped waste incidents. Click to switch to raw reports view."
                    : "Currently showing all individual reports. Click to switch to grouped incidents view."
                }
              >
                <span>👥</span>
                <span>{groupedMode ? "Grouped Incidents" : "Raw Reports"}</span>
                {groupedMode && incidentsLoading && (
                  <span className="ml-1 inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
              </button>

              <button
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  isDrawingZone
                    ? "bg-[hsl(var(--primary))] text-white hover:opacity-90"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => {
                  setIsEditingZone(false);
                  setIsDrawingZone((v) => !v);
                }}
              >
                {isDrawingZone ? "Stop Drawing" : "Draw Zone"}
              </button>
              <button
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  isEditingZone
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "border border-amber-200 bg-white text-amber-700 hover:bg-amber-50"
                }`}
                onClick={() => {
                  setIsDrawingZone(false);
                  setIsEditingZone((v) => !v);
                }}
              >
                {isEditingZone ? "Stop Editing" : "Edit Zone"}
              </button>
              <button
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                onClick={() => {
                  setSelectedZoneId(null);
                  setIsEditingZone(false);
                  setIsDrawingZone(false);
                }}
              >
                Reset
              </button>
            </div>
          </div>

          {(selectedZoneId ||
            isDrawingZone ||
            isEditingZone ||
            selectedStatus !== "ALL" ||
            groupedMode) && (
            <p className="mt-2 text-xs text-slate-500">
              {isDrawingZone
                ? "Drawing mode enabled: draw a polygon on the map."
                : isEditingZone
                  ? "Editing mode enabled: drag vertices to adjust the selected zone."
                  : groupedMode
                    ? `Showing ${activeCount} grouped waste incident${activeCount !== 1 ? "s" : ""}${selectedStatus !== "ALL" ? ` with status "${ADMIN_REPORT_STATUS_LABELS[selectedStatus]}"` : ""}. Markers with a blue badge have multiple citizen reports.`
                    : selectedStatus !== "ALL"
                      ? `Showing ${activeCount} report${activeCount !== 1 ? "s" : ""} with ${ADMIN_REPORT_STATUS_LABELS[selectedStatus]}.`
                      : "Zone selected: you can start editing or drawing."}
            </p>
          )}
        </div>
      )}

      <div className={`relative ${isAdmin ? "h-[62vh]" : "h-[70vh]"}`}>
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
}