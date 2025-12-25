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
      page,
      limit,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      populate = 'createdBy assignedTo ticketId',
      select = 'name email role number',
      lean = true,
    } = options;

    const query = { isDeleted: false, ...filters };
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    let queryBuilder = Task.find(query).sort(sort);

    // Apply pagination only if page and limit are provided
    if (page && limit) {
      const skip = (page - 1) * limit;
      queryBuilder = queryBuilder.skip(skip).limit(limit);
    }

    // Only populate if populate is not null/false
    if (populate) {
      queryBuilder = queryBuilder.populate(populate, select);
    }

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
    const now = new Date();

    const [
      totalTasks,
      completedTasks,
      byStatus,
      byPriority,
      overdueCount,
      avgCompletionTime,
      hoursStats,
    ] = await Promise.all([
      // Total tasks (excluding deleted)
      Task.countDocuments(query),

      // Completed tasks
      Task.countDocuments({ ...query, status: 'completed' }),

      // By status
      Task.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } },
      ]),

      // By priority
      Task.aggregate([
        { $match: query },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $project: { priority: '$_id', count: 1, _id: 0 } },
      ]),

      // Overdue tasks count
      Task.countDocuments({
        ...query,
        dueDate: { $lt: now },
        status: { $nin: ['completed', 'cancelled'] },
      }),

      // Average completion time
      Task.aggregate([
        {
          $match: {
            ...query,
            status: 'completed',
            completedAt: { $exists: true },
          },
        },
        {
          $project: {
            completionTime: {
              $divide: [{ $subtract: ['$completedAt', '$createdAt'] }, 1000 * 60 * 60],
            },
          },
        },
        { $group: { _id: null, avgTime: { $avg: '$completionTime' } } },
      ]),

      // Hours statistics
      Task.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalEstimated: { $sum: { $ifNull: ['$estimatedHours', 0] } },
            totalActual: { $sum: { $ifNull: ['$actualHours', 0] } },
          },
        },
      ]),
    ]);

    return {
      totalTasks,
      completedTasks,
      byStatus,
      byPriority,
      overdueCount,
      averageCompletionTime: avgCompletionTime[0]?.avgTime || 0,
      totalEstimatedHours: hoursStats[0]?.totalEstimated || 0,
      totalActualHours: hoursStats[0]?.totalActual || 0,
    };
  }

  /**
   * Bulk update tasks
   */
  async bulkUpdate(filter, update) {
    return Task.updateMany(filter, update);
  }
}

export default new TaskRepository();