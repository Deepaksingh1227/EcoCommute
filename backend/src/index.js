// backend/src/index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import { initDb } from "./db/index.js";
import apiRoutes from "./routes/apiRoutes.js";
import authRoutes from "./routes/authRoutes.js"; // ✅ Import auth routes
import healthRoutes from "./routes/health.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", apiRoutes);
app.use("/api/auth", authRoutes); // ✅ Add auth routes
app.use("/health", healthRoutes);

// Server port
const PORT = process.env.PORT || 4000;

// Check if DATABASE_URL exists before connecting
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not set in .env. Cannot start server.");
  process.exit(1);
}

// Initialize MongoDB and start server
initDb()
  .then(() => {
    console.log("✅ DB connected successfully.");
    app.listen(PORT, () => {
      console.log(`🚀 Backend running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB init error:", err);
    process.exit(1);
  });