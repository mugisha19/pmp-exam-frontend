/**
 * Question React Query Hooks
 * Custom hooks for question bank management operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as questionService from "@/services/question.service";
import { queryKeys } from "@/lib/query-client";

/**
 * Get questions with filters query hook
 * @param {Object} filters - Query filters (topic_id, domain, difficulty, skip, limit)
 * @param {Object} options - Query options
 */
export const useQuestions = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.questions.list(filters),
    queryFn: () => questionService.getQuestions(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    keepPreviousData: true, // Keep previous data on filter change
    onError: (error) => {
      const errorMessage = error.message || "Failed to fetch questions";
      toast.error(errorMessage);
    },
    ...options,
  });
};

/**
 * Get question by ID query hook
 * @param {string} questionId - Question ID
 * @param {Object} options - Query options
 */
export const useQuestion = (questionId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.questions.detail(questionId),
    queryFn: () => questionService.getQuestionById(questionId),
    enabled: !!questionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    onError: (error) => {
      const errorMessage = error.message || "Failed to fetch question";
      toast.error(errorMessage);
    },
    ...options,
  });
};

/**
 * Create question mutation hook
 */
export const useCreateQuestionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionData) => questionService.createQuestion(questionData),
    onSuccess: () => {
      // Invalidate questions list
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.all });

      toast.success("Question created");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to create question. Please try again.";

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
 * Update question mutation hook
 */
export const useUpdateQuestionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, data }) =>
      questionService.updateQuestion(questionId, data),
    onSuccess: (data, variables) => {
      // Update specific question in cache
      queryClient.setQueryData(
        queryKeys.questions.detail(variables.questionId),
        data
      );

      // Invalidate questions list
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.all });

      // Also invalidate quiz bank questions since question content may have changed
      queryClient.invalidateQueries({ queryKey: ["quiz-bank-questions"] });

      toast.success("Question updated");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to update question. Please try again.";

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
 * Delete question mutation hook
 */
export const useDeleteQuestionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId) => questionService.deleteQuestion(questionId),
    onSuccess: (_, questionId) => {
      // Remove question from cache
      queryClient.removeQueries({
        queryKey: queryKeys.questions.detail(questionId),
      });

      // Invalidate questions list
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.all });

      // Also invalidate quiz bank questions since question may have been in banks
      queryClient.invalidateQueries({ queryKey: ["quiz-bank-questions"] });

      toast.success("Question deleted");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to delete question. Please try again.";
      toast.error(errorMessage);
    },
  });
};

/**
 * Bulk import questions mutation hook
 */
export const useBulkImportMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questions) => questionService.bulkImportQuestions(questions),
    onSuccess: (data) => {
      // Invalidate questions list
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.all });

      // Show success toast with count
      const count = data?.imported_count || data?.count || 0;
      toast.success(`${count} questions imported`);
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to import questions. Please try again.";

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

export default {
  useQuestions,
  useQuestion,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useBulkImportMutation,
};
