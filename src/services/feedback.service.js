/**
 * Feedback Service
 */

import api from "./api";

export const submitFeedback = async (attemptId, rating, comment) => {
  const response = await api.post("/feedback", {
    attempt_id: attemptId,
    rating,
    comment: comment || null,
  });
  return response.data;
};

export const getQuizFeedback = async (quizId, params = {}) => {
  const response = await api.get("/feedback/admin/feedbacks", {
    params: {
      quiz_id: quizId,
      ...params,
    },
  });
  return response.data;
};

export default {
  submitFeedback,
  getQuizFeedback,
};
