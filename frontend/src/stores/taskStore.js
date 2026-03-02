import {createStore} from "@/stores/createStore"
import taskService from "@/services/task.service"

export const useTaskStore = createStore("taskStore", (set, get) =>({
    tasks: [],
    task: null,
    loading: false,
    pagination: null,
    filters: {
        status: '',
        priority: '',
        assignee: '',
        parent_ticket: '',
    },
    stats: {
        total: 0,
        pending: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
    },

    // Fetch
    fetchTasks: async(filters = {}) =>{
        set({loading: true});
        try {
            const res = await taskService.getTasks(filters);
            set({
                tasks: res.data.data || [],
                pagination: res.data.pagination,
                stats: res.data.stats || get().stats,
            })
        } catch (error) {
            console.error('Error fetching tasks:', error);
            set({ tasks: [] });
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
    
    // Filter methods
    updateFilter: (key, value) => {
        set({
            filters: {
                ...get().filters,
                [key]: value
            }
        });
    },
    
    clearFilters: () => {
        set({
            filters: {
                status: '',
                priority: '',
                assignee: '',
                parent_ticket: '',
            }
        });
    },
    
    applyFilters: async () => {
        const currentFilters = get().filters;
        await get().fetchTasks(currentFilters);
    },
    
    setFilters: (newFilters) => {
        set({ filters: { ...get().filters, ...newFilters } });
    },

    // Fetch all tasks assigned to a specific user (used on HomePage kanban)
    fetchMyTasks: async (userId, extraFilters = {}) => {
        set({ loading: true });
        try {
            const res = await taskService.getTasksByAssignee(userId, { limit: 100, ...extraFilters });
            set({
                tasks: res.data.data || [],
                pagination: res.data.pagination,
                stats: res.data.stats || get().stats,
            });
        } catch (error) {
            console.error('Error fetching my tasks:', error);
            set({ tasks: [] });
        } finally {
            set({ loading: false });
        }
    },

    // Group current tasks by status (derived helper for kanban)
    getKanbanColumns: () => {
        const tasks = get().tasks;
        return {
            todo:        tasks.filter(t => t.status === 'todo'),
            in_progress: tasks.filter(t => t.status === 'in_progress'),
            review:      tasks.filter(t => t.status === 'review'),
            done:        tasks.filter(t => t.status === 'done'),
        };
    },

    // dọn dẹp state chi tiết khi không còn dùng nữa để tránh dữ liệu cũ gây bug UI.
}))
