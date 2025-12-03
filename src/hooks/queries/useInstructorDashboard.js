/**
 * useInstructorDashboard Hook
 * Fetch instructor dashboard data including stats, active quizzes, and recent activity
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-client";
import analyticsService from "@/services/analytics.service";
import quizService from "@/services/quiz.service";
import questionService from "@/services/question.service";
import quizBankService from "@/services/quizBank.service";
import groupService from "@/services/group.service";

/**
 * Hook to fetch all instructor dashboard data
 */
export function useInstructorDashboardData() {
  return useQuery({
    queryKey: queryKeys.analytics.instructor(),
    queryFn: async () => {
      try {
        // Try to fetch from analytics endpoint first
        const response = await analyticsService.getInstructorDashboard();
        return response;
      } catch {
        // Fallback: fetch individual data
        console.warn(
          "Analytics endpoint unavailable, fetching individual data"
        );
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

export function useInstructorQuestionCount() {
  return useQuery({
    queryKey: [...queryKeys.questions.all, "instructor-count"],
    queryFn: async () => {
      try {
        const response = await questionService.getMyQuestions({ page_size: 1 });
        return response?.total || 0;
      } catch {
        return 0;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useInstructorQuizBankCount() {
  return useQuery({
    queryKey: [...queryKeys.quizBanks.all, "instructor-count"],
    queryFn: async () => {
      try {
        const response = await quizBankService.getMyQuizBanks({ page_size: 1 });
        return response?.total || 0;
      } catch {
        return 0;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch instructor's active quiz count
 */
export function useInstructorActiveQuizCount() {
  return useQuery({
    queryKey: [...queryKeys.quizzes.all, "instructor-active-count"],
    queryFn: async () => {
      try {
        const response = await quizService.getMyQuizzes({
          status: "active",
          page_size: 1,
        });
        return response?.total || 0;
      } catch {
        return 0;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch instructor's group count
 */
export function useInstructorGroupCount() {
  return useQuery({
    queryKey: [...queryKeys.groups.all, "instructor-count"],
    queryFn: async () => {
      try {
        const response = await groupService.getMyGroups({ page_size: 1 });
        return response?.total || 0;
      } catch {
        return 0;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch instructor's active quizzes list
 */
export function useInstructorActiveQuizzes(limit = 5) {
  return useQuery({
    queryKey: [...queryKeys.quizzes.all, "instructor-active-list", limit],
    queryFn: async () => {
      try {
        const response = await quizService.getMyQuizzes({
          status: "active",
          page_size: limit,
        });
        return response?.items || response || [];
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch recent student activity
 */
export function useRecentStudentActivity(limit = 5) {
  return useQuery({
    queryKey: [...queryKeys.analytics.all, "recent-student-activity", limit],
    queryFn: async () => {
      try {
        const response = await analyticsService.getRecentActivity({
          limit,
          type: "quiz_completion",
        });
        return response?.items || response || [];
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes for more real-time updates
  });
}

/**
 * Combined hook for all instructor dashboard stats
 */
export function useInstructorStats() {
  const questionsQuery = useInstructorQuestionCount();
  const quizBanksQuery = useInstructorQuizBankCount();
  const activeQuizzesQuery = useInstructorActiveQuizCount();
  const groupsQuery = useInstructorGroupCount();

  const isLoading =
    questionsQuery.isLoading ||
    quizBanksQuery.isLoading ||
    activeQuizzesQuery.isLoading ||
    groupsQuery.isLoading;

  const isError =
    questionsQuery.isError &&
    quizBanksQuery.isError &&
    activeQuizzesQuery.isError &&
    groupsQuery.isError;

  return {
    stats: {
      questions: questionsQuery.data || 0,
      quizBanks: quizBanksQuery.data || 0,
      activeQuizzes: activeQuizzesQuery.data || 0,
      groups: groupsQuery.data || 0,
    },
    isLoading,
    isError,
    refetch: () => {
      questionsQuery.refetch();
      quizBanksQuery.refetch();
      activeQuizzesQuery.refetch();
      groupsQuery.refetch();
    },
  };
}

export default useInstructorDashboardData;
