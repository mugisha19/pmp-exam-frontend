// In development, use full URL with port; in production, use relative path for proxy
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? "http://localhost:8000/api/v1" : "/api/v1");

if (import.meta.env.DEV) {
  console.log(
    "API Base URL:",
    API_BASE_URL,
    "(mode:",
    import.meta.env.MODE,
    ")"
  );
}

// Authentication endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  VERIFY_EMAIL: "/auth/verify-email",
  RESEND_VERIFICATION: "/auth/resend-verification",
  REFRESH_TOKEN: "/auth/refresh",
  LOGOUT: "/auth/logout",
  LOGOUT_ALL: "/auth/logout-all",
  GOOGLE_AUTH: "/auth/google",
  GOOGLE_CALLBACK: "/auth/google/callback",
  APPLE_AUTH: "/auth/apple",
  CHANGE_PASSWORD: "/auth/change-password",
};

// User endpoints
export const USER_ENDPOINTS = {
  PROFILE: "/users/me",
  UPDATE_PROFILE: "/users/me",
  SETTINGS: "/users/settings",
  LIST_USERS: "/users",
  GET_USER: (userId) => `/users/${userId}`,
  UPDATE_USER: (userId) => `/users/${userId}`,
  DELETE_USER: (userId) => `/users/${userId}`,
  UPDATE_USER_EMAIL: (userId) => `/users/${userId}/email`,
  UPDATE_USER_STATUS: (userId) => `/users/${userId}/status`,
  UPDATE_USER_ROLE: (userId) => `/users/${userId}/role`,
  RESEND_CREDENTIALS: (userId) => `/users/${userId}/resend-credentials`,
};

// Group endpoints
export const GROUP_ENDPOINTS = {
  LIST_GROUPS: "/groups",
  CREATE_GROUP: "/groups",
  GET_GROUP: (groupId) => `/groups/${groupId}`,
  UPDATE_GROUP: (groupId) => `/groups/${groupId}`,
  DELETE_GROUP: (groupId) => `/groups/${groupId}`,
  ADD_MEMBER: (groupId) => `/groups/${groupId}/members`,
  REMOVE_MEMBER: (groupId, userId) => `/groups/${groupId}/members/${userId}`,
  LIST_MEMBERS: (groupId) => `/groups/${groupId}/members`,
  GENERATE_INVITE: (groupId) => `/groups/${groupId}/invite-link`,
  PREVIEW_BY_TOKEN: (token) => `/groups/preview/${token}`,
  JOIN_BY_TOKEN: (token) => `/groups/join/${token}`,
  JOIN_REQUEST: "/groups/join-request",
  JOIN_REQUESTS: (groupId) => `/groups/${groupId}/join-requests`,
  APPROVE_REQUEST: (groupId, requestId) =>
    `/groups/${groupId}/approve-request/${requestId}`,
  MY_GROUPS: "/groups/me/groups",
  USER_GROUPS: (userId) => `/groups/users/${userId}/groups`,
  AVAILABLE_GROUPS: "/groups/available", // Public groups user hasn't joined
  GROUP_QUIZZES: (groupId) => `/groups/${groupId}/quizzes`,
  GROUP_QUIZ_STATS: (groupId) => `/groups/${groupId}/quiz-stats`,
};

