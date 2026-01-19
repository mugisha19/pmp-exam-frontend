/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import api, { setAuthToken, clearAuthToken } from "./api";
import { AUTH_ENDPOINTS } from "@/constants/api.constants";
import {
  TOKEN_KEYS,
  STORAGE_KEYS,
  STORAGE_TYPE,
  setStorageItem,
  removeStorageItem,
  getStorageItem,
} from "@/constants/storage.constants";

/**
 * Login with email and password
 * @param {string} email - User email or username
 * @param {string} password - User password
 * @param {boolean} rememberMe - If true, store tokens in localStorage; if false, use sessionStorage
 * @returns {Promise<Object>} User data and tokens
 */
export const login = async (email, password, rememberMe = true) => {
  try {
    const response = await api.post(AUTH_ENDPOINTS.LOGIN, {
      email,
      password,
    });

    // Validate response structure
    if (!response.data || typeof response.data !== "object") {
      throw new Error("Invalid response from server");
    }

    const { access_token, refresh_token } = response.data;

    // Validate required fields
    if (!access_token || !refresh_token) {
      throw new Error("Missing authentication tokens in response");
    }

    // Store tokens with rememberMe preference
    setAuthToken(access_token, refresh_token, rememberMe);

    // Fetch user data after successful login
    const user = await validateSession();

    // Store user data (always in localStorage for persistence)
    if (user) {
      setStorageItem(STORAGE_KEYS.USER, user);
      setStorageItem(STORAGE_KEYS.USER_ROLE, user.role);
    }

    return { access_token, refresh_token, user };
  } catch (error) {
    throw handleAuthError(error);
  }
};

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @param {string} userData.first_name - User's first name
 * @param {string} userData.last_name - User's last name
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.role - User role (defaults to 'student')
 * @returns {Promise<Object>} Registration response
 */
export const register = async ({
  first_name,
  last_name,
  email,
  password,
  role = "student",
}) => {
  try {
    const response = await api.post(AUTH_ENDPOINTS.REGISTER, {
      first_name,
      last_name,
      email,
      password,
      role,
    });

    // Store email for verification
    setStorageItem(STORAGE_KEYS.VERIFICATION_EMAIL, email);

    return response.data;
  } catch (error) {
    throw handleAuthError(error);
  }
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<Object>} Reset request response
 */
export const forgotPassword = async (email) => {
  try {
    const response = await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, {
      email,
    });

    return response.data;
  } catch (error) {
    throw handleAuthError(error);
  }
};

/**
 * Reset password with token
 * @param {string} token - Password reset token
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Reset response
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
      token,
      new_password: newPassword,
    });

    return response.data;
  } catch (error) {
    throw handleAuthError(error);
  }
};

/**
 * Verify email with token
 * @param {string} token - Email verification token
 * @returns {Promise<Object>} Verification response
 */
export const verifyEmail = async (token) => {
  try {
    const response = await api.post(AUTH_ENDPOINTS.VERIFY_EMAIL, {
      token,
    });

    return response.data;
  } catch (error) {
    throw handleAuthError(error);
  }
};

/**
 * Resend verification email
 * @param {string} email - User email
 * @returns {Promise<Object>} Resend response
 */
export const resendVerification = async (email) => {
  try {
    const response = await api.post(AUTH_ENDPOINTS.RESEND_VERIFICATION, {
      email,
    });

    return response.data;
  } catch (error) {
    throw handleAuthError(error);
  }
};

/**
 * Refresh access token
 * @returns {Promise<Object>} New tokens
 */
export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await api.post(AUTH_ENDPOINTS.REFRESH_TOKEN, {
      refresh_token: refreshToken,
    });

    const { access_token, refresh_token: newRefreshToken } = response.data;

    // Update tokens
    setAuthToken(access_token, newRefreshToken || refreshToken);

    return response.data;
  } catch (error) {
    // If refresh fails, logout user
    logout();
    throw handleAuthError(error);
  }
};

/**
 * Logout user
 * @param {boolean} logoutAll - Logout from all devices
 * @returns {Promise<void>}
 */
