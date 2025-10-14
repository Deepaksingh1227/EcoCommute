import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import "./styles/tailwind.css";
import "leaflet/dist/leaflet.css";

import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import LoginForm from "./components/Auth/LoginForm";
import SignupForm from "./components/Auth/SignupForm";

function AuthenticatedApp() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginForm onSwitchToSignup={() => window.location.href = '/signup'} onLoginSuccess={() => window.location.href = '/'} />} />
          <Route path="/signup" element={<SignupForm onSwitchToLogin={() => window.location.href = '/login'} onSignupSuccess={() => window.location.href = '/'} />} />
          <Route path="/" element={<App />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthenticatedApp />
  </StrictMode>
);