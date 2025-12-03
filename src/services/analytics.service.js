/**
 * Analytics Service
 * Handles analytics and performance data API calls
 */

import api from "./api";
import { ANALYTICS_ENDPOINTS, QUIZ_ENDPOINTS } from "@/constants/api.constants";

/**
 * Get analytics for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User analytics data
 */
export const getUserAnalytics = async (userId) => {
  try {
    const response = await api.get(ANALYTICS_ENDPOINTS.USER_ANALYTICS(userId));
    return response.data;
  } catch (error) {
    throw handleAnalyticsError(error);
  }
};

/**
 * Get performance dashboard data for current user
 * @returns {Promise<Object>} Dashboard data with summary statistics
 */
export const getPerformanceDashboard = async () => {
  try {
    const response = await api.get(QUIZ_ENDPOINTS.DASHBOARD);
    return response.data;
  } catch (error) {
    throw handleAnalyticsError(error);
  }
};

/**
 * Get domain analysis data
 * @returns {Promise<Object>} Analysis of performance by domain (People, Process, Business Environment)
 */
export const getDomainAnalysis = async () => {
  try {
    const response = await api.get(QUIZ_ENDPOINTS.DOMAIN_ANALYSIS);
    return response.data;
  } catch (error) {
    throw handleAnalyticsError(error);
  }
};

/**
 * Get topic mastery data
 * @returns {Promise<Object>} Mastery levels by topic
 */
export const getTopicMastery = async () => {
  try {
    const response = await api.get(QUIZ_ENDPOINTS.TOPIC_MASTERY);
    return response.data;
  } catch (error) {
    throw handleAnalyticsError(error);
  }
};

/**
 * Get weak areas that need improvement
 * @param {number} [threshold] - Performance threshold below which areas are considered weak (default: 70)
 * @returns {Promise<Object>} Areas where performance is below threshold
 */
export const getWeakAreas = async (threshold) => {
  try {
    const params = threshold !== undefined ? { threshold } : {};
    const response = await api.get(QUIZ_ENDPOINTS.WEAK_AREAS, { params });
    return response.data;
  } catch (error) {
    throw handleAnalyticsError(error);
  }
};

/**
 * Get quiz attempts history
 * @param {Object} [params] - Query parameters
 * @param {number} [params.skip] - Number of items to skip
 * @param {number} [params.limit] - Maximum number of items to return
 * @returns {Promise<Object>} List of quiz attempts with pagination
 */
export const getAttempts = async (params = {}) => {
  try {
    const response = await api.get(QUIZ_ENDPOINTS.ATTEMPTS, { params });
    return response.data;
  } catch (error) {
    throw handleAnalyticsError(error);
  }
};

/**
 * Get a specific attempt's details
 * @param {string} attemptId - Attempt ID
 * @returns {Promise<Object>} Attempt details
 */
export const getAttemptById = async (attemptId) => {
  try {
    const response = await api.get(QUIZ_ENDPOINTS.GET_ATTEMPT(attemptId));
    return response.data;
  } catch (error) {
    throw handleAnalyticsError(error);
  }
};

/**
 * Get answers for a specific attempt
 * @param {string} attemptId - Attempt ID
 * @returns {Promise<Array>} List of answers for the attempt
 */
export const getAttemptAnswers = async (attemptId) => {
  try {
    const response = await api.get(QUIZ_ENDPOINTS.ATTEMPT_ANSWERS(attemptId));
    return response.data;
  } catch (error) {
    throw handleAnalyticsError(error);
  }
};

/**
 * Get study history
 * @returns {Promise<Object>} Study history with session data
 */
export const getStudyHistory = async () => {
  try {
    const response = await api.get(QUIZ_ENDPOINTS.STUDY_HISTORY);
    return response.data;
  } catch (error) {
    throw handleAnalyticsError(error);
  }
};

/**
 * Get learning goals
 * @returns {Promise<Object>} Learning goals and progress
 */
export const getLearningGoals = async () => {
  try {
    const response = await api.get(QUIZ_ENDPOINTS.LEARNING_GOALS);
    return response.data;
  } catch (error) {
    throw handleAnalyticsError(error);
  }
};

/**
 * Get admin dashboard data
 * @returns {Promise<Object>} Dashboard statistics
 */
