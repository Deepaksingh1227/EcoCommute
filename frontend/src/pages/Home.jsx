import React, { useState, useEffect } from "react";
import MapView from "../components/MapVIew/MapView";
import ParetoSlider from "../components/ParetoSlider";
import RouteCard from "../components/RouteCard";
import Dashboard from "../components/Dashboard";
import { getRoutes, chooseRoute, getCityStats } from "../services/api";
import { MapPin, Leaf, Activity } from "lucide-react";

export default function Home() {
  const [origin, setOrigin] = useState("12.9716,77.5946");
  const [dest, setDest] = useState("12.9352,77.6245");
  const [routes, setRoutes] = useState([]);
  const [alpha, setAlpha] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
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
      setSelectedRoute(null);
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
    setSelectedRoute(route.routeId);
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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <div className="w-[420px] bg-white shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Leaf size={32} className="animate-pulse" />
            <h1 className="text-2xl font-bold">EcoCommute</h1>
          </div>
          <p className="text-blue-100 text-sm">Smart & Sustainable Navigation</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Origin & Destination */}
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <MapPin size={16} className="text-green-500" />
                Origin
              </label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <MapPin size={16} className="text-red-500" />
                Destination
              </label>
              <input
                type="text"
                value={dest}
                onChange={(e) => setDest(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchRoutes}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Activity size={18} className="animate-spin" />
                    Loading...
                  </span>
                ) : (
                  "Get Routes"
                )}
              </button>
              <button
                onClick={() => {
                  setOrigin("12.9716,77.5946");
                  setDest("12.9352,77.6245");
                }}
                className="px-4 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Trade-Off Slider */}
          <ParetoSlider alpha={alpha} setAlpha={setAlpha} />

          {/* Candidate Routes */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Candidate Routes
            </h2>
            {routes.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                No routes yet. Click "Get Routes".
              </p>
            ) : (
              <div className="space-y-3">
                {routes.map((r) => (
                  <RouteCard
                    key={r.routeId}
                    route={r}
                    onChoose={() => handleChoose(r)}
                    isSelected={selectedRoute === r.routeId}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Dashboard */}
          <Dashboard cityStats={cityStats} />
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <MapView center={center} routes={routes} />
      </div>
    </div>
  );
}