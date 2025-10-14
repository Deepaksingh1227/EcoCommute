import express from "express";
import { getRoutesFromORS } from "../services/orsClient.js";
import { computeEmission } from "../services/emission.js";
import { predictDelay } from "../services/mlClient.js";
import { geocodePlace } from "../services/geocodeClient.js"; // ✅ new import
import { Route, Choice } from "../db/index.js"; // Mongoose models
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

/**
 * GET /api/routes?origin=MG Road Bengaluru&dest=Koramangala&modes=car,bike
 * or
 * GET /api/routes?origin=12.9716,77.5946&dest=12.9352,77.6245
 */
router.get("/routes", async (req, res) => {
  try {
    const { origin, dest, modes } = req.query;

    if (!origin || !dest) {
      return res.status(400).json({ error: "origin and dest required" });
    }

    // ✅ 1. Convert names → coordinates using geocode service
    const originGeo = await geocodePlace(origin);
    const destGeo = await geocodePlace(dest);

    if (!originGeo || !destGeo) {
      return res.status(400).json({ error: "Invalid origin or destination" });
    }

    const olat = originGeo.lat;
    const olng = originGeo.lng;
    const dlat = destGeo.lat;
    const dlng = destGeo.lng;

    // ✅ 2. Supported travel modes
    const requestedModes = modes
      ? modes.split(",")
      : ["driving-car", "cycling-regular", "foot-walking"];

    const candidates = [];

    // ✅ 3. Fetch route data for each mode
    for (const mode of requestedModes) {
      let routeData;
      try {
        routeData = await getRoutesFromORS(
          { lat: olat, lng: olng },
          { lat: dlat, lng: dlng },
          mode
        );
      } catch (err) {
        console.error(`ORS API failed for mode ${mode}:`, err.message);
        routeData = {
          distance_km: 0,
          duration_min: 0,
          geometry: null,
        };
      }

      // ✅ 4. Predict delay using ML microservice
      let duration_min = routeData.duration_min || 0;
      try {
        const mlResp = await predictDelay({
          distance_km: routeData.distance_km,
          hour_of_day: new Date().getHours(),
          mode,
        });
        if (mlResp?.predicted_duration_min) {
          duration_min = mlResp.predicted_duration_min;
        }
      } catch (err) {
        console.warn(`ML prediction failed for mode ${mode}:`, err.message);
      }

      // ✅ 5. Calculate emissions
      let vehicle = "petrol_car";
      if (mode.includes("cycling") || mode.includes("bike")) vehicle = "bike";
      if (mode.includes("foot")) vehicle = "bike";
      if (mode.includes("electric")) vehicle = "electric_car";

      const emission_g = computeEmission(routeData.distance_km, vehicle);

      // ✅ 6. Build route candidate object
      candidates.push({
        routeId: uuidv4(),
        mode,
        distance_km: Number(routeData.distance_km?.toFixed(3) || 0),
        duration_min: Number(routeData.duration_min?.toFixed(2) || 0),
        predicted_duration_min: Number(duration_min.toFixed(2)),
        emission_g: Number(emission_g.toFixed(2)),
        polyline: routeData.geometry || {},
        origin: { lat: olat, lng: olng },
        origin_name: originGeo.display_name,
        dest: { lat: dlat, lng: dlng },
        dest_name: destGeo.display_name,
      });
    }

    // ✅ 7. Send all route options to frontend
    res.json(candidates);
  } catch (err) {
    console.error("Error in /routes:", err);
    res.status(500).json({ error: "server error" });
  }
});

/**
 * POST /api/choose
 * body: { userId, routeId, route }
 */
router.post("/choose", async (req, res) => {
  try {
    const { userId, routeId, route } = req.body;

    if (!route || !routeId) {
      return res.status(400).json({ error: "routeId or route data missing" });
    }

    // ✅ 1. Check if route already exists
    const existing = await Route.findOne({ routeId });
    if (!existing) {
      const newRoute = new Route({
        routeId,
        origin: route.origin,
        origin_name: route.origin_name,
        dest: route.dest,
        dest_name: route.dest_name,
        mode: route.mode,
        distance_km: route.distance_km,
        duration_min: route.predicted_duration_min || route.duration_min,
        emission_g: route.emission_g,
        polyline: JSON.stringify(route.polyline || {}),
      });
      await newRoute.save();
    }

    // ✅ 2. Save user route choice
    const newChoice = new Choice({
      user_id: userId || "demo",
      route_id: routeId,
    });
    await newChoice.save();

    res.json({ status: "ok" });
  } catch (err) {
    console.error("Error in /choose:", err);
    res.status(500).json({ error: "server error" });
  }
});

/**
 * GET /api/stats/city-savings
 */
router.get("/stats/city-savings", async (req, res) => {
  try {
    const result = await Route.aggregate([
      { $group: { _id: null, total_emission_g: { $sum: "$emission_g" } } },
    ]);
    res.json({ total_emission_g: result[0]?.total_emission_g || 0 });
  } catch (err) {
    console.error("Error in /stats/city-savings:", err);
    res.status(500).json({ error: "server error" });
  }
});

/**
 * ✅ BONUS: Search routes by place name
 * GET /api/routes/search?query=Koramangala
 */
router.get("/routes/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "query required" });

    const results = await Route.find({
      $text: { $search: query },
    }).limit(10);

    res.json(results);
  } catch (err) {
    console.error("Error in /routes/search:", err);
    res.status(500).json({ error: "server error" });
  }
});

export default router;
