import { useTaskStore } from '@/stores/taskStore';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

/**
 * Task Filter Component
 * Provides filtering options for task list including parent ticket filter
 */
const TaskFilter = () => {
  const { filters, updateFilter, clearFilters, applyFilters } = useTaskStore();

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const hasActiveFilters = Object.values(filters).some((value) => value);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <Label htmlFor="status-filter">Status</Label>
        <select
          id="status-filter"
          className="w-full p-2 border rounded-md text-sm"
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Priority Filter */}
      <div className="space-y-2">
        <Label htmlFor="priority-filter">Priority</Label>
        <select
          id="priority-filter"
          className="w-full p-2 border rounded-md text-sm"
          value={filters.priority}
          onChange={(e) => updateFilter('priority', e.target.value)}
        >
          {priorityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Ticket Filter */}
      <div className="space-y-2">
        <Label htmlFor="ticket-filter">Parent Ticket</Label>
        <input
          id="ticket-filter"
          type="text"
          placeholder="Ticket ID or Number"
          className="w-full p-2 border rounded-md text-sm"
          value={filters.ticketId || ''}
          onChange={(e) => updateFilter('ticketId', e.target.value)}
        />
      </div>

      {/* Date Range Filter */}
      <div className="space-y-2">
        <Label htmlFor="date-from">Date From</Label>
        <input
          id="date-from"
          type="date"
          className="w-full p-2 border rounded-md text-sm"
          value={filters.dateFrom || ''}
          onChange={(e) => updateFilter('dateFrom', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date-to">Date To</Label>
        <input
          id="date-to"
          type="date"
          className="w-full p-2 border rounded-md text-sm"
          value={filters.dateTo || ''}
          onChange={(e) => updateFilter('dateTo', e.target.value)}
        />
      </div>

      {/* Apply Filters Button */}
      <Button className="w-full" onClick={applyFilters}>
        Apply Filters
      </Button>
    </Card>
  );
};

export default TaskFilter;
