import React from "react";
import { Navigation, Clock, Zap, Leaf, Award } from "lucide-react";

export default function RouteCard({ route, onChoose, isSelected }) {
  const modeIcons = {
    "driving-car": "🚗",
    "cycling-regular": "🚴",
    bike: "🏍️",
    bus: "🚌",
  };

  const modeColors = {
    "driving-car": "from-blue-500 to-blue-600",
    "cycling-regular": "from-green-500 to-green-600",
    bike: "from-purple-500 to-purple-600",
    bus: "from -yellow-500 to organge-700",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-white border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${
        isSelected ? "border-blue-500 shadow-lg" : "border-slate-200"
      }`}
      onClick={onChoose}
    >
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
          modeColors[route.mode]
        }`}
      />

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{modeIcons[route.mode]}</span>
            <span className="font-semibold text-slate-800 capitalize">
              {route.mode.replace("-", " ")}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold">
            <Award size={12} />
            {(route.score * 100).toFixed(0)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Navigation size={14} className="text-blue-500" />
            <span className="font-medium">{route.distance_km} km</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Clock size={14} className="text-purple-500" />
            <span className="font-medium">{route.duration_min} min</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Zap size={14} className="text-amber-500" />
            <span className="font-medium">
              {route.predicted_duration_min} min
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Leaf size={14} className="text-green-500" />
            <span className="font-medium">
              {(route.emission_g / 1000).toFixed(2)} kg
            </span>
          </div>
        </div>

        <button
          className={`w-full mt-3 py-2 rounded-lg font-medium transition-all duration-200 ${
            isSelected
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {isSelected ? "✓ Selected" : "Select Route"}
        </button>
      </div>
    </div>
  );
}
