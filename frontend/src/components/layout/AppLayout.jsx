import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './NavBar';
import Sidebar from './SideBar';
import useNotificationSocket from '@/hooks/useNotificationSocket';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Register socket notification listener for the entire authenticated session
  useNotificationSocket();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar - Fixed at top */}
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      
      <div className="flex pt-16">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} />
        
        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
