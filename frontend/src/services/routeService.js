import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem("token");
};

/**
 * Save a route choice
 * @param {string} routeId - Unique route ID
 * @param {object} route - Route data object
 * @returns {object} - Response from server
 */
export async function chooseRoute(routeId, route) {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error("User not authenticated. Please login first.");
    }

    console.log("📍 Saving route:", { routeId, mode: route.mode });

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const response = await axios.post(
      `${API_BASE}/choose`,
      {
        routeId,
        route: {
          mode: route.mode,
          distance_km: route.distance_km,
          duration_min: route.duration_min,
          predicted_duration_min: route.predicted_duration_min,
          emission_g: route.emission_g,
          polyline: route.polyline,
          origin: route.origin,
          origin_name: route.origin_name,
          dest: route.dest,
          dest_name: route.dest_name,
        },
      },
      config
    );

    console.log("✅ Route saved successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error saving route:", error);

    if (error.response?.status === 401) {
      throw new Error("Session expired. Please login again.");
    }

    const errorMessage = error.response?.data?.error || error.message;
    throw new Error(errorMessage);
  }
}

/**
 * Get all routes saved by current user
 * @returns {array} - Array of route objects
 */
export async function getUserRoutes() {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error("User not authenticated. Please login first.");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(`${API_BASE}/routes/user`, config);

    console.log("✅ User routes fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching user routes:", error);

    if (error.response?.status === 401) {
      throw new Error("Session expired. Please login again.");
    }

    const errorMessage = error.response?.data?.error || error.message;
    throw new Error(errorMessage);
  }
}

/**
 * Get route history/statistics for user
 * @returns {object} - User statistics
 */
export async function getUserStats() {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error("User not authenticated. Please login first.");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(`${API_BASE}/stats/user-savings`, config);

    console.log("✅ User stats fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching user stats:", error);

    if (error.response?.status === 401) {
      throw new Error("Session expired. Please login again.");
    }

    const errorMessage = error.response?.data?.error || error.message;
    throw new Error(errorMessage);
  }
}

/**
 * Search routes by place name
 * @param {string} query - Search query
 * @returns {array} - Array of matching routes
 */
export async function searchRoutes(query) {
  try {
    if (!query || query.trim().length === 0) {
      throw new Error("Search query cannot be empty");
    }

    const response = await axios.get(`${API_BASE}/routes/search`, {
      params: { query },
    });

    console.log("✅ Routes found:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error searching routes:", error);

    const errorMessage = error.response?.data?.error || error.message;
    throw new Error(errorMessage);
  }
}