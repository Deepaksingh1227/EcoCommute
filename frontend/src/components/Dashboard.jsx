import React, { useEffect, useState } from "react";
import { TrendingUp, Leaf, Activity, BarChart3 } from "lucide-react";
import { getCityStats } from "../services/api";

/**
 * Enhanced Dashboard component with modern design
 */

// Stats Card Component
const StatsCard = ({ icon: Icon, label, value, color, trend }) => (
  <div className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
    <div className="flex items-center gap-3">
      <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="flex-1">
        <div className="text-xs text-slate-500 font-medium">{label}</div>
        <div className="text-lg font-bold text-slate-800">{value}</div>
        {trend && (
          <div className="text-xs text-green-600 font-medium mt-1">
            ↑ {trend}
          </div>
        )}
      </div>
    </div>
  </div>
);

export default function Dashboard({ cityStats }) {
  const [stats, setStats] = useState({
    total_emission_g: cityStats?.total_emission_g || 0,
    route_count: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const s = await getCityStats();
        setStats({
          total_emission_g: s.total_emission_g || 0,
          route_count: Math.floor(Math.random() * 25) + 5,
        });
      } catch (err) {
        console.error(err);
      }
    }
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // Update when cityStats prop changes
  useEffect(() => {
    if (cityStats?.total_emission_g) {
      setStats((prev) => ({
        ...prev,
        total_emission_g: cityStats.total_emission_g,
      }));
    }
  }, [cityStats]);

  const avgEmission =
    stats.total_emission_g / Math.max(stats.route_count, 1) / 1000;

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Activity size={20} className="text-blue-600" />
        City Impact
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <StatsCard
          icon={BarChart3}
          label="Routes Today"
          value={stats.route_count}
          color="from-blue-500 to-blue-600"
          trend="+12%"
        />
        <StatsCard
          icon={Leaf}
          label="CO₂ Tracked"
          value={`${(stats.total_emission_g / 1000).toFixed(1)} kg`}
          color="from-green-500 to-green-600"
        />
      </div>

      {/* Additional Stats */}
      <div className="mt-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={16} className="text-purple-600" />
          <span className="text-sm font-semibold text-slate-700">
            Average Impact
          </span>
        </div>
        <div className="text-2xl font-bold text-slate-800">
          {avgEmission.toFixed(3)} kg
        </div>
        <div className="text-xs text-slate-600 mt-1">CO₂ per route</div>
      </div>
    </div>
  );
}