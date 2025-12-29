/**
 * Services Index
 * Central export point for all API services
 */

// Core API client
export { default as api } from "./api";
export {
  refreshAccessToken,
  isAuthenticated,
  setAuthToken,
  clearAuthToken,
} from "./api";

// Authentication Service
export { default as authService } from "./auth.service";
export {
  login,
  register,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  refreshToken,
  logout,
  getGoogleAuthUrl,
  getAppleAuthUrl,
  handleGoogleCallback,
  changePassword,
  validateSession,
} from "./auth.service";

// User Service (Admin user management)
export { default as userService } from "./user.service";
export {
  getCurrentUser,
  updateProfile,
  updateSettings,
  getUserById,
  getUsers,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserEmail,
  updateUserStatus,
  updateUserRole,
  resendCredentials,
} from "./user.service";

// Topic Service
export { default as topicService } from "./topic.service";
export {
  getTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
} from "./topic.service";

// Question Service
export { default as questionService } from "./question.service";
export {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkImportQuestions,
} from "./question.service";

// Quiz Bank Service
export { default as quizBankService } from "./quizBank.service";
export {
  getQuizBanks,
  getQuizBankById,
  createQuizBank,
  mergeQuizBanks,
  updateQuizBank,
  deleteQuizBank,
  addQuestionToBank,
  addQuestionsToBank,
  getBankQuestions,
  removeQuestionFromBank,
} from "./quizBank.service";

// Quiz Service (Real Quizzes)
export { default as quizService } from "./quiz.service";
export {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  publishQuiz,
  cancelQuiz,
} from "./quiz.service";

// Group Service
export { default as groupService } from "./group.service";
export {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupMembers,
  addGroupMember,
  removeGroupMember,
  getJoinRequests,
  approveJoinRequest,
  generateInviteLink,
  getGroupQuizzes,
  getMyGroups,
} from "./group.service";

// Notification Service
export { default as notificationService } from "./notification.service";
export {
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getWebSocketUrl,
} from "./notification.service";

// Analytics Service
export { default as analyticsService } from "./analytics.service";
export {
  getUserAnalytics,
  getPerformanceDashboard,
  getDomainAnalysis,
  getTopicMastery,
  getWeakAreas,
  getAttempts,
  getAttemptById,
  getAttemptAnswers,
  getStudyHistory,
  getLearningGoals,
} from "./analytics.service";
