/**
 * Route Constants
 * Application route definitions organized by user role
 */

// Authentication routes
export const AUTH_ROUTES = {
  LOGIN: "/login",
  SIGNUP: "/signup",
  REGISTER: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",
  GOOGLE_CALLBACK: "/auth/google/callback",
  APPLE_CALLBACK: "/auth/apple/callback",
};

// Public route paths
export const PUBLIC_ROUTE_PATHS = {
  JOIN_GROUP: "/join-group",
};

// Student routes
export const STUDENT_ROUTES = {
  ROOT: "/student",
  DASHBOARD: "/student/dashboard",
  QUIZZES: "/student/quizzes",
  QUIZ_DETAIL: "/student/quizzes/:quizId",
  QUIZ_TAKE: "/student/quizzes/:quizId/take",
  QUIZ_RESULTS: "/student/quizzes/:quizId/results",
  QUIZ_REVIEW: "/student/quizzes/:quizId/review",
  GROUPS: "/student/groups",
  GROUP_DETAIL: "/student/groups/:groupId",
  PERFORMANCE: "/student/performance",
  DOMAIN_ANALYSIS: "/student/performance/domain-analysis",
  TOPIC_MASTERY: "/student/performance/topic-mastery",
  STUDY_HISTORY: "/student/performance/history",
  WEAK_AREAS: "/student/performance/weak-areas",
  CHAT: "/student/chat",
  PROFILE: "/student/profile",
  SETTINGS: "/student/settings",
  NOTIFICATIONS: "/student/notifications",
};

// Instructor routes
export const INSTRUCTOR_ROUTES = {
  ROOT: "/instructor",
  DASHBOARD: "/instructor/dashboard",

  // Quiz Management
  QUIZZES: "/instructor/quizzes",
  QUIZ_CREATE: "/instructor/quizzes/create",
  QUIZ_EDIT: "/instructor/quizzes/:quizId/edit",
  QUIZ_DETAIL: "/instructor/quizzes/:quizId",
  QUIZ_PREVIEW: "/instructor/quizzes/:quizId/preview",

  // Quiz Bank Management
  QUIZ_BANKS: "/instructor/quiz-banks",
  QUIZ_BANK_CREATE: "/instructor/quiz-banks/create",
  QUIZ_BANK_EDIT: "/instructor/quiz-banks/:quizBankId/edit",
  QUIZ_BANK_DETAIL: "/instructor/quiz-banks/:quizBankId",

  // Question Bank Management
  QUESTIONS: "/instructor/questions",
  QUESTION_CREATE: "/instructor/questions/create",
  QUESTION_EDIT: "/instructor/questions/:questionId/edit",
  QUESTION_BULK_IMPORT: "/instructor/questions/bulk-import",

  // Topic Management
  TOPICS: "/instructor/topics",
  TOPIC_CREATE: "/instructor/topics/create",
  TOPIC_EDIT: "/instructor/topics/:topicId/edit",

  // Group Management
  GROUPS: "/instructor/groups",
  GROUP_CREATE: "/instructor/groups/create",
  GROUP_EDIT: "/instructor/groups/:groupId/edit",
  GROUP_DETAIL: "/instructor/groups/:groupId",
  GROUP_MEMBERS: "/instructor/groups/:groupId/members",

  // Students & Analytics
  STUDENTS: "/instructor/students",
  STUDENT_DETAIL: "/instructor/students/:studentId",
  STUDENT_PERFORMANCE: "/instructor/students/:studentId/performance",
  ANALYTICS: "/instructor/analytics",

  // Profile & Settings
  PROFILE: "/instructor/profile",
  SETTINGS: "/instructor/settings",
  NOTIFICATIONS: "/instructor/notifications",
};

