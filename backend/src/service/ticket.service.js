import ticketRepository from '../repository/ticket.repository.js';
import eventService from './event.service.js';

class TicketService {
  /**
   * Create a new ticket
   */
  async createTicket(data) {
    // Business validation
    this.validateTicketData(data);
    
    // Set SLA based on priority
    if (!data.dueDate && !data.estimatedResolutionTime) {
      data.estimatedResolutionTime = this.getEstimatedResolutionTime(data.priority);
      data.dueDate = new Date(Date.now() + (data.estimatedResolutionTime * 60 * 60 * 1000));
    }
    
    const ticket = await ticketRepository.create(data);
    
    //  Broadcast event
    await eventService.broadcastEvent('ticket:created', {
      ticketId: ticket._id,
      number: ticket.number,
      subject: ticket.subject,
      priority: ticket.priority,
      status: ticket.status,
      reporterEmail: ticket.reporter?.email,
      assignedTo: ticket.assignedTo,
      timestamp: new Date()
    });
    
    return ticket;
  }

  /**
   * Get tickets with business logic filtering
   */
  async getTickets(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeTasks = false,
    } = options;

    // Apply business rules to filters
    const processedFilters = this.processFilters(filters);
    
    const [tickets, total] = await Promise.all([
      ticketRepository.find(processedFilters, {
        page,
        limit,
        sortBy,
        sortOrder,
        includeTasks,
      }),
      ticketRepository.count(processedFilters),
    ]);

    return {
      tickets,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get ticket by ID with business logic
   */
  async getTicketById(ticketId) {
    if (!ticketId || !ticketId.toString().match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid ticket ID format');
    }

    const ticket = await ticketRepository.findById(ticketId, { includeTasks: true });
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    return ticket;
  }

  /**
   * Get ticket by number
   */
  async getTicketByNumber(ticketNumber) {
    if (!ticketNumber || typeof ticketNumber !== 'string') {
      throw new Error('Invalid ticket number format');
    }

    const ticket = await ticketRepository.findByNumber(ticketNumber, { includeTasks: true });
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    return ticket;
  }

  /**
   * Update ticket with business validation
   */
  async updateTicket(ticketId, updates) {
    // Validate updates
    this.validateTicketUpdates(updates);
    
    // Business logic for status transitions
    if (updates.status) {
      await this.validateStatusTransition(ticketId, updates.status);
    }
    
    const ticket = await ticketRepository.updateById(ticketId, updates);
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    //  Broadcast event
    await eventService.broadcastEvent('ticket:updated', {
      ticketId: ticket._id,
      number: ticket.number,
      subject: ticket.subject,
      priority: ticket.priority,
      status: ticket.status,
      assignedTo: ticket.assignedTo,
      changes: Object.keys(updates),
      timestamp: new Date(),
    });
    
    return ticket;
  }

  /**
   * Delete ticket (soft delete)
   */
  async deleteTicket(ticketId, deletedBy = null) {
    const ticket = await ticketRepository.softDeleteById(ticketId, deletedBy);
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    //  Broadcast event
    await eventService.broadcastEvent('ticket:deleted', {
      ticketId: ticket._id,
      number: ticket.number,
      subject: ticket.subject,
      deletedBy,
      timestamp: new Date(),
    });
    
    return { message: 'Ticket deleted successfully' };
  }

  /**
   * Assign ticket to user with business validation
   */
  async assignTicket(ticketId, userId, assignedById) {
    const ticket = await ticketRepository.updateById(ticketId, {
      assignedTo: userId,
      assignedBy: assignedById,
      assignedAt: new Date(),
      status: 'assigned',
    });
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    //  Broadcast event
    await eventService.broadcastEvent('ticket:assigned', {
      ticketId: ticket._id,
      number: ticket.number,
      subject: ticket.subject,
      priority: ticket.priority,
      assignedTo: ticket.assignedTo,
      assignedBy: assignedById,
      timestamp: new Date(),
    });
    
    return ticket;
  }

  /**
   * Resolve ticket
   */
  async resolveTicket(ticketId, resolutionData, resolvedBy) {
    const updates = {
      status: 'resolved',
      resolvedBy,
      resolvedAt: new Date(),
      resolutionNotes: resolutionData.notes || '',
    };
    
    const ticket = await ticketRepository.updateById(ticketId, updates);
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    // Calculate actual resolution time
    const resolutionTime = Math.round((ticket.resolvedAt - ticket.createdAt) / (1000 * 60 * 60));
    await ticketRepository.updateById(ticketId, { actualResolutionTime: resolutionTime });
    
    //  Broadcast event
    await eventService.broadcastEvent('ticket:resolved', {
      ticketId: ticket._id,
      number: ticket.number,
      subject: ticket.subject,
      priority: ticket.priority,
      resolvedBy,
      resolutionTime,
      resolutionNotes: resolutionData.notes,
      timestamp: new Date(),
    });
    
    return ticket;
  }

  /**
   * Get ticket statistics
   */
  async getTicketStats(filters = {}) {
    const stats = await ticketRepository.getStats(filters);
    const slaStats = await ticketRepository.getSLAStats();
    
    // Process and format stats
    const formattedStats = {
      open: 0,
      assigned: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
      avgResolutionTime: 0,
      sla: {
        met: 0,
        breached: 0,
        at_risk: 0,
        on_track: 0,
        unknown: 0,
      },
    };

    stats.forEach((stat) => {
      formattedStats[stat._id] = stat.count;
      if (stat.avgResolutionTime) {
        formattedStats.avgResolutionTime = Math.round(stat.avgResolutionTime * 100) / 100;
      }
    });

    slaStats.forEach((stat) => {
      formattedStats.sla[stat._id] = stat.count;
    });

    return formattedStats;
  }

  /**
   * Search tickets
   */
  async searchTickets(searchText, options = {}) {
    if (!searchText || searchText.trim().length === 0) {
      throw new Error('Search text is required');
    }
    
    return ticketRepository.search(searchText.trim(), options);
  }

  /**
   * Get tickets by reporter
   */
  async getTicketsByReporter(email, options = {}) {
    return ticketRepository.findByReporterEmail(email, options);
  }

  /**
   * Get tickets by assignee
   */
  async getTicketsByAssignee(userId, options = {}) {
    return ticketRepository.findByAssignee(userId, options);
  }

  /**
   * Get overdue tickets
   */
  async getOverdueTickets(options = {}) {
    return ticketRepository.findOverdue(options);
  }

  /**
   * Process AI triage result
   */
  async processAITriage(ticketData, aiResult) {
    const ticket = {
      ...ticketData,
      priority: aiResult.extractedPriority || ticketData.priority,
      category: aiResult.extractedCategory || 'other',
      tags: aiResult.suggestedTags || [],
      aiAnalysis: {
        processed: true,
        extractedPriority: aiResult.extractedPriority,
        extractedCategory: aiResult.extractedCategory,
        suggestedTags: aiResult.suggestedTags,
        confidence: aiResult.confidence,
        processedAt: new Date(),
        originalContent: aiResult.originalContent,
      },
    };
    
    return this.createTicket(ticket);
  }

  // Private business logic methods
  validateTicketData(data) {
    if (!data.subject || data.subject.trim().length === 0) {
      throw new Error('Ticket subject is required');
    }
    
    if (!data.reporter || !data.reporter.email) {
      throw new Error('Reporter email is required');
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.reporter.email)) {
      throw new Error('Invalid email format');
    }
  }

