"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface ReadOnlyMapProps {
  lat: number;
  lng: number;
  className?: string;
}

function buildMarkerIcon() {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
      <filter id="rsm" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.35)"/>
      </filter>
      <path d="M17 1C8.16 1 1 8.16 1 17c0 11.25 16 26 16 26S33 28.25 33 17C33 8.16 25.84 1 17 1z"
            fill="#2563eb" filter="url(#rsm)"/>
      <circle cx="17" cy="17" r="6.5" fill="white"/>
      <circle cx="17" cy="17" r="3.5" fill="#2563eb"/>
    </svg>`,
    className: "",
    iconSize: [34, 44],
    iconAnchor: [17, 44],
  });
}

export default function ReadOnlyMap({ lat, lng, className }: ReadOnlyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    L.marker([lat, lng], { icon: buildMarkerIcon() }).addTo(map);

    mapRef.current = map;
    requestAnimationFrame(() => map.invalidateSize());

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className={className || "h-full w-full"} />;
}
