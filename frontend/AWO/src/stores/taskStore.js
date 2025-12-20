import {createStore} from "@/stores/createStore"
import taskService from "@/services/task.service"
export const useTaskStore = createStore("taskStore", (set, get) =>({
    tasks: [],
    task: null,
    loading: false,
    pagination: null,

    // Fetch
    fetchTasks: async(filters = {}) =>{
        set({loading: true});
        try {
            const res = await taskService.getTasks(filters);
            set({
                tasks: res.data.data,
                pagination: res.data.pagination,
            })
        } finally {
            set({loading: false});
        }
    },

    fetTasksById: async (id) =>{
        set({loading: true});
        try {
            const res = await taskService.getTaskById(id);
            set({task: res.data.data});
        } finally {
            set({loading: false});
        }
    },

    // =================== MUTATION ===============
    createTask: async (payload) =>{
        const res = await taskService.createTask(payload);
        set({tickets: [res.data.data, ...get().tasks]});
        return res.data;
    },
    updateTask: async(id, payload) =>{
        const res = await taskService.updateTask(id, payload);
        set({
            tasks: get().tasks.map((t) => t._id === id? res.data.data : t),
        })
    },
    assignTask: async(id, userId) =>{
        const res = await taskService.assignTask(id, userId);
        set({
            tasks: get().tasks.map((t) => t._id === id ? res.data.data : t),
        })
    },
    deleteTask: async(id) =>{
        await taskService.deleteTask(id);
        set({
            tasks: get().tasks.filter((t) => t._id !== id),
        })
    },
    // ===================== Utils =============
    clearTask: () => set({task: null}),
    // dọn dẹp state chi tiết khi không còn dùng nữa để tránh dữ liệu cũ gây bug UI.
}))