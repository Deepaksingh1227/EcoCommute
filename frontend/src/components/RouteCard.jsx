import React from "react";

export default function RouteCard({ route, onChoose }) {
  return (
    <div className="card text-sm text-slate-700">
      <div className="flex justify-between items-center">
        <div className="font-semibold capitalize">
          {route.mode.replace("-", " ")}
        </div>
        <div className="text-xs text-slate-500">Score: {route.score}</div>
      </div>
      <div className="mt-1">
        <div>Distance: {route.distance_km} km</div>
        <div>Duration: {route.duration_min} min</div>
        <div>Predicted: {route.predicted_duration_min} min</div>
        <div>Emission: {(route.emission_g / 1000).toFixed(3)} kg CO₂</div>
      </div>
      <button onClick={onChoose} className="btn mt-2 w-full">
        Choose
      </button>
    </div>
  );
}
