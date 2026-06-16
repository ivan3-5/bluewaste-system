"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Navigation,
  RefreshCw,
  AlertTriangle,
  MapPin,
  Clock,
  Milestone,
} from "lucide-react";

// ── Icon factories ─────────────────────────────────────────────────────────────

function makeWorkerIcon(): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="position:relative;width:36px;height:36px;">
        <div style="position:absolute;inset:0;border-radius:50%;background:rgba(0,102,204,0.22);animation:trm-pulse 1.8s ease-out infinite;"></div>
        <div style="position:absolute;top:50%;left:50%;width:16px;height:16px;background:#0066cc;border:2.5px solid #fff;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 2px 8px rgba(0,102,204,0.5);"></div>
      </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -22],
    className: "",
  });
}

function makeDestIcon(): L.DivIcon {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
      <filter id="ds" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.35)"/>
      </filter>
      <path d="M17 1C8.16 1 1 8.16 1 17c0 11.25 16 26 16 26S33 28.25 33 17C33 8.16 25.84 1 17 1z"
            fill="#ef4444" filter="url(#ds)"/>
      <circle cx="17" cy="17" r="6.5" fill="white"/>
      <circle cx="17" cy="17" r="3.5" fill="#ef4444"/>
    </svg>`,
    className: "",
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -46],
  });
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function haversineKm(
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

function fmtDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function fmtDuration(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return `${h}h ${rem}m`;
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface RouteInfo {
  distanceKm: number;
  durationSec: number;
}

type Phase = "idle" | "gps" | "routing" | "ready" | "error" | "no-gps";

interface Props {
  lat: number;
  lng: number;
  reportTitle?: string;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function TaskRouteMap({ lat, lng, reportTitle }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const workerMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const workerPosRef = useRef<{ lat: number; lng: number } | null>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [straightKm, setStraightKm] = useState<number | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

  // ── Inject keyframe CSS once ──────────────────────────────────────────────
  useEffect(() => {
    if (!document.getElementById("trm-pulse-style")) {
      const style = document.createElement("style");
      style.id = "trm-pulse-style";
      style.textContent = `
        @keyframes trm-pulse {
          0%   { transform: scale(0.7); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }`;
      document.head.appendChild(style);
    }
  }, []);

  // ── Init Leaflet map ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    // Destination pin (report location)
    const destMarker = L.marker([lat, lng], { icon: makeDestIcon() })
      .addTo(map)
      .bindPopup(
        `<div style="padding:10px 12px;min-width:160px;">
          <div style="font-size:10px;font-weight:700;color:#ef4444;background:#fef2f2;border-radius:20px;padding:3px 8px;margin-bottom:6px;display:inline-block;text-transform:uppercase;letter-spacing:0.3px;">📍 Report Location</div>
          <div style="font-size:13px;font-weight:700;color:#020817;">${(reportTitle ?? "Waste Report").replace(/</g, "&lt;")}</div>
          <div style="font-size:10px;color:#94a3b8;font-family:monospace;margin-top:3px;">${lat.toFixed(6)}, ${lng.toFixed(6)}</div>
        </div>`,
        { maxWidth: 260 }
      );
    destMarkerRef.current = destMarker;
    mapRef.current = map;

    const raf = requestAnimationFrame(() => map.invalidateSize({ pan: false }));
    const t = window.setTimeout(() => map.invalidateSize({ pan: false }), 300);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      map.stop();
      map.remove();
      mapRef.current = null;
      workerMarkerRef.current = null;
      destMarkerRef.current = null;
      routeLineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── GPS helper ────────────────────────────────────────────────────────────
  const fetchGps = useCallback(
    (): Promise<{ lat: number; lng: number; accuracy: number }> =>
      new Promise((resolve, reject) => {
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
        const timer = window.setTimeout(() => {
          if (settled) return;
          settled = true;
          cleanup();
          reject(new Error("GPS timed out — please enable location services."));
        }, 20000);

        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            if (settled) return;
            const age = Date.now() - pos.timestamp;
            const goodEnough =
              pos.coords.accuracy <= 100 || age < 5000 || pos.coords.accuracy <= 500;
            if (!goodEnough) return;
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
              reject(new Error("Location permission denied. Please allow access and retry."));
            } else {
              reject(new Error("Could not determine your location. Please check GPS/network."));
            }
          },
          { enableHighAccuracy: true, timeout: 18000, maximumAge: 0 }
        );
      }),
    []
  );

  // ── Draw route ─────────────────────────────────────────────────────────────
  const drawRoute = useCallback(
    async (origin: { lat: number; lng: number; accuracy?: number }) => {
      const map = mapRef.current;
      if (!map) return;

      // Clear previous
      if (routeLineRef.current) {
        routeLineRef.current.remove();
        routeLineRef.current = null;
      }
      if (workerMarkerRef.current) {
        workerMarkerRef.current.remove();
        workerMarkerRef.current = null;
      }

      // Worker marker
      const wm = L.marker([origin.lat, origin.lng], {
        icon: makeWorkerIcon(),
        zIndexOffset: 1000,
      })
        .addTo(map)
        .bindPopup(
          `<div style="padding:10px 12px;min-width:160px;">
            <div style="font-size:10px;font-weight:700;color:#0066cc;background:rgba(0,102,204,0.1);border-radius:20px;padding:3px 8px;margin-bottom:6px;display:inline-block;text-transform:uppercase;letter-spacing:0.3px;">📍 Your Location</div>
            <div style="font-size:13px;font-weight:700;color:#020817;">You are here</div>
            <div style="font-size:10px;color:#94a3b8;font-family:monospace;margin-top:3px;">${origin.lat.toFixed(6)}, ${origin.lng.toFixed(6)}</div>
            ${origin.accuracy ? `<div style="font-size:10px;color:#64748b;margin-top:3px;">±${origin.accuracy} m accuracy</div>` : ""}
          </div>`,
          { maxWidth: 260 }
        );
      workerMarkerRef.current = wm;
      workerPosRef.current = origin;

      // Straight-line fallback
      const straight = haversineKm(origin.lat, origin.lng, lat, lng);
      setStraightKm(straight);

      // Fit both points
      const bounds = L.latLngBounds(
        [[origin.lat, origin.lng], [lat, lng]]
      );
      map.fitBounds(bounds, { padding: [52, 52], maxZoom: 16, animate: true });

      // OSRM driving route
      try {
        const coords = `${origin.lng},${origin.lat};${lng},${lat}`;
        const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
        const resp = await fetch(url);
        if (resp.ok) {
          const json = await resp.json();
          const route = json?.routes?.[0];
          if (route?.geometry?.coordinates) {
            const latlngs: [number, number][] = route.geometry.coordinates.map(
              ([lng, lat]: [number, number]) => [lat, lng]
            );
            routeLineRef.current = L.polyline(latlngs, {
              color: "#0066cc",
              weight: 5,
              opacity: 0.85,
            }).addTo(map);

            const routeBounds = L.latLngBounds(latlngs);
            map.fitBounds(routeBounds, { padding: [52, 52], maxZoom: 16, animate: true });

            setRouteInfo({
              distanceKm: (route.distance ?? 0) / 1000,
              durationSec: route.duration ?? 0,
            });
          }
        }
      } catch {
        // OSRM optional — markers still visible
      }

      setPhase("ready");
    },
    [lat, lng]
  );

  // ── Load route ─────────────────────────────────────────────────────────────
  const loadRoute = useCallback(async () => {
    setPhase("gps");
    setErrorMsg(null);
    setRouteInfo(null);
    setStraightKm(null);

    let pos: { lat: number; lng: number; accuracy: number };
    try {
      pos = await fetchGps();
    } catch (e: any) {
      setPhase("error");
      setErrorMsg(e.message);
      return;
    }

    setGpsAccuracy(pos.accuracy);
    setPhase("routing");
    await drawRoute(pos);
  }, [fetchGps, drawRoute]);

  // ── Auto-load once map is ready ───────────────────────────────────────────
  useEffect(() => {
    // Small delay to ensure Leaflet has mounted
    const t = window.setTimeout(() => loadRoute(), 400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading = phase === "idle" || phase === "gps" || phase === "routing";

  const phaseLabel: Record<Phase, string> = {
    idle: "Initialising…",
    gps: "Detecting your GPS location…",
    routing: "Calculating route…",
    ready: "",
    error: "",
    "no-gps": "",
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Info bar */}
      {phase === "ready" && (
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100/60 bg-gradient-to-r from-blue-50/60 to-slate-50/50 px-5 py-3">
          {routeInfo ? (
            <>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Milestone className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Distance</p>
                  <p className="text-xs font-bold text-slate-800">{fmtDistance(routeInfo.distanceKm)}</p>
                </div>
              </div>
              <div className="h-7 w-px bg-slate-200" />
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                  <Clock className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Drive Time</p>
                  <p className="text-xs font-bold text-slate-800">{fmtDuration(routeInfo.durationSec)}</p>
                </div>
              </div>
            </>
          ) : straightKm !== null ? (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <MapPin className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Straight-line</p>
                <p className="text-xs font-bold text-slate-800">{fmtDistance(straightKm)}</p>
              </div>
            </div>
          ) : null}

          {gpsAccuracy !== null && (
            <span
              className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                gpsAccuracy <= 20
                  ? "bg-green-100 text-green-700"
                  : gpsAccuracy <= 100
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              ±{gpsAccuracy}m GPS
            </span>
          )}

          <button
            onClick={loadRoute}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg bg-white/70 text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-white hover:text-blue-600"
            title="Refresh route"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Map */}
      <div className="relative flex-1">
        <div ref={containerRef} className="h-full w-full" />

        {/* Legend */}
        {phase === "ready" && (
          <div className="absolute bottom-4 left-3 z-[1000] space-y-1.5 rounded-xl border border-slate-200/60 bg-white/90 px-3 py-2.5 text-xs text-slate-600 shadow-md backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 flex-shrink-0 rounded-full bg-[#0066cc] ring-2 ring-white shadow" />
              Your location
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 flex-shrink-0 rounded-full bg-[#ef4444] ring-2 ring-white shadow" />
              Report site
            </div>
            <div className="flex items-center gap-2">
              <span className="h-[3px] w-5 flex-shrink-0 rounded bg-[#0066cc]" />
              Route
            </div>
          </div>
        )}

        {/* Locate Me FAB */}
        {phase === "ready" && (
          <button
            onClick={() => {
              const p = workerPosRef.current;
              if (mapRef.current && p) {
                mapRef.current.setView([p.lat, p.lng], 16, { animate: true });
              }
            }}
            className="absolute bottom-4 right-4 z-[1000] flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-md transition hover:border-blue-300 hover:bg-blue-50"
            title="Centre on my location"
          >
            <Navigation className="h-4 w-4 text-blue-600" />
          </button>
        )}



        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-[1001] flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
              <Navigation className="h-7 w-7 animate-pulse text-blue-600" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-sm font-medium text-slate-700">{phaseLabel[phase]}</p>
              <p className="text-xs text-slate-400">Getting your GPS & building route</p>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {phase === "error" && (
          <div className="absolute inset-0 z-[1001] flex flex-col items-center justify-center gap-4 px-8 text-center bg-white/95 backdrop-blur-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <AlertTriangle className="h-7 w-7 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Could not get your location</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{errorMsg}</p>
            </div>
            <button
              onClick={loadRoute}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
