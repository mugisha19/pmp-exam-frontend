import api from "./api";

const ANALYTICS_BASE_URL = "/statistics";

export const analyticsService = {
  // Student endpoints
  getStudentPerformance: async (userId, timeRange = "all") => {
    const response = await api.get(
      `${ANALYTICS_BASE_URL}/student/${userId}/performance`,
      {
        params: { time_range: timeRange },
      }
    );
    return response.data;
  },

  getStudentTopicPerformance: async (userId) => {
    const response = await api.get(
      `${ANALYTICS_BASE_URL}/student/${userId}/topic-performance`
    );
    return response.data;
  },

  getStudentQuizSpecific: async (userId, timeRange = "all") => {
    const response = await api.get(
      `${ANALYTICS_BASE_URL}/student/${userId}/quiz-specific`,
      {
        params: { time_range: timeRange },
      }
    );
    return response.data;
  },

  getStudentRecentActivity: async (userId) => {
    const response = await api.get(
      `${ANALYTICS_BASE_URL}/student/${userId}/recent-activity`
    );
    return response.data;
  },

  getStudentGroupComparison: async (userId, groupId = null) => {
    const response = await api.get(
      `${ANALYTICS_BASE_URL}/student/${userId}/group-comparison`,
      {
        params: groupId ? { group_id: groupId } : {},
      }
    );
    return response.data;
  },

  getAttemptsByDay: async (days = 7) => {
    const response = await api.get(
      `${ANALYTICS_BASE_URL}/admin/attempts-by-day`,
      {
        params: { days },
      }
    );
    return response.data;
  },

  getDashboard: async ({ days = 30 } = {}) => {
    const response = await api.get(`${ANALYTICS_BASE_URL}/admin/dashboard`, {
      params: { days },
    });
    return response.data;
  },

  getPlatformStats: async () => {
    const response = await api.get(
      `${ANALYTICS_BASE_URL}/admin/platform-overview`
    );
    return response.data;
  },

  getTopPerformers: async ({ limit = 10 } = {}) => {
    const response = await api.get(
      `${ANALYTICS_BASE_URL}/admin/top-performers`,
      {
        params: { limit },
      }
    );
    return response.data;
  },

  getMostActiveGroups: async ({ limit = 10 } = {}) => {
    const response = await api.get(
      `${ANALYTICS_BASE_URL}/admin/active-groups`,
      {
        params: { limit },
      }
    );
    return response.data;
  },
};

export default analyticsService;
