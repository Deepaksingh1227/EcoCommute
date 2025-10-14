import express from "express";
import { getRoutesFromORS } from "../services/orsClient.js";
import { computeEmission } from "../services/emission.js";
import { predictDelay } from "../services/mlClient.js";
import { User, Route, Choice } from "../db/index.js";
import { authMiddleware } from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

const router = express.Router();

/**
 * GET /api/routes?origin=lat,lng&dest=lat,lng&modes=car,bike
 */
router.get("/routes", async (req, res) => {
  try {
    const { origin, dest, modes } = req.query;
    if (!origin || !dest) {
      return res.status(400).json({ error: "origin and dest required" });
    }

    const [olat, olng] = origin.split(",").map(Number);
    const [dlat, dlng] = dest.split(",").map(Number);

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

      let vehicle = "petrol_car";
      if (mode.includes("cycling") || mode.includes("bike")) vehicle = "bike";
      if (mode.includes("foot")) vehicle = "bike";
      if (mode.includes("driving-electric")) vehicle = "electric_car";

      const emission_g = computeEmission(routeData.distance_km, vehicle);

      candidates.push({
        routeId: uuidv4(),
        mode,
        distance_km: Number(routeData.distance_km.toFixed(3)),
        duration_min: Number(routeData.duration_min?.toFixed(2) || 0),
        predicted_duration_min: Number(duration_min.toFixed(2)),
        emission_g: Number(emission_g.toFixed(2)),
        polyline: routeData.geometry || {},
        origin: { lat: olat, lng: olng },
        dest: { lat: dlat, lng: dlng },
      });
    }

    res.json(candidates);
  } catch (err) {
    console.error("Error in /routes:", err);
    res.status(500).json({ error: "server error" });
  }
});

/**
 * POST /api/choose
 * Protected route - requires authentication
 */
router.post("/choose", authMiddleware, async (req, res) => {
  try {
    const { routeId, route } = req.body;

    if (!route || !routeId) {
      return res
        .status(400)
        .json({ error: "routeId or route data missing" });
    }

    // Save route if not already saved
    const existing = await Route.findOne({ routeId });
    if (!existing) {
      const newRoute = new Route({
        routeId,
        user_id: req.userId,
        origin: route.origin,
        dest: route.dest,
        mode: route.mode,
        distance_km: route.distance_km,
        duration_min:
          route.predicted_duration_min || route.duration_min,
        emission_g: route.emission_g,
        polyline: JSON.stringify(route.polyline || {}),
      });
      await newRoute.save();
    }

    // Save user choice
    const newChoice = new Choice({
      user_id: req.userId,
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
 * GET /api/stats/user-savings
 * Protected route - get user's personal stats
 */
router.get("/stats/user-savings", authMiddleware, async (req, res) => {
  try {
    const result = await Route.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(req.userId),
        },
      },
      {
        $group: {
          _id: null,
          total_emission_g: { $sum: "$emission_g" },
          count: { $sum: 1 },
        },
      },
    ]);
    res.json({
      total_emission_g: result[0]?.total_emission_g || 0,
      route_count: result[0]?.count || 0,
    });
  } catch (err) {
    console.error("Error in /stats/user-savings:", err);
    res.status(500).json({ error: "server error" });
  }
});

export default router;