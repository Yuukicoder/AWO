import { useState, useEffect } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TaskFilter from '@/components/task/TaskFilter';
import TaskSearch from '@/components/task/TaskSearch';
import { Plus, RefreshCw } from 'lucide-react';

/**
 * Task List Page
 * Main task management interface with filtering and parent ticket display
 */
const TaskListPage = () => {
  const {
    tasks,
    loading,
    pagination,
    fetchTasks,
    setFilters,
    stats,
  } = useTaskStore();

  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleRefresh = () => {
    fetchTasks();
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
      pending: 'default',
      in_progress: 'info',
      completed: 'success',
      cancelled: 'secondary',
    };
    return colors[status] || 'default';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage tasks and track progress
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
            Create Task
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <TaskFilter />
        </div>
        <div className="lg:col-span-3 space-y-4">
          <TaskSearch />

          {/* Tasks List */}
          {loading ? (
            <div className="text-center py-8">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No tasks found</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <Card
                  key={task._id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge variant={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                        {task.ticketId && (
                          <Badge variant="outline">
                            Ticket: {task.ticketId.number || task.ticketId}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg mb-1">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        {task.assignedTo && (
                          <span>
                            Assigned: {task.assignedTo.name || task.assignedTo.email}
                          </span>
                        )}
                        {task.estimatedHours && (
                          <span>Est: {task.estimatedHours}h</span>
                        )}
                        {task.actualHours && (
                          <span>Actual: {task.actualHours}h</span>
                        )}
                        {task.dueDate && (
                          <span>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {task.ticketId && typeof task.ticketId === 'object' && (
                        <div className="mt-2 p-2 bg-muted rounded text-sm">
                          <strong>Parent Ticket:</strong> {task.ticketId.number} -{' '}
                          {task.ticketId.subject}
                        </div>
                      )}
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
                onClick={() => setFilters({ page: pagination.page - 1 })}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setFilters({ page: pagination.page + 1 })}
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

export default TaskListPage;
