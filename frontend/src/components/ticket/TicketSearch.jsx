import { useState } from 'react';
import { useTicketStore } from '@/stores/ticketStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

/**
 * Ticket Search Component
 * Provides search functionality by subject, description, or ticket number
 */
const TicketSearch = () => {
  const { searchQuery, setSearchQuery, applyFilters } = useTicketStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const handleSearch = () => {
    setSearchQuery(localQuery);
    applyFilters();
  };

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
    applyFilters();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by subject, description, or ticket number..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-10 pr-10"
        />
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button onClick={handleSearch}>Search</Button>
    </div>
  );
};

export default TicketSearch;
