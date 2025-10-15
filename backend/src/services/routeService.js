import { Route, Choice } from "../db/index.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Save a route to database
 */
export async function saveRoute(routeData, userId = null) {
  try {
    console.log("saveRoute called with:", { userId, mode: routeData?.mode });

    if (!routeData) {
      throw new Error("Route data is null or undefined");
    }

    const routeId = uuidv4();

    const routePayload = {
      routeId,
      user_id: userId || null,
      origin: {
        lat: parseFloat(routeData.origin?.lat || 0),
        lng: parseFloat(routeData.origin?.lng || 0),
      },
      origin_name: routeData.origin_name || "Unknown Origin",
      dest: {
        lat: parseFloat(routeData.dest?.lat || 0),
        lng: parseFloat(routeData.dest?.lng || 0),
      },
      dest_name: routeData.dest_name || "Unknown Destination",
      mode: routeData.mode || "unknown",
      distance_km: parseFloat(routeData.distance_km || 0),
      duration_min: parseFloat(routeData.predicted_duration_min || routeData.duration_min || 0),
      emission_g: parseFloat(routeData.emission_g || 0),
      polyline: JSON.stringify(routeData.polyline || {}),
    };

    console.log("Creating Route with payload:", routePayload);

    const newRoute = new Route(routePayload);
    const savedRoute = await newRoute.save();

    console.log("✅ Route saved successfully:", routeId);
    return savedRoute;
  } catch (err) {
    console.error("❌ Error in saveRoute:", err.message);
    throw new Error(`Failed to save route: ${err.message}`);
  }
}

/**
 * Save user's route choice
 */
export async function saveUserChoice(userId, routeId) {
  try {
    console.log("saveUserChoice called with:", { userId, routeId });

    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!routeId) {
      throw new Error("Route ID is required");
    }

    const choicePayload = {
      user_id: userId,
      route_id: routeId,
      chosen_at: new Date(),
    };

    console.log("Creating Choice with payload:", choicePayload);

    const newChoice = new Choice(choicePayload);
    const savedChoice = await newChoice.save();

    console.log("✅ Choice saved successfully for user:", userId);
    return savedChoice;
  } catch (err) {
    console.error("❌ Error in saveUserChoice:", err.message);
    throw new Error(`Failed to save choice: ${err.message}`);
  }
}

/**
 * Get all routes saved by a user
 */
export async function getRoutesByUser(userId) {
  try {
    console.log("getRoutesByUser called for user:", userId);

    if (!userId) {
      throw new Error("User ID is required");
    }

    const routes = await Route.find({ user_id: userId }).sort({ created_at: -1 });

    console.log("✅ Retrieved", routes.length, "routes for user:", userId);
    return routes;
  } catch (err) {
    console.error("❌ Error in getRoutesByUser:", err.message);
    throw new Error(`Failed to fetch routes: ${err.message}`);
  }
}