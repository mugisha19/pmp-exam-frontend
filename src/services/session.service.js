/**
 * Quiz Session Service
 * Handles quiz taking session management (session_v2 API)
 */

import api from "./api";

// Backend route: /api/v1/sessions (session_v2.py has prefix="/v1/sessions")
// Frontend API base: /api/v1
// So we need: /sessions to get /api/v1/sessions
const SESSION_BASE = "/sessions";

/**
 * Start a new quiz session
 * @param {string} quizId - Quiz ID to start
 * @returns {Promise<Object>} Session state with questions
 */
export const startQuizSession = async (quizId) => {
  const response = await api.post(`${SESSION_BASE}/start`, { quiz_id: quizId });
  return response.data;
};

/**
 * Get active session (for resume)
 * @returns {Promise<Object>} Active session or null
 */
export const getActiveSession = async () => {
  const response = await api.get(`${SESSION_BASE}/active`);
  return response.data;
};

/**
 * Get session state
 * @param {string} sessionToken - Session token
 * @returns {Promise<Object>} Current session state
 */
export const getSessionState = async (sessionToken) => {
  const response = await api.get(`${SESSION_BASE}/state`, {
    headers: { "X-Session-Token": sessionToken },
  });
  return response.data;
};

/**
 * Save a single answer
 * @param {string} sessionToken - Session token
 * @param {Object} answerData - Answer data
 * @returns {Promise<Object>} Save result
 */
export const saveAnswer = async (sessionToken, answerData) => {
  const response = await api.post(`${SESSION_BASE}/save-answer`, answerData, {
    headers: { "X-Session-Token": sessionToken },
  });
  return response.data;
};

/**
 * Save multiple answers (auto-save)
 * @param {string} sessionToken - Session token
 * @param {Object} data - Answers data
 * @returns {Promise<Object>} Save result
 */
export const saveMultipleAnswers = async (sessionToken, data) => {
  const response = await api.post(`${SESSION_BASE}/save-answers`, data, {
    headers: { "X-Session-Token": sessionToken },
  });
  return response.data;
};

/**
 * Pause quiz
 * @param {string} sessionToken - Session token
 * @returns {Promise<Object>} Pause result
 */
export const pauseQuiz = async (sessionToken) => {
  const response = await api.post(`${SESSION_BASE}/pause`, null, {
    headers: { "X-Session-Token": sessionToken },
  });
  return response.data;
};

/**
 * Resume quiz
 * @param {string} sessionToken - Session token
 * @returns {Promise<Object>} Resume result with session state
 */
export const resumeQuiz = async (sessionToken) => {
  const response = await api.post(`${SESSION_BASE}/resume`, null, {
    headers: { "X-Session-Token": sessionToken },
  });
  return response.data;
};

/**
 * Submit quiz
 * @param {string} sessionToken - Session token
 * @param {Object} data - Final answers (optional)
 * @returns {Promise<Object>} Quiz results
 */
export const submitQuiz = async (sessionToken, data = null) => {
  const response = await api.post(`${SESSION_BASE}/submit`, data, {
    headers: { "X-Session-Token": sessionToken },
  });
  return response.data;
};

/**
 * Abandon quiz
 * @param {string} sessionToken - Session token
 * @returns {Promise<Object>} Abandon result
 */
export const abandonQuiz = async (sessionToken) => {
  const response = await api.post(`${SESSION_BASE}/abandon`, null, {
    headers: { "X-Session-Token": sessionToken },
  });
  return response.data;
};

/**
 * Flag/unflag a question
 * @param {string} sessionToken - Session token
 * @param {string} quizQuestionId - Question ID
 * @param {boolean} isFlagged - Flag status
 * @returns {Promise<Object>} Flag result
 */
export const flagQuestion = async (sessionToken, quizQuestionId, isFlagged) => {
  const response = await api.post(
    `${SESSION_BASE}/flag`,
    { quiz_question_id: quizQuestionId, is_flagged: isFlagged },
    { headers: { "X-Session-Token": sessionToken } }
  );
  return response.data;
};

/**
 * Navigate to specific question
 * @param {string} sessionToken - Session token
 * @param {number} questionNumber - Question number (1-indexed)
 * @returns {Promise<Object>} Navigation result
 */
export const navigateToQuestion = async (sessionToken, questionNumber) => {
  const response = await api.post(
    `${SESSION_BASE}/navigate/${questionNumber}`,
    null,
    { headers: { "X-Session-Token": sessionToken } }
  );
  return response.data;
};

/**
 * Send heartbeat to keep session alive
 * @param {string} sessionToken - Session token
 * @returns {Promise<Object>} Heartbeat result with timing info
 */
export const sendHeartbeat = async (sessionToken) => {
  const response = await api.get(`${SESSION_BASE}/heartbeat`, {
    headers: { "X-Session-Token": sessionToken },
  });
  return response.data;
};

/**
 * Check network connectivity
 * @returns {Promise<boolean>} True if online
 */
export const checkNetworkStatus = async () => {
  if (!navigator.onLine) {
    return false;
  }
  
  try {
    const response = await api.get("/health", { timeout: 5000 });
    return response.status === 200;
  } catch {
    return false;
  }
};

export default {
  startQuizSession,
  getActiveSession,
  getSessionState,
  saveAnswer,
  saveMultipleAnswers,
  pauseQuiz,
  resumeQuiz,
  submitQuiz,
  abandonQuiz,
  flagQuestion,
  navigateToQuestion,
  sendHeartbeat,
  checkNetworkStatus,
};
