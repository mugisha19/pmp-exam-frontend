/**
 * Topic React Query Hooks
 * Custom hooks for topic management operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as topicService from "@/services/topic.service";
import { queryKeys } from "@/lib/query-client";

/**
 * Get all topics query hook
 * @param {Object} [params={}] - Query parameters (skip, limit, domain_id, course_id, is_active, domain)
 * @param {Object} [options={}] - Additional query options
 */
export const useTopics = (params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.topics.list(params),
    queryFn: () => topicService.getTopics(params),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Get topic by ID query hook
 * @param {string} topicId - Topic ID
 * @param {Object} options - Query options
 */
export const useTopic = (topicId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.topics.detail(topicId),
    queryFn: () => topicService.getTopicById(topicId),
    enabled: !!topicId,
    staleTime: 5 * 60 * 1000,
    retry: false,
    ...options,
  });
};

/**
 * Create topic mutation hook
 */
export const useCreateTopicMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (topicData) => topicService.createTopic(topicData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.topics.all });
      toast.success("Topic created successfully");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to create topic. Please try again.";

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
 * Update topic mutation hook
 */
export const useUpdateTopicMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ topicId, data }) => topicService.updateTopic(topicId, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        queryKeys.topics.detail(variables.topicId),
        data
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.topics.all });
      toast.success("Topic updated successfully");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to update topic. Please try again.";

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
 * Delete topic mutation hook
 */
export const useDeleteTopicMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (topicId) => topicService.deleteTopic(topicId),
    onSuccess: (_, topicId) => {
      queryClient.removeQueries({ queryKey: queryKeys.topics.detail(topicId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.topics.all });
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to delete topic. Please try again.";
      toast.error(errorMessage);
    },
  });
};

export default {
  useTopics,
  useTopic,
  useCreateTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
};
