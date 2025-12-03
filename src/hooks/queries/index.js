/**
 * Query Hooks Index
 * Central export for all React Query hooks
 */

// Authentication hooks
export * from "./useAuthQueries";

// User hooks
export * from "./useUserQueries";

// Topic hooks
export * from "./useTopicQueries";

// Question hooks
export * from "./useQuestionQueries";

// Quiz Bank hooks
export * from "./useQuizBankQueries";

// Quiz hooks
export * from "./useQuizQueries";

// Group hooks
export * from "./useGroupQueries";

// Notification hooks
export * from "./useNotificationQueries";

// Re-export commonly used hooks as default groups
export { default as authQueries } from "./useAuthQueries";
export { default as userQueries } from "./useUserQueries";
export { default as topicQueries } from "./useTopicQueries";
export { default as questionQueries } from "./useQuestionQueries";
export { default as quizBankQueries } from "./useQuizBankQueries";
export { default as quizQueries } from "./useQuizQueries";
export { default as groupQueries } from "./useGroupQueries";
export { default as notificationQueries } from "./useNotificationQueries";
