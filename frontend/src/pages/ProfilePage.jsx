import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Leaf, Calendar, MapPin, Award, Route, Share2, TreePine, TrendingUp } from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const displayUser = {
    name: user?.name || "Lucky Singh",
    joinedDate: user?.joinedDate || "Jan 2024",
    location: user?.location || "Amritsar, Punjab",
  };

  // Dummy stats
  const stats = {
    routes: 127,
    co2SavedKg: 235, // kg
    rewardsPoints: 420,
    tripsShared: 58,
    treesPlanted: 3,
  };

  const initials = (displayUser.name || "")
    .split(" ")
    .map((n) => n[0] || "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const styles = {
    container: {
      height: "100vh",                  // make container full viewport height
      overflowY: "auto",               // enable vertical scrolling inside the page
      WebkitOverflowScrolling: "touch",// smooth scrolling on iOS
      background: "linear-gradient(to bottom right, #f8fafc, #f1f5f9, #f8fafc)",
    },
    header: {
      background: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid #e2e8f0",
      position: "sticky",
      top: 0,
      zIndex: 50,
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    headerContent: {
      maxWidth: "1280px",
      margin: "0 auto",
      padding: "16px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    backButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: "#475569",
      background: "transparent",
      border: "none",
      cursor: "pointer",
      transition: "all 0.3s",
      fontWeight: 500,
    },
    logoContainer: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    logoBox: {
      width: "36px",
      height: "36px",
      background: "#10b981",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 4px 6px rgba(16, 185, 129, 0.3)",
    },
    logoText: {
      fontSize: "18px",
      fontWeight: "bold",
      color: "#0f172a",
    },
    main: {
      maxWidth: "1280px",
      margin: "0 auto",
      padding: "32px 24px",
    },
    heroCard: {
      background: "#ffffff",
      borderRadius: "24px",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      overflow: "hidden",
      marginBottom: "32px",
      border: "1px solid #e2e8f0",
    },
    banner: {
      height: "160px",
      background: "linear-gradient(to bottom right, #34d399, #14b8a6, #06b6d4)",
      position: "relative",
      overflow: "hidden",
    },
    bannerGradient: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(to bottom, transparent, transparent, rgba(0, 0, 0, 0.1))",
    },
    bannerPattern: {
      position: "absolute",
      inset: 0,
      opacity: 0.2,
      backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
      backgroundSize: "32px 32px",
    },
    profileContent: {
      padding: "0 32px 32px",
      marginTop: "-80px",
      position: "relative",
    },
    profileFlex: {
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      marginBottom: "24px",
    },
    avatar: {
      width: "144px",
      height: "144px",
      borderRadius: "24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "48px",
      fontWeight: "bold",
      background: "linear-gradient(135deg, #10b981, #06b6d4)",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      border: "4px solid white",
    },
    profileInfo: {
      flex: 1,
    },
    userName: {
      fontSize: "36px",
      fontWeight: "bold",
      color: "#0f172a",
      marginBottom: "12px",
    },
    badges: {
      display: "flex",
      flexWrap: "wrap",
      gap: "16px",
      color: "#475569",
    },
    badge: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      background: "#f1f5f9",
      padding: "6px 12px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: 500,
    },
    statsBar: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "16px",
      paddingTop: "24px",
      borderTop: "1px solid #e2e8f0",
    },
    statItem: {
      textAlign: "center",
    },
    statValue: {
      fontSize: "30px",
      fontWeight: "bold",
      color: "#0f172a",
    },
    statLabel: {
      fontSize: "14px",
      color: "#475569",
      marginTop: "4px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: "24px",
    },
    card: {
      background: "#ffffff",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      border: "1px solid #e2e8f0",
      transition: "box-shadow 0.3s",
    },
    cardHeader: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: "16px",
    },
    iconBox: {
      width: "48px",
      height: "48px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "transform 0.3s",
    },
    categoryBadge: {
      padding: "4px 8px",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: 600,
    },
    cardTitle: {
      fontSize: "14px",
      fontWeight: 600,
      color: "#475569",
      marginBottom: "8px",
    },
    cardValue: {
      fontSize: "36px",
      fontWeight: "bold",
      color: "#0f172a",
      marginBottom: "12px",
    },
    cardUnit: {
      fontSize: "18px",
      color: "#64748b",
    },
    cardDesc: {
      fontSize: "14px",
      color: "#475569",
      lineHeight: "1.6",
    },
    achievementCard: {
      background: "linear-gradient(to bottom right, #10b981, #14b8a6)",
      borderRadius: "16px",
      padding: "24px",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      border: "1px solid #059669",
      position: "relative",
      overflow: "hidden",
    },
    achievementCircle1: {
      position: "absolute",
      top: 0,
      right: 0,
      width: "128px",
      height: "128px",
      background: "rgba(255, 255, 255, 0.1)",
      borderRadius: "50%",
      marginRight: "-64px",
      marginTop: "-64px",
    },
    achievementCircle2: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "96px",
      height: "96px",
      background: "rgba(255, 255, 255, 0.1)",
      borderRadius: "50%",
      marginLeft: "-48px",
      marginBottom: "-48px",
    },
    achievementContent: {
      position: "relative",
      zIndex: 10,
    },
    achievementIconBox: {
      width: "48px",
      height: "48px",
      background: "rgba(255, 255, 255, 0.2)",
      backdropFilter: "blur(4px)",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "16px",
    },
    achievementTitle: {
      fontSize: "14px",
      fontWeight: 600,
      color: "#d1fae5",
      marginBottom: "8px",
    },
    achievementValue: {
      fontSize: "36px",
      fontWeight: "bold",
      color: "white",
      marginBottom: "12px",
    },
    achievementDesc: {
      fontSize: "14px",
      color: "#d1fae5",
      lineHeight: "1.6",
    },
  };

  // Media query styles
  const mediaStyles = `
    @media (min-width: 640px) {
      .profile-flex { flex-direction: row; align-items: flex-end; }
      .profile-info { padding-bottom: 16px; }
      .stats-bar { grid-template-columns: repeat(4, 1fr); }
    }
    @media (min-width: 768px) {
      .grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (min-width: 1024px) {
      .grid { grid-template-columns: repeat(3, 1fr); }
    }
    .card:hover { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
    .icon-box:hover { transform: scale(1.1); }
    .back-button:hover { color: #0f172a; gap: 12px; }
  `;

  return (
    <div style={styles.container}>
      <style>{mediaStyles}</style>
      
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <button
            onClick={() => navigate("/")}
            style={styles.backButton}
            className="back-button"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div style={styles.logoContainer}>
            <div style={styles.logoBox}>
              <Leaf size={20} style={{ color: "white" }} />
            </div>
            <h1 style={styles.logoText}>EcoCommute</h1>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {/* Hero Profile Section */}
        <div style={styles.heroCard}>
          {/* Gradient Banner */}
          <div style={styles.banner}>
            <div style={styles.bannerGradient}></div>
            <div style={styles.bannerPattern}></div>
          </div>
          
          {/* Profile Info */}
          <div style={styles.profileContent}>
            <div style={styles.profileFlex} className="profile-flex">
              <div style={styles.avatar}>
                {initials || "LS"}
              </div>
              
              <div style={styles.profileInfo} className="profile-info">
                <h2 style={styles.userName}>{displayUser.name}</h2>
                <div style={styles.badges}>
                  <div style={styles.badge}>
                    <Calendar size={16} style={{ color: "#059669" }} />
                    <span>Joined {displayUser.joinedDate}</span>
                  </div>
                  <div style={styles.badge}>
                    <MapPin size={16} style={{ color: "#059669" }} />
                    <span>{displayUser.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div style={styles.statsBar} className="stats-bar">
              <div style={styles.statItem}>
                <p style={styles.statValue}>{stats.routes}</p>
                <p style={styles.statLabel}>Total Routes</p>
              </div>
              <div style={styles.statItem}>
                <p style={{ ...styles.statValue, color: "#059669" }}>{stats.co2SavedKg}</p>
                <p style={styles.statLabel}>CO₂ Saved (kg)</p>
              </div>
              <div style={styles.statItem}>
                <p style={{ ...styles.statValue, color: "#d97706" }}>{stats.rewardsPoints}</p>
                <p style={styles.statLabel}>Reward Points</p>
              </div>
              <div style={styles.statItem}>
                <p style={{ ...styles.statValue, color: "#2563eb" }}>{stats.tripsShared}</p>
                <p style={styles.statLabel}>Shared Trips</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div style={styles.grid} className="grid">
          {/* CO2 Impact Card */}
          <div style={styles.card} className="card">
            <div style={styles.cardHeader}>
              <div style={{ ...styles.iconBox, background: "#d1fae5" }} className="icon-box">
                <TrendingUp size={24} style={{ color: "#059669" }} />
              </div>
              <div style={{ ...styles.categoryBadge, background: "#d1fae5", color: "#047857" }}>
                <span>Environmental</span>
              </div>
            </div>
            <h3 style={styles.cardTitle}>Carbon Footprint Saved</h3>
            <p style={styles.cardValue}>
              {stats.co2SavedKg} <span style={styles.cardUnit}>kg</span>
            </p>
            <p style={styles.cardDesc}>
              Equivalent to removing <span style={{ fontWeight: 600, color: "#059669" }}>{Math.max(1, Math.round(stats.co2SavedKg / 21))} cars</span> from the road for a full day
            </p>
          </div>

          {/* Rewards Card */}
          <div style={styles.card} className="card">
            <div style={styles.cardHeader}>
              <div style={{ ...styles.iconBox, background: "#fef3c7" }} className="icon-box">
                <Award size={24} style={{ color: "#d97706" }} />
              </div>
              <div style={{ ...styles.categoryBadge, background: "#fef3c7", color: "#b45309" }}>
                <span>Rewards</span>
              </div>
            </div>
            <h3 style={styles.cardTitle}>Available Points</h3>
            <p style={styles.cardValue}>
              {stats.rewardsPoints} <span style={styles.cardUnit}>pts</span>
            </p>
            <p style={styles.cardDesc}>
              Redeem for discounts, partner offers, and exclusive eco-friendly rewards
            </p>
          </div>

          {/* Sustainability Card */}
          <div style={styles.card} className="card">
            <div style={styles.cardHeader}>
              <div style={{ ...styles.iconBox, background: "#dbeafe" }} className="icon-box">
                <Share2 size={24} style={{ color: "#2563eb" }} />
              </div>
              <div style={{ ...styles.categoryBadge, background: "#dbeafe", color: "#1d4ed8" }}>
                <span>Community</span>
              </div>
            </div>
            <h3 style={styles.cardTitle}>Shared Trips</h3>
            <p style={styles.cardValue}>{stats.tripsShared}</p>
            <p style={styles.cardDesc}>
              Contributing to carpooling and reducing traffic congestion together
            </p>
          </div>

          {/* Routes Card */}
          <div style={styles.card} className="card">
            <div style={styles.cardHeader}>
              <div style={{ ...styles.iconBox, background: "#f3e8ff" }} className="icon-box">
                <Route size={24} style={{ color: "#9333ea" }} />
              </div>
              <div style={{ ...styles.categoryBadge, background: "#f3e8ff", color: "#7e22ce" }}>
                <span>Navigation</span>
              </div>
            </div>
            <h3 style={styles.cardTitle}>Optimized Routes</h3>
            <p style={styles.cardValue}>{stats.routes}</p>
            <p style={styles.cardDesc}>
              Total eco-friendly routes taken with optimized fuel efficiency
            </p>
          </div>

          {/* Trees Planted Card */}
          <div style={styles.card} className="card">
            <div style={styles.cardHeader}>
              <div style={{ ...styles.iconBox, background: "#dcfce7" }} className="icon-box">
                <TreePine size={24} style={{ color: "#16a34a" }} />
              </div>
              <div style={{ ...styles.categoryBadge, background: "#dcfce7", color: "#15803d" }}>
                <span>Impact</span>
              </div>
            </div>
            <h3 style={styles.cardTitle}>Trees Planted</h3>
            <p style={styles.cardValue}>{stats.treesPlanted}</p>
            <p style={styles.cardDesc}>
              Through program contributions and eco-initiative partnerships
            </p>
          </div>

          {/* Achievement Badge */}
          <div style={styles.achievementCard}>
            <div style={styles.achievementCircle1}></div>
            <div style={styles.achievementCircle2}></div>
            <div style={styles.achievementContent}>
              <div style={styles.achievementIconBox}>
                <Award size={24} style={{ color: "white" }} />
              </div>
              <h3 style={styles.achievementTitle}>Eco Champion</h3>
              <p style={styles.achievementValue}>Level 4</p>
              <p style={styles.achievementDesc}>
                Keep up the great work! You're making a real difference for our planet
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;