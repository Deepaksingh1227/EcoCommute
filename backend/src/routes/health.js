// backend/src/routes/health.js
import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router; // ✅ ESM-compatible export
