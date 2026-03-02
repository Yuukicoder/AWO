import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useManagerStore from '../../stores/managerStore';
import GlobalOverviewPanel from '../../components/manager/GlobalOverviewPanel';
import WorkloadHeatmap from '../../components/manager/WorkloadHeatmap';
import AITaskQueue from '../../components/manager/AITaskQueue';
import InterventionTools from '../../components/manager/InterventionTools';
import { RefreshCw, Settings, Download, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ManagerDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const user_profile = useAuth();
  console.log('👤 Current User:', user);
  console.log('👤 User Profile:', user_profile);
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const {
    overview,
    teamWorkload,
    taskQueue,
    loading,
    error,
    fetchDashboardOverview,
    fetchTeamWorkload,
    fetchTaskQueue,
    reassignTicket,
    changePriority,
  } = useManagerStore();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchDashboardOverview(),
        fetchTeamWorkload(),
        fetchTaskQueue({ unassigned: false }),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleInterventionAction = async (action, taskId, params) => {
    try {
      switch (action) {
        case 'reassign':
          await reassignTicket(
            taskId,
            selectedTask?.current_assignee?.id,
            params.toUserId,
            params.reason
          );
          break;
        case 'changePriority':
          await changePriority(taskId, params.priority);
          break;
        case 'pause':
          // Implement pause logic
          alert('Pause functionality will be implemented');
          break;
        case 'escalate':
          await changePriority(taskId, 'urgent');
          break;
        default:
          break;
      }
      setSelectedTask(null);
      loadDashboardData();
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Failed to perform action: ' + error.message);
    }
  };

  if (loading && !overview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading manager dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Manager Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Monitor team workload, manage tasks, and intervene when needed
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={loadDashboardData}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">Refresh</span>
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4" />
                <span className="text-sm font-medium">Export</span>
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Global Overview Panel */}
        <GlobalOverviewPanel data={overview} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Workload Heatmap */}
          <div className="lg:col-span-1">
            <WorkloadHeatmap data={teamWorkload} />
          </div>

          {/* Right Column - Task Queue */}
          <div className="lg:col-span-2">
            <AITaskQueue 
              tasks={taskQueue} 
              onTaskClick={handleTaskClick} 
            />
          </div>
        </div>
      </div>

      {/* Task Detail Sidebar */}
      {selectedTask && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-40"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedTask(null); }}
        >
          <div className="bg-white h-full w-full max-w-2xl shadow-xl overflow-y-auto mt-14">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Task Details
                </h2>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Task Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedTask.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedTask.description || 'No description provided'}
                </p>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-medium text-gray-500">Priority</span>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {selectedTask.priority?.toUpperCase()}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500">Status</span>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {selectedTask.status?.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500">Estimated Hours</span>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {selectedTask.estimated_hours || 'N/A'}h
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500">Due Date</span>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {selectedTask.due_date 
                      ? new Date(selectedTask.due_date).toLocaleDateString()
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>

              {/* AI Reasoning Panel */}
              {selectedTask.ai && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    AI Analysis & Reasoning
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-medium text-gray-600">Confidence Score</span>
                      <div className="mt-1 flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${(selectedTask.ai.confidence_score || 0) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {((selectedTask.ai.confidence_score || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {selectedTask.ai.reasoning && (
                      <div>
                        <span className="text-xs font-medium text-gray-600">Reasoning</span>
                        <p className="text-sm text-gray-700 mt-1">
                          {selectedTask.ai.reasoning}
                        </p>
                      </div>
                    )}

                    {selectedTask.ai.suggested_assignee && (
                      <div>
                        <span className="text-xs font-medium text-gray-600">Suggested Assignee</span>
                        <div className="flex items-center space-x-2 mt-1">
                          {selectedTask.ai.suggested_assignee.avatar_url ? (
                            <img
                              src={selectedTask.ai.suggested_assignee.avatar_url}
                              alt={selectedTask.ai.suggested_assignee.name}
                              className="h-6 w-6 rounded-full"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-gray-300"></div>
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {selectedTask.ai.suggested_assignee.name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Current Assignment */}
              {selectedTask.current_assignee && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Current Assignment
                  </h4>
                  <div className="flex items-center space-x-3">
                    {selectedTask.current_assignee.avatar_url ? (
                      <img
                        src={selectedTask.current_assignee.avatar_url}
                        alt={selectedTask.current_assignee.name}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300"></div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedTask.current_assignee.name}
                      </p>
                      {selectedTask.assigned_by && (
                        <p className="text-xs text-gray-500">
                          Assigned by {selectedTask.assigned_by.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Intervention Tools */}
              <InterventionTools
                task={selectedTask}
                onAction={handleInterventionAction}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
