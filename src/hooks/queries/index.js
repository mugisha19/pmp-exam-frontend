/**
 * Query Hooks Index
 * Central export for all React Query hooks
 */

// Authentication hooks
export * from "./useAuthQueries";

// User hooks
export * from "./useUserQueries";

// Re-export commonly used hooks as default groups
export { default as authQueries } from "./useAuthQueries";
export { default as userQueries } from "./useUserQueries";
