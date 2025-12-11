/**
 * Quiz Service
 * Handles real quiz management API calls (scheduled quizzes for groups)
 */

import api from "./api";
import { QUIZ_ENDPOINTS } from "@/constants/api.constants";

/**
 * Get quizzes with filters
 * @param {Object} params - Query parameters
 * @param {string} [params.group_id] - Filter by group ID
 * @param {string} [params.status] - Filter by status (draft, published, active, completed, cancelled)
 * @param {number} [params.skip] - Number of items to skip
 * @param {number} [params.limit] - Maximum number of items to return
 * @returns {Promise<Object>} Quizzes list with pagination info
 */
export const getQuizzes = async (params = {}) => {
  try {
    const response = await api.get(QUIZ_ENDPOINTS.LIST_QUIZZES, { params });
    return response.data;
  } catch (error) {
    throw handleQuizError(error);
  }
};

/**
 * Get quiz by ID
 * @param {string} quizId - Quiz ID
 * @returns {Promise<Object>} Quiz data with full details
 */
export const getQuizById = async (quizId) => {
  try {
    const response = await api.get(QUIZ_ENDPOINTS.GET_QUIZ(quizId));
    return response.data;
  } catch (error) {
    throw handleQuizError(error);
  }
};

/**
 * Create a new quiz
 * @param {Object} data - Quiz data
 * @param {string} data.title - Quiz title
 * @param {string} [data.description] - Quiz description
 * @param {string} data.group_id - Target group ID
 * @param {string} data.quiz_bank_id - Source quiz bank ID
 * @param {number} data.question_count - Number of questions to include
 * @param {number} data.time_limit - Time limit in minutes
 * @param {number} data.passing_score - Passing score percentage
 * @param {string} data.start_time - Quiz start time (ISO string)
 * @param {string} data.end_time - Quiz end time (ISO string)
 * @param {boolean} [data.shuffle_questions] - Whether to shuffle questions
 * @param {boolean} [data.shuffle_options] - Whether to shuffle options
 * @param {boolean} [data.show_correct_answers] - Whether to show correct answers after completion
 * @param {number} [data.max_attempts] - Maximum attempts allowed
 * @returns {Promise<Object>} Created quiz
 */
export const createQuiz = async (data) => {
  try {
    const response = await api.post(QUIZ_ENDPOINTS.CREATE_QUIZ, data);
    return response.data;
  } catch (error) {
    throw handleQuizError(error);
  }
};

/**
 * Update an existing quiz
 * @param {string} quizId - Quiz ID
 * @param {Object} data - Quiz data to update
 * @returns {Promise<Object>} Updated quiz
 */
export const updateQuiz = async (quizId, data) => {
  try {
    const response = await api.put(QUIZ_ENDPOINTS.UPDATE_QUIZ(quizId), data);
    return response.data;
  } catch (error) {
    throw handleQuizError(error);
  }
};

/**
 * Delete a quiz
 * @param {string} quizId - Quiz ID
 * @returns {Promise<void>}
 */
export const deleteQuiz = async (quizId) => {
  try {
    await api.delete(QUIZ_ENDPOINTS.DELETE_QUIZ(quizId));
  } catch (error) {
    throw handleQuizError(error);
  }
};

/**
 * Publish a quiz (make it available for students)
 * @param {string} quizId - Quiz ID
 * @returns {Promise<Object>} Published quiz
 */
export const publishQuiz = async (quizId) => {
  try {
    const response = await api.post(QUIZ_ENDPOINTS.PUBLISH_QUIZ(quizId));
    return response.data;
  } catch (error) {
    throw handleQuizError(error);
  }
};

/**
 * Cancel a quiz
 * @param {string} quizId - Quiz ID
 * @returns {Promise<Object>} Cancelled quiz
 */
export const cancelQuiz = async (quizId) => {
  try {
    const response = await api.post(QUIZ_ENDPOINTS.CANCEL_QUIZ(quizId));
    return response.data;
  } catch (error) {
    throw handleQuizError(error);
  }
};

/**
 * Publish quiz bank to groups
 * @param {Object} data - Publish data
 * @param {string} data.quiz_bank_id - Quiz bank ID to publish
 * @param {string[]} data.group_ids - Array of group IDs
 * @param {string} [data.title] - Override quiz title
 * @param {string} [data.description] - Override description
 * @param {string} [data.quiz_mode] - "practice" or "exam"
 * @param {number} [data.time_limit_minutes] - Time limit in minutes
 * @param {number} [data.passing_score] - Passing score percentage (default 70)
 * @param {boolean} [data.shuffle_questions] - Shuffle questions (default true)
 * @param {boolean} [data.shuffle_options] - Shuffle options (default true)
 * @param {boolean} [data.show_results_immediately] - Show results immediately (default true)
 * @param {number} [data.max_attempts] - Max attempts allowed
 * @param {boolean} [data.use_all_questions] - Use all questions (default true)
 * @param {number} [data.subset_count] - Number of questions if not all
 * @param {string} [data.starts_at] - Start datetime (ISO string)
 * @param {string} [data.ends_at] - End datetime (ISO string)
 * @returns {Promise<Object>} Published quizzes result
 */
export const publishToGroup = async (data) => {
  try {
    const response = await api.post(QUIZ_ENDPOINTS.PUBLISH_TO_GROUP, data);
    return response.data;
  } catch (error) {
    throw handleQuizError(error);
  }
};

/**
 * Publish quiz bank publicly
 * @param {Object} data - Publish data (same as publishToGroup but no group_ids)
 * @returns {Promise<Object>} Published quiz result
 */
export const publishPublic = async (data) => {
  try {
    const response = await api.post(QUIZ_ENDPOINTS.PUBLISH_PUBLIC, data);
    return response.data;
  } catch (error) {
    throw handleQuizError(error);
  }
};

/**
 * Get list of published quizzes
 * @param {Object} params - Query parameters
 * @param {string} [params.group_id] - Filter by group ID
 * @param {boolean} [params.is_public] - Filter by public status
 * @param {number} [params.skip] - Number to skip
 * @param {number} [params.limit] - Max results
 * @returns {Promise<Object>} Published quizzes list
 */
export const getPublishedQuizzes = async (params = {}) => {
  try {
    const response = await api.get(QUIZ_ENDPOINTS.LIST_PUBLISHED, { params });
    return response.data;
  } catch (error) {
    throw handleQuizError(error);
  }
};

/**
 * Handle quiz service errors
 * @param {Error} error - Error object
 * @returns {Error} Formatted error
 */
const handleQuizError = (error) => {
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
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  publishQuiz,
  cancelQuiz,
  publishToGroup,
  publishPublic,
  getPublishedQuizzes,
};
