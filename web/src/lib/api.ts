import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const AUTH_KEYS = {
  TOKEN: "bluewaste_token",
  REFRESH_TOKEN: "bluewaste_refresh_token",
  USER: "bluewaste_user",
} as const;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
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

// Mutex & subscriber queue for concurrent requests arriving during an in-flight refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

function handleForceLogout() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(AUTH_KEYS.TOKEN);
  localStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(AUTH_KEYS.USER);

  if (onUnauthorizedCallback && window.location.pathname !== "/login") {
    onUnauthorizedCallback();
  } else if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

// Handle 401 responses with automatic silent refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    // If there is no response, status is not 401, or server-side, reject normally
    if (!error.response || error.response.status !== 401 || !originalRequest || typeof window === "undefined") {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || "";

    // Never attempt silent refresh on authentication endpoints (login, register, logout, or refresh itself)
    if (
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/logout") ||
      requestUrl.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    // If this request already failed after a refresh retry, clear session and redirect
    if (originalRequest._retry) {
      handleForceLogout();
      return Promise.reject(error);
    }

    // If a refresh is already underway, queue this request until the new token arrives
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const storedRefreshToken = localStorage.getItem(AUTH_KEYS.REFRESH_TOKEN);

      // Perform refresh using a bare axios call so it bypasses our interceptor
      const refreshResponse = await axios.post(
        `${API_URL}/auth/refresh`,
        { refreshToken: storedRefreshToken },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );

      const newAccessToken = refreshResponse.data?.token;
      if (!newAccessToken) {
        throw new Error("No token returned by refresh endpoint");
      }

      // Persist the new access token
      localStorage.setItem(AUTH_KEYS.TOKEN, newAccessToken);

      // If a sliding refresh token was returned, persist it as well
      if (refreshResponse.data?.refreshToken) {
        localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, refreshResponse.data.refreshToken);
      }

      // Update default authorization headers
      api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      processQueue(null, newAccessToken);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      handleForceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
