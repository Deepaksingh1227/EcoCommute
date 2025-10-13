import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

export default function ParetoSlider({ alpha, setAlpha }) {
  return (
    <div className="slider-wrap">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 13 }}>
          Tradeoff:{" "}
          <strong>
            {alpha === 1 ? "Fast" : alpha === 0 ? "Green" : "Balanced"}
          </strong>
        </div>
        <div style={{ fontSize: 13 }}>{(alpha * 100).toFixed(0)}%</div>
      </div>
      <div style={{ padding: "8px 6px" }}>
        <Slider min={0} max={1} step={0.01} value={alpha} onChange={setAlpha} />
      </div>
      <div className="slider-labels">
        <div>Green (low CO₂)</div>
        <div>Fast (low time)</div>
      </div>
    </div>
  );
}
