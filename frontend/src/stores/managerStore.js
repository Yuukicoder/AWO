import { create } from 'zustand';
import managerService from '../services/manager.service';

const useManagerStore = create((set, get) => ({
  // State
  overview: null,
  teamWorkload: [],
  taskQueue: [],
  suggestions: [],
  selectedTicket: null,
  loading: false,
  error: null,

  // Actions
  fetchDashboardOverview: async () => {
    set({ loading: true, error: null });
    try {
      const data = await managerService.getDashboardOverview();
      set({ overview: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchTeamWorkload: async () => {
    set({ loading: true, error: null });
    try {
      const data = await managerService.getTeamWorkload();
      set({ teamWorkload: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchTaskQueue: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const data = await managerService.getTaskQueue(filters);
      set({ taskQueue: data.tasks || [], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchWorkloadSuggestions: async () => {
    set({ loading: true, error: null });
    try {
      const data = await managerService.getWorkloadSuggestions();
      set({ suggestions: data.suggestions || [], loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchManagerTicketDetail: async (ticketId) => {
    set({ loading: true, error: null });
    try {
      const data = await managerService.getTicketDetail(ticketId);
      set({ selectedTicket: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  calculateWorkloadImpact: async (userId, estimatedHours) => {
    try {
      const impact = await managerService.calculateWorkloadImpact(userId, estimatedHours);
      return impact;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Intervention actions
  reassignTicket: async (ticketId, fromUserId, toUserId, reason) => {
    try {
      // Call ticket reassignment API
      await managerService.reassignTicket(ticketId, toUserId, reason);
      // Refresh data
      await get().fetchTaskQueue();
      await get().fetchTeamWorkload();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  changePriority: async (ticketId, newPriority) => {
    try {
      await managerService.updateTicketPriority(ticketId, newPriority);
      await get().fetchTaskQueue();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  
  clearSelectedTicket: () => set({ selectedTicket: null }),
}));

export default useManagerStore;
