import Ticket from '../models/tickets.model.js';

class TicketRepository {
  /**
   * Create a new ticket
   */
  async create(data) {
    const ticket = await Ticket.create(data);
    return ticket;
  }

  /**
   * Find tickets with filters and pagination
   */
  async find(filters = {}, options = {}) {
    const {
      page,
      limit,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      populate = null,
      select = 'name email role',
      lean = true,
      includeTasks = false,
    } = options;

    const query = { isDeleted: false, ...filters };
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    let queryBuilder = Ticket.find(query).sort(sort);

    // Apply pagination only if page and limit are provided
    if (page && limit) {
      const skip = (page - 1) * limit;
      queryBuilder = queryBuilder.skip(skip).limit(limit);
    }

    // Only populate if populate field is provided
    if (populate) {
      queryBuilder = queryBuilder.populate(populate, select);
    }

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
      populate = null, // Make populate optional
      select = 'name email role',
      lean = true,
      includeTasks = true,
    } = options;

    let queryBuilder = Ticket.findOne({ _id: ticketId, isDeleted: false });

    // Only populate if populate field is provided
    if (populate) {
      queryBuilder = queryBuilder.populate(populate, select);
    }

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
      populate = null, // Make populate optional
      select = 'name email role',
    } = options;

    let query = Ticket.findOneAndUpdate(
      { _id: ticketId, isDeleted: false },
      { $set: updates },
      { new: true, runValidators: true }
    );

    // Only populate if populate field is provided
    if (populate) {
      query = query.populate(populate, select);
    }

    return query;
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

  /**
   * Get ticket statistics
   */
  async getStats(filters = {}) {
    const now = new Date();
    const matchQuery = { isDeleted: false, ...filters };

    const [
      totalTickets,
      byStatus,
      byPriority,
      bySLA,
      avgResolutionTime,
    ] = await Promise.all([
      // Total tickets
      Ticket.countDocuments(matchQuery),

      // By status
      Ticket.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            overdueCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $lt: ['$dueDate', now] },
                      { $nin: ['$status', ['resolved', 'closed']] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        { $project: { status: '$_id', count: 1, overdueCount: 1, _id: 0 } },
      ]),

      // By priority
      Ticket.aggregate([
        { $match: matchQuery },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $project: { priority: '$_id', count: 1, _id: 0 } },
      ]),

      // By SLA status
      Ticket.aggregate([
        { $match: { ...matchQuery, status: { $nin: ['resolved', 'closed'] } } },
        {
          $addFields: {
            slaStatus: {
              $cond: [
                { $lt: ['$dueDate', now] },
                'breached',
                {
                  $cond: [
                    { $lt: ['$dueDate', new Date(now.getTime() + 4 * 60 * 60 * 1000)] },
                    'at_risk',
                    'on_track',
                  ],
                },
              ],
            },
          },
        },
        { $group: { _id: '$slaStatus', count: { $sum: 1 } } },
        { $project: { slaStatus: '$_id', count: 1, _id: 0 } },
      ]),

      // Average resolution time
      Ticket.aggregate([
        {
          $match: {
            ...matchQuery,
            status: { $in: ['resolved', 'closed'] },
            resolvedAt: { $exists: true },
          },
        },
        {
          $project: {
            resolutionTime: {
              $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 1000 * 60 * 60],
            },
          },
        },
        { $group: { _id: null, avgTime: { $avg: '$resolutionTime' } } },
      ]),
    ]);

    return {
      totalTickets,
      byStatus,
      byPriority,
      bySLA,
      averageResolutionTime: avgResolutionTime[0]?.avgTime || 0,
    };
  }
}

export default new TicketRepository();