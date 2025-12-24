import taskRepository from '../repository/task.repository.js';
import ticketRepository from '../repository/ticket.repository.js';

class WorkloadService {
  /**
   * Calculate comprehensive user workload metrics
   * Including both tickets and tasks with SLA weighting
   */
  async calculateUserWorkload(userId) {
    try {
      // Get all active tickets assigned to user
      const tickets = await ticketRepository.find(
        { 
          assignedTo: userId,
          isDeleted: false,
          status: { $in: ['open', 'assigned', 'in_progress'] }
        },
        { 
          lean: true,
          includeTasks: true,
          populate: null // Don't populate to avoid circular refs
        }
      );

      // Get all active tasks assigned to user
      const tasks = await taskRepository.find(
        { 
          assignedTo: userId,
          isDeleted: false,
          status: { $in: ['todo', 'in_progress', 'review'] }
        },
        { 
          lean: true,
          populate: null
        }
      );

      // Calculate ticket metrics
      const ticketMetrics = this._calculateTicketMetrics(tickets);
      
      // Calculate task metrics
      const taskMetrics = this._calculateTaskMetrics(tasks);

      // Calculate SLA-weighted workload
      const slaWeightedLoad = this._calculateSLAWeightedLoad(tickets, tasks);

      // Calculate estimated hours
      const totalEstimatedHours = this._calculateTotalEstimatedHours(tickets, tasks);

      // Calculate workload score (0-100)
      const workloadScore = this._calculateWorkloadScore(
        ticketMetrics,
        taskMetrics,
        slaWeightedLoad,
        totalEstimatedHours
      );

      return {
        userId,
        summary: {
          totalTickets: tickets.length,
          totalTasks: tasks.length,
          totalItems: tickets.length + tasks.length,
          estimatedHours: totalEstimatedHours,
          workloadScore, // 0-100 scale
          workloadLevel: this._getWorkloadLevel(workloadScore), // low, medium, high, overloaded
        },
        tickets: ticketMetrics,
        tasks: taskMetrics,
        sla: slaWeightedLoad,
        breakdown: {
          byPriority: this._breakdownByPriority(tickets, tasks),
          byStatus: this._breakdownByStatus(tickets, tasks),
          bySLA: this._breakdownBySLA(tickets),
        },
        recommendations: this._generateRecommendations(workloadScore, ticketMetrics, taskMetrics),
      };
    } catch (error) {
      throw new Error(`Error calculating workload: ${error.message}`);
    }
  }

  /**
   * Calculate ticket-specific metrics
   */
  _calculateTicketMetrics(tickets) {
    const now = new Date();
    
    const metrics = {
      total: tickets.length,
      byStatus: {
        open: 0,
        assigned: 0,
        in_progress: 0,
      },
      byPriority: {
        urgent: 0,
        high: 0,
        medium: 0,
        low: 0,
      },
      bySLA: {
        breached: 0,
        at_risk: 0,
        on_track: 0,
        unknown: 0,
      },
      overdue: 0,
      dueWithin24h: 0,
      dueWithin7days: 0,
    };

    tickets.forEach(ticket => {
      // Count by status
      metrics.byStatus[ticket.status]++;

      // Count by priority
      metrics.byPriority[ticket.priority]++;

      // Calculate SLA status
      if (ticket.dueDate) {
        const timeRemaining = new Date(ticket.dueDate) - now;
        const hoursRemaining = timeRemaining / (1000 * 60 * 60);

        if (timeRemaining < 0) {
          metrics.bySLA.breached++;
          metrics.overdue++;
        } else if (hoursRemaining < 4) {
          metrics.bySLA.at_risk++;
          metrics.dueWithin24h++;
        } else if (hoursRemaining < 168) { // 7 days
          metrics.bySLA.on_track++;
          metrics.dueWithin7days++;
        } else {
          metrics.bySLA.on_track++;
        }
      } else {
        metrics.bySLA.unknown++;
      }
    });

    return metrics;
  }

  /**
   * Calculate task-specific metrics
   */
  _calculateTaskMetrics(tasks) {
    const metrics = {
      total: tasks.length,
      byStatus: {
        todo: 0,
        in_progress: 0,
        review: 0,
      },
      byPriority: {
        urgent: 0,
        high: 0,
        medium: 0,
        low: 0,
      },
      overdue: 0,
      dueWithin24h: 0,
      dueWithin7days: 0,
      totalEstimatedHours: 0,
    };

    const now = new Date();

    tasks.forEach(task => {
      // Count by status
      if (metrics.byStatus.hasOwnProperty(task.status)) {
        metrics.byStatus[task.status]++;
      }

      // Count by priority
      metrics.byPriority[task.priority]++;

      // Estimated hours
      if (task.estimatedHours) {
        metrics.totalEstimatedHours += task.estimatedHours;
      }

      // Deadline tracking
      if (task.deadline) {
        const timeRemaining = new Date(task.deadline) - now;
        const hoursRemaining = timeRemaining / (1000 * 60 * 60);

        if (timeRemaining < 0) {
          metrics.overdue++;
        } else if (hoursRemaining < 24) {
          metrics.dueWithin24h++;
        } else if (hoursRemaining < 168) { // 7 days
          metrics.dueWithin7days++;
        }
      }
    });

    return metrics;
  }

