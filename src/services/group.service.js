/**
 * Group Service
 * Handles group management, membership, and related operations
 */

import axios from "axios";
import api from "./api";
import { GROUP_ENDPOINTS } from "@/constants/api.constants";

/**
 * Get groups with filters
 * @param {Object} params - Query parameters
 * @param {number} [params.skip] - Number of items to skip
 * @param {number} [params.limit] - Maximum number of items to return
 * @param {string} [params.group_type] - Filter by group type (class, study_group, cohort)
 * @param {string} [params.status] - Filter by status (active, inactive, archived)
 * @param {string} [params.search] - Search by group name or description
 * @returns {Promise<Object>} Groups list with pagination info
 */
export const getGroups = async (params = {}) => {
  try {
    const response = await api.get(GROUP_ENDPOINTS.LIST_GROUPS, { params });
    return response.data;
  } catch (error) {
    throw handleGroupError(error);
  }
};

/**
 * Get group by ID
 * @param {string} groupId - Group ID
 * @returns {Promise<Object>} Group data with full details
 */
export const getGroupById = async (groupId) => {
  try {
    const response = await api.get(GROUP_ENDPOINTS.GET_GROUP(groupId));
    return response.data;
  } catch (error) {
    throw handleGroupError(error);
  }
};

/**
 * Create a new group
 * @param {Object} data - Group data
 * @param {string} data.name - Group name
 * @param {string} [data.description] - Group description
 * @param {string} data.group_type - Group type (class, study_group, cohort)
 * @param {number} [data.max_members] - Maximum number of members
 * @param {Object} [data.settings] - Group settings
 * @returns {Promise<Object>} Created group
 */
export const createGroup = async (data) => {
  try {
    const response = await api.post(GROUP_ENDPOINTS.CREATE_GROUP, data);
    return response.data;
  } catch (error) {
    throw handleGroupError(error);
  }
};

/**
 * Update an existing group
 * @param {string} groupId - Group ID
 * @param {Object} data - Group data to update
 * @returns {Promise<Object>} Updated group
 */
export const updateGroup = async (groupId, data) => {
  try {
    const response = await api.put(GROUP_ENDPOINTS.UPDATE_GROUP(groupId), data);
    return response.data;
  } catch (error) {
    throw handleGroupError(error);
  }
};

/**
 * Delete a group
 * @param {string} groupId - Group ID
 * @returns {Promise<void>}
 */
export const deleteGroup = async (groupId) => {
  try {
    await api.delete(GROUP_ENDPOINTS.DELETE_GROUP(groupId));
  } catch (error) {
    throw handleGroupError(error);
  }
};

/**
 * Get group members
 * @param {string} groupId - Group ID
 * @returns {Promise<Array>} List of group members
 */
export const getGroupMembers = async (groupId) => {
  try {
    const response = await api.get(GROUP_ENDPOINTS.LIST_MEMBERS(groupId));
    return response.data;
  } catch (error) {
    throw handleGroupError(error);
  }
};

/**
 * Add a member to a group
 * @param {string} groupId - Group ID
 * @param {Object} data - Member data
 * @param {string} data.user_id - User ID to add
 * @param {string} [data.role] - Member role in the group (member, instructor, admin)
 * @returns {Promise<Object>} Added member data
 */
export const addGroupMember = async (groupId, data) => {
  try {
    const response = await api.post(GROUP_ENDPOINTS.ADD_MEMBER(groupId), data);
    return response.data;
  } catch (error) {
    throw handleGroupError(error);
  }
};

/**
 * Remove a member from a group
 * @param {string} groupId - Group ID
 * @param {string} userId - User ID to remove
 * @param {Object} [data] - Removal data
 * @param {string} [data.reason] - Reason for removal
 * @returns {Promise<void>}
 */
export const removeGroupMember = async (groupId, userId, data = {}) => {
  try {
    await api.delete(GROUP_ENDPOINTS.REMOVE_MEMBER(groupId, userId), { data });
  } catch (error) {
    throw handleGroupError(error);
  }
};

/**
 * Get join requests for a group
 * @param {string} groupId - Group ID
 * @returns {Promise<Array>} List of pending join requests
 */
export const getJoinRequests = async (groupId) => {
  try {
    const response = await api.get(GROUP_ENDPOINTS.JOIN_REQUESTS(groupId));
    return response.data;
  } catch (error) {
    throw handleGroupError(error);
  }
};

/**
 * Approve or reject a join request
 * @param {string} groupId - Group ID
 * @param {string} requestId - Join request ID
 * @param {Object} data - Approval data
 * @param {boolean} data.approved - Whether to approve the request
 * @param {string} [data.message] - Message to send with the decision
 * @returns {Promise<Object>} Updated request status
 */
