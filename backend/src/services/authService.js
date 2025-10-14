import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../db/index.js";

/**
 * Register a new user
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {object} user info and JWT token
 */
export const registerUser = async (name, email, password) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({ name, email, password: hashedPassword });
  await user.save();

  // Generate JWT token
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    token,
  };
};

/**
 * Login user
 * @param {string} email
 * @param {string} password
 * @returns {object} user info and JWT token
 */
export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Compare password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    token,
  };
};

/**
 * Get user by ID
 * @param {string} userId
 * @returns {object} user info
 */
export const getUserById = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    preferences: user.preferences,
    created_at: user.created_at,
  };
};

/**
 * Update user profile
 * @param {string} userId
 * @param {string} name
 * @param {object} preferences
 * @returns {object} updated user info
 */
export const updateUserProfile = async (userId, name, preferences) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (name) user.name = name;
  if (preferences) user.preferences = preferences;
  user.updated_at = Date.now();

  await user.save();

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    preferences: user.preferences,
  };
};
