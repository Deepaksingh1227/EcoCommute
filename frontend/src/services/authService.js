import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://ecocommute-backend.onrender.com";

// Set auth token in axios headers
export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete axios.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
};

// Initialize token from localStorage
export const initializeAuth = () => {
  const token = localStorage.getItem("token");
  if (token) {
    setAuthToken(token);
  }
};

// Signup
export const signup = async (name, email, password) => {
  try {
    const res = await axios.post(`${API_BASE}/auth/signup`, {
      name,
      email,
      password,
    });
    if (res.data.token) {
      setAuthToken(res.data.token);
    }
    return res.data;
  } catch (error) {
    throw error.response?.data?.error || "Signup failed";
  }
};

// Login
export const login = async (email, password) => {
  try {
    const res = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password,
    });
    if (res.data.token) {
      setAuthToken(res.data.token);
    }
    return res.data;
  } catch (error) {
    throw error.response?.data?.error || "Login failed";
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const res = await axios.get(`${API_BASE}/auth/me`);
    return res.data.user;
  } catch (error) {
    throw error.response?.data?.error || "Failed to get user";
  }
};

// Update profile
export const updateProfile = async (name, preferences) => {
  try {
    const res = await axios.put(`${API_BASE}/auth/profile`, {
      name,
      preferences,
    });
    return res.data.user;
  } catch (error) {
    throw error.response?.data?.error || "Failed to update profile";
  }
};

// Logout
export const logout = () => {
  setAuthToken(null);
  localStorage.removeItem("user");
};
