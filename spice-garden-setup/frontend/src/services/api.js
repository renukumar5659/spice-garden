import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({ baseURL: BASE_URL });

function getTokens() {
  return {
    access: localStorage.getItem("sg_access"),
    refresh: localStorage.getItem("sg_refresh"),
  };
}

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem("sg_access", access);
  if (refresh) localStorage.setItem("sg_refresh", refresh);
}

export function clearTokens() {
  localStorage.removeItem("sg_access");
  localStorage.removeItem("sg_refresh");
}

// Attach the access token to every request.
api.interceptors.request.use((config) => {
  const { access } = getTokens();
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

// On a 401, try to refresh the access token once, then retry the request.
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const { refresh } = getTokens();

    if (error.response?.status === 401 && refresh && !original._retry) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${BASE_URL}/auth/token/refresh/`, { refresh })
            .finally(() => {
              refreshPromise = null;
            });
        }
        const { data } = await refreshPromise;
        setTokens({ access: data.access });
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch (refreshError) {
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
