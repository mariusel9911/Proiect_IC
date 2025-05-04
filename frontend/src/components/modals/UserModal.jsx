import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const UserModal = ({ user, onClose, onSave }) => {
    const { darkMode } = useDarkMode();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        isAdmin: false,
        isVerified: false,
    });

    // Populate form with user data
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                isAdmin: user.isAdmin || false,
                isVerified: user.isVerified || false,
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Edit User</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div className="flex items-center space-x-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isAdmin"
                                    checked={formData.isAdmin}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
                                />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Admin</span>
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isVerified"
                                    checked={formData.isVerified}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
                                />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Verified</span>
                            </label>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;