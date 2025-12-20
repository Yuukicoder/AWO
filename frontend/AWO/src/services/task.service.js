import axiosInstance from '../utils/axiosInstance';

class TaskService {
  /**
   * Get all tasks
   */
  getTasks(params = {}) {
    return axiosInstance.get('/tasks', { params });
  }

  /**
   * Get task by ID
   */
  getTaskById(id) {
    return axiosInstance.get(`/tasks/${id}`);
  }

  /**
   * Create new task
   */
  createTask(data) {
    return axiosInstance.post('/tasks', data);
  }

  /**
   * Update task
   */
  updateTask(id, data) {
    return axiosInstance.put(`/tasks/${id}`, data);
  }

  /**
   * Delete task
   */
  deleteTask(id) {
    return axiosInstance.delete(`/tasks/${id}`);
  }

  /**
   * Assign task to user
   */
  assignTask(id, userId) {
    return axiosInstance.patch(`/tasks/${id}/assign`, { assignedTo: userId });
  }

  /**
   * Update task status
   */
  updateTaskStatus(id, status) {
    return axiosInstance.patch(`/tasks/${id}/status`, { status });
  }

  /**
   * Get tasks by ticket
   */
  getTasksByTicket(ticketId) {
    return axiosInstance.get(`/tasks/ticket/${ticketId}`);
  }

  /**
   * Get tasks by assignee
   */
  getTasksByAssignee(userId) {
    return axiosInstance.get(`/tasks/assignee/${userId}`);
  }

  /**
   * Get task statistics
   */
  getTaskStats(params = {}) {
    return axiosInstance.get('/tasks/stats', { params });
  }
}

// Export as named exports for easier use in components
const taskServiceInstance = new TaskService();

export const getTasks = (params) => taskServiceInstance.getTasks(params);
export const getTaskById = (id) => taskServiceInstance.getTaskById(id);
export const createTask = (data) => taskServiceInstance.createTask(data);
export const updateTask = (id, data) => taskServiceInstance.updateTask(id, data);
export const deleteTask = (id) => taskServiceInstance.deleteTask(id);
export const assignTask = (id, userId) => taskServiceInstance.assignTask(id, userId);
export const updateTaskStatus = (id, status) => taskServiceInstance.updateTaskStatus(id, status);
export const getTasksByTicket = (ticketId) => taskServiceInstance.getTasksByTicket(ticketId);
export const getTasksByAssignee = (userId) => taskServiceInstance.getTasksByAssignee(userId);
export const getTaskStats = (params) => taskServiceInstance.getTaskStats(params);

export default taskServiceInstance;
