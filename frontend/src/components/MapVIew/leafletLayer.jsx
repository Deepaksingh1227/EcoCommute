import React from "react";
import { GeoJSON, Marker, Popup, Polyline } from "react-leaflet";

/**
 * Reusable LeafletLayer component:
 *  - draws route GeoJSON (or Polyline fallback)
 *  - optional color prop
 */
export default function LeafletLayer({ route, color }) {
  if (!route) return null;

  // ensure coordinates exist
  const coords = route.polyline?.coordinates || [];
  if (!coords.length) return null;

  // convert GeoJSON coordinates [lng,lat] → Leaflet [lat,lng]
  const latlngs = coords.map((c) => [c[1], c[0]]);

  return (
    <>
      {/* if geometry is GeoJSON */}
      {route.polyline?.type === "LineString" ? (
        <GeoJSON
          data={route.polyline}
          style={{ color, weight: 5, opacity: 0.9 }}
        />
      ) : (
        <Polyline
          positions={latlngs}
          pathOptions={{ color, weight: 5, opacity: 0.9 }}
        />
      )}

      {/* Origin + destination markers */}
      {route.origin && (
        <Marker position={[route.origin.lat, route.origin.lng]}>
          <Popup>
            <div>
              <b>Origin</b>
              <br />
              {route.origin.lat.toFixed(4)}, {route.origin.lng.toFixed(4)}
            </div>
          </Popup>
        </Marker>
      )}
      {route.dest && (
        <Marker position={[route.dest.lat, route.dest.lng]}>
          <Popup>
            <div>
              <b>Destination</b>
              <br />
              {route.dest.lat.toFixed(4)}, {route.dest.lng.toFixed(4)}
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
}
