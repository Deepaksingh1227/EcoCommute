import axios from "axios";

/*
  Enhanced ORS client with fallback simulation.
  Each mode now produces unique distance and duration values.
  Uses ORS API if key is available, otherwise simulates realistic route data.
*/

export async function getRoutesFromORS(origin, dest, mode = "driving-car") {
  const ORS_KEY = process.env.ORS_API_KEY;

  // --- Utility: Haversine formula to compute straight-line distance (km)
  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius (km)
    const toRad = (v) => (v * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // --- Simulation fallback for when ORS fails or key is missing
  function simulateRoute() {
    const baseDistance =
      haversine(origin.lat, origin.lng, dest.lat, dest.lng) || 1.2;
    let distance_km = baseDistance;

    // 🔹 Apply realistic variation by mode
    if (mode.includes("driving")) distance_km *= 1.2; // longer road network paths
    if (mode.includes("cycling")) distance_km *= 1.05;
    if (mode.includes("bike")) distance_km *= 1.1;
    if (mode.includes("bus")) distance_km *= 1.3;
    if (mode.includes("foot") || mode.includes("walk")) distance_km *= 0.9;

    // 🔹 Assign mode-based average speeds (km/h)
    let speed = 40;
    if (mode.includes("driving")) speed = 50;
    if (mode.includes("bike")) speed = 35;
    if (mode.includes("cycling")) speed = 18;
    if (mode.includes("foot") || mode.includes("walk")) speed = 5;
    if (mode.includes("bus")) speed = 45;

    const duration_min = (distance_km / speed) * 60;

    return {
      distance_km,
      duration_min,
      geometry: {
        type: "LineString",
        coordinates: [
          [origin.lng, origin.lat],
          [dest.lng, dest.lat],
        ],
      },
    };
  }

  // --- If ORS key not available, return simulated route
  if (!ORS_KEY) {
    console.warn("⚠️ ORS_API_KEY not found. Using simulated route data.");
    return simulateRoute();
  }

  // --- ORS API URL setup
  const url = `https://api.openrouteservice.org/v2/directions/${mode}/geojson`;
  const payload = {
    coordinates: [
      [origin.lng, origin.lat],
      [dest.lng, dest.lat],
    ],
    instructions: false,
  };

  // --- Retry logic
  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    try {
      const r = await axios.post(url, payload, {
        headers: {
          Authorization: ORS_KEY,
          "Content-Type": "application/json",
        },
      });

      const feat = r.data.features && r.data.features[0];
      const summary = feat?.properties?.summary;

      const distance_km = summary ? summary.distance / 1000 : 1;
      const duration_min = summary ? summary.duration / 60 : 1;

      return {
        distance_km,
        duration_min,
        geometry: feat.geometry,
      };
    } catch (err) {
      attempts++;
      console.warn(`ORS call failed (attempt ${attempts}):`, err.message);
      if (attempts >= maxAttempts) {
        console.warn("Returning simulated route due to ORS failure.");
        return simulateRoute();
      }
      await new Promise((res) => setTimeout(res, 500)); // brief delay before retry
    }
  }
}
