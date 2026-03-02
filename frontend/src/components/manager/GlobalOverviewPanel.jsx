import React from 'react';
import { TrendingUp, AlertCircle, Zap, Clock } from 'lucide-react';

const GlobalOverviewPanel = ({ data }) => {
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {['a', 'b', 'c', 'd'].map((n) => (
          <div key={`sk-${n}`} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const metrics = data.metrics || {};

  const cards = [
    {
      title: 'Total Tasks',
      value: metrics.total_tasks || 0,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Active in system'
    },
    {
      title: 'Overdue Tasks',
      value: metrics.overdue_tasks || 0,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Needs attention',
      alert: metrics.overdue_tasks > 0
    },
    {
      title: 'High Priority',
      value: metrics.high_priority_tasks || 0,
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Urgent/High'
    },
    {
      title: 'SLA at Risk',
      value: metrics.sla_at_risk || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: 'Within 24h deadline',
      alert: metrics.sla_at_risk > 0
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow ${
              card.alert ? 'ring-2 ring-red-200' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
              {card.alert && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Alert
                </span>
              )}
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500">{card.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GlobalOverviewPanel;
