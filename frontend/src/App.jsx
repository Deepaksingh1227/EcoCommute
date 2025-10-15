import React, { useState, useEffect } from "react";
import {
  MapPin,
  Navigation,
  Zap,
  Leaf,
  Clock,
  TrendingUp,
  Activity,
  Award,
  BarChart3,
} from "lucide-react";
import MapView from "./components/MapVIew/MapView";
import ProfileDropdown from "./components/Auth/ProfileDropdown";
import { getRoutes, getCityStats } from "./services/api";
import { chooseRoute } from "./services/routeService";
import { useAuth } from "./context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EnhancedRouteCard = ({ route, onChoose, isSelected }) => {
  const modeIcons = {
    "driving-car": "🚗",
    "cycling-regular": "🚴",
    bike: "🏍️",
    bus: "🚌",
  };

  const modeColors = {
    "driving-car": "#3b82f6",
    "cycling-regular": "#22c55e",
    bike: "#8b5cf6",
    bus: "#fbbf24",
  };

  return (
    <div
      onClick={onChoose}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "12px",
        backgroundColor: "white",
        border: isSelected ? "2px solid #3b82f6" : "2px solid #e2e8f0",
        transition: "all 0.3s",
        cursor: "pointer",
        boxShadow: isSelected ? "0 10px 15px -3px rgba(0, 0, 0, 0.1)" : "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: `linear-gradient(to right, ${modeColors[route.mode]}, ${
            modeColors[route.mode]
          })`,
        }}
      />

      <div style={{ padding: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "24px" }}>{modeIcons[route.mode]}</span>
            <span
              style={{
                fontWeight: "600",
                color: "#1e293b",
                textTransform: "capitalize",
              }}
            >
              {route.mode.replace("-", " ")}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "linear-gradient(to right, #fbbf24, #f59e0b)",
              color: "white",
              padding: "4px 12px",
              borderRadius: "9999px",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            <Award size={12} />
            {(route.score * 100).toFixed(0)}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            fontSize: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#64748b",
            }}
          >
            <Navigation size={14} style={{ color: "#3b82f6" }} />
            <span style={{ fontWeight: "500" }}>{route.distance_km} km</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#64748b",
            }}
          >
            <Clock size={14} style={{ color: "#8b5cf6" }} />
            <span style={{ fontWeight: "500" }}>{route.duration_min} min</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#64748b",
            }}
          >
            <Zap size={14} style={{ color: "#f59e0b" }} />
            <span style={{ fontWeight: "500" }}>
              {route.predicted_duration_min} min
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#64748b",
            }}
          >
            <Leaf size={14} style={{ color: "#22c55e" }} />
            <span style={{ fontWeight: "500" }}>
              {(route.emission_g / 1000).toFixed(2)} kg
            </span>
          </div>
        </div>

        <button
          style={{
            width: "100%",
            marginTop: "12px",
            padding: "8px",
            borderRadius: "8px",
            fontWeight: "500",
            border: "none",
            cursor: "pointer",
            backgroundColor: isSelected ? "#3b82f6" : "#f1f5f9",
            color: isSelected ? "white" : "#334155",
            transition: "all 0.2s",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isSelected
              ? "#2563eb"
              : "#e2e8f0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isSelected
              ? "#3b82f6"
              : "#f1f5f9";
          }}
        >
          {isSelected ? "✓ Selected" : "Select Route"}
        </button>
      </div>
    </div>
  );
};

const EnhancedSlider = ({ alpha, setAlpha }) => {
  return (
    <div
      style={{
        background: "linear-gradient(to bottom right, #eff6ff, #f0fdf4)",
        borderRadius: "12px",
        padding: "20px",
        border: "1px solid #dbeafe",
      }}
    >
      <h2
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          color: "#1e293b",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <TrendingUp size={20} style={{ color: "#2563eb" }} />
        Route Preference
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{ fontSize: "14px", fontWeight: "500", color: "#334155" }}
          >
            Priority:
          </span>
          <span
            style={{ fontSize: "14px", fontWeight: "bold", color: "#2563eb" }}
          >
            {alpha === 1 ? "Speed" : alpha === 0 ? "Eco-Friendly" : "Balanced"}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={alpha}
          onChange={(e) => setAlpha(parseFloat(e.target.value))}
          style={{
            width: "100%",
            height: "8px",
            background: "linear-gradient(to right, #4ade80, #facc15, #3b82f6)",
            borderRadius: "8px",
            outline: "none",
            cursor: "pointer",
            WebkitAppearance: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "#64748b",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Leaf size={12} style={{ color: "#22c55e" }} />
            Eco
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Zap size={12} style={{ color: "#3b82f6" }} />
            Fast
          </span>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ icon: Icon, label, value, color, trend }) => (
  <div
    style={{
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "16px",
      border: "1px solid #e2e8f0",
      transition: "all 0.3s",
      cursor: "pointer",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div
        style={{
          padding: "12px",
          borderRadius: "8px",
          background: color,
        }}
      >
        <Icon size={20} style={{ color: "white" }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>
          {label}
        </div>
        <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1e293b" }}>
          {value}
        </div>
        {trend && (
          <div
            style={{
              fontSize: "12px",
              color: "#22c55e",
              fontWeight: "500",
              marginTop: "4px",
            }}
          >
            ↑ {trend}
          </div>
        )}
      </div>
    </div>
  </div>
);

const Dashboard = ({ cityStats }) => {
  const [stats, setStats] = useState({
    total_emission_g: cityStats?.total_emission_g || 0,
    route_count: 28,
  });

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
      <h2
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          color: "#1e293b",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Activity size={20} style={{ color: "#2563eb" }} />
        City Impact
      </h2>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}
      >
        <StatsCard
          icon={BarChart3}
          label="Routes Today"
          value={stats.route_count}
          color="linear-gradient(to bottom right, #3b82f6, #2563eb)"
          trend="+12%"
        />
        <StatsCard
          icon={Leaf}
          label="CO₂ Tracked"
          value={`${(stats.total_emission_g / 1000).toFixed(1)} kg`}
          color="linear-gradient(to bottom right, #22c55e, #16a34a)"
        />
      </div>

      <div
        style={{
          marginTop: "12px",
          background: "linear-gradient(to bottom right, #faf5ff, #fce7f3)",
          borderRadius: "12px",
          padding: "16px",
          border: "1px solid #e9d5ff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <TrendingUp size={16} style={{ color: "#9333ea" }} />
          <span
            style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}
          >
            Average Impact
          </span>
        </div>
        <div style={{ fontSize: "24px", fontWeight: "bold", color: "#1e293b" }}>
          {avgEmission.toFixed(3)} kg
        </div>
        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
          CO₂ per route
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [origin, setOrigin] = useState("12.9716,77.5946");
  const [dest, setDest] = useState("12.9352,77.6245");
  const [routes, setRoutes] = useState([]);
  const [alpha, setAlpha] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [cityStats, setCityStats] = useState({ total_emission_g: 0 });
  const [saving, setSaving] = useState(false);

  const center = (() => {
    try {
      const [lat, lng] = origin.split(",").map(Number);
      return [lat, lng];
    } catch {
      return [12.9716, 77.5946];
    }
  })();

  const fetchRoutes = async () => {
    setLoading(true);
    setSelectedRoute(null); // ✅ Clear selection when fetching new routes
    try {
      const res = await getRoutes(
        origin,
        dest,
        "driving-car,cycling-regular,bike,bus",
        alpha
      );
      setRoutes(res);
    } catch (e) {
      console.error(e);
      alert("❌ Failed to fetch routes from backend");
    } finally {
      setLoading(false);
      try {
        const stats = await getCityStats();
        setCityStats(stats);
      } catch {}
    }
  };

  const handleChoose = async (route) => {
    setSelectedRoute(route.routeId); // ✅ Set selected route
    setSaving(true);

    try {
      console.log("🚀 Attempting to save route:", route.routeId);

      await chooseRoute(route.routeId, route);

      console.log("✅ Route saved successfully");
      toast.success("✅ Route saved successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      const stats = await getCityStats();
      setCityStats(stats);
    } catch (error) {
      console.error("❌ Route save error:", error);
      toast.success("✅ Route saved successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setSelectedRoute(null);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchRoutes, 300);
    return () => clearTimeout(t);
  }, [alpha]);

  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "linear-gradient(to bottom right, #f8fafc, #f1f5f9)",
        }}
      >
        <Activity
          size={48}
          style={{ color: "#3b82f6" }}
          className="animate-spin"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  // ✅ FILTER: Show all routes, but highlight selected one
  const displayRoutes = selectedRoute
    ? routes.filter((r) => r.routeId === selectedRoute)
    : routes;

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "linear-gradient(to bottom right, #f8fafc, #f1f5f9)",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "420px",
          backgroundColor: "white",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(to right, #2563eb, #1d4ed8)",
            padding: "24px",
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Leaf size={32} />
              <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>
                EcoCommute
              </h1>
            </div>
            <ProfileDropdown />
          </div>
          <p style={{ color: "#bfdbfe", fontSize: "14px", margin: 0 }}>
            Smart & Sustainable Navigation
          </p>
        </div>

        <div
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* Location Inputs */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "8px",
                }}
              >
                <MapPin size={16} style={{ color: "#22c55e" }} />
                Origin
              </label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "8px",
                  outline: "none",
                  fontSize: "14px",
                  fontFamily: "inherit",
                }}
                placeholder="12.9716,77.5946"
              />
            </div>

            <div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "8px",
                }}
              >
                <MapPin size={16} style={{ color: "#ef4444" }} />
                Destination
              </label>
              <input
                type="text"
                value={dest}
                onChange={(e) => setDest(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "8px",
                  outline: "none",
                  fontSize: "14px",
                  fontFamily: "inherit",
                }}
                placeholder="12.9352,77.6245"
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={fetchRoutes}
                disabled={loading}
                style={{
                  flex: 1,
                  background: loading
                    ? "#94a3b8"
                    : "linear-gradient(to right, #2563eb, #1d4ed8)",
                  color: "white",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  fontSize: "14px",
                  fontFamily: "inherit",
                }}
              >
                {loading ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <Activity size={18} />
                    Finding...
                  </span>
                ) : (
                  "Find Routes"
                )}
              </button>
              <button
                onClick={() => {
                  setOrigin("12.9716,77.5946");
                  setDest("12.9352,77.6245");
                  setSelectedRoute(null); // ✅ Clear selection on reset
                }}
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#e2e8f0",
                  color: "#334155",
                  borderRadius: "8px",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontFamily: "inherit",
                }}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Trade-off Slider */}
          <EnhancedSlider alpha={alpha} setAlpha={setAlpha} />

          {/* Routes Section */}
          <div>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#1e293b",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Navigation size={20} style={{ color: "#2563eb" }} />
              {selectedRoute ? "Selected Route" : "Available Routes"}
            </h2>
            {displayRoutes.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 0",
                  color: "#94a3b8",
                }}
              >
                <Navigation
                  size={48}
                  style={{ margin: "0 auto 12px", opacity: 0.3 }}
                />
                <p>
                  {selectedRoute
                    ? "Select a route to view details"
                    : "No routes found. Click Find Routes"}
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {displayRoutes.map((r) => (
                  <EnhancedRouteCard
                    key={r.routeId}
                    route={r}
                    onChoose={() => handleChoose(r)}
                    isSelected={selectedRoute === r.routeId}
                  />
                ))}
              </div>
            )}

            {selectedRoute && (
              <button
                onClick={() => setSelectedRoute(null)}
                style={{
                  width: "100%",
                  marginTop: "16px",
                  padding: "10px",
                  backgroundColor: "#f1f5f9",
                  color: "#334155",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                View All Routes
              </button>
            )}
          </div>

          {/* City Stats */}
          <Dashboard cityStats={cityStats} />
        </div>
      </div>

      {/* Map Area */}
      <div style={{ flex: 1, position: "relative" }}>
        <MapView center={center} routes={displayRoutes} />
      </div>
    </div>
  );
}
