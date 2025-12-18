import {createStore} from "@/stores/createStore";
import ticketService from "@/services/ticket.service"
export const useTicketStore = createStore("ticketStore", (set, get) =>({
    tickets: [],
    ticket: null,
    loading: false,
    pagination: null,
    // Fetch
    fetchTickets: async (filters = {}) =>{
        set({loading: true});
            try {
                const res = await ticketService.getTicket(filters);
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
}))