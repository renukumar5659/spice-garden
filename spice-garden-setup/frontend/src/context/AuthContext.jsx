import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import * as authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // LOAD USER WHEN APP STARTS
  // =========================================================

  useEffect(() => {
    const accessToken = localStorage.getItem("sg_access");

    if (!accessToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    async function loadProfile() {
      try {
        const profile = await authService.fetchProfile();

        if (!mounted) return;

        console.log("Loaded profile:", profile);

        setUser(profile);
      } catch (error) {
        console.error(
          "Failed to load profile:",
          error
        );

        /*
         * IMPORTANT:
         *
         * Do not immediately remove the authentication
         * state here.
         *
         * The access token already exists in localStorage.
         *
         * If the backend temporarily returns an error,
         * ProtectedRoute should not immediately treat the
         * user as logged out.
         */

        if (!mounted) return;

        const status = error?.response?.status;

        /*
         * Only clear the user for authentication errors.
         *
         * 401 = token is invalid/expired
         *
         * Other errors such as 500 should not immediately
         * force the user back to the login page.
         */

        if (status === 401) {
          localStorage.removeItem("sg_access");
          localStorage.removeItem("sg_refresh");

          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // LOGIN
  // =========================================================

  async function login(email, password) {
    try {
      const loggedInUser = await authService.login(
        email,
        password
      );

      console.log(
        "Login user:",
        loggedInUser
      );

      setUser(loggedInUser);

      return loggedInUser;
    } catch (error) {
      console.error(
        "Login failed:",
        error
      );

      throw error;
    }
  }

  // =========================================================
  // REGISTER
  // =========================================================

  async function register(payload) {
    return authService.register(payload);
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  async function logout() {
    try {
      await authService.logout();
    } catch (error) {
      console.error(
        "Logout API error:",
        error
      );
    }

    // Clear authentication tokens
    localStorage.removeItem("sg_access");
    localStorage.removeItem("sg_refresh");

    // Clear cart when user logs out
    localStorage.removeItem("sg_cart");

    // Tell CartContext to clear its state immediately
    window.dispatchEvent(
      new Event("sg_logout")
    );

    setUser(null);
  }

  // =========================================================
  // REFRESH PROFILE
  // =========================================================

  async function refreshProfile() {
    try {
      const profile =
        await authService.fetchProfile();

      console.log(
        "Refreshed profile:",
        profile
      );

      setUser(profile);

      return profile;
    } catch (error) {
      console.error(
        "Profile refresh failed:",
        error
      );

      throw error;
    }
  }

  // =========================================================
  // AUTH STATE
  // =========================================================

  const value = {
    user,
    loading,

    isAuthenticated:
      !!user ||
      !!localStorage.getItem("sg_access"),

    isAdmin:
      !!user?.is_staff ||
      !!user?.is_superuser,

    login,
    register,
    logout,
    refreshProfile,
  };

  // =========================================================
  // PROVIDER
  // =========================================================

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// =========================================================
// USE AUTH
// =========================================================

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return ctx;
}