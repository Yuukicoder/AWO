import { create } from 'zustand';
import ingestService from '@/services/ingest.service';

const useIngestStore = create((set, get) => ({
  ingests: [],
  pagination: null,
  loading: false,
  actionLoading: null, // id of ingest currently being actioned
  error: null,
  filters: { status: 'pending_review', source: '' },

  // ─── Fetch ────────────────────────────────────────────────────────────────

  fetchIngests: async (overrideFilters = {}) => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const params = { ...filters, ...overrideFilters };
      // strip empty strings
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);

      const res = await ingestService.listIngests(params);
      set({
        ingests: res.data.items || [],
        pagination: res.data.pagination || null,
        loading: false,
      });
    } catch (err) {
      set({ error: err.response?.data?.message || err.message, loading: false });
    }
  },

  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
  },

  // ─── Approve ─────────────────────────────────────────────────────────────

  approveIngest: async (id, overrides = {}) => {
    set({ actionLoading: id });
    try {
      const res = await ingestService.approveIngest(id, overrides);
      // Remove from pending list
      set((state) => ({
        ingests: state.ingests.filter((i) => i._id !== id),
        actionLoading: null,
      }));
      return { success: true, data: res.data };
    } catch (err) {
      set({ actionLoading: null });
      return {
        success: false,
        message: err.response?.data?.message || err.message,
      };
    }
  },

  // ─── Reject ───────────────────────────────────────────────────────────────

  rejectIngest: async (id, reason) => {
    set({ actionLoading: id });
    try {
      await ingestService.rejectIngest(id, reason);
      set((state) => ({
        ingests: state.ingests.filter((i) => i._id !== id),
        actionLoading: null,
      }));
      return { success: true };
    } catch (err) {
      set({ actionLoading: null });
      return {
        success: false,
        message: err.response?.data?.message || err.message,
      };
    }
  },
}));

export default useIngestStore;