export const getDashboard = async () => {
  try {
    const response = await api.get(ANALYTICS_ENDPOINTS.DASHBOARD);
    return response.data;
  } catch (error) {
    throw handleAnalyticsError(error);
  }
};

/**
 * Get instructor dashboard data
 * @returns {Promise<Object>} Instructor dashboard statistics
 */
export const getInstructorDashboard = async () => {
  try {
    const response = await api.get(ANALYTICS_ENDPOINTS.INSTRUCTOR_DASHBOARD);
    return response.data;
  } catch (error) {
    throw handleAnalyticsError(error);
  }
};

/**
 * Get platform statistics
 * @returns {Promise<Object>} Platform-wide statistics
 */
export const getPlatformStats = async () => {
  try {
    const response = await api.get(ANALYTICS_ENDPOINTS.PLATFORM_STATS);
    return response.data;
  } catch (error) {
    throw handleAnalyticsError(error);
  }
};

/**
 * Get user registration analytics
 * @param {Object} params - Query parameters (date range, etc.)
 * @returns {Promise<Object>} User registration data
 */
export const getUserRegistrations = async (params = {}) => {
  try {
    const response = await api.get(ANALYTICS_ENDPOINTS.USER_REGISTRATIONS, {
      params,
    });
    return response.data;
  } catch (error) {
    throw handleAnalyticsError(error);
  }
};

/**
 * Get quiz completion analytics
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Quiz completion data
 */
export const getQuizCompletions = async (params = {}) => {
  try {
    const response = await api.get(ANALYTICS_ENDPOINTS.QUIZ_COMPLETIONS, {
      params,
    });
    return response.data;
  } catch (error) {
    throw handleAnalyticsError(error);
  }
};

/**
 * Get score distribution analytics
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Score distribution data
 */
export const getScoreDistribution = async (params = {}) => {
  try {
    const response = await api.get(ANALYTICS_ENDPOINTS.SCORE_DISTRIBUTION, {
      params,
    });
    return response.data;
  } catch (error) {
    throw handleAnalyticsError(error);
  }
};

/**
 * Get domain performance analytics
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Domain performance data
 */
export const getDomainPerformance = async (params = {}) => {
  try {
    const response = await api.get(ANALYTICS_ENDPOINTS.DOMAIN_PERFORMANCE, {
      params,
    });
    return response.data;
  } catch (error) {
    throw handleAnalyticsError(error);
  }
};

/**
 * Get top performers
 * @param {Object} params - Query parameters including limit
 * @returns {Promise<Array>} Top performers list
 */
export const getTopPerformers = async (params = {}) => {
  try {
    const response = await api.get(ANALYTICS_ENDPOINTS.TOP_PERFORMERS, {
      params,
    });
    return response.data;
  } catch (error) {
    throw handleAnalyticsError(error);
  }
};

/**
 * Get most active groups
 * @param {Object} params - Query parameters including limit
 * @returns {Promise<Array>} Active groups list
 */
export const getMostActiveGroups = async (params = {}) => {
  try {
    const response = await api.get(ANALYTICS_ENDPOINTS.ACTIVE_GROUPS, {
      params,
    });
    return response.data;
  } catch (error) {
    throw handleAnalyticsError(error);
  }
};

/**
 * Get recent activity
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Recent activity data
 */
export const getRecentActivity = async (params = {}) => {
  try {
    const response = await api.get(ANALYTICS_ENDPOINTS.RECENT_ACTIVITY, {
      params,
    });
    return response.data;
  } catch (error) {
    throw handleAnalyticsError(error);
  }
};

/**
 * Handle analytics service errors
 * @param {Error} error - Error object
 * @returns {Error} Formatted error
 */
const handleAnalyticsError = (error) => {
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
  getUserAnalytics,
  getPerformanceDashboard,
  getDomainAnalysis,
  getTopicMastery,
  getWeakAreas,
  getAttempts,
  getAttemptById,
  getAttemptAnswers,
  getStudyHistory,
  getLearningGoals,
  getDashboard,
  getInstructorDashboard,
  getPlatformStats,
  getUserRegistrations,
  getQuizCompletions,
  getScoreDistribution,
  getDomainPerformance,
  getTopPerformers,
  getMostActiveGroups,
  getRecentActivity,
};
