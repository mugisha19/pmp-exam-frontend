/**
 * Question Service
 * Handles question bank management API calls
 */

import api from "./api";
import { QUIZ_ENDPOINTS } from "@/constants/api.constants";

/**
 * Get questions with filters
 * @param {Object} params - Query parameters
 * @param {string} [params.topic_id] - Filter by topic ID
 * @param {string} [params.domain] - Filter by domain (People, Process, Business Environment)
 * @param {string} [params.difficulty] - Filter by difficulty (easy, medium, hard)
 * @param {number} [params.skip] - Number of items to skip (pagination)
 * @param {number} [params.limit] - Maximum number of items to return
 * @returns {Promise<Object>} Questions list with pagination info
 */
export const getQuestions = async (params = {}) => {
  try {
    const response = await api.get(QUIZ_ENDPOINTS.LIST_QUESTIONS, { params });
    return response.data;
  } catch (error) {
    throw handleQuestionError(error);
  }
};

/**
 * Get question by ID
 * @param {string} questionId - Question ID
 * @returns {Promise<Object>} Question data with options and explanation
 */
export const getQuestionById = async (questionId) => {
  try {
    const response = await api.get(QUIZ_ENDPOINTS.GET_QUESTION(questionId));
    return response.data;
  } catch (error) {
    throw handleQuestionError(error);
  }
};

/**
 * Create a new question
 * @param {Object} data - Question data
 * @param {string} data.question_text - Question text
 * @param {string} data.question_type - Type (multiple_choice, multiple_response, drag_drop, fill_in_blank, hotspot)
 * @param {string} data.topic_id - Associated topic ID
 * @param {string} data.domain - Domain (People, Process, Business Environment)
 * @param {string} data.difficulty - Difficulty level (easy, medium, hard)
 * @param {Array<Object>} data.options - Answer options
 * @param {string} data.explanation - Explanation for the correct answer
 * @param {Array<string>} [data.correct_answers] - List of correct answer IDs
 * @param {Object} [data.metadata] - Additional metadata
 * @returns {Promise<Object>} Created question
 */
export const createQuestion = async (data) => {
  try {
    const response = await api.post(QUIZ_ENDPOINTS.CREATE_QUESTION, data);
    return response.data;
  } catch (error) {
    throw handleQuestionError(error);
  }
};

/**
 * Update an existing question
 * @param {string} questionId - Question ID
 * @param {Object} data - Question data to update
 * @returns {Promise<Object>} Updated question
 */
export const updateQuestion = async (questionId, data) => {
  try {
    const response = await api.put(
      QUIZ_ENDPOINTS.UPDATE_QUESTION(questionId),
      data
    );
    return response.data;
  } catch (error) {
    throw handleQuestionError(error);
  }
};

/**
 * Delete a question
 * @param {string} questionId - Question ID
 * @returns {Promise<void>}
 */
export const deleteQuestion = async (questionId) => {
  try {
    await api.delete(QUIZ_ENDPOINTS.DELETE_QUESTION(questionId));
  } catch (error) {
    throw handleQuestionError(error);
  }
};

/**
 * Bulk import questions
 * @param {Array<Object>} questions - Array of question objects to import
 * @returns {Promise<Object>} Import result with success/failure counts
 */
export const bulkImportQuestions = async (questions) => {
  try {
    const response = await api.post(QUIZ_ENDPOINTS.BULK_IMPORT_QUESTIONS, {
      questions,
    });
    return response.data;
  } catch (error) {
    throw handleQuestionError(error);
  }
};

/**
 * Handle question service errors
 * @param {Error} error - Error object
 * @returns {Error} Formatted error
 */
const handleQuestionError = (error) => {
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
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkImportQuestions,
};
