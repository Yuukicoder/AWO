import axiosInstance from '../utils/axiosInstance';

const API_BASE = '/v1/manager'; // Removed /api because axiosInstance baseURL already has /api

const managerService = {
  // Dashboard Overview
  getDashboardOverview: async () => {
    const response = await axiosInstance.get(`${API_BASE}/dashboard/overview`);
    return response.data.data;
  },

  // Team Workload
  getTeamWorkload: async () => {
    const response = await axiosInstance.get(`${API_BASE}/workload/team`);
    return response.data.data;
  },

  getUserWorkload: async (userId) => {
    const response = await axiosInstance.get(`${API_BASE}/workload/user/${userId}`);
    return response.data.data;
  },

  getWorkloadSuggestions: async () => {
    const response = await axiosInstance.get(`${API_BASE}/workload/suggestions`);
    return response.data.data;
  },

  calculateWorkloadImpact: async (userId, estimatedHours) => {
    const response = await axiosInstance.post(`${API_BASE}/workload/impact`, {
      userId,
      estimatedHours
    });
    return response.data.data;
  },

  // Task Queue
  getTaskQueue: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.assignee) params.append('assignee', filters.assignee);
    if (filters.unassigned) params.append('unassigned', 'true');
    if (filters.page) params.append('page', filters.page);
    if (filters.page_size) params.append('page_size', filters.page_size);

    const response = await axiosInstance.get(`${API_BASE}/tasks/queue?${params}`);
    return response.data.data;
  },

  // Ticket Detail
  getTicketDetail: async (ticketId) => {
    const response = await axiosInstance.get(`${API_BASE}/tickets/${ticketId}`);
    return response.data.data;
  },

  // Performance Analytics
  getTeamPerformance: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await axiosInstance.get(`${API_BASE}/analytics/performance?${params}`);
    return response.data.data;
  },

  // Intervention Actions (using existing ticket APIs)
  reassignTicket: async (ticketId, toUserId, reason) => {
    const response = await axiosInstance.post(`/api/tickets/${ticketId}/assign`, {
      user_id: toUserId,
      notes: reason
    });
    return response.data;
  },

  updateTicketPriority: async (ticketId, priority) => {
    const response = await axiosInstance.patch(`/api/tickets/${ticketId}`, {
      priority
    });
    return response.data;
  },

  updateTicketStatus: async (ticketId, status) => {
    const response = await axiosInstance.patch(`/api/tickets/${ticketId}/status`, {
      status
    });
    return response.data;
  },
};

export default managerService;
