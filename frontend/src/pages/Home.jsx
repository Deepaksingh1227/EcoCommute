import React, { useState, useEffect } from "react";
import MapView from "../components/MapVIew/MapView";
import ParetoSlider from "../components/ParetoSlider";
import RouteCard from "../components/RouteCard";
import Dashboard from "../components/Dashboard";
import { getRoutes, chooseRoute, getCityStats } from "../services/api";

export default function Home() {
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
    } catch {
      alert("Failed to get routes. Check backend.");
    } finally {
      setLoading(false);
      try {
        const stats = await getCityStats();
        setCityStats(stats);
      } catch {}
    }
  }

  async function handleChoose(route) {
    try {
      await chooseRoute(null, route.routeId, route);
      alert("Route chosen!");
      const stats = await getCityStats();
      setCityStats(stats);
    } catch {
      alert("Failed to save choice");
    }
  }

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchRoutes, 250);
    return () => clearTimeout(t);
  }, [alpha]);

  return (
    <div className="grid grid-cols-[400px,1fr] h-screen gap-4 p-4 bg-slate-50">
      {/* Sidebar */}
      <div className="overflow-y-auto p-4 rounded-2xl bg-white border border-slate-100">
        <h1 className="text-2xl font-semibold text-slate-800 mb-4">
          EcoCommute
        </h1>

        {/* Origin & Destination */}
        <div className="space-y-2 mb-4">
          <label className="text-sm text-slate-600 font-semibold">Origin</label>
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-xl"
          />
          <label className="text-sm text-slate-600 font-semibold">
            Destination
          </label>
          <input
            type="text"
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-xl"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={fetchRoutes}
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? "Loading..." : "Get Routes"}
            </button>
            <button
              onClick={() => {
                setOrigin("12.9716,77.5946");
                setDest("12.9352,77.6245");
              }}
              className="btn btn-secondary flex-1"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Trade-Off Slider */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-700 mb-2">
            Trade-Off
          </h2>
          <ParetoSlider alpha={alpha} setAlpha={setAlpha} />
        </div>

        {/* Candidate Routes */}
        <h2 className="text-lg font-semibold text-slate-700 mb-2">
          Candidate Routes
        </h2>
        {routes.length === 0 ? (
          <p className="text-sm text-slate-500 mb-2">
            No routes yet. Click "Get Routes".
          </p>
        ) : (
          <div className="space-y-3">
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
        <h2 className="text-lg font-semibold text-slate-700 mt-6 mb-2">
          City Stats
        </h2>
        <p className="text-sm text-slate-500">
          Total emissions:{" "}
          <strong>{(cityStats.total_emission_g / 1000).toFixed(3)} kg</strong>
        </p>
      </div>

      {/* Map Area */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 relative">
        <MapView center={center} routes={routes} />
        <Dashboard />
      </div>
    </div>
  );
}
