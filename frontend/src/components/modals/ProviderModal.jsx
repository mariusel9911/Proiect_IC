// ProviderModal.jsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ProviderModal = ({ provider, services, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    email: '',
    phone: '',
    type: 'person',
    services: [],
    serviceOptions: {},
    location: {
      address: '',
      city: '',
      zipCode: '',
      country: '',
    },
    availability: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00' },
      { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
      { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
      { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
      { day: 'Friday', startTime: '09:00', endTime: '17:00' },
    ],
    isActive: true,
    isVerified: false,
    isPopular: false,
  });

  useEffect(() => {
    if (provider) {
      const serviceOptions = {};
      const serviceIds = [];

      provider.serviceOfferings?.forEach((offering) => {
        const serviceId =
          typeof offering.service === 'object'
            ? offering.service._id
            : offering.service;
        serviceIds.push(serviceId);

        if (offering.options && offering.options.length > 0) {
          serviceOptions[serviceId] = offering.options.map((opt) => ({
            optionId: opt.optionId,
            name: opt.name,
            price: opt.price,
            description: opt.description,
          }));
        } else {
          const service = services.find((s) => s._id === serviceId);
          if (service) {
            serviceOptions[serviceId] = service.options.map((option) => ({
              optionId: option._id,
              name: option.name,
              price: parseFloat(option.price.replace('€', '')) || 0,
              description: option.description,
            }));
          }
        }
      });

      setFormData({
        ...provider,
        services: serviceIds,
        serviceOptions: serviceOptions,
      });
    }
  }, [provider, services]);

  const handleServiceSelection = (serviceId) => {
    const updatedServices = formData.services.includes(serviceId)
      ? formData.services.filter((id) => id !== serviceId)
      : [...formData.services, serviceId];

    const updatedServiceOptions = { ...formData.serviceOptions };

    if (!formData.services.includes(serviceId)) {
      const service = services.find((s) => s._id === serviceId);
      if (service && !updatedServiceOptions[serviceId]) {
        updatedServiceOptions[serviceId] = service.options.map((option) => ({
          optionId: option._id,
          name: option.name,
          price: parseFloat(option.price.replace('€', '')) || 0,
          description: option.description,
        }));
      }
    } else {
      delete updatedServiceOptions[serviceId];
    }

    setFormData((prev) => ({
      ...prev,
      services: updatedServices,
      serviceOptions: updatedServiceOptions,
    }));
  };

  const handleOptionPriceChange = (serviceId, optionId, newPrice) => {
    setFormData((prev) => {
      const updatedOptions = { ...prev.serviceOptions };

      if (!updatedOptions[serviceId]) {
        const service = services.find((s) => s._id === serviceId);
        if (service) {
          updatedOptions[serviceId] = service.options.map((option) => ({
            optionId: option._id,
            name: option.name,
            price: parseFloat(option.price.replace('€', '')) || 0,
            description: option.description,
          }));
        }
      }

      updatedOptions[serviceId] = updatedOptions[serviceId].map((option) =>
        option.optionId === optionId
          ? { ...option, price: parseFloat(newPrice) || 0 }
          : option
      );

      return {
        ...prev,
        serviceOptions: updatedOptions,
      };
    });
  };

  // Rest of the code remains the same as in the second version
  const handleAvailabilityChange = (index, field, value) => {
    const updatedAvailability = [...formData.availability];
    updatedAvailability[index] = {
      ...updatedAvailability[index],
      [field]: value,
    };
    setFormData({ ...formData, availability: updatedAvailability });
  };

  const handleLocationChange = (field, value) => {
    setFormData({
      ...formData,
      location: {
        ...formData.location,
        [field]: value,
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-semibold">
            {provider ? 'Edit Provider' : 'Add New Provider'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full border rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full border rounded-md px-3 py-2"
                placeholder="e.g., Professional Cleaner"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full border rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full border rounded-md px-3 py-2"
                required
              >
                <option value="person">Individual</option>
                <option value="company">Company</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border rounded-md px-3 py-2"
              rows="3"
              required
            />
          </div>

          {/* Location */}
          <div>
            <h3 className="text-lg font-medium mb-3">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) =>
                    handleLocationChange('address', e.target.value)
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.location.city}
                  onChange={(e) => handleLocationChange('city', e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.location.zipCode}
                  onChange={(e) =>
                    handleLocationChange('zipCode', e.target.value)
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.location.country}
                  onChange={(e) =>
                    handleLocationChange('country', e.target.value)
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Services Selection with Custom Pricing */}
          <div>
            <h3 className="text-lg font-medium mb-3">Services Offered</h3>
            <div className="space-y-4">
              {services?.map((service) => (
                <div key={service._id} className="border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`service-${service._id}`}
                      checked={formData.services.includes(service._id)}
                      onChange={() => handleServiceSelection(service._id)}
                      className="mr-2"
                    />
                    <label
                      htmlFor={`service-${service._id}`}
                      className="font-medium"
                    >
                      {service.name}
                    </label>
                  </div>

                  {formData.services.includes(service._id) &&
                    service.options && (
                      <div className="ml-6 mt-2">
                        <h4 className="font-medium mb-2">
                          Custom Prices for Options:
                        </h4>
                        <div className="space-y-2">
                          {service.options.map((option) => {
                            const customOption = formData.serviceOptions[
                              service._id
                            ]?.find((o) => o.optionId === option._id);
                            return (
                              <div
                                key={option._id}
                                className="flex items-center gap-4"
                              >
                                <span className="w-8">{option.icon}</span>
                                <span className="w-40">{option.name}</span>
                                <span className="text-gray-500">
                                  Default: {option.price}
                                </span>
                                <div className="flex items-center">
                                  <span>€</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                      customOption?.price ??
                                      parseFloat(
                                        option.price.replace('€', '')
                                      ) ??
                                      0
                                    }
                                    onChange={(e) =>
                                      handleOptionPriceChange(
                                        service._id,
                                        option._id,
                                        e.target.value
                                      )
                                    }
                                    className="w-24 border rounded-md px-2 py-1 ml-1"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <h3 className="text-lg font-medium mb-3">Availability</h3>
            <div className="space-y-2">
              {formData.availability.map((slot, index) => (
                <div key={slot.day} className="flex items-center gap-4">
                  <span className="w-24">{slot.day}</span>
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) =>
                      handleAvailabilityChange(
                        index,
                        'startTime',
                        e.target.value
                      )
                    }
                    className="border rounded-md px-2 py-1"
                  />
                  <span>to</span>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) =>
                      handleAvailabilityChange(index, 'endTime', e.target.value)
                    }
                    className="border rounded-md px-2 py-1"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Status Flags */}
          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="mr-2"
              />
              Active
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isVerified}
                onChange={(e) =>
                  setFormData({ ...formData, isVerified: e.target.checked })
                }
                className="mr-2"
              />
              Verified
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) =>
                  setFormData({ ...formData, isPopular: e.target.checked })
                }
                className="mr-2"
              />
              Popular
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
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
