import {publishEvent } from "../config/redis.js";
import { emitToRoom, emitToUser, emitToTicket, emitToTask } from "../config/socket.js";

class EventService {
    /**
     * Centralized event broadcasting cho ticket và task
     */
    async broadcastEvent(eventType, eventData) {
        try {
            await publishEvent(eventType, eventData);

            await this.emitSocketEvent(eventType, eventData);

            console.log(`Event broadcasted: ${eventType}`, eventData);
        } catch (error) {
            console.error(`Error broadcasting event :`, error);
        }
    }

    /**
     * Emit event qua socket.io
     */
    async emitSocketEvent(eventType, eventData) {
        try {
            const { taskId, ticketId, assignedTo, createdBy } = eventData;

            // ticket events
            if (eventType.startsWith("ticket:")) {
                await this.handleTicketEvent(eventType, eventData);
            }

            // task events
            else if (eventType.startsWith("task:")) {
                await this.handleTaskEvent(eventType, eventData);
            } else if (eventType.startsWith("notification:")) {
                await this.handleNotificationEvent(eventType, eventData);
            }
        } catch (error) {
            console.error(`Error emitting socket event:`, error);
        }
    }

    /**
     * Handle ticket-specific events
     */
    async handleTicketEvent(eventType, eventData) {
        const { ticketId, assignedTo, number, subject, priority, reporterEmail } =
            eventData;

        switch (eventType) {
            case "ticket:created":
                // Emit to all workspace users
                emitToRoom("workspace", "ticket:created", eventData);

                // Send notification to managers/admins
                emitToRoom("admin", "notification", {
                    type: "ticket_created",
                    message: `New ticket: ${number} - ${subject}`,
                    priority,
                    data: eventData,
                    timestamp: new Date(),
                });
                break;

            case "ticket:updated":
                // Emit to workspace and specific ticket room
                emitToRoom("workspace", "ticket:updated", eventData);
                emitToTicket(ticketId, "ticket:updated", eventData);

                // Notify assigned user
                if (assignedTo) {
                    emitToUser(assignedTo.toString(), "notification", {
                        type: "ticket_updated",
                        message: `Ticket ${number} has been updated`,
                        data: eventData,
                        timestamp: new Date(),
                    });
                }
                break;

            case "ticket:assigned":
                // Emit to workspace and ticket room
                emitToRoom("workspace", "ticket:assigned", eventData);
                emitToTicket(ticketId, "ticket:assigned", eventData);

                // Notify assigned user
                if (assignedTo) {
                    emitToUser(assignedTo.toString(), "notification", {
                        type: "ticket_assigned",
                        message: `You have been assigned ticket: ${number} - ${subject}`,
                        priority: "high",
                        data: eventData,
                        timestamp: new Date(),
                    });
                }
                break;

            case "ticket:resolved":
                emitToRoom("workspace", "ticket:resolved", eventData);
                emitToTicket(ticketId, "ticket:resolved", eventData);

                // Notify stakeholders
                emitToRoom("admin", "notification", {
                    type: "ticket_resolved",
                    message: `Ticket ${number} has been resolved`,
                    data: eventData,
                    timestamp: new Date(),
                });
                break;

            case "ticket:closed":
                emitToRoom("workspace", "ticket:closed", eventData);
                emitToTicket(ticketId, "ticket:closed", eventData);
                break;

            case "ticket:deleted":
                emitToRoom("workspace", "ticket:deleted", eventData);
                emitToTicket(ticketId, "ticket:deleted", eventData);
                break;

            default:
                console.warn(`Unknown ticket event type: ${eventType}`);
        }
    }

