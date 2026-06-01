"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import type { AdminReport } from "@/lib/admin-report";
import { useAuth } from "@/providers/AuthProvider";

type MapViewProps = {
  reports: AdminReport[];
  center?: [number, number];
  zoom?: number;
};

const DEFAULT_CENTER: [number, number] = [7.3132, 125.6844];

function buildIcon(color: string) {
  return L.divIcon({
    className: "",
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
  const locationName = escapeHtml(report.locationName);
  const detailHref = `/dashboard/reports/${encodeURIComponent(report.id)}`;

  return `
    <div style="display:flex;flex-direction:column;gap:12px;min-width:220px">
      <img src="${imageUrl}" alt="${locationName}" style="height:112px;width:100%;border-radius:12px;object-fit:cover" />
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${getCategoryPill(report.category)}
          ${getStatusPill(report.status)}
        </div>
        <p style="margin:0;font-size:14px;font-weight:700;color:#0f172a">${locationName}</p>
        <a href="${detailHref}" style="font-size:14px;font-weight:700;color:#0369a1;text-decoration:none">View details</a>
      </div>
    </div>
  `;
}

export default function MapView({
  reports,
  center = DEFAULT_CENTER,
  zoom = 12,
}: MapViewProps) {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [isEditingZone, setIsEditingZone] = useState(false);
  const [isDrawingZone, setIsDrawingZone] = useState(false);
  const { user, isAdmin } = useAuth();
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
  const zones = (zonesQuery && zonesQuery.data) || [];
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

  useEffect(() => {
    if (!markersLayerRef.current) {
      return;
    }

    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    reports.forEach((report) => {
      const marker = L.marker([report.latitude, report.longitude], {
        icon:
          report.category === "with_waste" ? icons.withWaste : icons.noWaste,
      });

      marker.bindPopup(buildPopupHtml(report), { maxWidth: 260 });
      marker.addTo(markersLayer);
    });
  }, [reports, icons]);

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
  }, [zones, selectedZoneId]);

  return (
    <div className="h-[70vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {isAdmin && (
        <div className="absolute z-30 m-4 flex flex-col gap-2 rounded bg-white/90 p-2 shadow">
          <label
            htmlFor="coastal-zone-select"
            className="text-xs font-medium text-slate-600"
          >
            Coastal Zone
          </label>
          <select
            id="coastal-zone-select"
            className="rounded border px-2 py-1 text-sm"
            value={selectedZoneId || ""}
            onChange={(e) => setSelectedZoneId(e.target.value || null)}
          >
            <option value="">(Select zone)</option>
            {zones.map((z: any) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              className="rounded bg-sky-500 px-3 py-1 text-xs text-white"
              onClick={() => {
                setIsEditingZone(false);
                setIsDrawingZone((v) => !v);
              }}
            >
              {isDrawingZone ? "Stop draw" : "Draw zone"}
            </button>
            <button
              className="rounded bg-amber-500 px-3 py-1 text-xs text-white"
              onClick={() => {
                setIsDrawingZone(false);
                setIsEditingZone((v) => !v);
              }}
            >
              {isEditingZone ? "Stop edit" : "Edit zone"}
            </button>
            <button
              className="rounded border px-3 py-1 text-xs"
              onClick={() => {
                setSelectedZoneId(null);
                setIsEditingZone(false);
                setIsDrawingZone(false);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
