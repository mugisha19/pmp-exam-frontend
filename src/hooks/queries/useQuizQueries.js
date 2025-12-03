/**
 * Quiz React Query Hooks
 * Custom hooks for real quiz management operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as quizService from "@/services/quiz.service";
import { queryKeys } from "@/lib/query-client";

/**
 * Get quizzes with filters query hook
 * @param {Object} filters - Query filters (group_id, status, skip, limit)
 * @param {Object} options - Query options
 */
export const useQuizzes = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.quizzes.list(filters),
    queryFn: () => quizService.getQuizzes(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
    keepPreviousData: true, // Keep previous data on filter change
    onError: (error) => {
      const errorMessage = error.message || "Failed to fetch quizzes";
      toast.error(errorMessage);
    },
    ...options,
  });
};

/**
 * Get quiz by ID query hook
 * @param {string} quizId - Quiz ID
 * @param {Object} options - Query options
 */
export const useQuiz = (quizId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.quizzes.detail(quizId),
    queryFn: () => quizService.getQuizById(quizId),
    enabled: !!quizId,
    staleTime: 1 * 60 * 1000, // 1 minute
    onError: (error) => {
      const errorMessage = error.message || "Failed to fetch quiz";
      toast.error(errorMessage);
    },
    ...options,
  });
};

/**
 * Create quiz mutation hook
 */
export const useCreateQuizMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizData) => quizService.createQuiz(quizData),
    onSuccess: () => {
      // Invalidate quizzes list
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.all });

      // Also invalidate group quizzes
      queryClient.invalidateQueries({ queryKey: ["group-quizzes"] });

      toast.success("Quiz created");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to create quiz. Please try again.";

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
 * Update quiz mutation hook
 */
export const useUpdateQuizMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, data }) => quizService.updateQuiz(quizId, data),
    onSuccess: (data, variables) => {
      // Update specific quiz in cache
      queryClient.setQueryData(
        queryKeys.quizzes.detail(variables.quizId),
        data
      );

      // Invalidate quizzes list
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.all });

      // Also invalidate group quizzes
      queryClient.invalidateQueries({ queryKey: ["group-quizzes"] });

      toast.success("Quiz updated");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to update quiz. Please try again.";

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
 * Delete quiz mutation hook
 */
export const useDeleteQuizMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId) => quizService.deleteQuiz(quizId),
    onSuccess: (_, quizId) => {
      // Remove quiz from cache
      queryClient.removeQueries({
        queryKey: queryKeys.quizzes.detail(quizId),
      });

      // Invalidate quizzes list
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.all });

      // Also invalidate group quizzes
      queryClient.invalidateQueries({ queryKey: ["group-quizzes"] });

      toast.success("Quiz deleted");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to delete quiz. Please try again.";
      toast.error(errorMessage);
    },
  });
};

/**
 * Publish quiz mutation hook
 */
export const usePublishQuizMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId) => quizService.publishQuiz(quizId),
    onSuccess: (data, quizId) => {
      // Update specific quiz in cache
      queryClient.setQueryData(queryKeys.quizzes.detail(quizId), data);

      // Invalidate quizzes list
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.all });

      // Also invalidate group quizzes
      queryClient.invalidateQueries({ queryKey: ["group-quizzes"] });

      toast.success("Quiz published");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to publish quiz. Please try again.";
      toast.error(errorMessage);
    },
  });
};

/**
 * Cancel quiz mutation hook
 */
export const useCancelQuizMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId) => quizService.cancelQuiz(quizId),
    onSuccess: (data, quizId) => {
      // Update specific quiz in cache
      queryClient.setQueryData(queryKeys.quizzes.detail(quizId), data);

      // Invalidate quizzes list
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.all });

      // Also invalidate group quizzes
      queryClient.invalidateQueries({ queryKey: ["group-quizzes"] });

      toast.success("Quiz cancelled");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to cancel quiz. Please try again.";
      toast.error(errorMessage);
    },
  });
};

export default {
  useQuizzes,
  useQuiz,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
  usePublishQuizMutation,
  useCancelQuizMutation,
};
