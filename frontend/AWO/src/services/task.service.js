import axios from "@/utils/axiosInstance";
class TaskService{
    createTask(data){
        return axios.post("/tasks", data);
    }

    getTasks(params){
        return axios.get("/tasks", params);
    }
    getTaskById(id){
        return axios.get(`/tasks/${id}`);
    }
    updateTask(id, data){
        return axios.put(`/tasks/${id}`, data);
    }
    deleteTask(id){
        return axios.delete(`/tasks/${id}`);
    }
    assignTask(id, userId){
        return axios.post(`/tasks/${id}/assign`, userId);
    }
}
export default new TaskService;