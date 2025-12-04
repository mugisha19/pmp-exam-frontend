/**
 * API Service - Axios Configuration
 * Centralized HTTP client with request/response interceptors
 */

import axios from "axios";
import {
  TOKEN_KEYS,
  STORAGE_KEYS,
  removeStorageItem,
  getStorageItem,
  setStorageItem,
} from "@/constants/storage.constants";
import { AUTH_ENDPOINTS, API_BASE_URL } from "@/constants/api.constants";

// Direct auth service URL for token refresh (bypass proxy)
const AUTH_SERVICE_URL = "http://localhost:8000/api/v1";

// Debug: Log what we're using
console.log("Creating axios with baseURL:", API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Debug: Verify the instance configuration
console.log("Axios instance baseURL:", api.defaults.baseURL);

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

/**
 * Process queued requests after token refresh
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Request Interceptor
 * Attaches Bearer token to all requests
 */
api.interceptors.request.use(
  (config) => {
    // Debug: Log request details
    console.log("API Request:", {
      baseURL: config.baseURL,
      url: config.url,
      fullURL: `${config.baseURL}${config.url}`,
    });

    const token = getStorageItem(TOKEN_KEYS.ACCESS_TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles errors and automatic token refresh
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error.message);
      return Promise.reject({
        message: "Network error. Please check your connection.",
        code: "NETWORK_ERROR",
      });
    }

    const { status } = error.response;

    // Handle 401 Unauthorized - Token expired or invalid
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getStorageItem(TOKEN_KEYS.REFRESH_TOKEN);

      if (!refreshToken) {
        // No refresh token, clear auth and redirect
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh token using direct auth service URL
        console.log("Attempting token refresh...");
        const response = await axios.post(
          `${AUTH_SERVICE_URL}${AUTH_ENDPOINTS.REFRESH_TOKEN}`,
          { refresh_token: refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const { access_token, refresh_token: newRefreshToken } = response.data;
        console.log("Token refresh successful");

        // Store new tokens
        setStorageItem(TOKEN_KEYS.ACCESS_TOKEN, access_token);
        if (newRefreshToken) {
          setStorageItem(TOKEN_KEYS.REFRESH_TOKEN, newRefreshToken);
        }

        // Update authorization header
        api.defaults.headers.common.Authorization = `Bearer ${access_token}`;
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        // Process queued requests
        processQueue(null, access_token);
        isRefreshing = false;

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect
        processQueue(refreshError, null);
        isRefreshing = false;
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden - Email not verified or insufficient permissions
    if (status === 403) {
      const errorMessage = error.response?.data?.detail || "Access forbidden";

      if (errorMessage.includes("email") || errorMessage.includes("verify")) {
        // Email not verified
        console.warn("Email verification required");
      }
    }

    // Handle 404 Not Found
    if (status === 404) {
      console.warn("Resource not found:", originalRequest.url);
    }

    // Handle 422 Validation Error
    if (status === 422) {
      const validationErrors = error.response?.data?.detail;
      if (Array.isArray(validationErrors)) {
        // Format validation errors
        const formattedErrors = validationErrors.map((err) => ({
          field: err.loc?.[1] || "unknown",
          message: err.msg,
        }));
        error.validationErrors = formattedErrors;
      }
    }

    // Handle 500 Internal Server Error
    if (status >= 500) {
      console.error("Server error:", error.response?.data);
    }

    return Promise.reject(error);
  }
);

/**
 * Clear authentication data and redirect to login
 */
const clearAuthAndRedirect = () => {
  // Clear tokens
  removeStorageItem(TOKEN_KEYS.ACCESS_TOKEN);
  removeStorageItem(TOKEN_KEYS.REFRESH_TOKEN);
  removeStorageItem(TOKEN_KEYS.TOKEN_EXPIRY);

  // Clear user data
  removeStorageItem(STORAGE_KEYS.USER);
  removeStorageItem(STORAGE_KEYS.USER_ROLE);

  // Redirect to login (only in browser environment)
  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname;
    // Don't redirect if already on login or public page
    if (!currentPath.includes("/login") && !currentPath.includes("/signup")) {
      window.location.href = "/login";
    }
  }
};

/**
 * Manual token refresh function
 * @returns {Promise<string>} New access token
 */
export const refreshAccessToken = async () => {
  const refreshToken = getStorageItem(TOKEN_KEYS.REFRESH_TOKEN);

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await axios.post(
    `${AUTH_SERVICE_URL}${AUTH_ENDPOINTS.REFRESH_TOKEN}`,
    { refresh_token: refreshToken },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const { access_token, refresh_token: newRefreshToken } = response.data;

  setStorageItem(TOKEN_KEYS.ACCESS_TOKEN, access_token);
  if (newRefreshToken) {
    setStorageItem(TOKEN_KEYS.REFRESH_TOKEN, newRefreshToken);
  }

  return access_token;
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = getStorageItem(TOKEN_KEYS.ACCESS_TOKEN);
  return !!token;
};

/**
 * Set authentication token
 * @param {string} accessToken
 * @param {string} refreshToken
 */
export const setAuthToken = (accessToken, refreshToken) => {
  setStorageItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
  setStorageItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
  api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
};

/**
 * Clear authentication token
 */
export const clearAuthToken = () => {
  removeStorageItem(TOKEN_KEYS.ACCESS_TOKEN);
  removeStorageItem(TOKEN_KEYS.REFRESH_TOKEN);
  removeStorageItem(TOKEN_KEYS.TOKEN_EXPIRY);
  delete api.defaults.headers.common.Authorization;
};

export default api;
