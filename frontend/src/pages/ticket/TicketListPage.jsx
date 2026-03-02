import { useState, useEffect } from 'react';
import { useTicketStore } from '@/stores/ticketStore';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TicketFilter from '@/components/ticket/TicketFilter';
import TicketSearch from '@/components/ticket/TicketSearch';
import TicketDetailModal from '@/components/ticket/TicketDetailModal';
import { toast } from 'sonner';
import { Plus, RefreshCw, CheckCircle2, X } from 'lucide-react';

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
    fetchTicketsByAssignee,
    fetchTicketsById,
    handleTicketUpdated,
    setPage,
    stats,
    fetchStats,
  } = useTicketStore();

  const { acceptTicket, dismissTicket, notifications } = useNotificationStore();
  const { user } = useAuth();
  const [acceptingId, setAcceptingId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Find matching unread ticket_assigned notification for a given ticket
  const getNotifForTicket = (ticketId) =>
    notifications.find(
      (n) =>
        !n.read &&
        n.type === 'ticket_assigned' &&
        (n.data?.ticketId === ticketId || n.data?._id === ticketId)
    );

  const handleAccept = async (ticket) => {
    const notif = getNotifForTicket(ticket._id);
    setAcceptingId(ticket._id);
    try {
      const updated = await acceptTicket(ticket._id, notif?.id);
      const patched = updated ?? { ...ticket, status: 'in_progress' };
      handleTicketUpdated(patched);
      // Reflect in open modal too
      setSelectedTicket((prev) => prev?._id === ticket._id ? patched : prev);
      toast.success(`Đã nhận ticket ${ticket.number} — chuyển sang In Progress`);
    } catch (err) {
      toast.error('Không thể nhận ticket, thử lại.');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleDismiss = (ticket) => {
    const notif = getNotifForTicket(ticket._id);
    if (notif) dismissTicket(notif.id);
  };

  // Open modal — fetch full detail (with tasks + populated refs)
  const handleCardClick = async (ticket) => {
    setSelectedTicket(ticket); // show immediately with list data
    setModalLoading(true);
    try {
      await fetchTicketsById(ticket._id);  // loads into store.ticket
      // read from store after fetch
      const full = useTicketStore.getState().ticket;
      if (full) setSelectedTicket(full);
    } catch (e) {
      // keep showing the list-level data
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchTicketsByAssignee(user._id);
      fetchStats();
    }
  }, [user?._id]);

  const handleRefresh = () => {
    if (user?._id) fetchTicketsByAssignee(user._id);
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
      urgent: 'destructive',
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
              {stats.averageResolutionTime ? `${Math.round(stats.averageResolutionTime)}h` : '—'}
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
                  className={`p-4 hover:shadow-md transition-shadow cursor-pointer ${
                    getNotifForTicket(ticket._id) ? 'ring-2 ring-blue-400 ring-offset-1' : ''
                  }`}
                  onClick={() => handleCardClick(ticket)}
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
                        {getNotifForTicket(ticket._id) && (
                          <Badge variant="default" className="bg-blue-500 text-white text-[11px]">
                            🔔 Mới
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-1">
                        {ticket.title || ticket.subject}
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

                    {/* Quick Accept / Dismiss on card — stop propagation so card click doesn't also open modal */}
                    {ticket.status === 'open' && getNotifForTicket(ticket._id) && (
                      <div className="flex flex-col gap-2 ml-4 shrink-0">
                        <Button
                          size="sm"
                          className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                          disabled={acceptingId === ticket._id}
                          onClick={(e) => { e.stopPropagation(); handleAccept(ticket); }}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {acceptingId === ticket._id ? 'Đang xử lý...' : 'Nhận'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-gray-500"
                          onClick={(e) => { e.stopPropagation(); handleDismiss(ticket); }}
                        >
                          <X className="h-3.5 w-3.5" />
                          Bỏ qua
                        </Button>
                      </div>
                    )}
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

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          isNew={!!getNotifForTicket(selectedTicket._id)}
          accepting={acceptingId === selectedTicket._id}
          onClose={() => setSelectedTicket(null)}
          onAccept={() => handleAccept(selectedTicket)}
          onDismiss={() => { handleDismiss(selectedTicket); setSelectedTicket(null); }}
        />
      )}
    </div>
  );
};

export default TicketListPage;
