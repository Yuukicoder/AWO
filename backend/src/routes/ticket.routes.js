import express from 'express';
import ticketController from '../controllers/ticket.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * Ticket CRUD routes
 */

// Create ticket - All authenticated users can create tickets
router.post('/', ticketController.createTicket.bind(ticketController));

// Get all tickets with filters and pagination
router.get('/', ticketController.getTickets.bind(ticketController));

// Get ticket statistics
router.get('/stats', ticketController.getTicketStats.bind(ticketController));

// Search tickets
router.get('/search', ticketController.searchTickets.bind(ticketController));

// Get overdue tickets - Manager/Admin only
router.get('/overdue', authorize(['admin', 'manager']), ticketController.getOverdueTickets.bind(ticketController));

// Get tickets by reporter email
router.get('/reporter/:email', ticketController.getTicketsByReporter.bind(ticketController));

// Get tickets assigned to user
router.get('/assigned/:userId', ticketController.getTicketsByAssignee.bind(ticketController));

// Get single ticket by number
router.get('/number/:ticketNumber', ticketController.getTicketByNumber.bind(ticketController));

// Get single ticket by ID
router.get('/:id', ticketController.getTicketById.bind(ticketController));

// Update ticket - Ticket assignee, creator, or manager can update
router.put('/:id', ticketController.updateTicket.bind(ticketController));

// Delete ticket - Only admin or manager can delete
router.delete('/:id', authorize(['admin', 'manager']), ticketController.deleteTicket.bind(ticketController));

/**
 * Ticket Action routes
 */

// Assign ticket - Only admin or manager can assign
router.post('/:id/assign', authorize(['admin', 'manager']), ticketController.assignTicket.bind(ticketController));

// Resolve ticket - Assignee or manager can resolve
router.post('/:id/resolve', ticketController.resolveTicket.bind(ticketController));

export default router;