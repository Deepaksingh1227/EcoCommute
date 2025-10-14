import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export async function getRoutes(
  origin,
  dest,
  modes = "driving-car,cycling-regular,foot-walking",
  alpha = 0.5
) {
  const res = await axios.get(`${API_BASE}/routes`, {
    params: { origin, dest, modes, alpha },
  });
  return res.data;
}

export async function chooseRoute(userId, routeId, route) {
  const res = await axios.post(`${API_BASE}/choose`, {
    userId,
    routeId,
    route,
  });
  return res.data;
}

export async function getCityStats() {
  const res = await axios.get(`${API_BASE}/stats/city-savings`);
  return res.data;
}
