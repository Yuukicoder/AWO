import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Zap, 
  Pause, 
  ArrowUp, 
  ArrowDown,
  RefreshCw,
  AlertTriangle,
  X
} from 'lucide-react';

const InterventionTools = ({ task, onAction }) => {
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReassign = () => {
    setShowReassignModal(true);
  };

  const handleChangePriority = () => {
    setShowPriorityModal(true);
  };

  const handlePause = async () => {
    if (confirm('Are you sure you want to pause this task?')) {
      setLoading(true);
      try {
        await onAction('pause', task.id);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEscalate = async () => {
    if (confirm('Escalate this task to urgent priority?')) {
      setLoading(true);
      try {
        await onAction('escalate', task.id);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
      
      <div className="grid grid-cols-2 gap-2">
        {/* Reassign Button */}
        <button
          onClick={handleReassign}
          disabled={loading}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserCheck className="h-4 w-4" />
          <span className="text-sm font-medium">Reassign</span>
        </button>

        {/* Change Priority Button */}
        <button
          onClick={handleChangePriority}
          disabled={loading}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Zap className="h-4 w-4" />
          <span className="text-sm font-medium">Priority</span>
        </button>

        {/* Pause Button */}
        <button
          onClick={handlePause}
          disabled={loading}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Pause className="h-4 w-4" />
          <span className="text-sm font-medium">Pause</span>
        </button>

        {/* Escalate Button */}
        <button
          onClick={handleEscalate}
          disabled={loading}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">Escalate</span>
        </button>
      </div>

      {loading && (
        <div className="mt-3 flex items-center justify-center text-sm text-gray-500">
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          Processing...
        </div>
      )}

      {/* Reassign Modal */}
      {showReassignModal && (
        <ReassignModal
          task={task}
          onClose={() => setShowReassignModal(false)}
          onConfirm={(toUserId, reason) => {
            onAction('reassign', task.id, { toUserId, reason });
            setShowReassignModal(false);
          }}
        />
      )}

      {/* Priority Modal */}
      {showPriorityModal && (
        <PriorityModal
          task={task}
          onClose={() => setShowPriorityModal(false)}
          onConfirm={(priority) => {
            onAction('changePriority', task.id, { priority });
            setShowPriorityModal(false);
          }}
        />
      )}
    </div>
  );
};

// Reassign Modal Component
const ReassignModal = ({ task, onClose, onConfirm }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [reason, setReason] = useState('');

  // This would be populated from a users API call
  const [users] = useState([
    { id: '1', name: 'John Doe', avatar_url: null },
    { id: '2', name: 'Jane Smith', avatar_url: null },
    { id: '3', name: 'Bob Johnson', avatar_url: null },
  ]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 pt-14"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Reassign Task
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you reassigning this task?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(selectedUser, reason)}
              disabled={!selectedUser}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reassign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Priority Modal Component
const PriorityModal = ({ task, onClose, onConfirm }) => {
  const [selectedPriority, setSelectedPriority] = useState(task.priority);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 pt-14"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Change Priority
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-2 mb-4">
            {priorities.map((priority) => (
              <button
                key={priority.value}
                onClick={() => setSelectedPriority(priority.value)}
                className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                  selectedPriority === priority.value
                    ? `${priority.color} ring-2 ring-offset-2 ring-blue-500`
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{priority.label}</span>
                  {selectedPriority === priority.value && (
                    <span className="text-blue-600">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(selectedPriority)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Priority
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterventionTools;