// Quiz endpoints
export const QUIZ_ENDPOINTS = {
  // Courses
  LIST_COURSES: "/courses",
  CREATE_COURSE: "/courses",
  GET_COURSE: (courseId) => `/courses/${courseId}`,
  UPDATE_COURSE: (courseId) => `/courses/${courseId}`,
  DELETE_COURSE: (courseId) => `/courses/${courseId}`,

  // Domains
  LIST_DOMAINS: "/domains",
  CREATE_DOMAIN: "/domains",
  GET_DOMAIN: (domainId) => `/domains/${domainId}`,
  UPDATE_DOMAIN: (domainId) => `/domains/${domainId}`,
  DELETE_DOMAIN: (domainId) => `/domains/${domainId}`,

  // Topics
  LIST_TOPICS: "/topics",
  CREATE_TOPIC: "/topics",
  GET_TOPIC: (topicId) => `/topics/${topicId}`,
  UPDATE_TOPIC: (topicId) => `/topics/${topicId}`,
  DELETE_TOPIC: (topicId) => `/topics/${topicId}`,

  // Question Bank
  LIST_QUESTIONS: "/questions",
  CREATE_QUESTION: "/questions",
  GET_QUESTION: (questionId) => `/questions/${questionId}`,
  UPDATE_QUESTION: (questionId) => `/questions/${questionId}`,
  DELETE_QUESTION: (questionId) => `/questions/${questionId}`,
  BULK_IMPORT_QUESTIONS: "/questions/bulk-import",

  // Quiz Banks
  LIST_QUIZ_BANKS: "/quiz-banks",
  CREATE_QUIZ_BANK: "/quiz-banks",
  MERGE_QUIZ_BANKS: "/quiz-banks/merge",
  GET_QUIZ_BANK: (quizBankId) => `/quiz-banks/${quizBankId}`,
  UPDATE_QUIZ_BANK: (quizBankId) => `/quiz-banks/${quizBankId}`,
  DELETE_QUIZ_BANK: (quizBankId) => `/quiz-banks/${quizBankId}`,
  ADD_QUESTION_TO_BANK: (quizBankId) => `/quiz-banks/${quizBankId}/questions`,
  ADD_BULK_QUESTIONS_TO_BANK: (quizBankId) =>
    `/quiz-banks/${quizBankId}/questions/bulk`,
  LIST_BANK_QUESTIONS: (quizBankId) => `/quiz-banks/${quizBankId}/questions`,
  REMOVE_QUESTION_FROM_BANK: (quizBankId, questionId) =>
    `/quiz-banks/${quizBankId}/questions/${questionId}`,

  // Real Quizzes
  LIST_QUIZZES: "/quizzes",
  CREATE_QUIZ: "/quizzes",
  GET_QUIZ: (quizId) => `/quizzes/${quizId}`,
  UPDATE_QUIZ: (quizId) => `/quizzes/${quizId}`,
  DELETE_QUIZ: (quizId) => `/quizzes/${quizId}`,
  PUBLISH_QUIZ: (quizId) => `/quizzes/${quizId}/publish`,
  CANCEL_QUIZ: (quizId) => `/quizzes/${quizId}/cancel`,
  GET_QUIZ_STATS: (quizId) => `/quizzes/${quizId}/stats`,
  GET_QUIZ_LEADERBOARD: (quizId) => `/quizzes/${quizId}/leaderboard`,
  GET_QUIZ_ALL_ATTEMPTS: (quizId) => `/quizzes/${quizId}/all-attempts`,
  GET_QUIZ_ATTEMPTS: (quizId) => `/quizzes/${quizId}/attempts`,
  GET_ATTEMPT_REVIEW: (quizId, attemptId) => `/quizzes/${quizId}/attempts/${attemptId}/review`,
  
  // Publish Quiz Bank
  PUBLISH_TO_GROUP: "/quizzes/publish-to-group",
  PUBLISH_PUBLIC: "/quizzes/publish-public",
  LIST_PUBLISHED: "/quizzes/published",

  // Quiz Sessions
  START_SESSION: "/sessions/start",
  GET_SESSION: (sessionId) => `/sessions/${sessionId}`,
  SAVE_ANSWER: "/sessions/save-answer",
  SUBMIT_SESSION: "/sessions/submit",
  PAUSE_SESSION: "/sessions/pause",
  RESUME_SESSION: "/sessions/resume",
  HEARTBEAT: "/sessions/heartbeat",
  NEXT_QUESTION: (sessionId) => `/sessions/${sessionId}/next-question`,
  GO_TO_QUESTION: (sessionId, questionNumber) =>
    `/sessions/${sessionId}/go-to-question/${questionNumber}`,
  QUESTIONS_STATUS: (sessionId) => `/sessions/${sessionId}/questions-status`,
  TIME_REMAINING: (sessionId) => `/sessions/${sessionId}/time-remaining`,
  FLAG_QUESTION: (sessionId, questionId) =>
    `/sessions/${sessionId}/questions/${questionId}/flag`,
  UNFLAG_QUESTION: (sessionId, questionId) =>
    `/sessions/${sessionId}/questions/${questionId}/flag`,
  FLAGGED_QUESTIONS: (sessionId) => `/sessions/${sessionId}/flagged-questions`,

  // Performance
  DASHBOARD: "/performance/dashboard",
  ATTEMPTS: "/performance/attempts",
  GET_ATTEMPT: (attemptId) => `/performance/attempts/${attemptId}`,
  ATTEMPT_ANSWERS: (attemptId) => `/performance/attempts/${attemptId}/answers`,
  DOMAIN_ANALYSIS: "/performance/domain-analysis",
  TOPIC_MASTERY: "/performance/topic-mastery",
  WEAK_AREAS: "/performance/weak-areas",
  STUDY_HISTORY: "/performance/study-history",
  LEARNING_GOALS: "/performance/learning-goals",
  PERFORMANCE_TRENDS: "/performance/trends",
};

// Notification endpoints
export const NOTIFICATION_ENDPOINTS = {
  LIST_NOTIFICATIONS: "/notifications",
  GET_NOTIFICATION: (notificationId) => `/notifications/${notificationId}`,
  MARK_AS_READ: (notificationId) => `/notifications/${notificationId}/read`,
  MARK_ALL_READ: "/notifications/mark-all-read",
  DELETE_NOTIFICATION: (notificationId) => `/notifications/${notificationId}`,
  WEBSOCKET_URL: (userIdentifier) => `ws://localhost:8000/ws/${userIdentifier}`,
};

// Analytics endpoints
export const ANALYTICS_ENDPOINTS = {
  USER_ANALYTICS: (userId) => `/analytics/user/${userId}`,
  DASHBOARD: "/analytics/dashboard",
  INSTRUCTOR_DASHBOARD: "/analytics/instructor/dashboard",
  PLATFORM_STATS: "/analytics/platform-stats",
  USER_REGISTRATIONS: "/analytics/user-registrations",
  QUIZ_COMPLETIONS: "/analytics/quiz-completions",
  SCORE_DISTRIBUTION: "/analytics/score-distribution",
  DOMAIN_PERFORMANCE: "/analytics/domain-performance",
  TOP_PERFORMERS: "/analytics/top-performers",
  ACTIVE_GROUPS: "/analytics/active-groups",
  RECENT_ACTIVITY: "/analytics/recent-activity",
};

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Request timeout
export const REQUEST_TIMEOUT = 30000; // 30 seconds
