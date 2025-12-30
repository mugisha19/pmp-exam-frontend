import api from "./api";

const ANALYTICS_BASE_URL = "/statistics";

export const analyticsService = {
  // Student endpoints
  getStudentPerformance: async (userId, timeRange = "all") => {
    const response = await api.get(`${ANALYTICS_BASE_URL}/student/${userId}/performance`, {
      params: { time_range: timeRange }
    });
    return response.data;
  },

  getStudentTopicPerformance: async (userId) => {
    const response = await api.get(`${ANALYTICS_BASE_URL}/student/${userId}/topic-performance`);
    return response.data;
  },

  getStudentQuizSpecific: async (userId, timeRange = "all") => {
    const response = await api.get(`${ANALYTICS_BASE_URL}/student/${userId}/quiz-specific`, {
      params: { time_range: timeRange }
    });
    return response.data;
  },

  getStudentRecentActivity: async (userId) => {
    const response = await api.get(`${ANALYTICS_BASE_URL}/student/${userId}/recent-activity`);
    return response.data;
  },

  getStudentGroupComparison: async (userId, groupId = null) => {
    const response = await api.get(`${ANALYTICS_BASE_URL}/student/${userId}/group-comparison`, {
      params: groupId ? { group_id: groupId } : {}
    });
    return response.data;
  }
};

export default analyticsService;
