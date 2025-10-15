import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// Helper to get auth token
const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export async function getRoutes(
  origin,
  dest,
  modes = "driving-car,cycling-regular,foot-walking",
  alpha = 0.5
) {
  try {
    const res = await axios.get(`${API_BASE}/routes`, {
      params: { origin, dest, modes, alpha },
    });
    return res.data;
  } catch (error) {
    console.error("Get routes error:", error);
    throw error.response?.data?.error || "Failed to fetch routes";
  }
}

export async function chooseRoute(userId, routeId, route) {
  try {
    const res = await axios.post(
      `${API_BASE}/choose`,
      { userId, routeId, route },
      getAuthConfig()
    );
    return res.data;
  } catch (error) {
    console.error("Choose route error:", error.response?.data);
    throw error.response?.data?.error || "Failed to save route";
  }
}

export async function getCityStats() {
  try {
    const res = await axios.get(`${API_BASE}/stats/city-savings`);
    return res.data;
  } catch (error) {
    console.error("Get stats error:", error);
    throw error.response?.data?.error || "Failed to fetch stats";
  }
}