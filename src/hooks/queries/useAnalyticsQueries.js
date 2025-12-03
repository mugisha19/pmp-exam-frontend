/**
 * Analytics Queries Hook
 * React Query hooks for analytics data
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-client";
import analyticsService from "@/services/analytics.service";

/**
 * Hook to fetch admin dashboard analytics
 */
export function useAnalyticsDashboard() {
  return useQuery({
    queryKey: queryKeys.analytics.dashboard(),
    queryFn: () => analyticsService.getDashboard(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch platform overview stats
 */
export function usePlatformStats() {
  return useQuery({
    queryKey: [...queryKeys.analytics.all, "platform-stats"],
    queryFn: () => analyticsService.getPlatformStats(),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch user registration analytics
 */
export function useUserRegistrationAnalytics(params = {}) {
  return useQuery({
    queryKey: [...queryKeys.analytics.all, "user-registrations", params],
    queryFn: () => analyticsService.getUserRegistrations(params),
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook to fetch quiz completion analytics
 */
export function useQuizCompletionAnalytics(params = {}) {
  return useQuery({
    queryKey: [...queryKeys.analytics.all, "quiz-completions", params],
    queryFn: () => analyticsService.getQuizCompletions(params),
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook to fetch score distribution analytics
 */
export function useScoreDistribution(params = {}) {
  return useQuery({
    queryKey: [...queryKeys.analytics.all, "score-distribution", params],
    queryFn: () => analyticsService.getScoreDistribution(params),
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook to fetch domain performance analytics
 */
export function useDomainPerformance(params = {}) {
  return useQuery({
    queryKey: [...queryKeys.analytics.all, "domain-performance", params],
    queryFn: () => analyticsService.getDomainPerformance(params),
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook to fetch top performers
 */
export function useTopPerformers(limit = 10) {
  return useQuery({
    queryKey: [...queryKeys.analytics.all, "top-performers", limit],
    queryFn: () => analyticsService.getTopPerformers({ limit }),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch most active groups
 */
export function useMostActiveGroups(limit = 10) {
  return useQuery({
    queryKey: [...queryKeys.analytics.all, "active-groups", limit],
    queryFn: () => analyticsService.getMostActiveGroups({ limit }),
    staleTime: 1000 * 60 * 5,
  });
}

export default {
  useAnalyticsDashboard,
  usePlatformStats,
  useUserRegistrationAnalytics,
  useQuizCompletionAnalytics,
  useScoreDistribution,
  useDomainPerformance,
  useTopPerformers,
  useMostActiveGroups,
};
