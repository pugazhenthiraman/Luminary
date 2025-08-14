import axios from "axios";
import { useAuthStore } from "../stores/useAuthStore";

// Use environment variable or default to localhost:5000
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Set to true if backend uses cookies/sessions
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and auto-logout on 401
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // Prefer a config flag that doesn't go over the wire (no CORS issues).
    const noLogoutFlag =
      originalRequest?._noLogoutOn401 === true ||
      originalRequest?.noLogoutOn401 === true;
    // Back-compat: also allow an opt-in header if already used elsewhere
    const noLogoutHeader =
      originalRequest?.headers?.["X-No-Logout-On-401"] ||
      originalRequest?.headers?.["x-no-logout-on-401"];
    const NO_LOGOUT_ON_401 =
      noLogoutFlag || noLogoutHeader === true || noLogoutHeader === "true";

    if (error.response?.status === 403) {
      const SKIP_BLOCK =
        originalRequest?._noBlockOn403 === true ||
        originalRequest?.noBlockOn403 === true;
      if (!SKIP_BLOCK) {
        const raw = error.response?.data?.message || "";
        const message =
          raw || "Your account has been suspended or deactivated.";
        const { blockSession } = useAuthStore.getState();
        blockSession(message);
      }
      return Promise.reject(error);
    }

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken, logout } = useAuthStore.getState();

        if (refreshToken) {
          // Try to refresh the token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          if (response.data?.accessToken) {
            // Update the store with new tokens
            const { login, user } = useAuthStore.getState();
            login(user, response.data.accessToken, refreshToken);

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
            return axiosInstance(originalRequest);
          }
        }
        // If no refreshToken or refresh fails
        if (!NO_LOGOUT_ON_401) {
          logout();
        }
        // Don't redirect here - let the component handle it based on context
        return Promise.reject(error);
      } catch (refreshError) {
        // If refresh fails, optionally skip logout for non-critical calls
        const { logout } = useAuthStore.getState();
        if (!NO_LOGOUT_ON_401) {
          logout();
        }
        // Don't redirect here - let the component handle it based on context
        return Promise.reject(refreshError);
      }
    }

    // If not handled above, reject
    if (error.response?.status === 401) {
      // If already retried or no refresh
      const { logout } = useAuthStore.getState();
      if (!NO_LOGOUT_ON_401) {
        logout();
      }
      // Don't redirect here - let the component handle it based on context
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
