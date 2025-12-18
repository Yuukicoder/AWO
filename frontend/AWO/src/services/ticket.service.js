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
        return axiosInstance.post(`/tickets/${id}/assign`, userId);
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
export default new TicketService;