  validateTicketUpdates(updates) {
    const restrictedFields = ['_id', 'number', 'createdAt'];
    
    for (const field of restrictedFields) {
      if (updates.hasOwnProperty(field)) {
        throw new Error(`Cannot update ${field}`);
      }
    }
  }

  async validateStatusTransition(ticketId, newStatus) {
    const currentTicket = await ticketRepository.findById(ticketId, { lean: true, includeTasks: false });
    
    // Define allowed status transitions
    const allowedTransitions = {
      'open': ['assigned', 'closed'],
      'assigned': ['in_progress', 'open'],
      'in_progress': ['resolved', 'assigned'],
      'resolved': ['closed', 'in_progress'],
      'closed': ['open'], // Can reopen if needed
    };

    if (!allowedTransitions[currentTicket.status]?.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentTicket.status} to ${newStatus}`);
    }
  }

  getEstimatedResolutionTime(priority) {
    const slaHours = {
      'urgent': 4,
      'high': 24,
      'medium': 72,
      'low': 168,
    };
    
    return slaHours[priority] || slaHours.medium;
  }

  processFilters(filters) {
    const processedFilters = { ...filters };
    
    // Handle search
    if (filters.search) {
      processedFilters.$or = [
        { subject: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { number: { $regex: filters.search, $options: 'i' } },
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
    
    // Handle SLA filters
    if (filters.slaStatus) {
      const now = new Date();
      switch (filters.slaStatus) {
        case 'breached':
          processedFilters.dueDate = { $lt: now };
          processedFilters.status = { $nin: ['resolved', 'closed'] };
          break;
        case 'at_risk':
          processedFilters.dueDate = {
            $gte: now,
            $lte: new Date(now.getTime() + (4 * 60 * 60 * 1000))
          };
          break;
        case 'on_track':
          processedFilters.dueDate = { $gt: new Date(now.getTime() + (4 * 60 * 60 * 1000)) };
          break;
      }
      delete processedFilters.slaStatus;
    }
    
    return processedFilters;
  }
}

export default new TicketService();