import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import AdminSidebar from './AdminSidebar';
import AdminServicesPanel from '../Admin/AdminServicesPanel';
import AdminProvidersPanel from '../Admin/AdminProvidersPanel';
import AdminOrdersPanel from '../Admin/AdminOrdersPanel';
import AdminUsersPanel from '../Admin/AdminUsersPanel';
import AdminAnalyticsPanel from '../Admin/AdminAnalyticsPanel';
import { Settings, LogOut } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState('services');

  // Redirect if not admin
  if (!user || !user.isAdmin) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Render panel based on active selection
  const renderPanel = () => {
    switch (activePanel) {
      case 'services':
        return <AdminServicesPanel />;
      case 'providers':
        return <AdminProvidersPanel />;
      case 'orders':
        return <AdminOrdersPanel />;
      case 'users':
        return <AdminUsersPanel />;
      case 'analytics':
        return <AdminAnalyticsPanel />;
      default:
        return <AdminServicesPanel />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 flex">
      {/* Sidebar */}
      <AdminSidebar activePanel={activePanel} setActivePanel={setActivePanel} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              Admin Dashboard |{' '}
              {activePanel.charAt(0).toUpperCase() + activePanel.slice(1)}
            </h1>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="hidden md:inline-block text-sm text-gray-500 mr-2">
                  Welcome, {user.name}
                </span>
                <span className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>

              <button
                className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                title="Settings"
              >
                <Settings size={20} />
              </button>

              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
          {renderPanel()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
