import React, { useRef, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";

// Fix Leaflet icons for Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function MapView({ center = [0, 0], routes = [] }) {
  const mapRef = useRef();

  useEffect(() => {
    if (!mapRef.current || routes.length === 0) return;
    const map = mapRef.current;
    try {
      // Flatten all valid coordinates
      const coords = routes.flatMap((r) =>
        Array.isArray(r.polyline?.coordinates)
          ? r.polyline.coordinates
              .filter(
                (c) =>
                  Array.isArray(c) && c.length === 2 && c.every(Number.isFinite)
              )
              .map((c) => [c[1], c[0]])
          : []
      );
      if (coords.length > 0) map.fitBounds(coords, { padding: [40, 40] });
    } catch (e) {
      console.warn("Failed to fit bounds:", e.message);
    }
  }, [routes]);

  const colorForIndex = (i) =>
    ["#0ea5a4", "#0b74ff", "#f97316", "#8b5cf6"][i % 4];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {routes.map((r, idx) => {
        // Filter valid polyline coords
        const coords =
          Array.isArray(r.polyline?.coordinates) &&
          r.polyline.coordinates.every(
            (c) =>
              Array.isArray(c) && c.length === 2 && c.every(Number.isFinite)
          )
            ? r.polyline.coordinates.map((c) => [c[1], c[0]])
            : [];

        // Check origin/destination safely
        const hasOrigin = r.origin?.lat != null && r.origin?.lng != null;
        const hasDest = r.dest?.lat != null && r.dest?.lng != null;

        return (
          <React.Fragment key={r.routeId || idx}>
            {coords.length > 0 && (
              <Polyline
                positions={coords}
                pathOptions={{
                  color: colorForIndex(idx),
                  weight: 5,
                  opacity: 0.9,
                }}
              />
            )}
            {hasOrigin && (
              <Marker position={[r.origin.lat, r.origin.lng]}>
                <Popup>Origin</Popup>
              </Marker>
            )}
            {hasDest && (
              <Marker position={[r.dest.lat, r.dest.lng]}>
                <Popup>Destination</Popup>
              </Marker>
            )}
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
}
