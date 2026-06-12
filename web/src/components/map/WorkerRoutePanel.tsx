"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAssignedReports, useUpdateReportStatus } from "@/hooks/useReports";
import { useQueryClient } from "@tanstack/react-query";
import {
  Report,
  WASTE_CATEGORY_LABELS,
} from "@/types";
import {
  Route,
  RefreshCw,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Navigation,
} from "lucide-react";

// ── Colour palette for numbered stop markers (mirrors mobile) ────────────────
const STOP_COLORS = [
  "#f97316",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#6366f1",
  "#ef4444",
  "#10b981",
];
function stopColor(idx: number) {
  return STOP_COLORS[idx % STOP_COLORS.length];
}

// ── Haversine distance (km) for nearest-neighbour sorting ────────────────────
function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Nearest-neighbour sort (same algorithm as mobile) ───────────────────────
function nearestNeighbour(
  originLat: number,
  originLng: number,
  reports: Report[]
): Report[] {
  if (reports.length === 0) return [];
  const remaining = [...reports];
  const sorted: Report[] = [];
  let curLat = originLat;
  let curLng = originLng;
  while (remaining.length > 0) {
    remaining.sort(
      (a, b) =>
        haversine(curLat, curLng, a.latitude, a.longitude) -
        haversine(curLat, curLng, b.latitude, b.longitude)
    );
    const next = remaining.shift()!;
    sorted.push(next);
    curLat = next.latitude;
    curLng = next.longitude;
  }
  return sorted;
}

// ── Leaflet icon factories ───────────────────────────────────────────────────
function makeWorkerIcon(): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="position:relative;width:36px;height:36px;">
        <div style="position:absolute;inset:0;border-radius:50%;background:rgba(0,102,204,0.22);animation:bw-pulse 1.8s ease-out infinite;"></div>
        <div style="position:absolute;top:50%;left:50%;width:16px;height:16px;background:#0066cc;border:2.5px solid #fff;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 2px 8px rgba(0,102,204,0.5);"></div>
      </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
    className: "",
  });
}

function makeStopIcon(number: number, color: string): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;background:${color};box-shadow:0 3px 10px rgba(0,0,0,0.25);">
        <span style="display:block;transform:rotate(45deg);font-size:11px;font-weight:800;color:#fff;line-height:1;">${number}</span>
      </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -32],
    className: "",
  });
}

// ── Types ────────────────────────────────────────────────────────────────────
interface Coords {
  lat: number;
  lng: number;
}

type LoadPhase =
  | "idle"
  | "gps"
  | "fetching"
  | "building"
  | "ready"
  | "error"
  | "empty";

