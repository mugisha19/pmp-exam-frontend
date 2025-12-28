/**
 * Domain Service
 * Handles domain management API calls
 */

import api from "./api";
import { QUIZ_ENDPOINTS } from "@/constants/api.constants";

/**
 * Get all domains
 * @param {Object} options - Query options
 * @param {string} options.course_id - Filter by course ID
 * @param {boolean} options.is_active - Filter by active status
 * @returns {Promise<Object>} List of domains with pagination
 */
export const getDomains = async (options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.course_id) {
      params.append("course_id", options.course_id);
    }
    if (options.is_active !== undefined) {
      params.append("is_active", options.is_active);
    }
    params.append("skip", options.skip || 0);
    params.append("limit", options.limit || 100);

    const response = await api.get(
      `${QUIZ_ENDPOINTS.LIST_DOMAINS}?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    throw handleDomainError(error);
  }
};

/**
 * Get domain by ID
 * @param {string} domainId - Domain ID
 * @returns {Promise<Object>} Domain data
 */
export const getDomainById = async (domainId) => {
  try {
    const response = await api.get(QUIZ_ENDPOINTS.GET_DOMAIN(domainId));
    return response.data;
  } catch (error) {
    throw handleDomainError(error);
  }
};

/**
 * Create a new domain
 * @param {Object} data - Domain data
 * @param {string} data.name - Domain name
 * @param {string} data.course_id - Course ID
 * @param {string} [data.description] - Domain description
 * @param {boolean} [data.is_active] - Active status
 * @returns {Promise<Object>} Created domain
 */
export const createDomain = async (data) => {
  try {
    const response = await api.post(QUIZ_ENDPOINTS.CREATE_DOMAIN, data);
    return response.data;
  } catch (error) {
    throw handleDomainError(error);
  }
};

/**
 * Update an existing domain
 * @param {string} domainId - Domain ID
 * @param {Object} data - Domain data to update
 * @returns {Promise<Object>} Updated domain
 */
export const updateDomain = async (domainId, data) => {
  try {
    const response = await api.put(QUIZ_ENDPOINTS.UPDATE_DOMAIN(domainId), data);
    return response.data;
  } catch (error) {
    throw handleDomainError(error);
  }
};

/**
 * Delete a domain
 * @param {string} domainId - Domain ID
 * @returns {Promise<void>}
 */
export const deleteDomain = async (domainId) => {
  try {
    await api.delete(QUIZ_ENDPOINTS.DELETE_DOMAIN(domainId));
  } catch (error) {
    throw handleDomainError(error);
  }
};

/**
 * Handle domain service errors
 * @param {Error} error - Error object
 * @returns {Error} Formatted error
 */
const handleDomainError = (error) => {
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
  getDomains,
  getDomainById,
  createDomain,
  updateDomain,
  deleteDomain,
};

