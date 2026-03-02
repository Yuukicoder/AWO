import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNotificationStore } from '@/stores/useNotificationStore';
import {
  LayoutDashboard,
  Ticket,
  CheckSquare,
  Users,
  BarChart3,
  Settings,
  Shield,
  Workflow,
  FolderKanban,
  UserCog,
  Clock,
  Inbox
} from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  // Unread ticket assignment notifications → badge count
  const unreadTicketCount = useNotificationStore((s) =>
    s.notifications.filter((n) => !n.read && n.type === 'ticket_assigned').length
  );

  // Define navigation items based on roles
  const getNavigationItems = () => {
    const commonItems = [
      {
        title: 'Tổng quan',
        icon: LayoutDashboard,
        path: '/',
        roles: ['admin', 'manager', 'member']
      },
      {
        title: 'Tickets',
        icon: Ticket,
        path: '/tickets',
        roles: ['admin', 'manager', 'member']
      },
      {
        title: 'Tasks',
        icon: CheckSquare,
        path: '/tasks',
        roles: ['admin', 'manager', 'member']
      }
    ];

    const managerItems = [
      {
        title: 'Manager Dashboard',
        icon: FolderKanban,
        path: '/manager/dashboard',
        roles: ['admin', 'manager']
      },
      {
        title: 'AI Ingest Review',
        icon: Inbox,
        path: '/manager/ingest-review',
        roles: ['admin', 'manager']
      },
      {
        title: 'Workload Analytics',
        icon: BarChart3,
        path: '/manager/analytics',
        roles: ['admin', 'manager']
      }
    ];

    const adminItems = [
      {
        title: 'Quản lý Users',
        icon: Users,
        path: '/users',
        roles: ['admin', 'manager']
      },
      {
        title: 'Phân quyền',
        icon: Shield,
        path: '/permissions',
        roles: ['admin']
      },
      {
        title: 'Workflows',
        icon: Workflow,
        path: '/workflows',
        roles: ['admin']
      },
      {
        title: 'Cấu hình hệ thống',
        icon: Settings,
        path: '/settings',
        roles: ['admin']
      }
    ];

    const memberItems = [
      {
        title: 'My Tasks',
        icon: UserCog,
        path: '/my-tasks',
        roles: ['member', 'manager', 'admin']
      },
      {
        title: 'Time Tracking',
        icon: Clock,
        path: '/time-tracking',
        roles: ['member', 'manager', 'admin']
      }
    ];

    return [...commonItems, ...managerItems, ...memberItems, ...adminItems];
  };

  const navigationItems = getNavigationItems().filter((item) => {
    if (loading || !user?.role) {
      return ['/', '/tickets', '/tasks'].includes(item.path);
    }
    return item.roles.includes(user.role);
  });

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  if (!isOpen) return null;

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 shadow-sm overflow-y-auto">
      <div className="p-4">
        {/* User Role Badge */}
        {/* <div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-600 capitalize">
                {user?.role === 'admin' ? 'Quản trị viên' : 
                user?.role === 'manager' ? 'Quản lý' : 'Thành viên'}
              </p>
            </div>
          </div>
        </div> */}

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${active 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                <span>{item.title}</span>
                {/* Notification badge for Tickets */}
                {item.path === '/tickets' && unreadTicketCount > 0 && (
                  <span className="ml-auto min-w-[20px] h-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1 shadow">
                    {unreadTicketCount > 9 ? '9+' : unreadTicketCount}
                  </span>
                )}
                {active && item.path !== '/tickets' && (
                  <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                )}
                {active && item.path === '/tickets' && unreadTicketCount === 0 && (
                  <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Stats for Manager/Admin */}
        {(user?.role === 'manager' || user?.role === 'admin') && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Quick Stats
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Tasks</span>
                <span className="text-sm font-semibold text-gray-900">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Overdue</span>
                <span className="text-sm font-semibold text-red-600">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Team Members</span>
                <span className="text-sm font-semibold text-gray-900">12</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
