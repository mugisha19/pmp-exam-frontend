/**
 * Topic Service
 * Handles topic management API calls for quiz content organization
 */

import api from "./api";
import { QUIZ_ENDPOINTS } from "@/constants/api.constants";

/**
 * Get all topics
 * @param {Object} [params={}] - Query parameters
 * @param {number} [params.skip] - Number of items to skip
 * @param {number} [params.limit] - Number of items to return
 * @param {string} [params.domain_id] - Filter by domain ID
 * @param {string} [params.course_id] - Filter by course ID
 * @param {boolean} [params.is_active] - Filter by active status
 * @param {string} [params.domain] - Filter by domain name
 * @returns {Promise<Object>} Response with items, total, page, and size
 */
export const getTopics = async (params = {}) => {
  try {
    const response = await api.get(QUIZ_ENDPOINTS.LIST_TOPICS, { params });
    return response.data;
  } catch (error) {
    throw handleTopicError(error);
  }
};

/**
 * Get topic by ID
 * @param {string} topicId - Topic ID
 * @returns {Promise<Object>} Topic data
 */
export const getTopicById = async (topicId) => {
  try {
    const response = await api.get(QUIZ_ENDPOINTS.GET_TOPIC(topicId));
    return response.data;
  } catch (error) {
    throw handleTopicError(error);
  }
};

/**
 * Create a new topic
 * @param {Object} data - Topic data
 * @param {string} data.name - Topic name
 * @param {string} [data.description] - Topic description
 * @param {string} [data.course_id] - Course ID (required if domain_id not provided)
 * @param {string} [data.domain_id] - Domain ID (required if course_id not provided)
 * @returns {Promise<Object>} Created topic
 */
export const createTopic = async (data) => {
  try {
    const response = await api.post(QUIZ_ENDPOINTS.CREATE_TOPIC, data);
    return response.data;
  } catch (error) {
    throw handleTopicError(error);
  }
};

/**
 * Update an existing topic
 * @param {string} topicId - Topic ID
 * @param {Object} data - Topic data to update
 * @param {string} [data.name] - Topic name
 * @param {string} [data.description] - Topic description
 * @param {string} [data.course_id] - Course ID
 * @param {string} [data.domain_id] - Domain ID
 * @param {boolean} [data.is_active] - Active status
 * @returns {Promise<Object>} Updated topic
 */
export const updateTopic = async (topicId, data) => {
  try {
    const response = await api.put(QUIZ_ENDPOINTS.UPDATE_TOPIC(topicId), data);
    return response.data;
  } catch (error) {
    throw handleTopicError(error);
  }
};

/**
 * Delete a topic
 * @param {string} topicId - Topic ID
 * @returns {Promise<void>}
 */
export const deleteTopic = async (topicId) => {
  try {
    await api.delete(QUIZ_ENDPOINTS.DELETE_TOPIC(topicId));
  } catch (error) {
    throw handleTopicError(error);
  }
};

/**
 * Handle topic service errors
 * @param {Error} error - Error object
 * @returns {Error} Formatted error
 */
const handleTopicError = (error) => {
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
  getTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
};
