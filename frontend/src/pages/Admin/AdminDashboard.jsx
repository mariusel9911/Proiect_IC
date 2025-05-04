import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import AdminSidebar from './AdminSidebar';
import AdminServicesPanel from '../Admin/AdminServicesPanel';
import AdminProvidersPanel from '../Admin/AdminProvidersPanel';
import AdminOrdersPanel from '../Admin/AdminOrdersPanel';
import AdminUsersPanel from '../Admin/AdminUsersPanel';
import AdminAnalyticsPanel from '../Admin/AdminAnalyticsPanel';
import AdminSettingsPanel from '../Admin/AdminSettingsPanel';
import { Settings, LogOut } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useMaintenanceMode } from '../../contexts/MaintenanceModeContext';

const AdminDashboard = () => {
    const { user, logout } = useAuthStore();
    const { darkMode } = useDarkMode();
    const { isMaintenanceMode } = useMaintenanceMode();
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

  const handleSettingsClick = () => {
        setActivePanel('settings');
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
    case 'settings':
        return <AdminSettingsPanel />;
    case 'analytics':
        return <AdminAnalyticsPanel />;
    default:
        return <AdminServicesPanel />;
    }
  };


    return (
        <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900 flex">
            {/* Sidebar */}
            <AdminSidebar activePanel={activePanel} setActivePanel={setActivePanel} />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">

                    {/* Maintenance Mode Indicator */}
                    {isMaintenanceMode && (
                        <div className="bg-yellow-500 text-white py-2 px-4 text-center">
                            <span className="font-medium">Maintenance Mode Active:</span> Only administrators can access the site.
                        </div>
                    )}

                    {/* Top Header */}
                    <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                Admin Dashboard | {' '}
              {activePanel.charAt(0).toUpperCase() + activePanel.slice(1)}
                            </h1>

                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <span className="hidden md:inline-block text-sm text-gray-500 dark:text-gray-400 mr-2">
                                        Welcome, {user.name}
                                    </span>
                                    <span className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>

                                <button
                                    onClick={handleSettingsClick}
                                    className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                    title="Settings"
                                >
                                    <Settings size={20} />
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                    title="Logout"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-800">
                        {renderPanel()}
                    </main>
                </div>
            </div>
    );
};

export default AdminDashboard;
