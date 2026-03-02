import React from 'react';
import { 
  AlertCircle, 
  Clock, 
  Zap, 
  HelpCircle, 
  UserX, 
  ArrowUp,
  Brain,
  TrendingUp
} from 'lucide-react';

const AITaskQueue = ({ tasks, onTaskClick }) => {
  if (!tasks) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Task Queue</h2>
        <div className="space-y-3">
          {['a', 'b', 'c'].map((n) => (
            <div key={`sk-${n}`} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'review':
        return 'bg-purple-100 text-purple-700';
      case 'done':
        return 'bg-green-100 text-green-700';
      case 'blocked':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getFlagIcon = (type) => {
    switch (type) {
      case 'danger':
        return AlertCircle;
      case 'warning':
        return Clock;
      case 'info':
        return UserX;
      default:
        return HelpCircle;
    }
  };

  const getFlagColor = (type) => {
    switch (type) {
      case 'danger':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">AI-Driven Task Queue</h2>
        <p className="text-sm text-gray-500 mt-1">
          Sorted by risk and priority. Manager reads risks, not tasks.
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No tasks in queue</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onTaskClick && onTaskClick(task)}
            >
              {/* Header Row */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    {task.ai?.is_unsure && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        <HelpCircle className="h-3 w-3 mr-1" />
                        AI Unsure
                      </span>
                    )}
                  </div>
                  
                  {/* Flags */}
                  {task.flags && task.flags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {task.flags.map((flag, idx) => {
                        const Icon = getFlagIcon(flag.type);
                        return (
                          <span
                            key={idx}
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getFlagColor(flag.type)}`}
                          >
                            <Icon className="h-3 w-3 mr-1" />
                            {flag.label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Priority Badge */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}
                >
                  {task.priority?.toUpperCase()}
                </span>
              </div>

              {/* Meta Row */}
              <div className="flex items-center justify-between text-sm mb-3">
                <div className="flex items-center space-x-4 text-gray-600">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(task.status)}`}>
                    {task.status?.replace('_', ' ').toUpperCase()}
                  </span>
                  
                  {task.category && (
                    <span className="text-xs">
                      {task.category}
                    </span>
                  )}

                  {task.estimated_hours && (
                    <span className="text-xs">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {task.estimated_hours}h
                    </span>
                  )}

                  {task.due_date && (
                    <span className="text-xs">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* AI Section */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 mb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-semibold text-gray-700">AI Analysis</span>
                  </div>
                  
                  {/* Confidence Score */}
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(task.ai?.confidence_score || 0)}`}>
                    {((task.ai?.confidence_score || 0) * 100).toFixed(0)}% confident
                  </div>
                </div>

                {/* AI Reasoning */}
                {task.ai?.reasoning && (
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {task.ai.reasoning}
                  </p>
                )}

                {/* Suggested Assignee */}
                {task.ai?.suggested_assignee && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">
                      Suggested:
                    </span>
                    <div className="flex items-center space-x-2">
                      {task.ai.suggested_assignee.avatar_url ? (
                        <img
                          src={task.ai.suggested_assignee.avatar_url}
                          alt={task.ai.suggested_assignee.name}
                          className="h-5 w-5 rounded-full"
                        />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-gray-300"></div>
                      )}
                      <span className="font-medium text-gray-900">
                        {task.ai.suggested_assignee.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Current Assignment */}
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center space-x-2">
                  {task.current_assignee ? (
                    <>
                      <span>Assigned to:</span>
                      <div className="flex items-center space-x-1">
                        {task.current_assignee.avatar_url ? (
                          <img
                            src={task.current_assignee.avatar_url}
                            alt={task.current_assignee.name}
                            className="h-4 w-4 rounded-full"
                          />
                        ) : (
                          <div className="h-4 w-4 rounded-full bg-gray-300"></div>
                        )}
                        <span className="font-medium text-gray-900">
                          {task.current_assignee.name}
                        </span>
                      </div>
                    </>
                  ) : (
                    <span className="text-orange-600 font-medium">
                      <UserX className="h-3 w-3 inline mr-1" />
                      Unassigned
                    </span>
                  )}
                </div>

                <button
                  className="text-blue-600 hover:text-blue-800 font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick && onTaskClick(task);
                  }}
                >
                  View Details →
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {tasks.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            Load More Tasks
          </button>
        </div>
      )}
    </div>
  );
};

export default AITaskQueue;
