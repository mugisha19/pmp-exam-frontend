/**
 * API Service - Axios Configuration
 * Centralized HTTP client with request/response interceptors
 */

import axios from "axios";
import {
  TOKEN_KEYS,
  STORAGE_KEYS,
  STORAGE_TYPE,
  removeStorageItem,
  getStorageItem,
  setStorageItem,
} from "@/constants/storage.constants";
import { AUTH_ENDPOINTS, API_BASE_URL } from "@/constants/api.constants";

// Direct auth service URL for token refresh (bypass proxy)
const AUTH_SERVICE_URL = "http://localhost:8000/api/v1";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // Increased to 120 seconds for production
  headers: {
    "Content-Type": "application/json",
  },
});

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
    // Mark performance endpoints to suppress 404 logging
    if (config.url?.includes('/performance/dashboard') || 
        config.url?.includes('/performance/trends')) {
      config._suppress404Log = true;
    }

    // Check both localStorage and sessionStorage for token
    let token = getStorageItem(TOKEN_KEYS.ACCESS_TOKEN, STORAGE_TYPE.LOCAL);
    if (!token) {
      token = getStorageItem(TOKEN_KEYS.ACCESS_TOKEN, STORAGE_TYPE.SESSION);
    }

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
    
    // Suppress 404 errors for performance endpoints (expected when user has no data)
    if (error.response?.status === 404) {
      const url = originalRequest?.url || '';
      const isPerformanceEndpoint = url.includes('/performance/dashboard') || 
                                    url.includes('/performance/trends');
      if (isPerformanceEndpoint) {
        // Return a custom error that won't be logged by axios
        const customError = new Error('Performance data not found');
        customError.response = error.response;
        customError.config = originalRequest;
        customError.isAxiosError = true;
        customError.status = 404;
        customError.suppressLog = true; // Flag to suppress logging
        return Promise.reject(customError);
      }
    }

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

      // Check both storages for refresh token
      let refreshToken = getStorageItem(TOKEN_KEYS.REFRESH_TOKEN, STORAGE_TYPE.LOCAL);
      let rememberMe = true; // Default to localStorage
      
      if (!refreshToken) {
        refreshToken = getStorageItem(TOKEN_KEYS.REFRESH_TOKEN, STORAGE_TYPE.SESSION);
        rememberMe = false; // Found in sessionStorage
      }

      if (!refreshToken) {
        // No refresh token, clear auth and redirect
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh token using direct auth service URL
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

        // Store new tokens using the same storage type as before
        setAuthToken(access_token, newRefreshToken || refreshToken, rememberMe);

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
      // Suppress console warnings for expected 404s (e.g., performance data not yet created)
      const isExpected404 = originalRequest.url?.includes("/performance/dashboard") ||
                           originalRequest.url?.includes("/performance/trends");
      if (!isExpected404) {
        console.warn("Resource not found:", originalRequest.url);
      }
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
  // Check both storages for refresh token
  let refreshToken = getStorageItem(TOKEN_KEYS.REFRESH_TOKEN, STORAGE_TYPE.LOCAL);
  let rememberMe = true; // Default to localStorage
  
  if (!refreshToken) {
    refreshToken = getStorageItem(TOKEN_KEYS.REFRESH_TOKEN, STORAGE_TYPE.SESSION);
    rememberMe = false; // Found in sessionStorage
  }

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

  // Store new tokens using the same storage type as before
  setAuthToken(access_token, newRefreshToken || refreshToken, rememberMe);

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
 * @param {boolean} rememberMe - If true, use localStorage; if false, use sessionStorage
 */
export const setAuthToken = (accessToken, refreshToken, rememberMe = true) => {
  const storageType = rememberMe ? STORAGE_TYPE.LOCAL : STORAGE_TYPE.SESSION;
  
  // Clear tokens from the other storage type first to avoid conflicts
  if (rememberMe) {
    // Switching to localStorage, clear sessionStorage
    removeStorageItem(TOKEN_KEYS.ACCESS_TOKEN, STORAGE_TYPE.SESSION);
    removeStorageItem(TOKEN_KEYS.REFRESH_TOKEN, STORAGE_TYPE.SESSION);
  } else {
    // Switching to sessionStorage, clear localStorage
    removeStorageItem(TOKEN_KEYS.ACCESS_TOKEN, STORAGE_TYPE.LOCAL);
    removeStorageItem(TOKEN_KEYS.REFRESH_TOKEN, STORAGE_TYPE.LOCAL);
  }
  
  // Store tokens in the appropriate storage
  setStorageItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken, storageType);
  setStorageItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken, storageType);
  api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
};

/**
 * Clear authentication token from both localStorage and sessionStorage
 */
export const clearAuthToken = () => {
  // Clear from both storage types to ensure complete cleanup
  removeStorageItem(TOKEN_KEYS.ACCESS_TOKEN, STORAGE_TYPE.LOCAL);
  removeStorageItem(TOKEN_KEYS.REFRESH_TOKEN, STORAGE_TYPE.LOCAL);
  removeStorageItem(TOKEN_KEYS.TOKEN_EXPIRY, STORAGE_TYPE.LOCAL);
  removeStorageItem(TOKEN_KEYS.ACCESS_TOKEN, STORAGE_TYPE.SESSION);
  removeStorageItem(TOKEN_KEYS.REFRESH_TOKEN, STORAGE_TYPE.SESSION);
  removeStorageItem(TOKEN_KEYS.TOKEN_EXPIRY, STORAGE_TYPE.SESSION);
  delete api.defaults.headers.common.Authorization;
};

export default api;
