import { useState, useEffect, useRef } from 'react';
import { Search, User, ChevronDown, Loader2, AlertTriangle, TrendingUp } from 'lucide-react';
import { getAllUsers, getUserWorkload } from '../../services/user.service';

/**
 * User Selection Dropdown with Search and Workload Display
 * Shows user workload metrics to help with assignment decisions
 */
const UserSelect = ({ 
  value, 
  onChange, 
  placeholder = 'Select a user...', 
  showWorkload = true,
  excludeUserIds = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [workloads, setWorkloads] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const dropdownRef = useRef(null);

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Load workloads when dropdown opens
  useEffect(() => {
    if (isOpen && showWorkload && users.length > 0) {
      loadWorkloads();
    }
  }, [isOpen, showWorkload, users]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllUsers();
      const filteredUsers = response.data.filter(
        user => !excludeUserIds.includes(user._id)
      );
      setUsers(filteredUsers);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWorkloads = async () => {
    try {
      const workloadPromises = users.map(user => 
        getUserWorkload(user._id).catch(() => null)
      );
      const workloadResults = await Promise.all(workloadPromises);
      
      const workloadMap = {};
      workloadResults.forEach((result, index) => {
        if (result?.data) {
          workloadMap[users[index]._id] = result.data;
        }
      });
      
      setWorkloads(workloadMap);
    } catch (err) {
      console.error('Error loading workloads:', err);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (user) => {
    onChange(user);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getWorkloadColor = (level) => {
    const colors = {
      low: 'text-green-600 bg-green-50',
      medium: 'text-yellow-600 bg-yellow-50',
      high: 'text-orange-600 bg-orange-50',
      overloaded: 'text-red-600 bg-red-50'
    };
    return colors[level] || colors.low;
  };

  const getWorkloadIcon = (level) => {
    if (level === 'overloaded' || level === 'high') {
      return <AlertTriangle className="w-3 h-3" />;
    }
    return <TrendingUp className="w-3 h-3" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selection Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-lg
          hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition bg-white"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {value ? (
            <>
              <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm font-medium truncate">{value.name}</span>
              {showWorkload && workloads[value._id] && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  getWorkloadColor(workloads[value._id].summary.workloadLevel)
                }`}>
                  {workloads[value._id].summary.workloadLevel}
                </span>
              )}
            </>
          ) : (
            <span className="text-sm text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          {/* User List */}
          <div className="overflow-y-auto max-h-64">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <div className="p-4 text-center text-sm text-red-600">
                {error}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No users found
              </div>
            ) : (
              filteredUsers.map(user => {
                const workload = workloads[user._id];
                
                return (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => handleSelect(user)}
                    className="w-full px-4 py-3 hover:bg-gray-50 transition text-left
                      border-b last:border-b-0 flex items-start gap-3"
                  >
                    {/* User Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 
                      flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm truncate">{user.name}</div>
                        {user.role && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                            {user.role}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{user.email}</div>
                      
                      {/* Workload Display */}
                      {showWorkload && workload && (
                        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            getWorkloadColor(workload.summary.workloadLevel)
                          }`}>
                            {getWorkloadIcon(workload.summary.workloadLevel)}
                            {workload.summary.workloadLevel}
                          </div>
                          <div className="text-xs text-gray-600">
                            {workload.summary.totalTickets} tickets, {workload.summary.totalTasks} tasks
                          </div>
                          {workload.sla.criticalItems > 0 && (
                            <div className="text-xs text-red-600 font-medium">
                              {workload.sla.criticalItems} critical
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSelect;
