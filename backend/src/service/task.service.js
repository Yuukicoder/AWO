import taskRepository from '../repository/task.repository.js';
import { publishEvent } from '../config/redis.js';

class TaskService {
  /**
   * Create a new task
   */
  async createTask(data) {
    // Business validation
    this.validateTaskData(data);
    
    const task = await taskRepository.create(data);
    
    // Emit event for real-time updates
    await publishEvent('task:created', {
      taskId: task._id,
      title: task.title,
      assignedTo: task.assignedTo,
      priority: task.priority,
      ticketId: task.ticketId,
      timestamp: new Date(),
    });
    
    return task;
  }

  /**
   * Get tasks with business logic filtering
   */
  async getTasks(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    // Apply business rules to filters
    const processedFilters = this.processFilters(filters);
    
    const [tasks, total] = await Promise.all([
      taskRepository.find(processedFilters, {
        page,
        limit,
        sortBy,
        sortOrder,
      }),
      taskRepository.count(processedFilters),
    ]);

    return {
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get task by ID with business logic
   */
  async getTaskById(taskId) {
    if (!taskId || !taskId.toString().match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid task ID format');
    }

    const task = await taskRepository.findById(taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }

    return task;
  }

  /**
   * Update task with business validation
   */
  async updateTask(taskId, updates) {
    // Validate updates
    this.validateTaskUpdates(updates);
    
    // Business logic for status transitions
    if (updates.status) {
      await this.validateStatusTransition(taskId, updates.status);
    }
    
    const task = await taskRepository.updateById(taskId, updates);
    
    if (!task) {
      throw new Error('Task not found');
    }
    
    // Emit update event
    await publishEvent('task:updated', {
      taskId: task._id,
      changes: Object.keys(updates),
      newStatus: task.status,
      assignedTo: task.assignedTo,
      timestamp: new Date(),
    });
    
    return task;
  }

  /**
   * Delete task (soft delete)
   */
  async deleteTask(taskId) {
    const task = await taskRepository.softDeleteById(taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }
    
    // Emit delete event
    await publishEvent('task:deleted', {
      taskId: task._id,
      title: task.title,
      timestamp: new Date(),
    });
    
    return { message: 'Task deleted successfully' };
  }

  /**
   * Assign task to user with business validation
   */
  async assignTask(taskId, userId) {
    // Check user workload before assignment
    await this.validateUserWorkload(userId);
    
    const task = await taskRepository.updateById(taskId, { assignedTo: userId });
    
    if (!task) {
      throw new Error('Task not found');
    }
    
    // Emit assignment event
    await publishEvent('task:assigned', {
      taskId: task._id,
      title: task.title,
      assignedTo: task.assignedTo,
      assignedBy: 'system', // TODO: Get from context
      timestamp: new Date(),
    });
    
    return task;
  }

  /**
   * Get tasks by ticket ID
   */
  async getTasksByTicketId(ticketId) {
    if (!ticketId || !ticketId.toString().match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid ticket ID format');
    }
    
    return taskRepository.findByTicketId(ticketId);
  }

  /**
   * Get task statistics
   */
  async getTaskStats(filters = {}) {
    const stats = await taskRepository.getStats(filters);
    
    // Process and format stats
    const formattedStats = {
      todo: 0,
      in_progress: 0,
      review: 0,
      done: 0,
      totalEstimatedHours: 0,
    };

    stats.forEach((stat) => {
      formattedStats[stat._id] = stat.count;
      formattedStats.totalEstimatedHours += stat.totalEstimatedHours || 0;
    });

    return formattedStats;
  }

  // Private business logic methods
  validateTaskData(data) {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Task title is required');
    }
    
    if (data.estimatedHours && data.estimatedHours < 0) {
      throw new Error('Estimated hours cannot be negative');
    }
  }

  validateTaskUpdates(updates) {
    const restrictedFields = ['_id', 'createdBy', 'createdAt'];
    
    for (const field of restrictedFields) {
      if (updates.hasOwnProperty(field)) {
        throw new Error(`Cannot update ${field}`);
      }
    }
  }

  async validateStatusTransition(taskId, newStatus) {
    const currentTask = await taskRepository.findById(taskId, { lean: true });
    
    // Define allowed status transitions
    const allowedTransitions = {
      'todo': ['in_progress'],
      'in_progress': ['review', 'todo'],
      'review': ['done', 'in_progress'],
      'done': ['review'],
    };

    if (!allowedTransitions[currentTask.status]?.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentTask.status} to ${newStatus}`);
    }
  }

  async validateUserWorkload(userId) {
    // TODO: Implement workload validation logic
    // Check if user has too many assigned tasks
    const userTasks = await taskRepository.find(
      { assignedTo: userId, status: { $in: ['todo', 'in_progress'] } },
      { lean: true }
    );
    
    if (userTasks.length > 10) {
      throw new Error('User workload is too high');
    }
  }

  processFilters(filters) {
    const processedFilters = { ...filters };
    
    // Handle search
    if (filters.search) {
      processedFilters.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
      delete processedFilters.search;
    }
    
    // Handle date filters
    if (filters.dateFrom || filters.dateTo) {
      processedFilters.createdAt = {};
      if (filters.dateFrom) {
        processedFilters.createdAt.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        processedFilters.createdAt.$lte = new Date(filters.dateTo);
      }
      delete processedFilters.dateFrom;
      delete processedFilters.dateTo;
    }
    
    return processedFilters;
  }
}

export default new TaskService();