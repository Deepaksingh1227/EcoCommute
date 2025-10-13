import React, { useEffect, useState } from "react";
import { getCityStats } from "../services/api";

/**
 * Simple dashboard to show aggregated data for planners
 * - total CO₂ emissions stored
 * - number of routes fetched (simulated for demo)
 */
export default function Dashboard() {
  const [stats, setStats] = useState({ total_emission_g: 0, route_count: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const s = await getCityStats();
        setStats({
          total_emission_g: s.total_emission_g || 0,
          route_count: Math.floor(Math.random() * 25) + 5, // fake for demo
        });
      } catch (err) {
        console.error(err);
      }
    }
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card mt-4">
      <h2 className="text-lg font-semibold text-slate-700 mb-2">
        Smart City Dashboard
      </h2>
      <div className="text-sm text-slate-600 space-y-1">
        <div>
          Total routes recorded: <strong>{stats.route_count}</strong>
        </div>
        <div>
          Total emissions tracked:{" "}
          <strong>{(stats.total_emission_g / 1000).toFixed(2)} kg CO₂</strong>
        </div>
        <div>
          Avg CO₂ per route:{" "}
          <strong>
            {(
              stats.total_emission_g /
              Math.max(stats.route_count, 1) /
              1000
            ).toFixed(3)}{" "}
            kg
          </strong>
        </div>
      </div>
    </div>
  );
}
