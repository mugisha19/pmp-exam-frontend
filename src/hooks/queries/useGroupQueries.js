/**
 * Group React Query Hooks
 * Custom hooks for group management operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as groupService from "@/services/group.service";
import { queryKeys } from "@/lib/query-client";

/**
 * Get groups with filters query hook
 * @param {Object} filters - Query filters (skip, limit, group_type, status, search)
 * @param {Object} options - Query options
 */
export const useGroups = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.groups.list(filters),
    queryFn: () => groupService.getGroups(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    keepPreviousData: true, // Keep previous data on filter change
    onError: (error) => {
      const errorMessage = error.message || "Failed to fetch groups";
      toast.error(errorMessage);
    },
    ...options,
  });
};

/**
 * Get group by ID query hook
 * @param {string} groupId - Group ID
 * @param {Object} options - Query options
 */
export const useGroup = (groupId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.groups.detail(groupId),
    queryFn: () => groupService.getGroupById(groupId),
    enabled: !!groupId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    onError: (error) => {
      const errorMessage = error.message || "Failed to fetch group";
      toast.error(errorMessage);
    },
    ...options,
  });
};

/**
 * Get current user's groups query hook
 * @param {Object} options - Query options
 */
export const useMyGroups = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.groups.myGroups(),
    queryFn: () => groupService.getMyGroups(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    onError: (error) => {
      const errorMessage = error.message || "Failed to fetch your groups";
      toast.error(errorMessage);
    },
    ...options,
  });
};

/**
 * Get group members query hook
 * @param {string} groupId - Group ID
 * @param {Object} options - Query options
 */
export const useGroupMembers = (groupId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.groups.members(groupId),
    queryFn: () => groupService.getGroupMembers(groupId),
    enabled: !!groupId,
    staleTime: 1 * 60 * 1000, // 1 minute
    onError: (error) => {
      const errorMessage = error.message || "Failed to fetch group members";
      toast.error(errorMessage);
    },
    ...options,
  });
};

/**
 * Get group join requests query hook
 * @param {string} groupId - Group ID
 * @param {Object} options - Query options
 */
export const useGroupJoinRequests = (groupId, options = {}) => {
  return useQuery({
    queryKey: ["group-join-requests", groupId],
    queryFn: () => groupService.getJoinRequests(groupId),
    enabled: !!groupId,
    staleTime: 30 * 1000, // 30 seconds - join requests need fresher data
    onError: (error) => {
      const errorMessage = error.message || "Failed to fetch join requests";
      toast.error(errorMessage);
    },
    ...options,
  });
};

/**
 * Get group quizzes query hook
 * @param {string} groupId - Group ID
 * @param {Object} filters - Query filters (status, skip, limit)
 * @param {Object} options - Query options
 */
export const useGroupQuizzes = (groupId, filters = {}, options = {}) => {
  return useQuery({
    queryKey: ["group-quizzes", groupId, filters],
    queryFn: () => groupService.getGroupQuizzes(groupId, filters),
    enabled: !!groupId,
    staleTime: 1 * 60 * 1000, // 1 minute
    keepPreviousData: true,
    onError: (error) => {
      const errorMessage = error.message || "Failed to fetch group quizzes";
      toast.error(errorMessage);
    },
    ...options,
  });
};

/**
 * Create group mutation hook
 */
export const useCreateGroupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupData) => groupService.createGroup(groupData),
    onSuccess: () => {
      // Invalidate groups list
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });

      // Also invalidate my groups
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.myGroups() });

      toast.success("Group created");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to create group. Please try again.";

      if (error.errors) {
        Object.values(error.errors).forEach((err) => {
          toast.error(err);
        });
      } else {
        toast.error(errorMessage);
      }
    },
  });
};

/**
 * Update group mutation hook
 */
export const useUpdateGroupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, data }) => groupService.updateGroup(groupId, data),
    onSuccess: (data, variables) => {
      // Update specific group in cache
      queryClient.setQueryData(
        queryKeys.groups.detail(variables.groupId),
        data
      );

      // Invalidate groups list
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });

      // Also invalidate my groups
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.myGroups() });

      toast.success("Group updated");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to update group. Please try again.";

      if (error.errors) {
        Object.values(error.errors).forEach((err) => {
          toast.error(err);
        });
      } else {
        toast.error(errorMessage);
      }
    },
  });
};

/**
 * Delete group mutation hook
 */
export const useDeleteGroupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId) => groupService.deleteGroup(groupId),
    onSuccess: (_, groupId) => {
      // Remove group from cache
      queryClient.removeQueries({
        queryKey: queryKeys.groups.detail(groupId),
      });

      // Remove group members from cache
      queryClient.removeQueries({
        queryKey: queryKeys.groups.members(groupId),
      });

      // Invalidate groups list
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });

      // Also invalidate my groups
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.myGroups() });

      toast.success("Group deleted");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to delete group. Please try again.";
      toast.error(errorMessage);
    },
  });
};

/**
 * Add member to group mutation hook
 */
export const useAddMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, data }) =>
      groupService.addGroupMember(groupId, data),
    onSuccess: (_, variables) => {
      // Invalidate group members
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.members(variables.groupId),
      });

      // Invalidate group detail to update member count
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.detail(variables.groupId),
      });

      toast.success("Member added to group");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to add member. Please try again.";
      toast.error(errorMessage);
    },
  });
};

/**
 * Remove member from group mutation hook
 */
export const useRemoveMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, userId, reason }) =>
      groupService.removeGroupMember(groupId, userId, { reason }),
    onSuccess: (_, variables) => {
      // Invalidate group members
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.members(variables.groupId),
      });

      // Invalidate group detail to update member count
      queryClient.invalidateQueries({
        queryKey: queryKeys.groups.detail(variables.groupId),
      });

      toast.success("Member removed from group");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to remove member. Please try again.";
      toast.error(errorMessage);
    },
  });
};

/**
 * Approve/reject join request mutation hook
 */
export const useApproveJoinRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, requestId, approved, message }) =>
      groupService.approveJoinRequest(groupId, requestId, {
        approved,
        message,
      }),
    onSuccess: (_, variables) => {
      // Invalidate join requests
      queryClient.invalidateQueries({
        queryKey: ["group-join-requests", variables.groupId],
      });

      // If approved, also invalidate members
      if (variables.approved) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.groups.members(variables.groupId),
        });

        // Invalidate group detail to update member count
        queryClient.invalidateQueries({
          queryKey: queryKeys.groups.detail(variables.groupId),
        });
      }

      const statusText = variables.approved ? "approved" : "rejected";
      toast.success(`Join request ${statusText}`);
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to process join request. Please try again.";
      toast.error(errorMessage);
    },
  });
};

/**
 * Generate invite link mutation hook
 */
export const useGenerateInviteLinkMutation = () => {
  return useMutation({
    mutationFn: ({ groupId, expires_in_days, max_uses }) =>
      groupService.generateInviteLink(groupId, { expires_in_days, max_uses }),
    onSuccess: () => {
      toast.success("Invite link generated");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to generate invite link. Please try again.";
      toast.error(errorMessage);
    },
  });
};

export default {
  useGroups,
  useGroup,
  useMyGroups,
  useGroupMembers,
  useGroupJoinRequests,
  useGroupQuizzes,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useAddMemberMutation,
  useRemoveMemberMutation,
  useApproveJoinRequestMutation,
  useGenerateInviteLinkMutation,
};
