"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix leaflet icon path issues in Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// Fix React-Leaflet Fast Refresh "Map container is already initialized" error
const _originalInit = (L.Map.prototype as any).initialize as (
  id: string | HTMLElement,
  options?: L.MapOptions
) => void;
(L.Map.prototype as any).initialize = function (
  id: string | HTMLElement,
  options?: L.MapOptions
) {
  const container = typeof id === "string" ? document.getElementById(id) : id;
  if (container && (container as any)._leaflet_id) {
    // HMR fix
    (container as any).innerHTML = "";
    delete (container as any)._leaflet_id;
  }
  _originalInit.call(this, id, options);
};

interface MapPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}

function LocationMarker({ position, onChange }: { position: L.LatLngExpression, onChange: (pos: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={defaultIcon} />
  );
}

export default function MapPicker({ latitude, longitude, onChange }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number]>([latitude, longitude]);

  useEffect(() => {
    setPosition([latitude, longitude]);
  }, [latitude, longitude]);

  return (
    <MapContainer
      center={position}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker
        position={position}
        onChange={(pos) => {
          setPosition([pos.lat, pos.lng]);
          onChange(pos.lat, pos.lng);
        }}
      />
    </MapContainer>
  );
}
