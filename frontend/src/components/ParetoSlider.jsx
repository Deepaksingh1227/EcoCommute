import React from "react";
import { TrendingUp, Leaf, Zap } from "lucide-react";

export default function ParetoSlider({ alpha, setAlpha }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-5 border border-blue-100">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <TrendingUp size={20} className="text-blue-600" />
        Route Preference
      </h2>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-slate-700">Priority:</span>
          <span className="text-sm font-bold text-blue-600">
            {alpha === 1 ? "Speed" : alpha === 0 ? "Eco-Friendly" : "Balanced"}
          </span>
        </div>

        <div className="relative pt-1">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={alpha}
            onChange={(e) => setAlpha(parseFloat(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-green-400 via-yellow-400 to-blue-400 rounded-lg appearance-none cursor-pointer slider"
          />
          <style>{`
            .slider::-webkit-slider-thumb {
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: white;
              border: 3px solid #3b82f6;
              cursor: pointer;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            }
            .slider::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: white;
              border: 3px solid #3b82f6;
              cursor: pointer;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            }
          `}</style>
        </div>

        <div className="flex justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Leaf size={12} className="text-green-500" />
            Eco
          </span>
          <span className="flex items-center gap-1">
            <Zap size={12} className="text-blue-500" />
            Fast
          </span>
        </div>
      </div>
    </div>
  );
}