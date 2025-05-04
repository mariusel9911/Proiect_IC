import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Star } from 'lucide-react';
import ProviderModal from '../../components/modals/ProviderModal';
import DeleteConfirmModal from '../../components/modals/DeleteConfirmModal';
import { toast } from 'react-hot-toast';
import { useAdminStore } from '../../store/adminStore';
import { useDarkMode } from '../../contexts/DarkModeContext';

const AdminProvidersPanel = () => {
    const { darkMode } = useDarkMode();
    const {
        providers,
        services,
        isLoading,
        error,
        fetchProviders,
        fetchServices,
        createProvider,
        updateProvider,
        deleteProvider
    } = useAdminStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [showProviderModal, setShowProviderModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentProvider, setCurrentProvider] = useState(null);

    // Fetch providers and services on component mount
    useEffect(() => {
        fetchProviders();
        fetchServices();
    }, [fetchProviders, fetchServices]);

    // Show error toast if there's an error from the store
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleCreateProvider = () => {
        setCurrentProvider(null);
        setShowProviderModal(true);
    };

    const handleEditProvider = (provider) => {
        setCurrentProvider(provider);
        setShowProviderModal(true);
    };

    const handleDeleteClick = (provider) => {
        setCurrentProvider(provider);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteProvider(currentProvider._id);
            toast.success('Provider deleted successfully');
            setShowDeleteModal(false);
        } catch (error) {
            // Error is shown from the store effect
        }
    };

    const handleProviderSave = async (providerData) => {
        try {
            if (currentProvider) {
                // Update existing provider
                await updateProvider(currentProvider._id, providerData);
                toast.success('Provider updated successfully');
            } else {
                // Create new provider
                await createProvider(providerData);
                toast.success('Provider created successfully');
            }

            setShowProviderModal(false);
        } catch (error) {
            // Error is shown from the store effect
        }
    };

    // Filter providers based on search query
    const filteredProviders = providers && providers.length > 0
        ? providers.filter(
            (provider) =>
                provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                provider.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                provider.type.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Manage Providers</h2>

                    <div className="mt-4 md:mt-0 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search providers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="py-2 pl-10 pr-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>

                        <button
                            onClick={handleCreateProvider}
                            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-purple-700 dark:hover:bg-purple-800"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Add Provider
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="p-6 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-purple-500 border-r-transparent"></div>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Loading providers...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Provider
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Services
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Rating
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredProviders.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                    No providers found
                                </td>
                            </tr>
                        ) : (
                            filteredProviders.map((provider) => (
                                <tr key={provider._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-purple-200 dark:bg-purple-900 flex items-center justify-center">
                                                <span className="text-purple-600 dark:text-purple-300 font-semibold">
                                                    {provider.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {provider.name}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {provider.type === 'person' ? 'Individual' : 'Company'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">{provider.email}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{provider.phone || 'No phone'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            {provider.serviceOfferings?.length || 0} services
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Star
                                                className="h-4 w-4 text-yellow-400 mr-1"
                                                fill="currentColor"
                                            />
                                            <span className="text-sm text-gray-900 dark:text-white">
                                                {provider.rating || '0.0'}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                                ({provider.reviews?.length || 0})
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                provider.isActive
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}
                                        >
                                            {provider.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        {provider.isVerified && (
                                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                Verified
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditProvider(provider)}
                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(provider)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Provider Modal for Create/Edit */}
            {showProviderModal && (
                <ProviderModal
                    provider={currentProvider}
                    services={services}
                    onClose={() => setShowProviderModal(false)}
                    onSave={handleProviderSave}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <DeleteConfirmModal
                    title="Delete Provider"
                    message={`Are you sure you want to delete "${currentProvider?.name}"? This action cannot be undone.`}
                    onCancel={() => setShowDeleteModal(false)}
                    onConfirm={handleDeleteConfirm}
                />
            )}
        </div>
    );
};

export default AdminProvidersPanel;