import mongoose from "mongoose";

// NOTE: User model is not defined yet. This is a placeholder.
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  preferences: { type: Object },
});

export const User = mongoose.model("User", userSchema);

export const registerUser = async (name, email, password) => {
  // Placeholder function
  console.log("registerUser called with", { name, email, password });
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }
  // NOTE: Password should be hashed before saving
  const user = new User({ name, email, password });
  await user.save();
  return { user: { name, email }, token: "dummy-token" };
};

export const loginUser = async (email, password) => {
  // Placeholder function
  console.log("loginUser called with", { email, password });
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }
  // NOTE: Password should be compared with hashed password
  if (user.password !== password) {
    throw new Error("Invalid credentials");
  }
  return { user: { name: user.name, email }, token: "dummy-token" };
};

export const getUserById = async (userId) => {
  // Placeholder function
  console.log("getUserById called with", { userId });
  return { name: "Test User", email: "test@example.com" };
};

export const updateUserProfile = async (userId, name, preferences) => {
  // Placeholder function
  console.log("updateUserProfile called with", { userId, name, preferences });
  return { name, email: "test@example.com", preferences };
};
