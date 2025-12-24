import { useState, useEffect } from 'react';
import { useTicketStore } from '@/stores/ticketStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TicketFilter from '@/components/ticket/TicketFilter';
import TicketSearch from '@/components/ticket/TicketSearch';
import { Plus, RefreshCw } from 'lucide-react';

/**
 * Ticket List Page
 * Main ticket management interface with filtering, search, and SLA tracking
 */
const TicketListPage = () => {
  const {
    tickets,
    loading,
    pagination,
    filters,
    fetchTickets,
    setPage,
    stats,
    fetchStats,
  } = useTicketStore();

  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, []);

  const handleRefresh = () => {
    fetchTickets();
    fetchStats();
  };

  const getSLABadgeColor = (ticket) => {
    if (!ticket.dueDate) return 'default';
    
    const now = new Date();
    const dueDate = new Date(ticket.dueDate);
    const hoursRemaining = (dueDate - now) / (1000 * 60 * 60);

    if (ticket.status === 'closed' || ticket.status === 'resolved') {
      return 'success';
    }

    if (hoursRemaining < 0) return 'destructive'; // Breached
    if (hoursRemaining < 4) return 'warning'; // At risk
    return 'default'; // On track
  };

  const getSLAStatus = (ticket) => {
    if (!ticket.dueDate) return 'No SLA';
    
    const now = new Date();
    const dueDate = new Date(ticket.dueDate);
    const hoursRemaining = (dueDate - now) / (1000 * 60 * 60);

    if (ticket.status === 'closed' || ticket.status === 'resolved') {
      return 'Resolved';
    }

    if (hoursRemaining < 0) return 'Breached';
    if (hoursRemaining < 4) return 'At Risk';
    return 'On Track';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'destructive',
      high: 'warning',
      medium: 'default',
      low: 'secondary',
    };
    return colors[priority] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'default',
      in_progress: 'info',
      waiting_customer: 'warning',
      resolved: 'success',
      closed: 'secondary',
    };
    return colors[status] || 'default';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tickets</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track support tickets with SLA monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Ticket
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Tickets</div>
            <div className="text-2xl font-bold">{stats.totalTickets}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Overdue</div>
            <div className="text-2xl font-bold text-red-600">
              {stats.overdueCount}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Avg Resolution</div>
            <div className="text-2xl font-bold">
              {Math.round(stats.averageResolutionTime)}h
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Open Tickets</div>
            <div className="text-2xl font-bold">
              {stats.byStatus?.find((s) => s.status === 'open')?.count || 0}
            </div>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <TicketFilter />
        </div>
        <div className="lg:col-span-3 space-y-4">
          <TicketSearch />

          {/* Tickets List */}
          {loading ? (
            <div className="text-center py-8">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No tickets found</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <Card
                  key={ticket._id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm text-muted-foreground">
                          {ticket.number}
                        </span>
                        <Badge variant={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Badge variant={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                        <Badge variant={getSLABadgeColor(ticket)}>
                          {getSLAStatus(ticket)}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">
                        {ticket.subject}
                      </h3>
                      {ticket.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {ticket.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span>
                          Reporter: {ticket.reporter?.name || ticket.reporter?.email}
                        </span>
                        {ticket.assignedTo && (
                          <span>Assigned: {ticket.assignedTo.name}</span>
                        )}
                        {ticket.tasks && ticket.tasks.length > 0 && (
                          <span>Tasks: {ticket.tasks.length}</span>
                        )}
                        {ticket.dueDate && (
                          <span>
                            Due: {new Date(ticket.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setPage(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketListPage;
