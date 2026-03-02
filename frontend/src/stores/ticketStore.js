import {createStore} from "@/stores/createStore";
import ticketService from "@/services/ticket.service"

export const useTicketStore = createStore("ticketStore", (set, get) =>({
    tickets: [],
    ticket: null,
    loading: false,
    pagination: null,
    filters: {
        status: '',
        priority: '',
        assignee: '',
        reporter: '',
        slaStatus: '',
        dateFrom: null,
        dateTo: null,
    },
    searchQuery: '',
    stats: null,

    /* ================= QUERIES ================= */

    // Fetch all tickets with advanced filters
    fetchTickets: async (filters = {}) =>{
        set({loading: true});
            try {
                const { filters: storeFilters, searchQuery } = get();
                const mergedFilters = { ...storeFilters, ...filters, search: searchQuery };
                const res = await ticketService.getTicket({ params: mergedFilters });
                set({tickets: res.data.data,
                    pagination: res.data.pagination,
                 });
            } finally {
                set({loading: false});                
            }
    },

    fetchTicketsById: async (id) =>{
        set({loading: true});
        try {
            const res = await ticketService.getTicketById(id);
            set({ticket: res.data.data});
        } finally {
            set({loading: false})
        }
    },

    searchTickets: async (q, options = {}) =>{
        set({loading: true});
        try {
            const res = await ticketService.searchTickets(q, options);
            set({tickets: res.data.data});
        } finally {
            set({loading: false});
        }
    }, 
    fetchTicketsByReporter: async (email, options = {}) =>{
        set({loading: true});
        try {
            const res = await ticketService.getTicketsByReporter(email, options);
            set({tickets: res.data.data});
        } finally {
            set({loading: false});
        }
    },
    fetchTicketsByAssignee: async (userId, options = {}) =>{
        set({loading: true});
        try {
            const res = await ticketService.getTicketsByAssignee(userId, options);
            set({tickets: res.data.data});
        } finally {
            set({loading: false});
            
        }
    }, 
    fetchOverdueTickets: async(options = {}) =>{
        set({loading: true});
        try {
            const res = await ticketService.getOverdueTickets(options);
            set({tickets: res.data.data});
        } finally {
            set({loading: false});
        }
    },
     /* ================= MUTATION ================= */
  createTicket: async (payload) => {
    const res = await ticketService.createTicket(payload);
    set({ tickets: [res.data.data, ...get().tickets] });
    return res.data;
  },

  updateTicket: async (id, payload) => {
    const res = await ticketService.updateTicket(id, payload);
    set({
      tickets: get().tickets.map((t) =>
        t._id === id ? res.data.data : t
      ),
    });
  },

  assignTicket: async (id, userId) => {
    const res = await ticketService.assignTicket(id, userId);
    set({
      tickets: get().tickets.map((t) =>
        t._id === id ? res.data.data : t
      ),
    });
  },

  resolveTicket: async (id, notes) => {
    const res = await ticketService.resolveTicket(id, notes);
    set({
      tickets: get().tickets.map((t) =>
        t._id === id ? res.data.data : t
      ),
    });
  },

  deleteTicket: async (id) => {
    await ticketService.deleteTicket(id);
    set({
      tickets: get().tickets.filter((t) => t._id !== id),
    });
  },

  /* ================= FILTERS & SEARCH ================= */

  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
  },

  updateFilter: (key, value) => {
    set({ filters: { ...get().filters, [key]: value } });
  },

  clearFilters: () => {
    set({
      filters: {
        status: '',
        priority: '',
        assignee: '',
        reporter: '',
        slaStatus: '',
        dateFrom: null,
        dateTo: null,
      },
      searchQuery: '',
    });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  applyFilters: async () => {
    await get().fetchTickets();
  },

  /* ================= STATISTICS ================= */

  fetchStats: async () => {
    try {
      const res = await ticketService.getTicketStats();
      set({ stats: res.data.data });
    } catch (error) {
      console.error('Error fetching ticket stats:', error);
    }
  },

  /* ================= REAL-TIME EVENTS ================= */

  handleTicketCreated: (ticket) => {
    set({ tickets: [ticket, ...get().tickets] });
  },

  handleTicketUpdated: (ticket) => {
    set({
      tickets: get().tickets.map((t) => (t._id === ticket._id ? ticket : t)),
      ticket: get().ticket?._id === ticket._id ? ticket : get().ticket,
    });
  },

  handleTicketDeleted: (ticketId) => {
    set({
      tickets: get().tickets.filter((t) => t._id !== ticketId),
      ticket: get().ticket?._id === ticketId ? null : get().ticket,
    });
  },

  handleTicketAssigned: (data) => {
    set({
      tickets: get().tickets.map((t) =>
        t._id === data.ticketId ? { ...t, assignedTo: data.assignedTo } : t
      ),
    });
  },

  /* ================= HELPERS ================= */

  getTicketsByStatus: (status) => {
    return get().tickets.filter((t) => t.status === status);
  },

  getOverdueTickets: () => {
    const now = new Date();
    return get().tickets.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'closed'
    );
  },

  getTicketsByPriority: (priority) => {
    return get().tickets.filter((t) => t.priority === priority);
  },
}))