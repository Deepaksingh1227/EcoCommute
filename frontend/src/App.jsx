import React, { useState, useEffect } from "react";

// Components
import MapView from "./components/MapVIew/MapView";
import ParetoSlider from "./components/ParetoSlider";
import RouteCard from "./components/RouteCard";
import Home from "./pages/Home";
// API services
import { getRoutes, chooseRoute, getCityStats } from "./services/api";

export default function App() {
  const [origin, setOrigin] = useState("12.9716,77.5946");
  const [dest, setDest] = useState("12.9352,77.6245");
  const [routes, setRoutes] = useState([]);
  const [alpha, setAlpha] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [cityStats, setCityStats] = useState({ total_emission_g: 0 });

  const center = (() => {
    try {
      const [lat, lng] = origin.split(",").map(Number);
      return [lat, lng];
    } catch {
      return [12.9716, 77.5946];
    }
  })();

  // Fetch routes from backend
  async function fetchRoutes() {
    setLoading(true);
    try {
      const res = await getRoutes(
        origin,
        dest,
        "driving-car,cycling-regular,foot-walking",
        alpha
      );
      setRoutes(res);
    } catch (e) {
      console.error(e);
      alert("Failed to fetch routes from backend");
    } finally {
      setLoading(false);
      try {
        const stats = await getCityStats();
        setCityStats(stats);
      } catch {}
    }
  }

  // Handle choosing a route
  async function handleChoose(route) {
    try {
      await chooseRoute(null, route.routeId, route);
      alert("Route chosen — saved!");
      const stats = await getCityStats();
      setCityStats(stats);
    } catch (e) {
      console.error(e);
      alert("Failed to save route");
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchRoutes();
  }, []);

  // Fetch routes when alpha changes (debounced)
  useEffect(() => {
    const t = setTimeout(fetchRoutes, 250);
    return () => clearTimeout(t);
  }, [alpha]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 bg-gray-50 p-4 overflow-y-auto border-r border-gray-200">
        <h1 className="text-xl font-bold mb-4">EcoCommute — Demo</h1>

        {/* Origin/Destination */}
        <div className="space-y-2 mb-4">
          <label className="block font-semibold">Origin</label>
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="input-field w-full p-2 border rounded"
          />
          <label className="block font-semibold">Destination</label>
          <input
            type="text"
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            className="input-field w-full p-2 border rounded"
          />
          <div className="flex gap-2 mt-2">
            <button
              className="btn btn-primary flex-1"
              onClick={fetchRoutes}
              disabled={loading}
            >
              {loading ? "Loading..." : "Get routes"}
            </button>
            <button
              className="btn btn-secondary flex-1"
              onClick={() => {
                setOrigin("12.9716,77.5946");
                setDest("12.9352,77.6245");
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Tradeoff Slider */}
        <h2 className="text-lg font-semibold mb-2">Tradeoff</h2>
        <ParetoSlider alpha={alpha} setAlpha={setAlpha} />

        {/* Candidate Routes */}
        <h2 className="text-lg font-semibold mt-4 mb-2">Candidate Routes</h2>
        {routes.length === 0 ? (
          <div className="text-gray-500">
            No routes yet. Click "Get routes".
          </div>
        ) : (
          <div className="space-y-2">
            {routes.map((r) => (
              <RouteCard
                key={r.routeId}
                route={r}
                onChoose={() => handleChoose(r)}
              />
            ))}
          </div>
        )}

        {/* City Stats */}
        <h2 className="text-lg font-semibold mt-4 mb-1">City Stats</h2>
        <div className="text-sm">
          Total emissions stored:{" "}
          <strong>{(cityStats.total_emission_g / 1000).toFixed(3)} kg</strong>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <MapView center={center} routes={routes} />
        <Home />
      </div>
    </div>
  );
}
