import { useTicketStore } from '@/stores/ticketStore';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

/**
 * Ticket Filter Component
 * Provides filtering options for ticket list
 */
const TicketFilter = () => {
  const { filters, updateFilter, clearFilters, applyFilters } = useTicketStore();

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'waiting_customer', label: 'Waiting Customer' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const slaOptions = [
    { value: '', label: 'All SLA Status' },
    { value: 'breached', label: 'Breached' },
    { value: 'at_risk', label: 'At Risk' },
    { value: 'on_track', label: 'On Track' },
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

      {/* SLA Status Filter */}
      <div className="space-y-2">
        <Label htmlFor="sla-filter">SLA Status</Label>
        <select
          id="sla-filter"
          className="w-full p-2 border rounded-md text-sm"
          value={filters.slaStatus}
          onChange={(e) => updateFilter('slaStatus', e.target.value)}
        >
          {slaOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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

export default TicketFilter;
