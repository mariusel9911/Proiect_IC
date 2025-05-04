import { useState, useEffect } from 'react';
import { Save, Check, AlertCircle, Moon, Sun } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useMaintenanceMode } from '../../contexts/MaintenanceModeContext';

const AdminSettingsPanel = () => {
    const { user } = useAuthStore();
    const { darkMode, toggleDarkMode } = useDarkMode(); // Make sure you're getting toggleDarkMode
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // App settings state
    const [appSettings, setAppSettings] = useState({
        siteTitle: 'Clingo Admin',
        siteDescription: 'Admin dashboard for service management',
        enableNotifications: true,
        emailNotifications: true,
        maintenanceMode: false,
    });

    // Load saved settings from localStorage on component mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('adminSettings');
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                setAppSettings(parsedSettings);
            } catch (error) {
                console.error('Error parsing saved settings:', error);
            }
        }
    }, []);

    const handleAppSettingsChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAppSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const { setIsMaintenanceMode } = useMaintenanceMode();

    const handleSaveAppSettings = async () => {
        try {
            setIsLoading(true);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update maintenance mode context
            setIsMaintenanceMode(appSettings.maintenanceMode);

            toast.success('Settings updated successfully');
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);

            // Save settings to localStorage
            localStorage.setItem('adminSettings', JSON.stringify(appSettings));
        } catch (error) {
            toast.error('Failed to update settings');
            console.error('Error updating settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden dark:text-white">
            {/* Settings Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Admin Settings</h2>

                {/* Success Alert */}
                {showSuccess && (
                    <div className="flex items-center text-sm font-medium text-green-600 dark:text-green-400">
                        <Check className="h-5 w-5 mr-1" />
                        Changes saved successfully
                    </div>
                )}
            </div>

            {/* Settings Content */}
            <div className="p-6">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="siteTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dashboard Title</label>
                        <input
                            type="text"
                            id="siteTitle"
                            name="siteTitle"
                            value={appSettings.siteTitle}
                            onChange={handleAppSettingsChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    <div>
                        <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Site Description</label>
                        <textarea
                            id="siteDescription"
                            name="siteDescription"
                            rows={3}
                            value={appSettings.siteDescription}
                            onChange={handleAppSettingsChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Interface</h3>

                        {/* Dark Mode Toggle */}
                        <div className="flex items-center justify-between py-3">
                            <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Dark Mode</span>
                                {darkMode ? (
                                    <Moon className="ml-2 h-4 w-4 text-gray-400 dark:text-gray-300" />
                                ) : (
                                    <Sun className="ml-2 h-4 w-4 text-yellow-500" />
                                )}
                            </div>
                            <div
                                className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                style={{ backgroundColor: darkMode ? '#34D399' : '#D1D5DB' }}
                                onClick={toggleDarkMode}>
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                        darkMode ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                    aria-hidden="true"
                                ></span>
                                <input
                                    type="checkbox"
                                    id="darkMode"
                                    checked={darkMode}
                                    onChange={() => {}}
                                    className="sr-only"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">Notifications</h3>

                        <div className="flex items-center justify-between py-3">
                            <div>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Enable Notifications</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Receive notifications about orders and users</p>
                            </div>
                            <div className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                 style={{ backgroundColor: appSettings.enableNotifications ? '#34D399' : '#D1D5DB' }}
                                 onClick={() => setAppSettings(prev => ({...prev, enableNotifications: !prev.enableNotifications}))}>
                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    appSettings.enableNotifications ? 'translate-x-5' : 'translate-x-0'
                                }`} aria-hidden="true"></span>
                                <input
                                    type="checkbox"
                                    id="enableNotifications"
                                    name="enableNotifications"
                                    checked={appSettings.enableNotifications}
                                    onChange={handleAppSettingsChange}
                                    className="sr-only"
                                />
                            </div>
                        </div>

                        {/* Email Notifications Toggle */}
                        <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700">
                            <div>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Email Notifications</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Receive email notifications for important events</p>
                            </div>
                            <div
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    !appSettings.enableNotifications ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                                style={{
                                    backgroundColor: !appSettings.enableNotifications
                                        ? '#D1D5DB'
                                        : appSettings.emailNotifications
                                            ? '#34D399'
                                            : '#D1D5DB'
                                }}
                                onClick={() => {
                                    if (appSettings.enableNotifications) {
                                        setAppSettings(prev => ({...prev, emailNotifications: !prev.emailNotifications}));
                                    }
                                }}>
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                        appSettings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                                    }`} aria-hidden="true"
                                ></span>
                                <input
                                    type="checkbox"
                                    id="emailNotifications"
                                    name="emailNotifications"
                                    checked={appSettings.emailNotifications}
                                    onChange={handleAppSettingsChange}
                                    disabled={!appSettings.enableNotifications}
                                    className="sr-only"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">System</h3>

                        <div className="flex items-center justify-between py-3">
                            <div>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Maintenance Mode</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Put the site in maintenance mode</p>
                            </div>
                            <div
                                className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                style={{ backgroundColor: appSettings.maintenanceMode ? '#34D399' : '#D1D5DB' }}
                                onClick={() => setAppSettings(prev => ({...prev, maintenanceMode: !prev.maintenanceMode}))}>
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                        appSettings.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                    aria-hidden="true"
                                ></span>
                                <input
                                    type="checkbox"
                                    id="maintenanceMode"
                                    name="maintenanceMode"
                                    checked={appSettings.maintenanceMode}
                                    onChange={handleAppSettingsChange}
                                    className="sr-only"
                                />
                            </div>
                        </div>

                        {appSettings.maintenanceMode && (
                            <div className="mt-4 p-4 bg-yellow-50 rounded-md flex items-start dark:bg-yellow-900">
                                <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                                <div>
                                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Attention Required</h3>
                                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
                                        <p>
                                            When maintenance mode is enabled, the site will be inaccessible to regular users.
                                            Only administrators will be able to access the site.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-6">
                        <button
                            type="button"
                            onClick={handleSaveAppSettings}
                            disabled={isLoading}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-700 dark:hover:bg-green-800 dark:focus:ring-offset-gray-800"
                        >
                            {isLoading ? (
                                <>
                                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-solid border-white border-r-transparent mr-2"></span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettingsPanel;