/**
 * useQuizAttemptsBatch Hook
 * Fetch attempts for multiple quizzes efficiently
 */

import { useQueries } from "@tanstack/react-query";
import { getQuizAttempts } from "@/services/quiz.service";

/**
 * Fetch attempts for multiple quizzes
 * @param {string[]} quizIds - Array of quiz IDs
 * @param {Object} options - Query options
 */
export const useQuizAttemptsBatch = (quizIds = [], options = {}) => {
  const queries = useQueries({
    queries: quizIds.map((quizId) => ({
      queryKey: ["quiz-attempts", quizId],
      queryFn: () => getQuizAttempts(quizId),
      enabled: !!quizId && (options.enabled !== false),
      staleTime: 2 * 60 * 1000, // 2 minutes
      retry: 1,
      ...options,
    })),
  });

  // Transform results into a map for easy lookup
  const attemptsMap = {};
  queries.forEach((query, index) => {
    const quizId = quizIds[index];
    if (quizId && query.data) {
      // Extract attempt info from the response
      const attempts = query.data?.attempts || query.data || [];
      const attemptCount = Array.isArray(attempts) ? attempts.length : 0;
      const bestScore = Array.isArray(attempts) && attempts.length > 0
        ? Math.max(...attempts.map(a => a.score || a.percentage || 0))
        : null;
      const lastAttemptDate = Array.isArray(attempts) && attempts.length > 0
        ? attempts.sort((a, b) => new Date(b.completed_at || b.created_at) - new Date(a.completed_at || a.created_at))[0]?.completed_at || attempts[0]?.created_at
        : null;

      attemptsMap[quizId] = {
        attempts: attemptCount,
        best_score: bestScore,
        last_attempt_date: lastAttemptDate,
        data: attempts,
      };
    }
  });

  const isLoading = queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);

  return {
    attemptsMap,
    isLoading,
    isError,
    queries,
  };
};

export default useQuizAttemptsBatch;

