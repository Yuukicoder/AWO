import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Bell, Settings, LogOut, User, Menu } from "lucide-react";
import CreateTicketModal from "@/components/ticket/CreateTicketModal";

export default function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between">
        {/* Left - Logo & Title */}
        <div className="flex items-center gap-4">
          {/* Toggle Sidebar Button */}
          <button 
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="3" y="3" width="7" height="7" fill="white" rx="1" />
                <rect x="14" y="3" width="7" height="7" fill="white" rx="1" />
                <rect x="3" y="14" width="7" height="7" fill="white" rx="1" />
                <rect x="14" y="14" width="7" height="7" fill="white" rx="1" />
              </svg>
            </div>
            <h1 className="text-black font-semibold text-lg">AWO - AI Workflow Orchestrator</h1>
          </div>
        </div>

        {/* Center - Quick Search */}
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm tickets, tasks, users..."
              className="bg-[#F4F4F4] text-black placeholder:text-gray-500 rounded-lg px-4 py-2 pr-10 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-600 border border-gray-200"
            />
            <svg
              className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-3">
          {/* Create Button */}
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-black hover:bg-gray-900 text-white text-sm h-9 shadow-md"
          >
            Tạo Ticket
          </Button>

          {/* Notifications */}
          <button className="text-gray-600 hover:text-black transition-colors relative p-2 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings - Only for admin/manager */}
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <button 
              onClick={() => navigate('/settings')}
              className="text-gray-600 hover:text-black transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1.5 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-black font-medium text-sm">{user?.name || 'User'}</p>
                  <p className="text-gray-600 text-xs">{user?.email || ''}</p>
                </div>
                
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-[#F4F4F4] transition-colors flex items-center gap-3 text-sm"
                >
                  <User className="w-4 h-4" />
                  Trang cá nhân
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-[#F4F4F4] transition-colors flex items-center gap-3 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>

    {showCreateModal && (
      <CreateTicketModal
        onClose={() => setShowCreateModal(false)}
      />
    )}
  </>);
}
