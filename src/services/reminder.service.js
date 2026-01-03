import api from "./api";

const REMINDER_BASE_URL = "/reminders";

export const reminderService = {
  getReminders: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get(REMINDER_BASE_URL, { params });
    return response.data;
  },

  getReminder: async (reminderId) => {
    const response = await api.get(`${REMINDER_BASE_URL}/${reminderId}`);
    return response.data;
  },

  getDefaultOptions: async (quizId) => {
    const response = await api.get(`${REMINDER_BASE_URL}/default-options/${quizId}`);
    return response.data;
  },

  createReminder: async (reminderData) => {
    const response = await api.post(REMINDER_BASE_URL, reminderData);
    return response.data;
  },

  updateReminder: async (reminderId, updateData) => {
    const response = await api.put(`${REMINDER_BASE_URL}/${reminderId}`, updateData);
    return response.data;
  },

  deleteReminder: async (reminderId) => {
    await api.delete(`${REMINDER_BASE_URL}/${reminderId}`);
  },
};

export default reminderService;