  /**
   * Calculate SLA-weighted workload
   * Higher weight for items with closer deadlines
   */
  _calculateSLAWeightedLoad(tickets, tasks) {
    const now = new Date();
    let totalWeight = 0;
    let criticalItems = 0;
    let urgentItems = 0;

    // Weight tickets based on SLA status
    tickets.forEach(ticket => {
      if (ticket.dueDate) {
        const timeRemaining = new Date(ticket.dueDate) - now;
        const hoursRemaining = timeRemaining / (1000 * 60 * 60);

        if (hoursRemaining < 0) {
          // Breached SLA - highest weight
          totalWeight += 10;
          criticalItems++;
        } else if (hoursRemaining < 4) {
          // At risk - high weight
          totalWeight += 7;
          urgentItems++;
        } else if (hoursRemaining < 24) {
          // Due within 24h - medium-high weight
          totalWeight += 5;
          urgentItems++;
        } else if (hoursRemaining < 72) {
          // Due within 3 days - medium weight
          totalWeight += 3;
        } else {
          // On track - normal weight
          totalWeight += 1;
        }
      } else {
        // No deadline - minimal weight
        totalWeight += 1;
      }
    });

    // Weight tasks based on deadline
    tasks.forEach(task => {
      if (task.deadline) {
        const timeRemaining = new Date(task.deadline) - now;
        const hoursRemaining = timeRemaining / (1000 * 60 * 60);

        if (hoursRemaining < 0) {
          totalWeight += 8;
          criticalItems++;
        } else if (hoursRemaining < 24) {
          totalWeight += 5;
          urgentItems++;
        } else if (hoursRemaining < 72) {
          totalWeight += 3;
        } else {
          totalWeight += 1;
        }
      } else {
        totalWeight += 1;
      }
    });

    return {
      totalWeight,
      criticalItems,
      urgentItems,
      averageWeight: (tickets.length + tasks.length) > 0 
        ? (totalWeight / (tickets.length + tasks.length)).toFixed(2)
        : 0,
    };
  }

  /**
   * Calculate total estimated hours
   */
  _calculateTotalEstimatedHours(tickets, tasks) {
    let totalHours = 0;

    // Add ticket estimated resolution times
    tickets.forEach(ticket => {
      if (ticket.estimatedResolutionTime) {
        totalHours += ticket.estimatedResolutionTime;
      }
    });

    // Add task estimated hours
    tasks.forEach(task => {
      if (task.estimatedHours) {
        totalHours += task.estimatedHours;
      }
    });

    return Math.round(totalHours * 10) / 10; // Round to 1 decimal
  }

  /**
   * Calculate workload score (0-100)
   */
  _calculateWorkloadScore(ticketMetrics, taskMetrics, slaWeightedLoad, totalEstimatedHours) {
    // Base score from item count
    const itemScore = Math.min(50, (ticketMetrics.total + taskMetrics.total) * 2);

    // SLA weight contribution
    const slaScore = Math.min(30, slaWeightedLoad.totalWeight * 1.5);

    // Estimated hours contribution
    const hoursScore = Math.min(20, totalEstimatedHours * 0.5);

    const totalScore = itemScore + slaScore + hoursScore;

    return Math.min(100, Math.round(totalScore));
  }

  /**
   * Get workload level from score
   */
  _getWorkloadLevel(score) {
    if (score >= 80) return 'overloaded';
    if (score >= 60) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }

  /**
   * Breakdown workload by priority
   */
  _breakdownByPriority(tickets, tasks) {
    const breakdown = {
      urgent: { tickets: 0, tasks: 0 },
      high: { tickets: 0, tasks: 0 },
      medium: { tickets: 0, tasks: 0 },
      low: { tickets: 0, tasks: 0 },
    };

    tickets.forEach(ticket => {
      breakdown[ticket.priority].tickets++;
    });

    tasks.forEach(task => {
      breakdown[task.priority].tasks++;
    });

    return breakdown;
  }

  /**
   * Breakdown workload by status
   */
  _breakdownByStatus(tickets, tasks) {
    const breakdown = {
      tickets: {
        open: 0,
        assigned: 0,
        in_progress: 0,
      },
      tasks: {
        todo: 0,
        in_progress: 0,
        review: 0,
      },
    };

    tickets.forEach(ticket => {
      if (breakdown.tickets.hasOwnProperty(ticket.status)) {
        breakdown.tickets[ticket.status]++;
      }
    });

    tasks.forEach(task => {
      if (breakdown.tasks.hasOwnProperty(task.status)) {
        breakdown.tasks[task.status]++;
      }
    });

    return breakdown;
  }

  /**
   * Breakdown tickets by SLA status
   */
  _breakdownBySLA(tickets) {
    const now = new Date();
    const breakdown = {
      breached: [],
      at_risk: [],
      on_track: [],
      unknown: [],
    };

    tickets.forEach(ticket => {
      if (!ticket.dueDate) {
        breakdown.unknown.push({
          id: ticket._id,
          number: ticket.number,
          subject: ticket.subject,
          priority: ticket.priority,
        });
        return;
      }

      const timeRemaining = new Date(ticket.dueDate) - now;
      const hoursRemaining = timeRemaining / (1000 * 60 * 60);

      const ticketInfo = {
        id: ticket._id,
        number: ticket.number,
        subject: ticket.subject,
        priority: ticket.priority,
        dueDate: ticket.dueDate,
        hoursRemaining: Math.round(hoursRemaining * 10) / 10,
      };

      if (hoursRemaining < 0) {
        breakdown.breached.push(ticketInfo);
      } else if (hoursRemaining < 4) {
        breakdown.at_risk.push(ticketInfo);
      } else {
        breakdown.on_track.push(ticketInfo);
      }
    });

    return breakdown;
  }

  /**
   * Generate recommendations based on workload
   */
  _generateRecommendations(workloadScore, ticketMetrics, taskMetrics) {
    const recommendations = [];

    // Overload recommendation
    if (workloadScore >= 80) {
      recommendations.push({
        type: 'critical',
        message: 'User is overloaded. Consider reassigning some tickets or tasks.',
        action: 'reassign_items',
      });
    }

    // SLA breach recommendation
    if (ticketMetrics.bySLA.breached > 0) {
      recommendations.push({
        type: 'urgent',
        message: `${ticketMetrics.bySLA.breached} ticket(s) have breached SLA. Immediate action required.`,
        action: 'resolve_breached_tickets',
      });
    }

    // At-risk SLA recommendation
    if (ticketMetrics.bySLA.at_risk > 0) {
      recommendations.push({
        type: 'warning',
        message: `${ticketMetrics.bySLA.at_risk} ticket(s) at risk of breaching SLA within 4 hours.`,
        action: 'prioritize_at_risk_tickets',
      });
    }

    // Overdue tasks recommendation
    if (taskMetrics.overdue > 0) {
      recommendations.push({
        type: 'warning',
        message: `${taskMetrics.overdue} task(s) are overdue.`,
        action: 'complete_overdue_tasks',
      });
    }

    // Balanced workload recommendation
    if (workloadScore < 30) {
      recommendations.push({
        type: 'info',
        message: 'User has capacity for additional work.',
        action: 'assign_more_items',
      });
    }

    return recommendations;
  }

  /**
   * Get team workload overview
   */
  async getTeamWorkload(teamMemberIds) {
    try {
      const workloads = await Promise.all(
        teamMemberIds.map(userId => this.calculateUserWorkload(userId))
      );

      // Calculate team statistics
      const teamStats = {
        totalMembers: workloads.length,
        totalTickets: workloads.reduce((sum, w) => sum + w.summary.totalTickets, 0),
        totalTasks: workloads.reduce((sum, w) => sum + w.summary.totalTasks, 0),
        averageWorkloadScore: Math.round(
          workloads.reduce((sum, w) => sum + w.summary.workloadScore, 0) / workloads.length
        ),
        overloadedMembers: workloads.filter(w => w.summary.workloadLevel === 'overloaded').length,
        capacityMembers: workloads.filter(w => w.summary.workloadLevel === 'low').length,
      };

      return {
        teamStats,
        members: workloads.map(w => ({
          userId: w.userId,
          workloadScore: w.summary.workloadScore,
          workloadLevel: w.summary.workloadLevel,
          totalItems: w.summary.totalItems,
          criticalItems: w.sla.criticalItems,
          urgentItems: w.sla.urgentItems,
        })),
      };
    } catch (error) {
      throw new Error(`Error calculating team workload: ${error.message}`);
    }
  }
}

export default new WorkloadService();
