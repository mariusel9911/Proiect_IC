import {
    LayoutGrid,
    Users,
    PackageOpen,
    ShoppingCart,
    Home,
    Settings,
    BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminSidebar = ({ activePanel, setActivePanel }) => {
    const menuItems = [
        { id: 'services', name: 'Services', icon: <PackageOpen size={20} /> },
        { id: 'providers', name: 'Providers', icon: <Users size={20} /> },
        { id: 'orders', name: 'Orders', icon: <ShoppingCart size={20} /> },
        { id: 'users', name: 'Users', icon: <Users size={20} /> },
        { id: 'analytics', name: 'Analytics', icon: <BarChart3 size={20} /> },
        { id: 'settings', name: 'Settings', icon: <Settings size={20} /> },
    ];

    return (
        <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64 bg-gray-800">
                <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-600 rounded-lg">
                        <span className="text-white font-bold">C</span>
                    </div>
                    <h1 className="ml-3 text-xl font-semibold text-white">Clingo Admin</h1>
                </div>

                <div className="h-0 flex-1 flex flex-col overflow-y-auto">
                    {/* Main Nav */}
                    <nav className="px-2 py-4 space-y-1">
                        <Link
                            to="/"
                            className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700"
                        >
                            <Home className="mr-3 h-5 w-5" />
                            Go to Home
                        </Link>

                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActivePanel(item.id)}
                                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md w-full ${
                                    activePanel === item.id
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                            >
                                <span className="mr-3">{item.icon}</span>
                                {item.name}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex-shrink-0 flex bg-gray-700 p-4">
                    <div className="flex items-center">
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white">Admin Portal</p>
                            <p className="text-xs font-medium text-gray-300">v1.0.0</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSidebar;