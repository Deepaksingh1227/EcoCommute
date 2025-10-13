import axios from "axios";

/*
  Simple ORS client with safe fallback. Retries ORS calls up to 2 times.
  ORS returns distances in meters and duration in seconds.
*/
export async function getRoutesFromORS(origin, dest, mode = "driving-car") {
  const ORS_KEY = process.env.ORS_API_KEY;

  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const toRad = (v) => (v * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function simulateRoute() {
    const distance_km =
      haversine(origin.lat, origin.lng, dest.lat, dest.lng) || 1.2;

    let speed = 40;
    if (mode.includes("cycling")) speed = 15;
    if (mode.includes("foot")) speed = 5;
    if (mode.includes("driving")) speed = 40;

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

  if (!ORS_KEY) return simulateRoute();

  const url = `https://api.openrouteservice.org/v2/directions/${mode}/geojson`;
  const payload = {
    coordinates: [
      [origin.lng, origin.lat],
      [dest.lng, dest.lat],
    ],
    instructions: false,
  };

  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    try {
      const r = await axios.post(url, payload, {
        headers: { Authorization: ORS_KEY, "Content-Type": "application/json" },
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
      await new Promise((res) => setTimeout(res, 500)); // small delay before retry
    }
  }
}
