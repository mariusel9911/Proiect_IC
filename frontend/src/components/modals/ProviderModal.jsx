import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit } from 'lucide-react';

const ProviderModal = ({ provider, services, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        description: '',
        email: '',
        phone: '',
        type: 'person',
        services: [],
        location: {
            address: '',
            city: '',
            zipCode: '',
            country: '',
        },
        isActive: true,
        isVerified: false,
        isPopular: false,
    });

    const [serviceOptions, setServiceOptions] = useState({});
    const [currentServiceId, setCurrentServiceId] = useState('');

    // Populate form with provider data when editing
    useEffect(() => {
        if (provider) {
            // Extract service IDs from serviceOfferings
            const providerServices = provider.serviceOfferings
                ? provider.serviceOfferings.map(offering => offering.service)
                : [];

            // Prepare service options from serviceOfferings
            const options = {};
            if (provider.serviceOfferings) {
                provider.serviceOfferings.forEach(offering => {
                    if (offering.options && offering.options.length > 0) {
                        options[offering.service] = offering.options;
                    }
                });
            }

            setFormData({
                name: provider.name || '',
                title: provider.title || '',
                description: provider.description || '',
                email: provider.email || '',
                phone: provider.phone || '',
                type: provider.type || 'person',
                services: providerServices,
                location: provider.location || {
                    address: '',
                    city: '',
                    zipCode: '',
                    country: '',
                },
                isActive: provider.isActive !== undefined ? provider.isActive : true,
                isVerified: provider.isVerified || false,
                isPopular: provider.isPopular || false,
            });

            setServiceOptions(options);
        }
    }, [provider]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            if (name.includes('.')) {
                const [parent, child] = name.split('.');
                return {
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: type === 'checkbox' ? checked : value,
                    },
                };
            }

            return {
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            };
        });
    };

    const handleServiceSelect = (e) => {
        setCurrentServiceId(e.target.value);
    };

    const addService = () => {
        if (!currentServiceId || formData.services.includes(currentServiceId)) {
            return;
        }

        setFormData({
            ...formData,
            services: [...formData.services, currentServiceId],
        });

        // Initialize service options if not already
        if (!serviceOptions[currentServiceId]) {
            setServiceOptions({
                ...serviceOptions,
                [currentServiceId]: [],
            });
        }
    };

    const removeService = (serviceId) => {
        setFormData({
            ...formData,
            services: formData.services.filter(id => id !== serviceId),
        });

        // Remove service options as well
        const updatedOptions = { ...serviceOptions };
        delete updatedOptions[serviceId];
        setServiceOptions(updatedOptions);
    };

    // Add or update service option
    const handleServiceOption = (serviceId, optionData) => {
        // Check if this option already exists
        const currentOptions = serviceOptions[serviceId] || [];
        const existingIndex = currentOptions.findIndex(
            opt => opt.optionId === optionData.optionId
        );

        let updatedOptions = [...currentOptions];

        if (existingIndex >= 0) {
            // Update existing option
            updatedOptions[existingIndex] = optionData;
        } else {
            // Add new option
            updatedOptions.push(optionData);
        }

        setServiceOptions({
            ...serviceOptions,
            [serviceId]: updatedOptions,
        });
    };

    const removeServiceOption = (serviceId, optionId) => {
        const updatedOptions = serviceOptions[serviceId].filter(
            option => option.optionId !== optionId
        );

        setServiceOptions({
            ...serviceOptions,
            [serviceId]: updatedOptions,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Format provider data for submission
        const submitData = {
            ...formData,
            serviceOptions, // Include service options
        };

        onSave(submitData);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {provider ? 'Edit Provider' : 'Create New Provider'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Provider Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Title/Position *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Cleaning Specialist"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                Phone
                            </label>
                            <input
                                type="text"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                Provider Type *
                            </label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="person">Individual Person</option>
                                <option value="company">Company</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        {/* Location Info */}
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-medium text-gray-800 mb-2">Location</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="location.address" className="block text-sm font-medium text-gray-700 mb-1">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        id="location.address"
                                        name="location.address"
                                        value={formData.location.address}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="location.city" className="block text-sm font-medium text-gray-700 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        id="location.city"
                                        name="location.city"
                                        value={formData.location.city}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="location.zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                                        ZIP Code
                                    </label>
                                    <input
                                        type="text"
                                        id="location.zipCode"
                                        name="location.zipCode"
                                        value={formData.location.zipCode}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="location.country" className="block text-sm font-medium text-gray-700 mb-1">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        id="location.country"
                                        name="location.country"
                                        value={formData.location.country}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Services Section */}
                        <div className="md:col-span-2">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-medium text-gray-800">Services Offered</h3>
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Active</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="isVerified"
                                            checked={formData.isVerified}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Verified</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="isPopular"
                                            checked={formData.isPopular}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Popular</span>
                                    </label>
                                </div>
                            </div>

                            {/* Add Service */}
                            <div className="flex items-end space-x-2 mb-4">
                                <div className="flex-grow">
                                    <label htmlFor="serviceSelect" className="block text-sm font-medium text-gray-700 mb-1">
                                        Add Service
                                    </label>
                                    <select
                                        id="serviceSelect"
                                        value={currentServiceId}
                                        onChange={handleServiceSelect}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Select a service...</option>
                                        {services.map(service => (
                                            <option
                                                key={service._id}
                                                value={service._id}
                                                disabled={formData.services.includes(service._id)}
                                            >
                                                {service.name} ({service.type})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    onClick={addService}
                                    disabled={!currentServiceId || formData.services.includes(currentServiceId)}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed"
                                >
                                    <Plus size={18} className="inline mr-1" />
                                    Add
                                </button>
                            </div>

                            {/* Services List */}
                            {formData.services.length > 0 ? (
                                <div className="border rounded-md overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Service Name
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Custom Options
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {formData.services.map(serviceId => {
                                            const service = services.find(s => s._id === serviceId);
                                            if (!service) return null;

                                            return (
                                                <tr key={serviceId}>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {service.name}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {service.type}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-500">
                                                        {serviceOptions[serviceId]?.length || 0} custom options
                                                        {serviceOptions[serviceId]?.length > 0 && (
                                                            <button
                                                                type="button"
                                                                className="ml-2 text-indigo-600 hover:text-indigo-900"
                                                                onClick={() => {
                                                                    // Show modal or expand to edit options
                                                                    // For simplicity, just log for now
                                                                    console.log("Edit options for", service.name);
                                                                }}
                                                            >
                                                                <Edit size={14} className="inline" />
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeService(serviceId)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="py-4 text-center text-sm text-gray-500 border rounded-md">
                                    No services added yet
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                        >
                            {provider ? 'Update Provider' : 'Create Provider'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProviderModal;