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

export default {
  submitFeedback,
};
