/**
 * Quiz Bank React Query Hooks
 * Custom hooks for quiz bank management operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as quizBankService from "@/services/quizBank.service";
import { queryKeys } from "@/lib/query-client";

/**
 * Get quiz banks with filters query hook
 * @param {Object} filters - Query filters (skip, limit)
 * @param {Object} options - Query options
 */
export const useQuizBanks = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.quizBanks.list(filters),
    queryFn: () => quizBankService.getQuizBanks(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    keepPreviousData: true, // Keep previous data on filter change
    onError: (error) => {
      const errorMessage = error.message || "Failed to fetch quiz banks";
      toast.error(errorMessage);
    },
    ...options,
  });
};

/**
 * Get quiz bank by ID query hook
 * @param {string} quizBankId - Quiz bank ID
 * @param {Object} options - Query options
 */
export const useQuizBank = (quizBankId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.quizBanks.detail(quizBankId),
    queryFn: () => quizBankService.getQuizBankById(quizBankId),
    enabled: !!quizBankId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    onError: (error) => {
      const errorMessage = error.message || "Failed to fetch quiz bank";
      toast.error(errorMessage);
    },
    ...options,
  });
};

/**
 * Get quiz bank questions query hook
 * @param {string} quizBankId - Quiz bank ID
 * @param {Object} options - Query options
 */
export const useQuizBankQuestions = (quizBankId, options = {}) => {
  return useQuery({
    queryKey: ["quiz-bank-questions", quizBankId],
    queryFn: () => quizBankService.getBankQuestions(quizBankId),
    enabled: !!quizBankId,
    staleTime: 1 * 60 * 1000, // 1 minute
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to fetch quiz bank questions";
      toast.error(errorMessage);
    },
    ...options,
  });
};

/**
 * Create quiz bank mutation hook
 */
export const useCreateQuizBankMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizBankData) => quizBankService.createQuizBank(quizBankData),
    onSuccess: () => {
      // Invalidate quiz banks list
      queryClient.invalidateQueries({ queryKey: queryKeys.quizBanks.all });

      toast.success("Quiz bank created");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to create quiz bank. Please try again.";

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
 * Update quiz bank mutation hook
 */
export const useUpdateQuizBankMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizBankId, data }) =>
      quizBankService.updateQuizBank(quizBankId, data),
    onSuccess: (data, variables) => {
      // Update specific quiz bank in cache
      queryClient.setQueryData(
        queryKeys.quizBanks.detail(variables.quizBankId),
        data
      );

      // Invalidate quiz banks list
      queryClient.invalidateQueries({ queryKey: queryKeys.quizBanks.all });

      toast.success("Quiz bank updated");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to update quiz bank. Please try again.";

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
 * Delete quiz bank mutation hook
 */
export const useDeleteQuizBankMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizBankId) => quizBankService.deleteQuizBank(quizBankId),
    onSuccess: (_, quizBankId) => {
      // Remove quiz bank from cache
      queryClient.removeQueries({
        queryKey: queryKeys.quizBanks.detail(quizBankId),
      });

      // Remove quiz bank questions from cache
      queryClient.removeQueries({
        queryKey: ["quiz-bank-questions", quizBankId],
      });

      // Invalidate quiz banks list
      queryClient.invalidateQueries({ queryKey: queryKeys.quizBanks.all });

      toast.success("Quiz bank deleted");
    },
    onError: (error) => {
      const errorMessage =
        error.message || "Failed to delete quiz bank. Please try again.";
      toast.error(errorMessage);
    },
  });
};

/**
 * Add single question to quiz bank mutation hook
 */
export const useAddQuestionToBankMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizBankId, questionId }) =>
      quizBankService.addQuestionToBank(quizBankId, questionId),
    onSuccess: (_, variables) => {
      // Invalidate quiz bank questions
      queryClient.invalidateQueries({
        queryKey: ["quiz-bank-questions", variables.quizBankId],
      });

      // Also invalidate quiz bank detail to update question count
      queryClient.invalidateQueries({
        queryKey: queryKeys.quizBanks.detail(variables.quizBankId),
      });

      toast.success("Question added to quiz bank");
    },
    onError: (error) => {
      const errorMessage =
        error.message ||
        "Failed to add question to quiz bank. Please try again.";
      toast.error(errorMessage);
    },
  });
};

/**
 * Add multiple questions to quiz bank mutation hook (bulk)
 */
export const useAddQuestionsToBankMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizBankId, questionIds }) =>
      quizBankService.addQuestionsToBank(quizBankId, questionIds),
    onSuccess: (data, variables) => {
      // Invalidate quiz bank questions
      queryClient.invalidateQueries({
        queryKey: ["quiz-bank-questions", variables.quizBankId],
      });

      // Also invalidate quiz bank detail to update question count
      queryClient.invalidateQueries({
        queryKey: queryKeys.quizBanks.detail(variables.quizBankId),
      });

      const count = data?.added_count || variables.questionIds?.length || 0;
      toast.success(`${count} questions added to quiz bank`);
    },
    onError: (error) => {
      const errorMessage =
        error.message ||
        "Failed to add questions to quiz bank. Please try again.";
      toast.error(errorMessage);
    },
  });
};

/**
 * Remove question from quiz bank mutation hook
 */
export const useRemoveQuestionFromBankMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizBankId, questionId }) =>
      quizBankService.removeQuestionFromBank(quizBankId, questionId),
    onSuccess: (_, variables) => {
      // Invalidate quiz bank questions
      queryClient.invalidateQueries({
        queryKey: ["quiz-bank-questions", variables.quizBankId],
      });

      // Also invalidate quiz bank detail to update question count
      queryClient.invalidateQueries({
        queryKey: queryKeys.quizBanks.detail(variables.quizBankId),
      });

      toast.success("Question removed from quiz bank");
    },
    onError: (error) => {
      const errorMessage =
        error.message ||
        "Failed to remove question from quiz bank. Please try again.";
      toast.error(errorMessage);
    },
  });
};

export default {
  useQuizBanks,
  useQuizBank,
  useQuizBankQuestions,
  useCreateQuizBankMutation,
  useUpdateQuizBankMutation,
  useDeleteQuizBankMutation,
  useAddQuestionToBankMutation,
  useAddQuestionsToBankMutation,
  useRemoveQuestionFromBankMutation,
};
