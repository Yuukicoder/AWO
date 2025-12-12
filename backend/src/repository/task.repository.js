import Task from '../models/tasks.model.js';

class TaskRepository {
  /**
   * Create a new task
   */
  async create(data) {
    const task = await Task.create(data);
    return task.populate('createdBy assignedTo ticketId', 'name email role number');
  }

  /**
   * Find tasks with filters and pagination
   */
  async find(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      populate = 'createdBy assignedTo ticketId',
      select = 'name email role number',
      lean = true,
    } = options;

    const query = { isDeleted: false, ...filters };
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    let queryBuilder = Task.find(query)
      .populate(populate, select)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    if (lean) {
      queryBuilder = queryBuilder.lean();
    }

    return queryBuilder;
  }

  /**
   * Count tasks with filters
   */
  async count(filters = {}) {
    const query = { isDeleted: false, ...filters };
    return Task.countDocuments(query);
  }

  /**
   * Find task by ID
   */
  async findById(taskId, options = {}) {
    const {
      populate = 'createdBy assignedTo ticketId',
      select = 'name email role number',
      lean = true,
    } = options;

    let queryBuilder = Task.findOne({ _id: taskId, isDeleted: false })
      .populate(populate, select);

    if (lean) {
      queryBuilder = queryBuilder.lean();
    }

    return queryBuilder;
  }

  /**
   * Update task by ID
   */
  async updateById(taskId, updates, options = {}) {
    const {
      populate = 'createdBy assignedTo ticketId',
      select = 'name email role number',
    } = options;

    return Task.findOneAndUpdate(
      { _id: taskId, isDeleted: false },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate(populate, select);
  }

  /**
   * Soft delete task
   */
  async softDeleteById(taskId) {
    return Task.findOneAndUpdate(
      { _id: taskId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );
  }

  /**
   * Find tasks by ticket ID
   */
  async findByTicketId(ticketId, options = {}) {
    const filters = { ticketId };
    return this.find(filters, options);
  }

  /**
   * Get task statistics
   */
  async getStats(filters = {}) {
    const query = { isDeleted: false, ...filters };
    
    return Task.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalEstimatedHours: { $sum: '$estimatedHours' },
        },
      },
    ]);
  }

  /**
   * Bulk update tasks
   */
  async bulkUpdate(filter, update) {
    return Task.updateMany(filter, update);
  }
}

export default new TaskRepository();