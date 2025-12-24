import { useState, useEffect } from 'react';
import { X, User, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import UserSelect from '../ui/UserSelect';
import { assignTicket } from '../../services/ticket.service';
import { assignTask } from '../../services/task.service';
import { toast } from 'sonner';

/**
 * Assignment Modal Component
 * Support both ticket and task assignment
 * Shows user workload when selecting assignee
 */
const AssignmentModal = ({ isOpen, onClose, item, type = 'ticket', onSuccess }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedUser(item?.assignedTo || null);
      setError(null);
    }
  }, [isOpen, item]);

  const handleAssign = async () => {
    if (!selectedUser) {
      setError('Please select a user to assign');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let result;
      
      if (type === 'ticket') {
        result = await assignTicket(item._id, selectedUser._id);
        toast.success(`Ticket ${item.number} assigned to ${selectedUser.name}`);
      } else {
        result = await assignTask(item._id, selectedUser._id);
        toast.success(`Task assigned to ${selectedUser.name}`);
      }

      onSuccess?.(result);
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Assignment failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnassign = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      let result;
      
      if (type === 'ticket') {
        result = await assignTicket(item._id, null);
        toast.success(`Ticket ${item.number} unassigned`);
      } else {
        result = await assignTask(item._id, null);
        toast.success('Task unassigned');
      }

      onSuccess?.(result);
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Unassignment failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">
              Assign {type === 'ticket' ? 'Ticket' : 'Task'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Item Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              {type === 'ticket' ? 'Ticket' : 'Task'}
            </div>
            <div className="font-medium mt-1">
              {type === 'ticket' 
                ? `${item?.number} - ${item?.subject}` 
                : item?.title}
            </div>
            {item?.priority && (
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium
                  ${item.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    item.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'}`}>
                  {item.priority.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Current Assignment */}
          {item?.assignedTo && (
            <div className="p-3 bg-blue-50 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <div className="text-sm">
                <span className="text-gray-600">Currently assigned to: </span>
                <span className="font-medium text-blue-900">
                  {typeof item.assignedTo === 'object' 
                    ? item.assignedTo.name 
                    : 'Unknown User'}
                </span>
              </div>
            </div>
          )}

          {/* User Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Assign to User
            </label>
            <UserSelect
              value={selectedUser}
              onChange={setSelectedUser}
              placeholder="Search and select a user..."
              showWorkload={true}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          {item?.assignedTo && (
            <Button
              variant="outline"
              onClick={handleUnassign}
              disabled={isSubmitting}
            >
              Unassign
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={isSubmitting || !selectedUser}
          >
            {isSubmitting ? 'Assigning...' : 'Assign'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;