// ── Main component ───────────────────────────────────────────────────────────
export default function WorkerRoutePanel() {
  const queryClient = useQueryClient();
  const { mutateAsync: updateStatus } = useUpdateReportStatus();

  // Panel-level state
  const [phase, setPhase] = useState<LoadPhase>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [workerPos, setWorkerPos] = useState<Coords | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [sortedReports, setSortedReports] = useState<Report[]>([]);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [stopCount, setStopCount] = useState(0);

  // Leaflet refs
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  // Expose current worker position so the "Locate Me" button can use it
  const workerPosRef = useRef<Coords | null>(null);

  // Stable refs for callbacks used inside Leaflet closures
  const resolvedIdsRef = useRef(resolvedIds);
  const updateStatusRef = useRef(updateStatus);
  const queryClientRef = useRef(queryClient);

  useEffect(() => {
    resolvedIdsRef.current = resolvedIds;
  }, [resolvedIds]);
  useEffect(() => {
    updateStatusRef.current = updateStatus;
  }, [updateStatus]);
  useEffect(() => {
    queryClientRef.current = queryClient;
  }, [queryClient]);
  useEffect(() => {
    workerPosRef.current = workerPos;
  }, [workerPos]);

  // ── Toast helper ────────────────────────────────────────────────────────────
  const showToast = useCallback(
    (msg: string, type: "success" | "error") => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 3500);
    },
    []
  );

  // ── GPS helper ──────────────────────────────────────────────────────────────
  // Uses watchPosition warm-up to guarantee a fresh hardware fix instead of a
  // stale IP/Wi-Fi cached position. The watch is cleared as soon as the first
  // position arrives (or on error), so it doesn't drain battery.
  const fetchLocation = useCallback((): Promise<Coords & { accuracy: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser."));
        return;
      }

      let watchId: number | null = null;
      let settled = false;

      const cleanup = () => {
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        }
      };

      // Overall timeout safety net (20 s)
      const timer = window.setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error("GPS timed out — ensure location services are enabled."));
      }, 20000);

      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          if (settled) return;
          // Accept the first fix with high accuracy, OR any fix after 5 s
          const age = Date.now() - pos.timestamp;
          const goodEnough =
            pos.coords.accuracy <= 100 ||
            age < 5000 ||
            pos.coords.accuracy <= 500;
          if (!goodEnough) return; // keep watching for a better fix
          settled = true;
          cleanup();
          window.clearTimeout(timer);
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
          });
        },
        (err) => {
          if (settled) return;
          settled = true;
          cleanup();
          window.clearTimeout(timer);
          if (err.code === err.PERMISSION_DENIED) {
            reject(
              new Error(
                "Location permission denied. Please allow location access in your browser and try again."
              )
            );
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            reject(new Error("Your location is currently unavailable. Please check your GPS/network and try again."));
          } else {
            reject(new Error("GPS timed out. Please ensure location services are enabled."));
          }
        },
        { enableHighAccuracy: true, timeout: 18000, maximumAge: 0 }
      );
    });
  }, []);

  // ── Draw route via OSRM then render markers ─────────────────────────────────
  const drawRoute = useCallback(
    async (map: L.Map, origin: Coords & { accuracy?: number }, reports: Report[]) => {
      // Clear previous route + markers + accuracy circle
      if (routeLineRef.current) {
        routeLineRef.current.remove();
        routeLineRef.current = null;
      }
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.remove();
        accuracyCircleRef.current = null;
      }
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // ── GPS accuracy circle (radius = accuracy in metres) ────────────────────
      if (origin.accuracy && origin.accuracy > 0) {
        accuracyCircleRef.current = L.circle([origin.lat, origin.lng], {
          radius: origin.accuracy,
          color: "#0066cc",
          fillColor: "#0066cc",
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: "4 4",
        }).addTo(map);
      }

      const allPoints: Coords[] = [origin, ...reports.map((r) => ({ lat: r.latitude, lng: r.longitude }))];

      // ── Worker marker ────────────────────────────────────────────────────────
      const accuracyText = origin.accuracy
        ? `<div style="font-size:10px;color:#64748b;margin-top:4px;">±${origin.accuracy} m accuracy</div>`
        : "";
      const workerMarker = L.marker([origin.lat, origin.lng], {
        icon: makeWorkerIcon(),
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindPopup(
          `<div style="padding:12px 14px;min-width:180px;">
            <div style="font-size:10px;font-weight:700;color:#0066cc;background:rgba(0,102,204,0.1);border-radius:20px;padding:3px 8px;margin-bottom:6px;display:inline-block;text-transform:uppercase;letter-spacing:0.3px;">📍 Your Location</div>
            <div style="font-size:13px;font-weight:700;color:#020817;">You are here</div>
            <div style="font-size:10px;color:#94a3b8;font-family:monospace;margin-top:3px;">${origin.lat.toFixed(6)}, ${origin.lng.toFixed(6)}</div>
            ${accuracyText}
          </div>`,
          { maxWidth: 260 }
        );
      markersRef.current.push(workerMarker);

      // ── Stop markers ─────────────────────────────────────────────────────────
      reports.forEach((report, idx) => {
        const stopNum = idx + 1;
        const color = stopColor(idx);
        const catLabel =
          (WASTE_CATEGORY_LABELS as Record<string, string>)[report.category] ||
          report.category;

        const marker = L.marker([report.latitude, report.longitude], {
          icon: makeStopIcon(stopNum, color),
        }).addTo(map);

        marker.bindPopup(
          () => {
            const isResolved = resolvedIdsRef.current.has(report.id);
            return `
              <div style="padding:14px 16px 12px;min-width:200px;max-width:260px;" id="popup-${report.id}">
                <div style="display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:700;color:${color};background:${color}1a;border-radius:20px;padding:3px 8px;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.3px;">Stop ${stopNum}</div>
                <div style="font-size:13px;font-weight:700;color:#020817;margin-bottom:3px;line-height:1.3;">${report.title.replace(/</g, "&lt;")}</div>
                ${catLabel ? `<div style="font-size:11px;color:#64748b;margin-bottom:8px;">${catLabel}</div>` : ""}
                <div style="font-size:10px;color:#94a3b8;font-family:monospace;margin-bottom:10px;">${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}</div>
                <div style="height:1px;background:#e2e8f0;margin:0 -16px 10px;"></div>
                <button
                  id="resolve-btn-${report.id}"
                  style="width:100%;padding:9px 14px;background:${isResolved ? "linear-gradient(135deg,#94a3b8,#64748b)" : "linear-gradient(135deg,#22c55e,#16a34a)"};color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:${isResolved ? "default" : "pointer"};display:flex;align-items:center;justify-content:center;gap:6px;transition:opacity 0.15s,transform 0.1s;letter-spacing:0.1px;"
                  ${isResolved ? "disabled" : ""}
                  onclick="window.__workerResolve('${report.id}')"
                >
                  ${isResolved ? "✓ Resolved" : "✓ Mark as Resolved"}
                </button>
              </div>`;
          },
          { maxWidth: 280 }
        );

        markersRef.current.push(marker);
      });

      // ── Fit bounds ───────────────────────────────────────────────────────────
      if (allPoints.length >= 2) {
        const bounds = L.latLngBounds(
          allPoints.map((p) => [p.lat, p.lng] as [number, number])
        );
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16, animate: true });
      } else {
        map.setView([origin.lat, origin.lng], 15, { animate: true });
      }

      // ── OSRM driving route ───────────────────────────────────────────────────
      if (allPoints.length >= 2) {
        try {
          const coords = allPoints
            .map((p) => `${p.lng},${p.lat}`)
            .join(";");
          const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
          const resp = await fetch(url);
          if (resp.ok) {
            const json = await resp.json();
            const geometry = json?.routes?.[0]?.geometry;
            if (geometry?.coordinates) {
              const latlngs: [number, number][] = geometry.coordinates.map(
                ([lng, lat]: [number, number]) => [lat, lng]
              );
              routeLineRef.current = L.polyline(latlngs, {
                color: "#0066cc",
                weight: 4,
                opacity: 0.85,
              }).addTo(map);

              // Re-fit after route is drawn
              const routeBounds = L.latLngBounds(latlngs);
              map.fitBounds(routeBounds, { padding: [48, 48], maxZoom: 16, animate: true });
            }
          }
        } catch {
          // OSRM failed — route line is optional, markers still visible
        }
      }
    },
    []
  );

  // ── Global resolve handler called from popup HTML ─────────────────────────
  useEffect(() => {
    (window as any).__workerResolve = async (reportId: string) => {
      if (!reportId || resolvedIdsRef.current.has(reportId)) return;

      // Optimistic UI — update button immediately
      const btn = document.getElementById(`resolve-btn-${reportId}`);
      if (btn) {
        btn.textContent = "✓ Resolved";
        (btn as HTMLButtonElement).disabled = true;
        (btn as HTMLButtonElement).style.background =
          "linear-gradient(135deg,#94a3b8,#64748b)";
        (btn as HTMLButtonElement).style.cursor = "default";
      }

      setResolvedIds((prev) => new Set([...prev, reportId]));

      try {
        await updateStatusRef.current({
          id: reportId,
          status: "CLEANED",
          notes: "Marked as resolved via Worker Route Map",
        });
        queryClientRef.current.invalidateQueries({
          queryKey: ["assigned-reports"],
        });
        showToast("Report marked as resolved ✓", "success");
      } catch (err: any) {
        showToast(
          `Failed to update report: ${err?.message || "Unknown error"}`,
          "error"
        );
        // Revert optimistic state
        setResolvedIds((prev) => {
          const next = new Set(prev);
          next.delete(reportId);
          return next;
        });
      }
    };

    return () => {
      delete (window as any).__workerResolve;
    };
  }, [showToast]);

  // ── Main load sequence ────────────────────────────────────────────────────
  const { refetch } = useAssignedReports({ page: 1, limit: 100 } as any);

  const loadRoute = useCallback(async () => {
    setPhase("gps");
    setErrorMsg(null);

    let pos: Coords & { accuracy: number };
    try {
      pos = await fetchLocation();
    } catch (e: any) {
      setPhase("error");
      setErrorMsg(e.message);
      return;
    }

    // Store accuracy so the info bar can display it
    setGpsAccuracy(pos.accuracy);
    workerPosRef.current = pos;

    setPhase("fetching");
    let reports: Report[] = [];
    try {
      const result = await refetch();
      const raw: Report[] = result.data?.data || [];
      reports = raw.filter(
        (r) => r.status !== "CLEANED" && r.status !== "REJECTED"
      );
    } catch (e: any) {
      setPhase("error");
      setErrorMsg("Failed to load assigned reports. Please try again.");
      return;
    }

    setPhase("building");
    const sorted = nearestNeighbour(pos.lat, pos.lng, reports);

    setWorkerPos(pos);
    setSortedReports(sorted);
    setStopCount(sorted.length);
    setResolvedIds(new Set());
    setPhase(sorted.length === 0 ? "empty" : "ready");

    if (mapRef.current && sorted.length >= 0) {
      await drawRoute(mapRef.current, pos, sorted);
    }
  }, [fetchLocation, refetch, drawRoute]);

  // ── Init Leaflet map ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Inject pulse keyframe CSS once
    if (!document.getElementById("bw-pulse-style")) {
      const style = document.createElement("style");
      style.id = "bw-pulse-style";
      style.textContent = `
        @keyframes bw-pulse {
          0%   { transform: scale(0.7); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }`;
      document.head.appendChild(style);
    }

    const map = L.map(containerRef.current, { zoomControl: true }).setView(
      [7.3132, 125.6844],
      13
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapRef.current = map;

    const raf = requestAnimationFrame(() => map.invalidateSize({ pan: false }));
    const t = window.setTimeout(() => map.invalidateSize({ pan: false }), 250);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      map.stop();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Auto-load on mount ────────────────────────────────────────────────────
  useEffect(() => {
    loadRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-draw when sortedReports/workerPos change after refresh ────────────
  useEffect(() => {
    if (phase === "ready" && mapRef.current && workerPos) {
      drawRoute(mapRef.current, workerPos, sortedReports);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedReports, workerPos]);

  // ── Derived loading label ────────────────────────────────────────────────
  const phaseLabel: Record<LoadPhase, string> = {
    idle: "Preparing…",
    gps: "Detecting your GPS location…",
    fetching: "Fetching assigned reports…",
    building: "Building optimal route…",
    ready: "",
    error: "",
    empty: "",
  };

  return (
    <div className="space-y-3">
      {/* Info bar */}
      <div className="bg-white rounded-xl border shadow-sm px-4 py-3 flex items-center gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
          <Route className="w-4 h-4 text-blue-600" />
        </div>

        <div className="flex-1 min-w-0">
          {(phase === "ready" || phase === "empty") && workerPos && (
            <div className="flex items-center gap-1.5 mb-0.5">
              <Navigation className="w-3 h-3 text-blue-500 flex-shrink-0" />
              <span className="text-[11px] font-mono text-blue-600 truncate">
                {workerPos.lat.toFixed(6)}, {workerPos.lng.toFixed(6)}
              </span>
              {gpsAccuracy !== null && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    gpsAccuracy <= 20
                      ? "bg-green-100 text-green-700"
                      : gpsAccuracy <= 100
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  ±{gpsAccuracy}m
                </span>
              )}
            </div>
          )}
          {phase === "ready" && stopCount === 0 && (
            <p className="text-sm font-semibold text-green-600">
              No active stops — all reports resolved!
            </p>
          )}
          {phase === "ready" && stopCount > 0 && (
            <p className="text-sm text-gray-700">
              <span className="font-bold text-gray-900">
                {stopCount} stop{stopCount === 1 ? "" : "s"}
              </span>
              <span className="text-gray-400"> · </span>
              <span className="text-gray-500 text-xs">Nearest-neighbour order</span>
            </p>
          )}
          {phase === "error" && (
            <p className="text-sm font-semibold text-red-600 truncate">
              {errorMsg}
            </p>
          )}
          {["idle", "gps", "fetching", "building"].includes(phase) && (
            <p className="text-sm text-gray-500">{phaseLabel[phase]}</p>
          )}
          {phase === "empty" && (
            <p className="text-sm font-semibold text-green-600">
              No active stops — all reports resolved!
            </p>
          )}
        </div>

        <button
          onClick={loadRoute}
          disabled={["gps", "fetching", "building"].includes(phase)}
          title="Refresh route"
          aria-label="Refresh route"
          className="flex-shrink-0 w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 text-gray-600 ${["gps", "fetching", "building"].includes(phase) ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Map container */}
      <div className="bg-white rounded-xl border overflow-hidden relative">
        {/* Gradient overlays */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 z-[500] bg-gradient-to-b from-white/20 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 z-[500] bg-gradient-to-t from-white/10 to-transparent" />

        {/* Leaflet div */}
        <div className="h-[520px] sm:h-[620px] relative">
          <div ref={containerRef} className="h-full w-full" />

          {/* Legend overlay */}
          {(phase === "ready" || phase === "empty") && (
            <div className="absolute bottom-6 left-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md px-3 py-2.5 text-xs text-gray-600 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#0066cc] border-2 border-white shadow flex-shrink-0" />
                Your location
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#f97316] flex-shrink-0" />
                Report stop
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-0.5 rounded bg-gradient-to-r from-[#0066cc] to-[#3b82f6] flex-shrink-0" />
                Route
              </div>
            </div>
          )}

          {/* Locate Me FAB — re-centers map on the worker's GPS position */}
          {(phase === "ready" || phase === "empty") && (
            <button
              onClick={() => {
                const p = workerPosRef.current;
                if (mapRef.current && p) {
                  mapRef.current.setView([p.lat, p.lng], 16, { animate: true });
                }
              }}
              className="absolute bottom-6 right-4 z-[1000] w-10 h-10 bg-white rounded-xl border border-gray-200 shadow-md flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-colors"
              title="Centre on my location"
              aria-label="Centre on my location"
            >
              <Navigation className="w-4 h-4 text-blue-600" />
            </button>
          )}

          {/* Loading overlay */}
          {["idle", "gps", "fetching", "building"].includes(phase) && (
            <div className="absolute inset-0 z-[1001] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Navigation className="w-7 h-7 text-blue-600 animate-pulse" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-gray-700">
                  {phaseLabel[phase]}
                </p>
                <p className="text-xs text-gray-400">
                  Fetching GPS &amp; assigned reports
                </p>
              </div>
            </div>
          )}

          {/* Error overlay */}
          {phase === "error" && (
            <div className="absolute inset-0 z-[1001] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900 mb-1">
                  Could not load route
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {errorMsg}
                </p>
              </div>
              <button
                onClick={loadRoute}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          )}

          {/* Empty overlay */}
          {phase === "empty" && (
            <div className="absolute inset-0 z-[1001] flex items-center justify-center">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 px-8 py-7 text-center max-w-xs">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-green-500" />
                </div>
                <p className="text-base font-bold text-gray-900 mb-1">
                  All Clear!
                </p>
                <p className="text-sm text-gray-500">
                  No active stops — all assigned reports have been resolved.
                </p>
                <button
                  onClick={loadRoute}
                  className="mt-5 flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stop list */}
      {phase === "ready" && sortedReports.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-800">
              Route Stops
            </span>
            <span className="ml-auto text-xs text-gray-400 font-medium">
              Nearest-neighbour order
            </span>
          </div>
          <ul className="divide-y divide-gray-50">
            {sortedReports.map((report, idx) => {
              const color = stopColor(idx);
              const isResolved = resolvedIds.has(report.id);
              return (
                <li
                  key={report.id}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${isResolved ? "opacity-50" : "hover:bg-gray-50/60"}`}
                >
                  {/* Stop badge */}
                  <div
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                    style={{ background: color }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${isResolved ? "line-through text-gray-400" : "text-gray-900"}`}
                    >
                      {report.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {(WASTE_CATEGORY_LABELS as Record<string, string>)[
                        report.category
                      ] || report.category}
                      {report.address ? ` · ${report.address}` : ""}
                    </p>
                  </div>
                  {isResolved && (
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all animate-in slide-in-from-bottom duration-300 ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
