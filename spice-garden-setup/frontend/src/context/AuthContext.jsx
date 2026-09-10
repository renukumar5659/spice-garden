import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hasToken = localStorage.getItem("sg_access");

    if (!hasToken) {
      setLoading(false);
      return;
    }

    authService
      .fetchProfile()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const loggedInUser = await authService.login(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function register(payload) {
    return authService.register(payload);
  }

  async function logout() {
    await authService.logout();

    // Clear the shopping cart when the user logs out
    localStorage.removeItem("sg_cart");

    // Tell CartContext that logout happened
    window.dispatchEvent(new Event("sg_logout"));

    setUser(null);
  }

  async function refreshProfile() {
    const profile = await authService.fetchProfile();
    setUser(profile);
    return profile;
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: !!user?.is_staff,
    login,
    register,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}
