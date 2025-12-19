import taskRepository from '../repository/task.repository.js';
import eventService from './event.service.js';

class TaskService {
  /**
   * Create a new task
   */
  async createTask(taskData) {
    try {
      const task = await taskRepository.create(taskData);
      
      //   Broadcast event
      await eventService.broadcastEvent('task:created', {
        taskId: task._id,
        ticketId: task.ticketId,
        title: task.title,
        assignedTo: task.assignedTo,
        priority: task.priority,
        status: task.status,
        createdBy: task.createdBy,
        timestamp: new Date()
      });

      return task;
    } catch (error) {
      throw new Error(`Error creating task: ${error.message}`);
    }
  }

  /**
   * Update task
   */
  async updateTask(taskId, updateData) {
    try {
      const oldTask = await taskRepository.findById(taskId);
      const task = await taskRepository.updateById(taskId, updateData);
      
      //   Broadcast event
      await eventService.broadcastEvent('task:updated', {
        taskId: task._id,
        ticketId: task.ticketId,
        title: task.title,
        assignedTo: task.assignedTo,
        priority: task.priority,
        status: task.status,
        changes: this._getChanges(oldTask, task),
        timestamp: new Date()
      });

      return task;
    } catch (error) {
      throw new Error(`Error updating task: ${error.message}`);
    }
  }

  /**
   * Assign task to user
   */
  async assignTask(taskId, userId) {
    try {
      const task = await taskRepository.updateById(taskId, { assignedTo: userId });
      
      //   Broadcast event
      await eventService.broadcastEvent('task:assigned', {
        taskId: task._id,
        ticketId: task.ticketId,
        title: task.title,
        assignedTo: task.assignedTo,
        priority: task.priority,
        timestamp: new Date()
      });

      return task;
    } catch (error) {
      throw new Error(`Error assigning task: ${error.message}`);
    }
  }

  /**
   * Delete task (soft delete)
   */
  async deleteTask(taskId) {
    try {
      const task = await taskRepository.softDeleteById(taskId);
      
      //   Broadcast event
      await eventService.broadcastEvent('task:deleted', {
        taskId: task._id,
        ticketId: task.ticketId,
        title: task.title,
        timestamp: new Date()
      });

      return { message: 'Task deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting task: ${error.message}`);
    }
  }

  /**
   * Get tasks with business logic filtering
   */
  async getTasks(filters = {}, options = {}) {
    // No changes needed for read operations
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = options;

      const query = { isDeleted: false, ...filters };
      const skip = (page - 1) * limit;
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const tasks = await taskRepository.findAll(query, { skip, limit, sort });
      const total = await taskRepository.count(query);

      return {
        tasks,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Error fetching tasks: ${error.message}`);
    }
  }

  async getTaskById(taskId) {
    try {
      const task = await taskRepository.findById(taskId);
      if (!task || task.isDeleted) {
        throw new Error('Task not found');
      }
      return task;
    } catch (error) {
      throw new Error(`Error fetching task: ${error.message}`);
    }
  }

  // Helper method để detect changes
  _getChanges(oldTask, newTask) {
    const changes = {};
    const fields = ['status', 'priority', 'assignedTo', 'deadline'];
    
    fields.forEach(field => {
      if (JSON.stringify(oldTask[field]) !== JSON.stringify(newTask[field])) {
        changes[field] = {
          from: oldTask[field],
          to: newTask[field]
        };
      }
    });
    
    return changes;
  }
}

export default new TaskService();
