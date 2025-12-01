/**
 * React Query Client Configuration
 * Centralized configuration for TanStack Query (React Query)
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * Default query options
 */
const defaultOptions = {
  queries: {
    // Data is considered fresh for 5 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes

    // Retry failed requests once
    retry: 1,

    // Don't refetch on window focus
    refetchOnWindowFocus: false,

    // Refetch on mount if data is stale
    refetchOnMount: true,

    // Don't refetch on reconnect
    refetchOnReconnect: false,

    // Keep unused data in cache for 10 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes

    // Suspense mode disabled by default
    suspense: false,
  },
  mutations: {
    // Retry failed mutations once
    retry: 1,

    // Don't retry on network errors
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
};

/**
 * Create and configure Query Client
 */
export const queryClient = new QueryClient({
  defaultOptions,
});

/**
 * Query key factory for consistent cache keys
 */
export const queryKeys = {
  // Auth
  auth: {
    user: ["auth", "user"],
    session: ["auth", "session"],
  },

  // Users
  users: {
    all: ["users"],
    list: (filters) => ["users", "list", filters],
    detail: (userId) => ["users", "detail", userId],
    current: () => ["users", "current"],
  },

  // Groups
  groups: {
    all: ["groups"],
    list: (filters) => ["groups", "list", filters],
    detail: (groupId) => ["groups", "detail", groupId],
    members: (groupId) => ["groups", groupId, "members"],
    myGroups: () => ["groups", "my"],
    quizzes: (groupId) => ["groups", groupId, "quizzes"],
    stats: (groupId) => ["groups", groupId, "stats"],
  },

  // Quizzes
  quizzes: {
    all: ["quizzes"],
    list: (filters) => ["quizzes", "list", filters],
    detail: (quizId) => ["quizzes", "detail", quizId],
    session: (sessionId) => ["quizzes", "session", sessionId],
    attempts: (filters) => ["quizzes", "attempts", filters],
    attempt: (attemptId) => ["quizzes", "attempt", attemptId],
  },

  // Quiz Banks
  quizBanks: {
    all: ["quiz-banks"],
    list: (filters) => ["quiz-banks", "list", filters],
    detail: (quizBankId) => ["quiz-banks", "detail", quizBankId],
    questions: (quizBankId) => ["quiz-banks", quizBankId, "questions"],
  },

  // Questions
  questions: {
    all: ["questions"],
    list: (filters) => ["questions", "list", filters],
    detail: (questionId) => ["questions", "detail", questionId],
  },

  // Topics
  topics: {
    all: ["topics"],
    list: () => ["topics", "list"],
    detail: (topicId) => ["topics", "detail", topicId],
  },

  // Performance
  performance: {
    dashboard: () => ["performance", "dashboard"],
    attempts: (filters) => ["performance", "attempts", filters],
    domainAnalysis: () => ["performance", "domain-analysis"],
    topicMastery: () => ["performance", "topic-mastery"],
    weakAreas: (threshold) => ["performance", "weak-areas", threshold],
    studyHistory: () => ["performance", "study-history"],
    learningGoals: () => ["performance", "learning-goals"],
  },

  // Notifications
  notifications: {
    all: ["notifications"],
    list: (filters) => ["notifications", "list", filters],
    unreadCount: () => ["notifications", "unread-count"],
  },

  // Analytics
  analytics: {
    user: (userId) => ["analytics", "user", userId],
  },
};

/**
 * Invalidate queries helper
 */
export const invalidateQueries = {
  users: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  groups: () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.groups.all }),
  quizzes: () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.all }),
  questions: () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.questions.all }),
  notifications: () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  performance: () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.performance.dashboard(),
    }),
};

/**
 * Prefetch query helper
 * @param {Array} queryKey - Query key
 * @param {Function} queryFn - Query function
 */
export const prefetchQuery = async (queryKey, queryFn) => {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
  });
};

/**
 * Set query data helper
 * @param {Array} queryKey - Query key
 * @param {any} data - Data to set
 */
export const setQueryData = (queryKey, data) => {
  queryClient.setQueryData(queryKey, data);
};

/**
 * Get query data helper
 * @param {Array} queryKey - Query key
 * @returns {any} Query data
 */
export const getQueryData = (queryKey) => {
  return queryClient.getQueryData(queryKey);
};

/**
 * Clear all queries
 */
export const clearAllQueries = () => {
  queryClient.clear();
};

/**
 * Remove query helper
 * @param {Array} queryKey - Query key
 */
export const removeQuery = (queryKey) => {
  queryClient.removeQueries({ queryKey });
};

/**
 * Reset queries helper
 * @param {Array} queryKey - Query key (optional)
 */
export const resetQueries = (queryKey) => {
  if (queryKey) {
    queryClient.resetQueries({ queryKey });
  } else {
    queryClient.resetQueries();
  }
};

export default queryClient;
