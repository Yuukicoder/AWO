import axiosInstance from "@/utils/axiosInstance";
class TicketService {
    createTicket(data){
        return axiosInstance.post("/tickets",data);
    }
    getTicket(params){
        return axiosInstance.get("/tickets", params);
    }
    getTicketById(id){
        return axiosInstance.get(`/tickets/${id}`);
    }
    getTicketByNumber(ticketNumber){
        return axiosInstance.get(`/tickets/number/${ticketNumber}`)
    }
    updateTicket(id, data){
        return axiosInstance.put(`/tickets/${id}`, data);
    }
    deleteTicket(id){
        return axiosInstance.delete(`/tickets/${id}`);
    }
    assignTicket(id, userId){
        return axiosInstance.post(`/tickets/${id}/assign`, { assignedTo: userId });
    }
    resolveTicket(id, notes){
        return axiosInstance.post(`/tickets/${id}/resolve`, notes);
    }
    getTicketStats(params){
        return axiosInstance.get(`tickets/stats`, {params});
    }
    searchTickets(q, params = {}){
        return axiosInstance.get(`/tickets/search`, {params: {q, ...params}});
    }
    getTicketsByReporter(email, params = {}){
        return axiosInstance.get(`/tickets/reporter/${email}`, {params});
    }
    getTicketsByAssignee(userId, params= {}){
        return axiosInstance.get(`/tickets/assignee/${userId}`, {params});
    }
    getOverdueTickets(params = {}){
        return axiosInstance.get(`/tickets/overdue`, {params})
    }

}

// Export as named exports for easier use in components
export const createTicket = (data) => new TicketService().createTicket(data);
export const getTicket = (params) => new TicketService().getTicket(params);
export const getTicketById = (id) => new TicketService().getTicketById(id);
export const updateTicket = (id, data) => new TicketService().updateTicket(id, data);
export const deleteTicket = (id) => new TicketService().deleteTicket(id);
export const assignTicket = (id, userId) => new TicketService().assignTicket(id, userId);
export const resolveTicket = (id, notes) => new TicketService().resolveTicket(id, notes);

export default new TicketService;
