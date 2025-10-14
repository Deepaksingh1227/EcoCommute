import express from "express";
import {
  registerUser,
  loginUser,
  getUserById,
  updateUserProfile,
} from "../services/authService.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/auth/signup
 * body: { name, email, password }
 */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const result = await registerUser(name, email, password);
    res.status(201).json(result);
  } catch (err) {
    console.error("Signup error:", err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/auth/login
 * body: { email, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password required" });
    }

    const result = await loginUser(email, password);
    res.json(result);
  } catch (err) {
    console.error("Login error:", err);
    res.status(401).json({ error: err.message });
  }
});

/**
 * GET /api/auth/me
 * Protected route - requires JWT token
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await getUserById(req.userId);
    res.json({ user });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/auth/profile
 * Protected route - update user profile
 */
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, preferences } = req.body;
    const user = await updateUserProfile(req.userId, name, preferences);
    res.json({ user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