export const logout = async (logoutAll = false) => {
  try {
    const endpoint = logoutAll
      ? AUTH_ENDPOINTS.LOGOUT_ALL
      : AUTH_ENDPOINTS.LOGOUT;

    const refreshToken = getStorageItem(TOKEN_KEYS.REFRESH_TOKEN);

    // Call logout endpoint with refresh token if available
    if (refreshToken && !logoutAll) {
      await api.post(endpoint, { refresh_token: refreshToken }).catch(() => {});
    } else if (logoutAll) {
      await api.post(endpoint).catch(() => {});
    }
  } finally {
    // Always clear local auth data
    clearAuthToken();
    removeStorageItem(STORAGE_KEYS.USER);
    removeStorageItem(STORAGE_KEYS.USER_ROLE);
    removeStorageItem(STORAGE_KEYS.USER_PREFERENCES);
    removeStorageItem(STORAGE_KEYS.QUIZ_SESSION);
    removeStorageItem(STORAGE_KEYS.QUIZ_ANSWERS);
  }
};

/**
 * Get Google OAuth authentication URL
 * @returns {Promise<string>} Google auth URL
 */
export const getGoogleAuthUrl = async () => {
  try {
    const response = await api.get(AUTH_ENDPOINTS.GOOGLE_AUTH);
    const authUrl = response.data.auth_url || response.data.url;
    // Redirect directly to Google
    window.location.href = authUrl;
  } catch (error) {
    throw handleAuthError(error);
  }
};

/**
 * Handle Google OAuth callback
 * @param {string} code - OAuth authorization code
 * @returns {Promise<Object>} User data and tokens
 */
export const handleGoogleCallback = async (code) => {
  try {
    const response = await api.post(AUTH_ENDPOINTS.GOOGLE_CALLBACK, {
      code,
    });

    const { access_token, refresh_token } = response.data;

    // Store tokens
    setAuthToken(access_token, refresh_token);

    // Fetch user data after successful OAuth
    const user = await validateSession();

    // Store user data
    if (user) {
      setStorageItem(STORAGE_KEYS.USER, user);
      setStorageItem(STORAGE_KEYS.USER_ROLE, user.role);
    }

    return { access_token, refresh_token, user };
  } catch (error) {
    throw handleAuthError(error);
  }
};

/**
 * Get Apple OAuth authentication URL
 * @returns {Promise<string>} Apple auth URL
 */
export const getAppleAuthUrl = async () => {
  try {
    const response = await api.get(AUTH_ENDPOINTS.APPLE_AUTH);
    return response.data.auth_url || response.data.url;
  } catch (error) {
    throw handleAuthError(error);
  }
};

/**
 * Change user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Change password response
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
      current_password: currentPassword,
      new_password: newPassword,
    });

    return response.data;
  } catch (error) {
    throw handleAuthError(error);
  }
};

/**
 * Validate current session by fetching user profile
 * @returns {Promise<Object|null>} User data if session is valid, null otherwise
 */
export const validateSession = async () => {
  try {
    const response = await api.get("/users/me");
    return response.data;
  } catch (error) {
    // If unauthorized or any error, session is invalid
    if (error.response?.status === 401) {
      return null;
    }
    throw handleAuthError(error);
  }
};

/**
 * Handle authentication errors
 * @param {Error} error - Error object
 * @returns {Error} Formatted error
 */
const handleAuthError = (error) => {
  // If it's already a formatted error object (from our validation), return it
  if (error instanceof Error && !error.response && !error.config) {
    return error;
  }

  // Handle Axios errors
  if (error.response) {
    const { status, data } = error.response;

    // Handle validation errors
    if (status === 422 && error.validationErrors) {
      const err = new Error("Validation failed");
      err.errors = error.validationErrors;
      err.status = status;
      return err;
    }

    // Handle specific error messages
    const message = data?.detail || data?.message || "An error occurred";
    const err = new Error(message);
    err.status = status;
    err.data = data;
    return err;
  }

  // Network or other errors
  const err = new Error(error.message || "Network error");
  err.status = 0;
  return err;
};

export default {
  login,
  register,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  refreshToken,
  logout,
  getGoogleAuthUrl,
  getAppleAuthUrl,
  handleGoogleCallback,
  changePassword,
  validateSession,
};
