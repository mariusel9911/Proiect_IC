// src/components/MaintenancePage.jsx
import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';

const MaintenancePage = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const isAdmin = user && user.isAdmin;
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        // Redirect to login page after logout
        navigate('/login');
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
                <div className="mb-6">
                    <span className="inline-block p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Site Under Maintenance
                </h2>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    We're currently performing scheduled maintenance.
                    We'll be back shortly. Thank you for your patience.
                </p>

                {isAuthenticated && !isAdmin && (
                    <div className="mt-6">
                        <button
                            onClick={handleLogout}
                            className="inline-block bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg shadow-md transition duration-200 mr-4"
                        >
                            Logout
                        </button>
                    </div>
                )}

                {isAdmin && (
                    <Link
                        to="/admin/dashboard"
                        className="inline-block bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg shadow-md transition duration-200"
                    >
                        Go to Admin Dashboard
                    </Link>
                )}
            </div>
        </div>
    );
};

export default MaintenancePage;