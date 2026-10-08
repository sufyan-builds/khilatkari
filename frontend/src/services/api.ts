import axios from "axios";

// Production Render backend domain
const PROD_API_ORIGIN = "https://ms-fashion-closet.onrender.com";

const computeBaseUrl = (): string => {
  const envUrl = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");
  if (envUrl) {
    return envUrl.endsWith("/api") ? envUrl : `${envUrl}/api`;
  }
  // When running in production (Vercel deployment or built SPA), default to Render backend
  if (
    import.meta.env.PROD ||
    (typeof window !== "undefined" &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1")
  ) {
    return `${PROD_API_ORIGIN}/api`;
  }
  // In local development, use Vite dev proxy (/api -> localhost:8000)
  return "/api";
};

export const baseURL = computeBaseUrl();

const api = axios.create({
  baseURL,
  timeout: 60000, // 60s timeout accommodates Render cold-start spin-ups
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach admin JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ms_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("ms_admin_token");
      if (window.location.pathname.startsWith("/admin") && !window.location.pathname.includes("/login")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
