import React from 'react';
import { User, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

const WorkloadHeatmap = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Workload</h2>
        <div className="space-y-3">
          {['a', 'b', 'c', 'd'].map((n) => (
            <div key={`sk-${n}`} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getWorkloadColor = (status) => {
    switch (status) {
      case 'available':
        return {
          bg: 'bg-green-100',
          bar: 'bg-green-500',
          text: 'text-green-700',
          badge: 'bg-green-50 text-green-700'
        };
      case 'busy':
        return {
          bg: 'bg-yellow-100',
          bar: 'bg-yellow-500',
          text: 'text-yellow-700',
          badge: 'bg-yellow-50 text-yellow-700'
        };
      case 'overload':
        return {
          bg: 'bg-red-100',
          bar: 'bg-red-500',
          text: 'text-red-700',
          badge: 'bg-red-50 text-red-700'
        };
      default:
        return {
          bg: 'bg-gray-100',
          bar: 'bg-gray-500',
          text: 'text-gray-700',
          badge: 'bg-gray-50 text-gray-700'
        };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4" />;
      case 'busy':
        return <TrendingUp className="h-4 w-4" />;
      case 'overload':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'busy':
        return 'Busy';
      case 'overload':
        return 'Overloaded';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Team Workload Heatmap</h2>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-gray-600">Busy</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-600">Overload</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((user) => {
          const colors = getWorkloadColor(user.status);
          const utilizationPercent = (user.utilization * 100).toFixed(0);

          return (
            <div
              key={user.id}
              className={`p-4 rounded-lg border-2 ${colors.bg} border-transparent hover:border-gray-300 transition-all`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 p-1 rounded-full ${colors.badge}`}>
                      {getStatusIcon(user.status)}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
                    {getStatusLabel(user.status)}
                  </div>
                  <span className={`text-sm font-bold ${colors.text}`}>
                    {utilizationPercent}%
                  </span>
                </div>
              </div>

              {/* Workload Bar */}
              <div className="mb-2">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full ${colors.bar} transition-all duration-500 rounded-full`}
                    style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Metrics */}
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center space-x-4">
                  <span>
                    <strong>{user.active_tasks}</strong> active tasks
                  </span>
                  <span>
                    <strong>{parseFloat(user.current_workload_hours).toFixed(1)}h</strong> / {user.capacity_hours_per_week}h
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  {user.overdue_count > 0 && (
                    <span className="text-red-600 font-medium">
                      {user.overdue_count} overdue
                    </span>
                  )}
                  {user.high_priority_count > 0 && (
                    <span className="text-orange-600 font-medium">
                      {user.high_priority_count} high priority
                    </span>
                  )}
                </div>
              </div>

              {/* Skills (optional) */}
              {user.skills && user.skills.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {user.skills.slice(0, 5).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-white rounded text-xs text-gray-600 border"
                    >
                      {typeof skill === 'string' ? skill : skill.name}
                    </span>
                  ))}
                  {user.skills.length > 5 && (
                    <span className="px-2 py-0.5 bg-white rounded text-xs text-gray-500 border">
                      +{user.skills.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No team members found</p>
        </div>
      )}
    </div>
  );
};

export default WorkloadHeatmap;
