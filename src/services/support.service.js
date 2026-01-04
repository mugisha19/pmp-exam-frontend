import api from "./api";

const SUPPORT_BASE_URL = "/support";

export const supportService = {
  createTicket: async (ticketData) => {
    const response = await api.post(SUPPORT_BASE_URL, ticketData);
    return response.data;
  },

  getMyTickets: async (skip = 0, limit = 50) => {
    const response = await api.get(`${SUPPORT_BASE_URL}/my-tickets`, {
      params: { skip, limit },
    });
    return response.data;
  },

  // Admin endpoints
  getAllTickets: async (status = null, skip = 0, limit = 50) => {
    const response = await api.get(`${SUPPORT_BASE_URL}/admin/tickets`, {
      params: { status, skip, limit },
    });
    return response.data;
  },

  getTicketById: async (ticketId) => {
    const response = await api.get(`${SUPPORT_BASE_URL}/admin/tickets/${ticketId}`);
    return response.data;
  },

  updateTicket: async (ticketId, updateData) => {
    const response = await api.patch(`${SUPPORT_BASE_URL}/admin/tickets/${ticketId}`, updateData);
    return response.data;
  },
};

export default supportService;
