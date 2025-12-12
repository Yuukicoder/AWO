import Ticket from '../models/tickets.model.js';

class TicketRepository {
  /**
   * Create a new ticket
   */
  async create(data) {
    const ticket = await Ticket.create(data);
    return ticket.populate('assignedTo assignedBy resolvedBy', 'name email role');
  }

  /**
   * Find tickets with filters and pagination
   */
  async find(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      populate = 'assignedTo assignedBy resolvedBy',
      select = 'name email role',
      lean = true,
      includeTasks = false,
    } = options;

    const query = { isDeleted: false, ...filters };
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    let queryBuilder = Ticket.find(query)
      .populate(populate, select)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    if (includeTasks) {
      queryBuilder = queryBuilder.populate('tasks', 'title status priority estimatedHours');
    }

    if (lean) {
      queryBuilder = queryBuilder.lean();
    }

    return queryBuilder;
  }

  /**
   * Count tickets with filters
   */
  async count(filters = {}) {
    const query = { isDeleted: false, ...filters };
    return Ticket.countDocuments(query);
  }

  /**
   * Find ticket by ID
   */
  async findById(ticketId, options = {}) {
    const {
      populate = 'assignedTo assignedBy resolvedBy',
      select = 'name email role',
      lean = true,
      includeTasks = true,
    } = options;

    let queryBuilder = Ticket.findOne({ _id: ticketId, isDeleted: false })
      .populate(populate, select);

    if (includeTasks) {
      queryBuilder = queryBuilder.populate('tasks', 'title status priority estimatedHours deadline');
    }

    if (lean) {
      queryBuilder = queryBuilder.lean();
    }

    return queryBuilder;
  }

  /**
   * Find ticket by number
   */
  async findByNumber(ticketNumber, options = {}) {
    const {
      populate = 'assignedTo assignedBy resolvedBy',
      select = 'name email role',
      lean = true,
      includeTasks = true,
    } = options;

    let queryBuilder = Ticket.findOne({ number: ticketNumber, isDeleted: false })
      .populate(populate, select);

    if (includeTasks) {
      queryBuilder = queryBuilder.populate('tasks');
    }

    if (lean) {
      queryBuilder = queryBuilder.lean();
    }

    return queryBuilder;
  }

  /**
   * Update ticket by ID
   */
  async updateById(ticketId, updates, options = {}) {
    const {
      populate = 'assignedTo assignedBy resolvedBy',
      select = 'name email role',
    } = options;

    return Ticket.findOneAndUpdate(
      { _id: ticketId, isDeleted: false },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate(populate, select);
  }

  /**
   * Soft delete ticket
   */
  async softDeleteById(ticketId, deletedBy = null) {
    return Ticket.findOneAndUpdate(
      { _id: ticketId, isDeleted: false },
      { 
        $set: { 
          isDeleted: true, 
          deletedAt: new Date(),
          deletedBy 
        } 
      },
      { new: true }
    );
  }

  /**
   * Get open tickets
   */
  async findOpen(options = {}) {
    const filters = { status: { $in: ['open', 'assigned', 'in_progress'] } };
    return this.find(filters, options);
  }

  /**
   * Get overdue tickets
   */
  async findOverdue(options = {}) {
    const filters = {
      dueDate: { $lt: new Date() },
      status: { $nin: ['resolved', 'closed'] },
    };
    return this.find(filters, options);
  }

  /**
   * Get tickets by reporter email
   */
  async findByReporterEmail(email, options = {}) {
    const filters = { 'reporter.email': email.toLowerCase() };
    return this.find(filters, options);
  }

  /**
   * Get tickets assigned to user
   */
  async findByAssignee(userId, options = {}) {
    const filters = { assignedTo: userId };
    return this.find(filters, options);
  }

  /**
   * Get ticket statistics
   */
  async getStats(filters = {}) {
    const query = { isDeleted: false, ...filters };
    
    return Ticket.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgResolutionTime: { $avg: '$actualResolutionTime' },
        },
      },
    ]);
  }

  /**
   * Get SLA dashboard data
   */
  async getSLAStats() {
    const now = new Date();
    
    return Ticket.aggregate([
      { $match: { isDeleted: false } },
      {
        $addFields: {
          slaStatus: {
            $cond: [
              { $in: ['$status', ['resolved', 'closed']] },
              'met',
              {
                $cond: [
                  { $or: [{ $eq: ['$dueDate', null] }, { $eq: ['$dueDate', undefined] }] },
                  'unknown',
                  {
                    $cond: [
                      { $gt: [now, '$dueDate'] },
                      'breached',
                      {
                        $cond: [
                          { $lt: [{ $subtract: ['$dueDate', now] }, 4 * 60 * 60 * 1000] },
                          'at_risk',
                          'on_track'
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: '$slaStatus',
          count: { $sum: 1 }
        }
      }
    ]);
  }

  /**
   * Bulk update tickets
   */
  async bulkUpdate(filter, update) {
    return Ticket.updateMany(filter, update);
  }

  /**
   * Search tickets by text
   */
  async search(searchText, options = {}) {
    const filters = {
      $or: [
        { subject: { $regex: searchText, $options: 'i' } },
        { description: { $regex: searchText, $options: 'i' } },
        { number: { $regex: searchText, $options: 'i' } },
        { 'reporter.email': { $regex: searchText, $options: 'i' } },
      ],
    };
    return this.find(filters, options);
  }
}

export default new TicketRepository();