// Admin routes
export const ADMIN_ROUTES = {
  ROOT: "/admin",
  DASHBOARD: "/admin/dashboard",

  // User Management
  USERS: "/admin/users",
  USER_CREATE: "/admin/users/create",
  USER_EDIT: "/admin/users/:userId/edit",
  USER_DETAIL: "/admin/users/:userId",

  // Instructor Management
  INSTRUCTORS: "/admin/instructors",
  INSTRUCTOR_CREATE: "/admin/instructors/create",
  INSTRUCTOR_DETAIL: "/admin/instructors/:instructorId",

  // Student Management
  STUDENTS: "/admin/students",
  STUDENT_DETAIL: "/admin/students/:studentId",

  // Quiz Management
  QUIZZES: "/admin/quizzes",
  QUIZ_DETAIL: "/admin/quizzes/:quizId",

  // Topic Management
  TOPICS: "/admin/topics",
  TOPIC_CREATE: "/admin/topics/create",
  TOPIC_EDIT: "/admin/topics/:topicId/edit",
  TOPIC_DETAIL: "/admin/topics/:topicId",

  // Question Bank
  QUESTIONS: "/admin/questions",
  QUESTION_DETAIL: "/admin/questions/:questionId",

  // Quiz Bank Management
  QUIZ_BANKS: "/admin/quiz-banks",
  QUIZ_BANK_CREATE: "/admin/quiz-banks/create",
  QUIZ_BANK_EDIT: "/admin/quiz-banks/:quizBankId/edit",
  QUIZ_BANK_DETAIL: "/admin/quiz-banks/:quizBankId",
  QUIZ_BANK_ADD_QUESTIONS: "/admin/quiz-banks/:quizBankId/add-questions",

  // Group Management
  GROUPS: "/admin/groups",
  GROUP_DETAIL: "/admin/groups/:groupId",

  // System Settings
  SETTINGS: "/admin/settings",
  SETTINGS_GENERAL: "/admin/settings/general",
  SETTINGS_EMAIL: "/admin/settings/email",
  SETTINGS_OAUTH: "/admin/settings/oauth",
  SETTINGS_NOTIFICATIONS: "/admin/settings/notifications",

  // Analytics & Reports
  ANALYTICS: "/admin/analytics",
  REPORTS: "/admin/reports",

  // Audit & Logs
  AUDIT_LOGS: "/admin/audit-logs",
  SYSTEM_LOGS: "/admin/system-logs",

  // Profile
  PROFILE: "/admin/profile",
  NOTIFICATIONS: "/admin/notifications",
};

// Common routes (accessible to all authenticated users)
export const COMMON_ROUTES = {
  HOME: "/",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  NOTIFICATIONS: "/notifications",
  HELP: "/help",
  PRIVACY_POLICY: "/privacy-policy",
  TERMS_OF_SERVICE: "/terms-of-service",
  CONTACT: "/contact",
  NOT_FOUND: "/404",
  UNAUTHORIZED: "/401",
  FORBIDDEN: "/403",
  SERVER_ERROR: "/500",
};

// Public routes (no authentication required)
export const PUBLIC_ROUTES = [
  AUTH_ROUTES.LOGIN,
  AUTH_ROUTES.SIGNUP,
  AUTH_ROUTES.FORGOT_PASSWORD,
  AUTH_ROUTES.RESET_PASSWORD,
  AUTH_ROUTES.VERIFY_EMAIL,
  AUTH_ROUTES.GOOGLE_CALLBACK,
  AUTH_ROUTES.APPLE_CALLBACK,
  PUBLIC_ROUTE_PATHS.JOIN_GROUP,
  COMMON_ROUTES.HOME,
  COMMON_ROUTES.HELP,
  COMMON_ROUTES.PRIVACY_POLICY,
  COMMON_ROUTES.TERMS_OF_SERVICE,
  COMMON_ROUTES.CONTACT,
];

// Routes that don't require email verification
export const UNVERIFIED_ALLOWED_ROUTES = [
  ...PUBLIC_ROUTES,
  COMMON_ROUTES.PROFILE,
  COMMON_ROUTES.SETTINGS,
  AUTH_ROUTES.VERIFY_EMAIL,
];

/**
 * Build route with parameters
 * @param {string} route - Route template with parameters
 * @param {Object} params - Parameters to replace in route
 * @returns {string} Built route
 */
export const buildRoute = (route, params = {}) => {
  let builtRoute = route;

  Object.entries(params).forEach(([key, value]) => {
    builtRoute = builtRoute.replace(`:${key}`, value);
  });

  return builtRoute;
};

/**
 * Check if a route is public
 * @param {string} path - Route path
 * @returns {boolean}
 */
export const isPublicRoute = (path) => {
  return PUBLIC_ROUTES.some((route) => {
    // Handle exact matches
    if (route === path) return true;

    // Handle dynamic routes (e.g., /verify-email/:token)
    const routePattern = route.replace(/:[^/]+/g, "[^/]+");
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(path);
  });
};

/**
 * Check if route is accessible without email verification
 * @param {string} path - Route path
 * @returns {boolean}
 */
export const isUnverifiedAllowedRoute = (path) => {
  return UNVERIFIED_ALLOWED_ROUTES.some((route) => {
    if (route === path) return true;
    const routePattern = route.replace(/:[^/]+/g, "[^/]+");
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(path);
  });
};

/**
 * Get all routes for a specific role
 * @param {string} role - User role
 * @returns {Object} Routes object for the role
 */
export const getRoutesByRole = (role) => {
  const routesMap = {
    student: STUDENT_ROUTES,
    instructor: INSTRUCTOR_ROUTES,
    admin: ADMIN_ROUTES,
  };

  return routesMap[role] || COMMON_ROUTES;
};
