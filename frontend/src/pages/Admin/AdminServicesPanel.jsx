import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import ServiceModal from '../../components/modals/ServiceModal';
import DeleteConfirmModal from '../../components/modals/DeleteConfirmModal';
import { toast } from 'react-hot-toast';
import { useAdminStore } from '../../store/adminStore';
import { useDarkMode } from '../../contexts/DarkModeContext';

const AdminServicesPanel = () => {
    const { darkMode } = useDarkMode();
    const {
        services,
        isLoading,
        error,
        fetchServices,
        createService,
        updateService,
        deleteService,
        setCurrentItem
    } = useAdminStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentService, setCurrentService] = useState(null);

    // Fetch services on component mount
    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    // Show error toast if there's an error from the store
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleCreateService = () => {
        setCurrentService(null);
        setShowServiceModal(true);
    };

    const handleEditService = (service) => {
        setCurrentService(service);
        setShowServiceModal(true);
    };

    const handleDeleteClick = (service) => {
        setCurrentService(service);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteService(currentService._id);
            toast.success('Service deleted successfully');
            setShowDeleteModal(false);
        } catch (error) {
            // Error is shown from the store effect
        }
    };

    const handleServiceSave = async (serviceData) => {
        try {
            if (currentService) {
                // Update existing service
                await updateService(currentService._id, serviceData);
                toast.success('Service updated successfully');
            } else {
                // Create new service
                await createService(serviceData);
                toast.success('Service created successfully');
            }

            setShowServiceModal(false);
        } catch (error) {
            // Error is shown from the store effect
        }
    };

    // Filter services based on search query
    const filteredServices = services && services.length > 0
        ? services.filter(
            (service) =>
                service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                service.type.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Manage Services</h2>

                    <div className="mt-4 md:mt-0 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search services..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="py-2 pl-10 pr-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>

                        <button
                            onClick={handleCreateService}
                            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:bg-purple-700 dark:hover:bg-purple-800"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Add Service
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="p-6 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-purple-500 border-r-transparent"></div>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Loading services...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Service Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Options
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
                        {filteredServices.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                    No services found
                                </td>
                            </tr>
                        ) : (
                            filteredServices.map((service) => (
                                <tr key={service._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {service.name}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                            {service.description}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            {service.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {service.options?.length || 0} options
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                service.isActive
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}
                                        >
                                            {service.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditService(service)}
                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(service)}
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

            {/* Service Modal for Create/Edit */}
            {showServiceModal && (
                <ServiceModal
                    service={currentService}
                    onClose={() => setShowServiceModal(false)}
                    onSave={handleServiceSave}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <DeleteConfirmModal
                    title="Delete Service"
                    message={`Are you sure you want to delete "${currentService?.name}"? This action cannot be undone.`}
                    onCancel={() => setShowDeleteModal(false)}
                    onConfirm={handleDeleteConfirm}
                />
            )}
        </div>
    );
};

export default AdminServicesPanel;