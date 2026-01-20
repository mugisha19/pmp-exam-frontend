/**
 * Quiz Bank Service
 * Handles quiz bank management and question assignments
 */

import api from "./api";
import { QUIZ_ENDPOINTS } from "@/constants/api.constants";

/**
 * Get quiz banks with pagination
 * @param {Object} params - Query parameters
 * @param {number} [params.skip] - Number of items to skip
 * @param {number} [params.limit] - Maximum number of items to return
 * @returns {Promise<Object>} Quiz banks list with pagination info
 */
export const getQuizBanks = async (params = {}) => {
  try {
    const response = await api.get(QUIZ_ENDPOINTS.LIST_QUIZ_BANKS, { params });
    return response.data;
  } catch (error) {
    throw handleQuizBankError(error);
  }
};

/**
 * Get quiz bank by ID
 * @param {string} quizBankId - Quiz bank ID
 * @returns {Promise<Object>} Quiz bank data with details
 */
export const getQuizBankById = async (quizBankId) => {
  try {
    const response = await api.get(QUIZ_ENDPOINTS.GET_QUIZ_BANK(quizBankId));
    return response.data;
  } catch (error) {
    throw handleQuizBankError(error);
  }
};

/**
 * Create a new quiz bank
 * @param {Object} data - Quiz bank data
 * @param {string} data.name - Quiz bank name
 * @param {string} [data.description] - Quiz bank description
 * @param {boolean} [data.is_public] - Whether the quiz bank is public
 * @returns {Promise<Object>} Created quiz bank
 */
export const createQuizBank = async (data) => {
  try {
    const response = await api.post(QUIZ_ENDPOINTS.CREATE_QUIZ_BANK, data);
    return response.data;
  } catch (error) {
    throw handleQuizBankError(error);
  }
};

/**
 * Merge multiple quiz banks into a new one
 * @param {Object} data - Merge data
 * @param {Array<string>} data.quiz_bank_ids - Array of quiz bank IDs to merge (minimum 2)
 * @param {string} data.title - Title for the merged quiz bank
 * @param {string} [data.description] - Description for the merged quiz bank
 * @returns {Promise<Object>} Created merged quiz bank
 */
export const mergeQuizBanks = async (data) => {
  try {
    const response = await api.post(QUIZ_ENDPOINTS.MERGE_QUIZ_BANKS, data);
    return response.data;
  } catch (error) {
    throw handleQuizBankError(error);
  }
};

/**
 * Update an existing quiz bank
 * @param {string} quizBankId - Quiz bank ID
 * @param {Object} data - Quiz bank data to update
 * @param {string} [data.name] - Quiz bank name
 * @param {string} [data.description] - Quiz bank description
 * @param {boolean} [data.is_public] - Whether the quiz bank is public
 * @returns {Promise<Object>} Updated quiz bank
 */
export const updateQuizBank = async (quizBankId, data) => {
  try {
    const response = await api.put(
      QUIZ_ENDPOINTS.UPDATE_QUIZ_BANK(quizBankId),
      data
    );
    return response.data;
  } catch (error) {
    throw handleQuizBankError(error);
  }
};

/**
 * Delete a quiz bank
 * @param {string} quizBankId - Quiz bank ID
 * @returns {Promise<void>}
 */
export const deleteQuizBank = async (quizBankId) => {
  try {
    await api.delete(QUIZ_ENDPOINTS.DELETE_QUIZ_BANK(quizBankId));
  } catch (error) {
    throw handleQuizBankError(error);
  }
};

/**
 * Add a single question to a quiz bank
 * @param {string} quizBankId - Quiz bank ID
 * @param {string} questionId - Question ID to add
 * @returns {Promise<Object>} Updated quiz bank
 */
export const addQuestionToBank = async (quizBankId, questionId) => {
  try {
    const response = await api.post(
      QUIZ_ENDPOINTS.ADD_QUESTION_TO_BANK(quizBankId),
      { question_id: questionId }
    );
    return response.data;
  } catch (error) {
    throw handleQuizBankError(error);
  }
};

/**
 * Add multiple questions to a quiz bank
 * @param {string} quizBankId - Quiz bank ID
 * @param {Array<string>} questionIds - Array of question IDs to add
 * @returns {Promise<Object>} Updated quiz bank with added questions count
 */
export const addQuestionsToBank = async (quizBankId, questionIds) => {
  try {
    const response = await api.post(
      QUIZ_ENDPOINTS.ADD_BULK_QUESTIONS_TO_BANK(quizBankId),
      { question_ids: questionIds }
    );
    return response.data;
  } catch (error) {
    throw handleQuizBankError(error);
  }
};

/**
 * Get all questions in a quiz bank
 * @param {string} quizBankId - Quiz bank ID
 * @param {number} limit - Maximum number of questions to fetch (default 500)
 * @returns {Promise<Array>} List of questions in the quiz bank
 */
export const getBankQuestions = async (quizBankId, limit = 500) => {
  try {
    const response = await api.get(
      QUIZ_ENDPOINTS.LIST_BANK_QUESTIONS(quizBankId),
      { params: { limit } }
    );
    return response.data;
  } catch (error) {
    throw handleQuizBankError(error);
  }
};

/**
 * Remove a question from a quiz bank
 * @param {string} quizBankId - Quiz bank ID
 * @param {string} questionId - Question ID to remove
 * @returns {Promise<void>}
 */
export const removeQuestionFromBank = async (quizBankId, questionId) => {
  try {
    await api.delete(
      QUIZ_ENDPOINTS.REMOVE_QUESTION_FROM_BANK(quizBankId, questionId)
    );
  } catch (error) {
    throw handleQuizBankError(error);
  }
};

/**
 * Handle quiz bank service errors
 * @param {Error} error - Error object
 * @returns {Error} Formatted error
 */
const handleQuizBankError = (error) => {
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
  getQuizBanks,
  getQuizBankById,
  createQuizBank,
  mergeQuizBanks,
  updateQuizBank,
  deleteQuizBank,
  addQuestionToBank,
  addQuestionsToBank,
  getBankQuestions,
  removeQuestionFromBank,
};
