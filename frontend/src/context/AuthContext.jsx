import React, { createContext, useState, useContext, useEffect } from "react";
import { getCurrentUser, initializeAuth, logout as authLogout } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        initializeAuth();
        const token = localStorage.getItem("token");
        if (token) {
          const userData = await getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        authLogout();
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const logout = () => {
    authLogout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};