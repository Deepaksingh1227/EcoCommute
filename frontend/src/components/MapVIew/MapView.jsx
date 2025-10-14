import React, { useRef, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { Navigation } from "lucide-react";

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

// Custom component to handle map bounds
function MapBoundsSetter({ routes }) {
  const map = useMap();

  useEffect(() => {
    if (routes.length === 0) return;

    try {
      const coords = routes.flatMap((r) =>
        Array.isArray(r.polyline?.coordinates)
          ? r.polyline.coordinates
              .filter(
                (c) =>
                  Array.isArray(c) &&
                  c.length === 2 &&
                  c.every(Number.isFinite)
              )
              .map((c) => [c[1], c[0]])
          : []
      );
      if (coords.length > 0) {
        map.fitBounds(coords, { padding: [50, 50] });
      }
    } catch (e) {
      console.warn("Failed to fit bounds:", e.message);
    }
  }, [routes, map]);

  return null;
}

export default function MapView({ center = [0, 0], routes = [] }) {
  const colorForIndex = (i) => {
    const colors = ["#0ea5a4", "#0b74ff", "#f97316", "#8b5cf6"];
    return colors[i % colors.length];
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsSetter routes={routes} />

        {routes.map((r, idx) => {
          // Filter valid polyline coords
          const coords =
            Array.isArray(r.polyline?.coordinates) &&
            r.polyline.coordinates.every(
              (c) =>
                Array.isArray(c) &&
                c.length === 2 &&
                c.every(Number.isFinite)
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
                    opacity: 0.8,
                  }}
                />
              )}
              {hasOrigin && (
                <Marker position={[r.origin.lat, r.origin.lng]}>
                  <Popup>
                    <div style={{ fontSize: '14px' }}>
                      <strong style={{ color: '#22c55e' }}>📍 Origin</strong>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                        {r.origin.lat.toFixed(4)}, {r.origin.lng.toFixed(4)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}
              {hasDest && (
                <Marker position={[r.dest.lat, r.dest.lng]}>
                  <Popup>
                    <div style={{ fontSize: '14px' }}>
                      <strong style={{ color: '#ef4444' }}>🎯 Destination</strong>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                        {r.dest.lat.toFixed(4)}, {r.dest.lng.toFixed(4)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Map Legend */}
      {routes.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          padding: '16px',
          border: '1px solid #e2e8f0',
          maxWidth: '280px',
          zIndex: 1000
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: '0 0 12px 0'
          }}>
            <Navigation size={16} style={{ color: '#2563eb' }} />
            Routes Overview
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {routes.map((r, idx) => (
              <div key={r.routeId || idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '13px',
                padding: '8px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }}>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: colorForIndex(idx),
                    flexShrink: 0
                  }}
                />
                <div style={{ flex: 1 }}>
                  <span style={{ color: '#334155', fontWeight: '600', textTransform: 'capitalize' }}>
                    {r.mode.replace("-", " ")}
                  </span>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    {r.distance_km} km • {r.duration_min} min • {(r.emission_g / 1000).toFixed(2)} kg CO₂
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
              <span>Origin</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <span>Destination</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}