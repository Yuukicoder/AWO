import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Bell, Settings, LogOut, User } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left - Logo & Title */}
        <div className="flex items-center gap-4">
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
            <h1 className="text-black font-semibold text-lg">Bảng tác vụ Kanban</h1>
          </div>
        </div>

        {/* Center - Navigation */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-black transition-colors text-sm font-medium"
          >
            Tổng quan
          </button>
          <button 
            onClick={() => navigate('/')}
            className={`${window.location.pathname === '/' ? 'text-black border-b-2 border-blue-600' : 'text-gray-600 hover:text-black'} pb-1 text-sm font-medium transition-colors`}
          >
            Bảng
          </button>
          <button 
            onClick={() => navigate('/users')}
            className={`${window.location.pathname === '/users' ? 'text-black border-b-2 border-blue-600' : 'text-gray-600 hover:text-black'} pb-1 text-sm font-medium transition-colors`}
          >
            Người dùng
          </button>
          <button className="text-gray-600 hover:text-black transition-colors text-sm font-medium">
            Báo cáo
          </button>
        </div>

        {/* Right - Search & Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm tác vụ..."
              className="bg-[#F4F4F4] text-black placeholder:text-gray-500 rounded-lg px-4 py-2 pr-10 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-600 border border-gray-200"
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

          {/* Create Button */}
          <Button className="bg-black hover:bg-gray-900 text-white text-sm h-9 shadow-md">
            Tạo Tác Vụ Mới
          </Button>

          {/* Notifications */}
          <button className="text-gray-600 hover:text-black transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button className="text-gray-600 hover:text-black transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 hover:bg-[#F4F4F4] px-3 py-2 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
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
  );
}
