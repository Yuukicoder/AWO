import { createStore } from '@/stores/createStore';
import taskService from '@/services/task.service';

/**
 * Task Store - Zustand state management
 * Handles task CRUD, filtering, search, and real-time updates
 * Integration with ticket store for parent-child relationship
 */
export const useTaskStore = createStore('taskStore', (set, get) => ({
  // State
  tasks: [],
  task: null,
  loading: false,
  pagination: null,
  filters: {
    status: '',
    priority: '',
    assignee: '',
    ticketId: '',
    dateFrom: null,
    dateTo: null,
  },
  searchQuery: '',

  /* ================= QUERIES ================= */

  /**
   * Fetch all tasks with filters
   */
  fetchTasks: async (filters = {}) => {
    set({ loading: true });
    try {
      const res = await taskService.getTasks(filters);
      set({
        tasks: res.data.data,
        pagination: res.data.pagination,
      });
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Fetch single task by ID
   */
  fetchTaskById: async (id) => {
    set({ loading: true });
    try {
      const res = await taskService.getTaskById(id);
      set({ task: res.data.data });
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Fetch tasks by ticket ID (parent-child relationship)
   */
  fetchTasksByTicket: async (ticketId, options = {}) => {
    set({ loading: true });
    try {
      const res = await taskService.getTasks({ ticketId, ...options });
      set({
        tasks: res.data.data,
        pagination: res.data.pagination,
      });
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Fetch tasks by assignee
   */
  fetchTasksByAssignee: async (userId, options = {}) => {
    set({ loading: true });
    try {
      const res = await taskService.getTasks({ assignedTo: userId, ...options });
      set({
        tasks: res.data.data,
        pagination: res.data.pagination,
      });
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Search tasks by query
   */
  searchTasks: async (query, options = {}) => {
    set({ loading: true, searchQuery: query });
    try {
      const res = await taskService.getTasks({ search: query, ...options });
      set({
        tasks: res.data.data,
        pagination: res.data.pagination,
      });
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Fetch overdue tasks
   */
  fetchOverdueTasks: async (options = {}) => {
    set({ loading: true });
    try {
      const now = new Date().toISOString();
      const res = await taskService.getTasks({
        dueDateBefore: now,
        status: ['pending', 'in_progress'],
        ...options,
      });
      set({
        tasks: res.data.data,
        pagination: res.data.pagination,
      });
    } finally {
      set({ loading: false });
    }
  },

  /* ================= MUTATIONS ================= */

  /**
   * Create new task
   */
  createTask: async (payload) => {
    const res = await taskService.createTask(payload);
    set({ tasks: [res.data.data, ...get().tasks] });
    return res.data;
  },

  /**
   * Update task
   */
  updateTask: async (id, payload) => {
    const res = await taskService.updateTask(id, payload);
    set({
      tasks: get().tasks.map((t) => (t._id === id ? res.data.data : t)),
      task: get().task?._id === id ? res.data.data : get().task,
    });
    return res.data;
  },

  /**
   * Assign task to user
   */
  assignTask: async (id, userId) => {
    const res = await taskService.assignTask(id, userId);
    set({
      tasks: get().tasks.map((t) => (t._id === id ? res.data.data : t)),
    });
    return res.data;
  },

  /**
   * Update task status
   */
  updateTaskStatus: async (id, status) => {
    const res = await taskService.updateTask(id, { status });
    set({
      tasks: get().tasks.map((t) => (t._id === id ? res.data.data : t)),
    });
    return res.data;
  },

  /**
   * Delete task (soft delete)
   */
  deleteTask: async (id) => {
    await taskService.deleteTask(id);
    set({
      tasks: get().tasks.filter((t) => t._id !== id),
    });
  },

  /* ================= FILTERS ================= */

  /**
   * Set filters
   */
  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
  },

  /**
   * Update single filter
   */
  updateFilter: (key, value) => {
    set({ filters: { ...get().filters, [key]: value } });
  },

  /**
   * Clear all filters
   */
  clearFilters: () => {
    set({
      filters: {
        status: '',
        priority: '',
        assignee: '',
        ticketId: '',
        dateFrom: null,
        dateTo: null,
      },
      searchQuery: '',
    });
  },

  /**
   * Apply filters and fetch
   */
  applyFilters: async () => {
    const { filters, searchQuery } = get();
    await get().fetchTasks({
      ...filters,
      search: searchQuery,
    });
  },

  /* ================= REAL-TIME EVENTS ================= */

  /**
   * Handle task created event from socket
   */
  handleTaskCreated: (task) => {
    set({ tasks: [task, ...get().tasks] });
  },

  /**
   * Handle task updated event from socket
   */
  handleTaskUpdated: (task) => {
    set({
      tasks: get().tasks.map((t) => (t._id === task._id ? task : t)),
      task: get().task?._id === task._id ? task : get().task,
    });
  },

  /**
   * Handle task deleted event from socket
   */
  handleTaskDeleted: (taskId) => {
    set({
      tasks: get().tasks.filter((t) => t._id !== taskId),
      task: get().task?._id === taskId ? null : get().task,
    });
  },

  /**
   * Handle task assigned event from socket
   */
  handleTaskAssigned: (data) => {
    set({
      tasks: get().tasks.map((t) =>
        t._id === data.taskId ? { ...t, assignedTo: data.assignedTo } : t
      ),
    });
  },

  /* ================= HELPERS ================= */

  /**
   * Get tasks by status
   */
  getTasksByStatus: (status) => {
    return get().tasks.filter((t) => t.status === status);
  },

  /**
   * Get tasks by priority
   */
  getTasksByPriority: (priority) => {
    return get().tasks.filter((t) => t.priority === priority);
  },

  /**
   * Get tasks by ticket
   */
  getTasksByTicket: (ticketId) => {
    return get().tasks.filter((t) => t.ticketId === ticketId);
  },

  /**
   * Get overdue tasks
   */
  getOverdueTasks: () => {
    const now = new Date();
    return get().tasks.filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate) < now &&
        !['completed', 'cancelled'].includes(t.status)
    );
  },

  /**
   * Get task completion rate
   */
  getCompletionRate: () => {
    const tasks = get().tasks;
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
  },
}));

export default useTaskStore;