    /**
     * Handle task-specific events
     */
    async handleTaskEvent(eventType, eventData) {
        const { taskId, ticketId, assignedTo, createdBy, title, priority } =
            eventData;

        switch (eventType) {
            case "task:created":
                // Emit to workspace and task room
                emitToRoom("workspace", "task:created", eventData);
                emitToTask(taskId, "task:created", eventData);

                // If task belongs to a ticket, emit to ticket room too
                if (ticketId) {
                    emitToTicket(ticketId, "ticket:task_added", {
                        ticketId,
                        taskId,
                        title,
                        timestamp: new Date(),
                    });
                }
                break;

            case "task:updated":
                emitToRoom("workspace", "task:updated", eventData);
                emitToTask(taskId, "task:updated", eventData);

                // Notify relevant users
                if (assignedTo) {
                    emitToUser(assignedTo.toString(), "task:updated", eventData);
                }
                if (createdBy && createdBy !== assignedTo) {
                    emitToUser(createdBy.toString(), "task:updated", eventData);
                }

                // If task belongs to ticket, update ticket room
                if (ticketId) {
                    emitToTicket(ticketId, "ticket:task_updated", eventData);
                }
                break;

            case "task:assigned":
                emitToRoom("workspace", "task:assigned", eventData);
                emitToTask(taskId, "task:assigned", eventData);

                // Notify assigned user
                if (assignedTo) {
                    emitToUser(assignedTo.toString(), "notification", {
                        type: "task_assigned",
                        message: `You have been assigned task: ${title}`,
                        priority: priority === "urgent" ? "high" : "normal",
                        data: eventData,
                        timestamp: new Date(),
                    });
                }

                // Update ticket room if task belongs to ticket
                if (ticketId) {
                    emitToTicket(ticketId, "ticket:task_assigned", eventData);
                }
                break;

            case "task:deleted":
                emitToRoom("workspace", "task:deleted", eventData);
                emitToTask(taskId, "task:deleted", eventData);

                // Update ticket if task belonged to one
                if (ticketId) {
                    emitToTicket(ticketId, "ticket:task_removed", {
                        ticketId,
                        taskId,
                        title,
                        timestamp: new Date(),
                    });
                }
                break;

            default:
                console.warn(`Unknown task event type: ${eventType}`);
        }
    }
    /**
     * Handle notification-specific events
     */
    async handleNotificationEvent(eventType, eventData) {
        const { userId, targetRoom } = eventData;
        switch (eventType) {
            case "notification:user":
                if (userId) {
                    emitToUser(userId.toString(), "notification", eventData);
                }
                break;
            case "notification:room":
                if (targetRoom) {
                    emitToRoom(targetRoom, "notification", eventData);
                }
                break;

            case 'notification:broadcast':
                emitToRoom("workspace", "notification", eventData);
                break;
            default:
                console.warn(`Unknown notification event type: ${eventType}`);
        }
    }
    
  /**
   * Send notification to specific user
   */
  async sendUserNotification(userId, notification) {
    try {
      const notificationData = {
        id: Date.now(),
        userId,
        read: false,
        timestamp: new Date(),
        ...notification
      };

      await this.broadcastEvent('notification:user', notificationData);
      
      return notificationData;
    } catch (error) {
      console.error('Error sending user notification:', error);
    }
  }

  /**
   * Send notification to room
   */
  async sendRoomNotification(room, notification) {
    try {
      const notificationData = {
        id: Date.now(),
        targetRoom: room,
        timestamp: new Date(),
        ...notification
      };

      await this.broadcastEvent('notification:room', notificationData);
      
      return notificationData;
    } catch (error) {
      console.error('Error sending room notification:', error);
    }
  }
   /**
   * Broadcast system-wide announcement
   */
  async broadcastAnnouncement(message, type = 'info') {
    try {
      const announcement = {
        id: Date.now(),
        type,
        message,
        timestamp: new Date()
      };

      await this.broadcastEvent('notification:broadcast', announcement);
      console.log('📢 System announcement sent:', message);
      
      return announcement;
    } catch (error) {
      console.error('Error broadcasting announcement:', error);
    }
  }
  
  /**
   * Handle batch events for performance
   */
  async processBatchEvents(events) {
    try {
      const promises = events.map(({ eventType, eventData }) => 
        this.broadcastEvent(eventType, eventData)
      );

      await Promise.allSettled(promises);
      console.log(`✅ Processed ${events.length} batch events`);
    } catch (error) {
      console.error('Error processing batch events:', error);
    }
  }

  /**
   * Emit task-ticket relationship events
   */
  async broadcastRelationshipEvent(parentTicketId, childTaskData, action) {
    try {
      const eventData = {
        ticketId: parentTicketId,
        taskData: childTaskData,
        action, // 'added', 'updated', 'removed'
        timestamp: new Date()
      };

      await this.broadcastEvent(`ticket:task_${action}`, eventData);
    } catch (error) {
      console.error('Error broadcasting relationship event:', error);
    }
  }

  /**
   * Health check for event system
   */
  async healthCheck() {
    try {
      const testEvent = {
        type: 'system',
        message: 'Event system health check',
        timestamp: new Date()
      };

      await publishEvent('system:health', testEvent);
      console.log('✅ Event system health check passed');
      return true;
    } catch (error) {
      console.error('❌ Event system health check failed:', error);
      return false;
    }
  }
}

export default new EventService();
