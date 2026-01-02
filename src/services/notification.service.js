/**
 * Notification Service
 * Handles notification management and real-time updates
 */

import api from "./api";
import { NOTIFICATION_ENDPOINTS } from "@/constants/api.constants";

/**
 * Get notifications with filters
 * @param {Object} params - Query parameters
 * @param {number} [params.skip] - Number of items to skip
 * @param {number} [params.limit] - Maximum number of items to return
 * @param {boolean} [params.unread_only] - Filter to show only unread notifications
 * @returns {Promise<Object>} Notifications list with pagination info
 */
export const getNotifications = async (params = {}) => {
  try {
    // Convert page/page_size to skip/limit if needed
    const queryParams = { ...params };
    if (params.page !== undefined && params.page_size !== undefined) {
      queryParams.skip = (params.page - 1) * params.page_size;
      queryParams.limit = params.page_size;
      delete queryParams.page;
      delete queryParams.page_size;
    }
    
    const response = await api.get(NOTIFICATION_ENDPOINTS.LIST_NOTIFICATIONS, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    throw handleNotificationError(error);
  }
};

/**
 * Get notification by ID
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Notification data
 */
export const getNotificationById = async (notificationId) => {
  try {
    const response = await api.get(
      NOTIFICATION_ENDPOINTS.GET_NOTIFICATION(notificationId)
    );
    return response.data;
  } catch (error) {
    throw handleNotificationError(error);
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
export const markAsRead = async (notificationId) => {
  try {
    const response = await api.put(
      NOTIFICATION_ENDPOINTS.MARK_AS_READ(notificationId)
    );
    return response.data;
  } catch (error) {
    throw handleNotificationError(error);
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise<Object>} Result with count of marked notifications
 */
export const markAllAsRead = async () => {
  try {
    const response = await api.put(NOTIFICATION_ENDPOINTS.MARK_ALL_READ);
    return response.data;
  } catch (error) {
    throw handleNotificationError(error);
  }
};

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export const deleteNotification = async (notificationId) => {
  try {
    await api.delete(
      NOTIFICATION_ENDPOINTS.DELETE_NOTIFICATION(notificationId)
    );
  } catch (error) {
    throw handleNotificationError(error);
  }
};

/**
 * Get WebSocket URL for real-time notifications
 * @param {string} userIdentifier - User identifier for WebSocket connection
 * @returns {string} WebSocket URL
 */
export const getWebSocketUrl = (userIdentifier) => {
  return NOTIFICATION_ENDPOINTS.WEBSOCKET_URL(userIdentifier);
};

/**
 * Handle notification service errors
 * @param {Error} error - Error object
 * @returns {Error} Formatted error
 */
const handleNotificationError = (error) => {
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
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getWebSocketUrl,
};
