import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  Pane,
} from "react-leaflet";
import L from "leaflet";
import { Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";

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

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Fit map bounds to all routes
function MapBoundsSetter({ routes }) {
  const map = useMap();

  useEffect(() => {
    if (routes.length === 0) return;

    try {
      const coords = [];
      routes.forEach((r) => {
        if (r.origin?.lat != null && r.origin?.lng != null)
          coords.push([r.origin.lat, r.origin.lng]);
        if (r.dest?.lat != null && r.dest?.lng != null)
          coords.push([r.dest.lat, r.dest.lng]);
      });

      if (coords.length > 0) {
        map.fitBounds(coords, { padding: [100, 100] });
      }
    } catch (e) {
      console.warn("Failed to fit bounds:", e.message);
    }
  }, [routes, map]);

  return null;
}

// Draw route with different styles
function RoutePolyline({
  origin,
  destination,
  color,
  routeIndex,
  mode,
  totalRoutes,
  onClick,
}) {
  const [routeCoords, setRouteCoords] = useState([]);

  useEffect(() => {
    if (!origin || !destination) return;

    const fetchRoute = async () => {
      try {
        let profile = "driving";
        if (mode && mode.toLowerCase().includes("cycling")) profile = "cycling";
        else if (mode && mode.toLowerCase().includes("walking"))
          profile = "foot";

        let url;

        // create a different route shape for walking route
        if (routeIndex === 2) {
          const { lat: lat1, lng: lng1 } = origin;
          const { lat: lat2, lng: lng2 } = destination;
          const midLat = (lat1 + lat2) / 2;
          const midLng = (lng1 + lng2) / 2;
          const dx = lat2 - lat1;
          const dy = lng2 - lng1;
          const offsetScale = 0.25;
          const waypointLat = midLat - dy * offsetScale;
          const waypointLng = midLng + dx * offsetScale;

          url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${waypointLng},${waypointLat};${lng2},${lat2}?overview=full&geometries=geojson`;
        } else {
          url = `https://router.project-osrm.org/route/v1/${profile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&alternatives=true`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const routeData =
            data.routes[routeIndex === 1
              ? Math.min(1, data.routes.length - 1)
              : 0];
          if (routeData && routeData.geometry) {
            const coords = routeData.geometry.coordinates.map((coord) => [
              coord[1],
              coord[0],
            ]);
            setRouteCoords(coords);
          }
        }
      } catch (error) {
        console.error(`Error fetching route ${routeIndex}:`, error);
      }
    };

    fetchRoute();
  }, [origin, destination, routeIndex, mode, totalRoutes]);

  if (routeCoords.length === 0) return null;

  const getPathOptions = () => {
    if (routeIndex === 0)
      return { color, weight: 11, opacity: 0.85, dashArray: null };
    else if (routeIndex === 1)
      return { color, weight: 7, opacity: 0.9, dashArray: "20, 10" };
    else return { color, weight: 4, opacity: 1, dashArray: "2, 8" };
  };

  return (
    <>
      <Polyline
        pane="outlines"
        positions={routeCoords}
        pathOptions={{
          color: "white",
          weight: getPathOptions().weight + 5,
          opacity: 0.8,
        }}
      />
      <Polyline
        pane="colors"
        positions={routeCoords}
        pathOptions={getPathOptions()}
        eventHandlers={{
          click: () => onClick && onClick(), // ✅ click to select
        }}
      />
    </>
  );
}

// Main Map component
export default function MapView({ center = [0, 0], routes = [] }) {
  const [selectedRoute, setSelectedRoute] = useState(null);

  const colorForMode = (mode) => {
    const m = mode.toLowerCase();
    if (m.includes("driving") || m.includes("car")) return "#3b82f6";
    if (m.includes("cycling") || m.includes("bike")) return "#22c55e";
    if (m.includes("walking") || m.includes("foot")) return "#f97316";
    return "#8b5cf6";
  };

  const uniqueOrigin =
    routes.length > 0 && routes[0].origin ? routes[0].origin : null;
  const uniqueDestination =
    routes.length > 0 && routes[0].dest ? routes[0].dest : null;

  const modeIcons = {
    "driving-car": "🚗",
    "cycling-regular": "🚴",
    "foot-walking": "🚶",
  };

  const handleRouteClick = (route) => {
    // toggle selection
    if (selectedRoute && selectedRoute.routeId === route.routeId) {
      setSelectedRoute(null);
    } else {
      setSelectedRoute(route);
    }
  };

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        />

        <Pane name="outlines" style={{ zIndex: 450 }} />
        <Pane name="colors" style={{ zIndex: 460 }} />

        <MapBoundsSetter routes={routes} />

        {/* Draw all routes */}
        {routes.map((r, index) => {
          const hasOrigin = r.origin?.lat != null && r.origin?.lng != null;
          const hasDest = r.dest?.lat != null && r.dest?.lng != null;
          return (
            hasOrigin &&
            hasDest && (
              <RoutePolyline
                key={r.routeId || index}
                origin={r.origin}
                destination={r.dest}
                color={colorForMode(r.mode)}
                routeIndex={index}
                mode={r.mode}
                totalRoutes={routes.length}
                onClick={() => handleRouteClick(r)}
              />
            )
          );
        })}

        {/* Markers */}
        {uniqueOrigin && (
          <Marker position={[uniqueOrigin.lat, uniqueOrigin.lng]} icon={greenIcon}>
            <Popup>📍 Origin</Popup>
          </Marker>
        )}
        {uniqueDestination && (
          <Marker position={[uniqueDestination.lat, uniqueDestination.lng]} icon={redIcon}>
            <Popup>🎯 Destination</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Right-side panel */}
      {routes.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            borderRadius: "16px",
            boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.3)",
            padding: "18px",
            border: "2px solid #e2e8f0",
            maxWidth: "320px",
            zIndex: 1000,
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "#1e293b",
              marginBottom: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Navigation size={20} style={{ color: "#2563eb" }} />
            {selectedRoute ? "Selected Route" : `Routes (${routes.length})`}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {(selectedRoute ? [selectedRoute] : routes).map((r, idx) => (
              <div
                key={r.routeId || idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  fontSize: "13px",
                  padding: "12px",
                  backgroundColor:
                    selectedRoute && selectedRoute.routeId === r.routeId
                      ? "#dbeafe"
                      : "#f8fafc",
                  borderRadius: "10px",
                  borderLeft: `5px solid ${colorForMode(r.mode)}`,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ fontSize: "28px" }}>
                  {modeIcons[r.mode] || "🚗"}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "#1e293b",
                      fontWeight: "700",
                      fontSize: "14px",
                      marginBottom: "6px",
                    }}
                  >
                    {r.mode.replace("-", " ").replace("regular", "").trim()}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "4px",
                      fontSize: "11px",
                    }}
                  >
                    <div style={{ color: "#64748b" }}>
                      📏 <strong>{r.distance_km} km</strong>
                    </div>
                    <div style={{ color: "#64748b" }}>
                      ⏱️ <strong>{r.duration_min} min</strong>
                    </div>
                    <div
                      style={{
                        color: r.emission_g === 0 ? "#22c55e" : "#64748b",
                        gridColumn: "1 / -1",
                        fontWeight: "600",
                      }}
                    >
                      🌱 {(r.emission_g / 1000).toFixed(2)} kg CO₂
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
