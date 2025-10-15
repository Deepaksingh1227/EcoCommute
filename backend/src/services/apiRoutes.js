import express from "express";
import { getRoutesFromORS } from "../services/orsClient.js";
import { computeEmission } from "../services/emission.js";
import { predictDelay } from "../services/mlClient.js";
import { geocodePlace } from "../services/geocodeClient.js";
import { saveRoute, saveUserChoice, getRoutesByUser } from "../services/routeService.js";
import { Route, Choice } from "../db/index.js";
import { authMiddleware } from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

/**
 * GET /api/routes?origin=MG Road Bengaluru&dest=Koramangala&modes=car,bike
 */
router.get("/routes", async (req, res) => {
  try {
    const { origin, dest, modes } = req.query;

    if (!origin || !dest) {
      return res.status(400).json({ error: "origin and dest required" });
    }

    // Convert names → coordinates
    const originGeo = await geocodePlace(origin);
    const destGeo = await geocodePlace(dest);

    if (!originGeo || !destGeo) {
      return res.status(400).json({ error: "Invalid origin or destination" });
    }

    const olat = originGeo.lat;
    const olng = originGeo.lng;
    const dlat = destGeo.lat;
    const dlng = destGeo.lng;

    const requestedModes = modes
      ? modes.split(",")
      : ["driving-car", "cycling-regular", "foot-walking"];

    const candidates = [];

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

      // Predict delay using ML
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

      // Calculate emissions
      let vehicle = "petrol_car";
      const modeLower = mode.toLowerCase();

      if (modeLower.includes("cycling")) {
        vehicle = "cycling";
      } else if (modeLower.includes("bike") || modeLower.includes("motor")) {
        vehicle = "bike";
      } else if (modeLower.includes("bus")) {
        vehicle = "bus";
      } else if (modeLower.includes("electric")) {
        vehicle = "electric_car";
      }

      const emission_g = computeEmission(routeData.distance_km, vehicle);

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

    res.json(candidates);
  } catch (err) {
    console.error("Error in /routes:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

/**
 * POST /api/choose
 * body: { routeId, route }
 * Protected route - requires authentication
 */
router.post("/choose", authMiddleware, async (req, res) => {
  try {
    const { routeId, route } = req.body;
    const userId = req.userId;

    console.log("📍 Attempting to save route:", { routeId, userId });

    if (!route || !routeId) {
      return res.status(400).json({ error: "routeId or route data missing" });
    }

    // Save route
    try {
      await saveRoute(route, userId);
    } catch (saveErr) {
      console.error("Route save error:", saveErr);
      return res.status(500).json({ error: "Failed to save route: " + saveErr.message });
    }

    // Save choice
    try {
      await saveUserChoice(userId, routeId);
    } catch (choiceErr) {
      console.error("Choice save error:", choiceErr);
      return res.status(500).json({ error: "Failed to save choice: " + choiceErr.message });
    }

    res.json({ status: "ok", message: "Route saved successfully" });
  } catch (err) {
    console.error("Error in /choose:", err);
    res.status(500).json({ error: "Server error: " + err.message });
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
 * GET /api/routes/user
 * Protected route - get user's saved routes
 */
router.get("/routes/user", authMiddleware, async (req, res) => {
  try {
    const routes = await getRoutesByUser(req.userId);
    res.json(routes);
  } catch (err) {
    console.error("Error fetching user routes:", err);
    res.status(500).json({ error: "Failed to fetch routes" });
  }
});

/**
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