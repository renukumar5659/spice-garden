import axios from "axios";

// ============================================================
// API BASE URL
// ============================================================

// Production:
// VITE_API_URL = https://spice-garden-backend-f1zi.onrender.com/api
//
// Local development:
// VITE_API_URL = /api

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "/api"
).replace(/\/+$/, "");

// ============================================================
// AXIOS INSTANCE
// ============================================================

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// ============================================================
// TOKEN HELPERS
// ============================================================

export function getAccessToken() {
  return localStorage.getItem("sg_access");
}

export function getRefreshToken() {
  return localStorage.getItem("sg_refresh");
}

// ============================================================
// SAVE TOKENS
// ============================================================

export function setTokens({
  access,
  refresh,
}) {
  if (access) {
    localStorage.setItem(
      "sg_access",
      access
    );
  }

  if (refresh) {
    localStorage.setItem(
      "sg_refresh",
      refresh
    );
  }
}

// ============================================================
// CLEAR TOKENS
// ============================================================

export function clearTokens() {
  localStorage.removeItem("sg_access");
  localStorage.removeItem("sg_refresh");
}

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    /*
     * IMPORTANT:
     * Do NOT manually set Content-Type here.
     *
     * This allows Axios to correctly handle:
     *
     * FormData
     * multipart/form-data
     * image uploads
     */

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================
// REFRESH CONTROL
// ============================================================

let refreshPromise = null;

// ============================================================
// REFRESH ACCESS TOKEN
// ============================================================

async function refreshAccessToken() {
  const refresh =
    getRefreshToken();

  if (!refresh) {
    throw new Error(
      "No refresh token available."
    );
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = axios
    .post(
      `${API_BASE_URL}/auth/token/refresh/`,
      {
        refresh,
      },
      {
        headers: {
          "Content-Type":
            "application/json",
        },
      }
    )
    .then((response) => {
      const newAccess =
        response.data?.access;

      const newRefresh =
        response.data?.refresh;

      if (!newAccess) {
        throw new Error(
          "Refresh response did not contain an access token."
        );
      }

      localStorage.setItem(
        "sg_access",
        newAccess
      );

      if (newRefresh) {
        localStorage.setItem(
          "sg_refresh",
          newRefresh
        );
      }

      return newAccess;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest =
      error.config;

    // ========================================================
    // NO SERVER RESPONSE
    // ========================================================

    if (!error.response) {
      console.error(
        "API connection error:",
        error.message
      );

      return Promise.reject(error);
    }

    // ========================================================
    // ONLY HANDLE 401
    // ========================================================

    if (
      error.response.status !== 401
    ) {
      return Promise.reject(error);
    }

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // ========================================================
    // PREVENT INFINITE RETRY
    // ========================================================

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    const requestURL =
      originalRequest.url || "";

    // ========================================================
    // NEVER REFRESH REFRESH ENDPOINT
    // ========================================================

    if (
      requestURL.includes(
        "/auth/token/refresh/"
      )
    ) {
      clearTokens();

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refresh =
      getRefreshToken();

    if (!refresh) {
      clearTokens();

      return Promise.reject(error);
    }

    // ========================================================
    // REFRESH TOKEN
    // ========================================================

    try {
      const newAccess =
        await refreshAccessToken();

      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newAccess}`;

      return api(originalRequest);
    } catch (refreshError) {
      console.error(
        "Token refresh failed:",
        refreshError?.response?.data ||
          refreshError?.message
      );

      clearTokens();

      return Promise.reject(
        refreshError
      );
    }
  }
);

// ============================================================
// EXPORT
// ============================================================

export default api;