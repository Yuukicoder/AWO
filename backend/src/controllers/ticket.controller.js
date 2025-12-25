import ticketService from '../service/ticket.service.js';

class TicketController {
  async createTicket(req, res) {
    try {
      const {
        subject,
        description,
        source = 'web',
        priority = 'medium',
        category = 'other',
        reporter,
        tags = [],
        dueDate,
        estimatedResolutionTime,
      } = req.body;

      // Validate required fields
      if (!subject) {
        return res.status(400).json({
          success: false,
          message: 'Ticket subject is required',
        });
      }

      // if (!reporter || !reporter.email) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'Reporter email is required',
      //   });
      // }

      const ticketData = {
        subject,
        description,
        source,
        priority,
        category,
        reporter,
        tags,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedResolutionTime,
      };

      const ticket = await ticketService.createTicket(ticketData);

       

      res.status(201).json({
        success: true,
        message: 'Ticket created successfully',
        data: ticket,
      });
    } catch (error) {
      console.error('Create ticket error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error creating ticket',
      });
    }
  }

  async getTickets(req, res) {
    try {
      const {
        status,
        priority,
        category,
        source,
        assignedTo,
        reporterEmail,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
        dateFrom,
        dateTo,
        slaStatus,
        includeTasks = false,
      } = req.query;

      // Build filters
      const filters = {};

      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      if (category) filters.category = category;
      if (source) filters.source = source;
      if (assignedTo) filters.assignedTo = assignedTo;
      if (reporterEmail) filters['reporter.email'] = reporterEmail.toLowerCase();
      if (search) filters.search = search;
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;
      if (slaStatus) filters.slaStatus = slaStatus;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
        includeTasks: includeTasks === 'true',
      };

      const result = await ticketService.getTickets(filters, options);

      res.status(200).json({
        success: true,
        data: result.tickets,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('Get tickets error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error fetching tickets',
      });
    }
  }

  async getTicketById(req, res) {
    try {
      const { id } = req.params;
      const ticket = await ticketService.getTicketById(id);
      
      res.status(200).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      const statusCode = error.message === 'Ticket not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error fetching ticket',
      });
    }
  }

  async getTicketByNumber(req, res) {
    try {
      const { ticketNumber } = req.params;
      const ticket = await ticketService.getTicketByNumber(ticketNumber);
      
      res.status(200).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      const statusCode = error.message === 'Ticket not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error fetching ticket',
      });
    }
  }


  async updateTicket(req, res) {
    try {
      const { id } = req.params;
      const updates = { ...req.body };

      // Remove fields that shouldn't be updated directly
      delete updates._id;
      delete updates.number;
      delete updates.createdAt;
      delete updates.updatedAt;

      const ticket = await ticketService.updateTicket(id, updates);
      
      res.status(200).json({
        success: true,
        message: 'Ticket updated successfully',
        data: ticket,
      });
    } catch (error) {
      const statusCode = error.message === 'Ticket not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error updating ticket',
      });
    }
  }

  async deleteTicket(req, res) {
    try {
      const { id } = req.params;
      const deletedBy = req.user?._id || null;
      
      const result = await ticketService.deleteTicket(id, deletedBy);
      
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      const statusCode = error.message === 'Ticket not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error deleting ticket',
      });
    }
  }

  async assignTicket(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const assignedBy = req.user._id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      const ticket = await ticketService.assignTicket(id, userId, assignedBy);
      
      res.status(200).json({
        success: true,
        message: 'Ticket assigned successfully',
        data: ticket,
      });
    } catch (error) {
      const statusCode = error.message === 'Ticket not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error assigning ticket',
      });
    }
  }

  
  async resolveTicket(req, res) {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const resolvedBy = req.user._id;

      const ticket = await ticketService.resolveTicket(id, { notes }, resolvedBy);
      
      res.status(200).json({
        success: true,
        message: 'Ticket resolved successfully',
        data: ticket,
      });
    } catch (error) {
      const statusCode = error.message === 'Ticket not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error resolving ticket',
      });
    }
  }


  async getTicketStats(req, res) {
    try {
      const { assignedTo, reporterEmail, dateFrom, dateTo } = req.query;
      
      const filters = {};
      if (assignedTo) filters.assignedTo = assignedTo;
      if (reporterEmail) filters['reporter.email'] = reporterEmail;
      if (dateFrom || dateTo) {
        filters.createdAt = {};
        if (dateFrom) filters.createdAt.$gte = new Date(dateFrom);
        if (dateTo) filters.createdAt.$lte = new Date(dateTo);
      }

      const stats = await ticketService.getTicketStats(filters);
      
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Get ticket stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error fetching ticket statistics',
      });
    }
  }

  async searchTickets(req, res) {
    try {
      const { q, page = 1, limit = 10 } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required',
        });
      }

      const tickets = await ticketService.searchTickets(q, {
        page: parseInt(page),
        limit: parseInt(limit),
      });
      
      res.status(200).json({
        success: true,
        data: tickets,
      });
    } catch (error) {
      console.error('Search tickets error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error searching tickets',
      });
    }
  }


  async getTicketsByReporter(req, res) {
    try {
      const { email } = req.params;
      const { page = 1, limit = 10, status } = req.query;
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
      };
      
      if (status) {
        options.filters = { status };
      }

      const tickets = await ticketService.getTicketsByReporter(email, options);
      
      res.status(200).json({
        success: true,
        data: tickets,
      });
    } catch (error) {
      console.error('Get tickets by reporter error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error fetching reporter tickets',
      });
    }
  }


  async getTicketsByAssignee(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10, status } = req.query;
      
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
      };
      
      if (status) {
        options.filters = { status };
      }

      const tickets = await ticketService.getTicketsByAssignee(userId, options);
      
      res.status(200).json({
        success: true,
        data: tickets,
      });
    } catch (error) {
      console.error('Get tickets by assignee error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error fetching assigned tickets',
      });
    }
  }

  /**
   * @route   GET /api/tickets/overdue
   * @desc    Get overdue tickets
   * @access  Private
   */
  async getOverdueTickets(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      
      const tickets = await ticketService.getOverdueTickets({
        page: parseInt(page),
        limit: parseInt(limit),
      });
      
      res.status(200).json({
        success: true,
        data: tickets,
      });
    } catch (error) {
      console.error('Get overdue tickets error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error fetching overdue tickets',
      });
    }
  }
}

export default new TicketController();