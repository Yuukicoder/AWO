import Task from '../models/tasks.model.js';

class TaskService {
  async createTask(data) {
    const task = await Task.create(data);
    return task.populate('createdBy assignedTo', 'name email role');
  }

  async getTasks(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const query = { isDeleted: false, ...filters };
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('createdBy assignedTo', 'name email role')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(query),
    ]);

    return {
      tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getTaskById(taskId) {
    const task = await Task.findOne({ _id: taskId, isDeleted: false })
      .populate('createdBy assignedTo', 'name email role')
      .lean();

    if (!task) {
      throw new Error('Task not found');
    }

    return task;
  }

  async updateTask(taskId, updates) {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, isDeleted: false },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('createdBy assignedTo', 'name email role');

    if (!task) {
      throw new Error('Task not found');
    }

    return task;
  }

  async deleteTask(taskId) {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!task) {
      throw new Error('Task not found');
    }

    return { message: 'Task deleted successfully' };
  }

  async assignTask(taskId, userId) {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, isDeleted: false },
      { $set: { assignedTo: userId } },
      { new: true, runValidators: true }
    ).populate('createdBy assignedTo', 'name email role');

    if (!task) {
      throw new Error('Task not found');
    }

    return task;
  }
}

export default new TaskService();