export const approveJoinRequest = async (groupId, requestId, data) => {
  try {
    const response = await api.post(
      GROUP_ENDPOINTS.APPROVE_REQUEST(groupId, requestId),
      data
    );
    return response.data;
  } catch (error) {
    throw handleGroupError(error);
  }
};

/**
 * Generate an invite link for a group
 * @param {string} groupId - Group ID
 * @param {Object} [data] - Invite link options
 * @param {number} [data.expires_in_days] - Number of days until the link expires
 * @param {number} [data.max_uses] - Maximum number of times the link can be used
 * @returns {Promise<Object>} Generated invite link data
 */
export const generateInviteLink = async (groupId, data = {}) => {
  try {
    const response = await api.post(
      GROUP_ENDPOINTS.GENERATE_INVITE(groupId),
      data
    );
    return response.data;
  } catch (error) {
    throw handleGroupError(error);
  }
};

/**
 * Get quizzes for a group
 * @param {string} groupId - Group ID
 * @param {Object} [params] - Query parameters
 * @param {string} [params.status] - Filter by quiz status
 * @param {number} [params.skip] - Number of items to skip
 * @param {number} [params.limit] - Maximum number of items to return
 * @returns {Promise<Object>} Quizzes list with pagination info
 */
export const getGroupQuizzes = async (groupId, params = {}) => {
  try {
    const response = await api.get(GROUP_ENDPOINTS.GROUP_QUIZZES(groupId), {
      params,
    });
    return response.data;
  } catch (error) {
    throw handleGroupError(error);
  }
};

/**
 * Get current user's groups
 * @returns {Promise<Array>} List of groups the current user belongs to
 */
export const getMyGroups = async () => {
  try {
    const response = await api.get(GROUP_ENDPOINTS.MY_GROUPS);
    return response.data;
  } catch (error) {
    throw handleGroupError(error);
  }
};

/**
 * Get available public groups (not joined by current user)
 * @param {Object} params - Query parameters
 * @param {string} [params.search] - Search query
 * @param {number} [params.skip] - Number of items to skip
 * @param {number} [params.limit] - Maximum number of items to return
 * @returns {Promise<Array>} List of available public groups
 */
export const getAvailableGroups = async (params = {}) => {
  try {
    const response = await api.get(GROUP_ENDPOINTS.AVAILABLE_GROUPS, { params });
    return response.data;
  } catch (error) {
    throw handleGroupError(error);
  }
};

/**
 * Get groups for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of groups the user belongs to
 */
export const getUserGroups = async (userId) => {
  try {
    const response = await api.get(GROUP_ENDPOINTS.USER_GROUPS(userId));
    return response.data;
  } catch (error) {
    throw handleGroupError(error);
  }
};

/**
 * Create a join request for a group
 * @param {Object} data - Join request data
 * @param {string} data.group_id - Group ID to join
 * @param {string} [data.message] - Optional message with the request
 * @returns {Promise<Object>} Created join request
 */
export const createJoinRequest = async (data) => {
  try {
    const response = await api.post(GROUP_ENDPOINTS.JOIN_REQUEST, data);
    return response.data;
  } catch (error) {
    throw handleGroupError(error);
  }
};

/**
 * Get quiz statistics for a group
 * @param {string} groupId - Group ID
 * @param {Object} [params] - Query parameters
 * @returns {Promise<Object>} Group quiz statistics
 */
export const getGroupQuizStats = async (groupId, params = {}) => {
  try {
    const response = await api.get(GROUP_ENDPOINTS.GROUP_QUIZ_STATS(groupId), {
      params,
    });
    return response.data;
  } catch (error) {
    throw handleGroupError(error);
  }
};

/**
 * Handle group service errors
 * @param {Error} error - Error object
 * @returns {Error} Formatted error
 */
const handleGroupError = (error) => {
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

/**
 * Get group preview by invite token (public endpoint)
 * @param {string} token - Invite token
 * @returns {Promise<Object>} Group preview data
 */
export const getGroupPreviewByToken = async (token) => {
  try {
    const response = await api.get(GROUP_ENDPOINTS.PREVIEW_BY_TOKEN(token));
    return response.data;
  } catch (error) {
    throw handleGroupError(error);
  }
};

/**
 * Join group by invite token
 * @param {string} token - Invite token
 * @returns {Promise<Object>} Join response
 */
export const joinGroupByToken = async (token) => {
  try {
    const response = await api.post(GROUP_ENDPOINTS.JOIN_BY_TOKEN(token));
    return response.data;
  } catch (error) {
    throw handleGroupError(error);
  }
};

export default {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupMembers,
  addGroupMember,
  removeGroupMember,
  getJoinRequests,
  createJoinRequest,
  approveJoinRequest,
  generateInviteLink,
  getGroupQuizzes,
  getGroupQuizStats,
  getMyGroups,
  getUserGroups,
  getGroupPreviewByToken,
  joinGroupByToken,
};
