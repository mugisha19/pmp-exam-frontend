/**
 * User Service
 * Handles user profile and settings API calls
 */

import api from "./api";
import { USER_ENDPOINTS } from "@/constants/api.constants";
import { STORAGE_KEYS, setStorageItem } from "@/constants/storage.constants";

/**
 * Get current authenticated user profile
 * @returns {Promise<Object>} User profile data
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get(USER_ENDPOINTS.PROFILE);

    // Update stored user data
    setStorageItem(STORAGE_KEYS.USER, response.data);
    setStorageItem(STORAGE_KEYS.USER_ROLE, response.data.role);

    return response.data;
  } catch (error) {
    throw handleUserError(error);
  }
};

/**
 * Update user profile
 * @param {Object} data - Profile data to update
 * @param {string} data.first_name - First name
 * @param {string} data.last_name - Last name
 * @param {string} data.avatar_url - Avatar URL
 * @param {Object} data.notification_preferences - Notification preferences
 * @returns {Promise<Object>} Updated user profile
 */
export const updateProfile = async (data) => {
  try {
    const response = await api.put(USER_ENDPOINTS.UPDATE_PROFILE, data);

    // Update stored user data
    setStorageItem(STORAGE_KEYS.USER, response.data);

    return response.data;
  } catch (error) {
    throw handleUserError(error);
  }
};

/**
 * Update user settings
 * @param {Object} settings - User settings
 * @param {Object} settings.notification_preferences - Notification preferences
 * @param {boolean} settings.notification_preferences.email - Email notifications
 * @param {boolean} settings.notification_preferences.push - Push notifications
 * @param {string} settings.language - Preferred language
 * @param {string} settings.timezone - Timezone
 * @returns {Promise<Object>} Updated settings
 */
export const updateSettings = async (settings) => {
  try {
    const response = await api.put(USER_ENDPOINTS.SETTINGS, settings);

    // Update stored preferences
    setStorageItem(STORAGE_KEYS.USER_PREFERENCES, response.data);

    return response.data;
  } catch (error) {
    throw handleUserError(error);
  }
};

/**
 * Change user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Password change response
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    // Import auth service to avoid circular dependency
    const { changePassword: authChangePassword } = await import(
      "./auth.service"
    );
    return await authChangePassword(currentPassword, newPassword);
  } catch (error) {
    throw handleUserError(error);
  }
};

/**
 * Get user by ID (admin/instructor only)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User data
 */
export const getUserById = async (userId) => {
  try {
    const response = await api.get(USER_ENDPOINTS.GET_USER(userId));
    return response.data;
  } catch (error) {
    throw handleUserError(error);
  }
};

/**
 * Get users with filters (admin/instructor only)
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.per_page - Items per page
 * @param {string} params.role - Filter by role
 * @param {string} params.search - Search query
 * @param {boolean} params.active - Filter by active status
 * @returns {Promise<Object>} Users list with pagination
 */
export const getUsers = async (params = {}) => {
  try {
    const response = await api.get(USER_ENDPOINTS.LIST_USERS, { params });
    return response.data;
  } catch (error) {
    throw handleUserError(error);
  }
};

// Alias for backward compatibility
export const listUsers = getUsers;

/**
 * Create new user (admin only)
 * @param {Object} userData - User data
 * @param {string} userData.email - User email
 * @param {string} userData.first_name - First name
 * @param {string} userData.last_name - Last name
 * @param {string} userData.role - User role
 * @returns {Promise<Object>} Created user
 */
export const createUser = async (userData) => {
  try {
    const response = await api.post(USER_ENDPOINTS.LIST_USERS, userData);
    return response.data;
  } catch (error) {
    throw handleUserError(error);
  }
};

/**
 * Update user (admin only)
 * @param {string} userId - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} Updated user
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(
      USER_ENDPOINTS.UPDATE_USER(userId),
      userData
    );
    return response.data;
  } catch (error) {
    throw handleUserError(error);
  }
};

/**
 * Delete user (admin only)
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const deleteUser = async (userId) => {
  try {
    await api.delete(USER_ENDPOINTS.DELETE_USER(userId));
  } catch (error) {
    throw handleUserError(error);
  }
};

/**
 * Update user email (admin only)
 * @param {string} userId - User ID
 * @param {string} newEmail - New email address
 * @returns {Promise<Object>} Updated user
 */
export const updateUserEmail = async (userId, newEmail) => {
  try {
    const response = await api.put(USER_ENDPOINTS.UPDATE_USER_EMAIL(userId), {
      email: newEmail,
    });
    return response.data;
  } catch (error) {
    throw handleUserError(error);
  }
};

/**
 * Update user status (admin only)
 * @param {string} userId - User ID
 * @param {boolean} active - Active status
 * @param {string} reason - Reason for status change
 * @returns {Promise<Object>} Updated user
 */
export const updateUserStatus = async (userId, active, reason = "") => {
  try {
    const response = await api.put(USER_ENDPOINTS.UPDATE_USER_STATUS(userId), {
      active,
      reason,
    });
    return response.data;
  } catch (error) {
    throw handleUserError(error);
  }
};

/**
 * Update user role (admin only)
 * @param {string} userId - User ID
 * @param {string} role - New role
 * @returns {Promise<Object>} Updated user
 */
export const updateUserRole = async (userId, role) => {
  try {
    const response = await api.put(USER_ENDPOINTS.UPDATE_USER_ROLE(userId), {
      role,
    });
    return response.data;
  } catch (error) {
    throw handleUserError(error);
  }
};

/**
 * Resend user credentials (admin only)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Response message
 */
export const resendCredentials = async (userId) => {
  try {
    const response = await api.post(USER_ENDPOINTS.RESEND_CREDENTIALS(userId));
    return response.data;
  } catch (error) {
    throw handleUserError(error);
  }
};

/**
 * Handle user service errors
 * @param {Error} error - Error object
 * @returns {Error} Formatted error
 */
const handleUserError = (error) => {
  if (error.response) {
    const { status, data } = error.response;

    // Handle validation errors
    if (status === 422 && error.validationErrors) {
      return {
        message: "Validation failed",
        errors: error.validationErrors,
        status,
      };
    }

    // Handle specific error messages
    const message = data?.detail || data?.message || "An error occurred";

    return {
      message,
      status,
      data,
    };
  }

  // Network or other errors
  return {
    message: error.message || "Network error",
    status: 0,
  };
};

export default {
  getCurrentUser,
  updateProfile,
  updateSettings,
  changePassword,
  getUserById,
  getUsers,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserEmail,
  updateUserStatus,
  updateUserRole,
  resendCredentials,
};
