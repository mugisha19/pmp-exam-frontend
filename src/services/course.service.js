/**
 * Course Service
 * Handles course management API calls
 */

import api from "./api";
import { QUIZ_ENDPOINTS } from "@/constants/api.constants";

/**
 * Get all courses
 * @param {Object} options - Query options
 * @param {boolean} options.is_active - Filter by active status
 * @returns {Promise<Object>} List of courses with pagination
 */
export const getCourses = async (options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.is_active !== undefined) {
      params.append("is_active", options.is_active);
    }
    params.append("skip", options.skip || 0);
    params.append("limit", options.limit || 100);

    const response = await api.get(
      `${QUIZ_ENDPOINTS.LIST_COURSES}?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    throw handleCourseError(error);
  }
};

/**
 * Get course by ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Course data
 */
export const getCourseById = async (courseId) => {
  try {
    const response = await api.get(QUIZ_ENDPOINTS.GET_COURSE(courseId));
    return response.data;
  } catch (error) {
    throw handleCourseError(error);
  }
};

/**
 * Create a new course
 * @param {Object} data - Course data
 * @param {string} data.name - Course name
 * @param {string} [data.description] - Course description
 * @param {boolean} [data.is_active] - Active status
 * @returns {Promise<Object>} Created course
 */
export const createCourse = async (data) => {
  try {
    const response = await api.post(QUIZ_ENDPOINTS.CREATE_COURSE, data);
    return response.data;
  } catch (error) {
    throw handleCourseError(error);
  }
};

/**
 * Update an existing course
 * @param {string} courseId - Course ID
 * @param {Object} data - Course data to update
 * @returns {Promise<Object>} Updated course
 */
export const updateCourse = async (courseId, data) => {
  try {
    const response = await api.put(QUIZ_ENDPOINTS.UPDATE_COURSE(courseId), data);
    return response.data;
  } catch (error) {
    throw handleCourseError(error);
  }
};

/**
 * Delete a course
 * @param {string} courseId - Course ID
 * @returns {Promise<void>}
 */
export const deleteCourse = async (courseId) => {
  try {
    await api.delete(QUIZ_ENDPOINTS.DELETE_COURSE(courseId));
  } catch (error) {
    throw handleCourseError(error);
  }
};

/**
 * Handle course service errors
 * @param {Error} error - Error object
 * @returns {Error} Formatted error
 */
const handleCourseError = (error) => {
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
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};

