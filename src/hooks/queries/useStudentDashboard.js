/**
 * Student Dashboard React Query Hooks
 * Custom hooks for student dashboard data fetching
 */

import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as groupService from "@/services/group.service";
import * as quizService from "@/services/quiz.service";
import { queryKeys } from "@/lib/query-client";

/**
 * Get student dashboard statistics
 */
export const useStudentDashboardStats = (options = {}) => {
  return useQuery({
    queryKey: ["student", "dashboard", "stats"],
    queryFn: async () => {
      // Fetch data in parallel
      const [groupsData, quizzesData] = await Promise.all([
        groupService.getMyGroups({ limit: 100 }).catch(() => ({ items: [] })),
        quizService.getPublishedQuizzes({ limit: 100 }).catch(() => ({ items: [] })),
      ]);

      const myGroups = groupsData?.items || groupsData || [];
      const availableQuizzes = quizzesData?.quizzes || quizzesData?.items || quizzesData || [];

      // Calculate stats
      const totalGroups = myGroups.length;
      const activeQuizzes = availableQuizzes.filter(q => 
        q.status === 'active' || q.status === 'published'
      ).length;
      
      // Count completed attempts (would need actual attempts data)
      const completedAttempts = 0; // Placeholder
      const averageScore = 0; // Placeholder

      return {
        totalGroups,
        activeQuizzes,
        completedAttempts,
        averageScore,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: () => {
      toast.error("Failed to load dashboard statistics");
    },
    ...options,
  });
};

/**
 * Get student's recent groups
 */
export const useRecentGroups = (limit = 5, options = {}) => {
  return useQuery({
    queryKey: ["student", "groups", "recent", { limit }],
    queryFn: () => groupService.getMyGroups({ limit }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (data) => data?.items || data || [],
    onError: () => {
      // Error handled silently
    },
    ...options,
  });
};

/**
 * Get student's available quizzes
 */
export const useAvailableQuizzes = (limit = 5, options = {}) => {
  return useQuery({
    queryKey: ["student", "quizzes", "available", { limit }],
    queryFn: () => quizService.getPublishedQuizzes({ limit }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    select: (data) => data?.quizzes || data?.items || data || [],
    onError: () => {
      // Error handled silently
    },
    ...options,
  });
};

/**
 * Get student's recent activity
 * This generates activity from groups and quizzes
 */
export const useStudentActivity = (options = {}) => {
  return useQuery({
    queryKey: ["student", "dashboard", "activity"],
    queryFn: async () => {
      const [groups, quizzes] = await Promise.all([
        groupService.getMyGroups({ limit: 3 }).catch(() => ({ items: [] })),
        quizService.getPublishedQuizzes({ limit: 3 }).catch(() => ({ items: [] })),
      ]);

      const activity = [];

      // Add group activities
      const groupItems = groups?.items || groups || [];
      groupItems.forEach((group) => {
        activity.push({
          type: "group_joined",
          title: group.name,
          subtitle: `Joined ${group.group_type || 'group'}`,
          timestamp: group.joined_at || group.created_at,
        });
      });

      // Add quiz activities
      const quizItems = quizzes?.quizzes || quizzes?.items || quizzes || [];
      quizItems.forEach((quiz) => {
        activity.push({
          type: "quiz_available",
          title: quiz.title,
          subtitle: `Available until ${new Date(quiz.ends_at).toLocaleDateString()}`,
          timestamp: quiz.starts_at || quiz.created_at,
        });
      });

      // Sort by timestamp
      activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return activity.slice(0, 5);
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
};

/**
 * Combined hook for all student dashboard data
 */
export const useStudentDashboardData = () => {
  const stats = useStudentDashboardStats();
  const recentGroups = useRecentGroups(5);
  const availableQuizzes = useAvailableQuizzes(5);
  const activity = useStudentActivity();

  const isLoading =
    stats.isLoading ||
    recentGroups.isLoading ||
    availableQuizzes.isLoading ||
    activity.isLoading;

  const isError = 
    stats.isError && 
    recentGroups.isError && 
    availableQuizzes.isError;

  const refetchAll = () => {
    stats.refetch();
    recentGroups.refetch();
    availableQuizzes.refetch();
    activity.refetch();
  };

  return {
    stats: stats.data,
    recentGroups: recentGroups.data,
    availableQuizzes: availableQuizzes.data,
    activity: activity.data,
    isLoading,
    isError,
    refetchAll,
    queries: {
      stats,
      recentGroups,
      availableQuizzes,
      activity,
    },
  };
};

export default {
  useStudentDashboardStats,
  useRecentGroups,
  useAvailableQuizzes,
  useStudentActivity,
  useStudentDashboardData,
};
