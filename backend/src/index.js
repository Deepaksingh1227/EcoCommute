// backend/src/index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import { initDb } from "./db/index.js";
import apiRoutes from "./routes/apiRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import healthRoutes from "./routes/health.js";

const app = express();

// ✅ CORS Configuration - YE CHANGE KARNA HAI
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://ecocommute-frontend.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use("/api", apiRoutes);
app.use("/api/auth", authRoutes);
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