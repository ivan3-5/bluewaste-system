import axios from "axios";

export const AUTH_KEYS = {
  TOKEN: "bluewaste_token",
  USER: "bluewaste_user",
} as const;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let onUnauthorizedCallback: (() => void) | null = null;

/**
 * Register a custom navigation callback for 401 Unauthorized responses
 * (e.g., Next.js router.push('/login') inside a top-level provider)
 * instead of forcing a hard page reload.
 */
export function setUnauthorizedHandler(callback: () => void): void {
  onUnauthorizedCallback = callback;
}

// Attach JWT token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(AUTH_KEYS.TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem(AUTH_KEYS.TOKEN);
      localStorage.removeItem(AUTH_KEYS.USER);
      if (onUnauthorizedCallback && window.location.pathname !== "/login") {
        onUnauthorizedCallback();
      } else if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
