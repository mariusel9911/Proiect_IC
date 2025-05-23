import { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2 } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const ServiceModal = ({ service, onClose, onSave }) => {
  const { darkMode } = useDarkMode();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    price: 'FREE',
    options: [],
    isActive: true,
  });

  const [newOption, setNewOption] = useState({
    name: '',
    icon: '🧹',
    price: '',
    description: '',
  });

  // Available icons for services
  const icons = [
    '🧹', '🛁', '🧼', '🧽', '🚿', '🪣', '🧴', '🧺',
    '🧷', '✨', '🧻', '🚽', '🛋️', '🪠', '🪒', '🧯',
    '🛒', '📦', '🗑️', '🌱',
  ];

  // Populate form with service data when editing
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        type: service.type || '',
        price: service.price || 'FREE',
        options: service.options || [],
        isActive: service.isActive !== undefined ? service.isActive : true,
      });
    }
  }, [service]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleOptionChange = (e) => {
    const { name, value } = e.target;
    setNewOption({
      ...newOption,
      [name]:
          name === 'price'
              ? value.startsWith('€')
                  ? value
                  : `€${value}`
              : value,
    });
  };

  const addOption = () => {
    // Validate option
    if (!newOption.name || !newOption.price || !newOption.icon) {
      return;
    }

    // Format price if needed
    const formattedPrice = newOption.price.startsWith('€')
        ? newOption.price
        : `€${newOption.price}`;

    // Add to options array
    setFormData({
      ...formData,
      options: [
        ...formData.options,
        {
          ...newOption,
          price: formattedPrice,
          _id: `temp-${Date.now()}`, // Temp ID for new options
        },
      ],
    });

    // Clear the new option form
    setNewOption({
      name: '',
      icon: '🧹',
      price: '',
      description: '',
    });
  };

  const removeOption = (index) => {
    const updatedOptions = [...formData.options];
    updatedOptions.splice(index, 1);
    setFormData({
      ...formData,
      options: updatedOptions,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form data
    if (!formData.name || !formData.description || !formData.type) {
      alert('Please fill in all required fields');
      return;
    }

    // Ensure options is an array and has required fields
    const validatedOptions = formData.options.map((option) => ({
      name: option.name || '',
      icon: option.icon || '',
      price: option.price || '€0',
      description: option.description || '',
    }));

    const dataToSend = {
      ...formData,
      options: validatedOptions,
    };

    try {
      await onSave(dataToSend);
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };

  return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {service ? 'Edit Service' : 'Create New Service'}
            </h2>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Service Name *
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
                <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Service Type *
                </label>
                <input
                    type="text"
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    placeholder="e.g. DOMESTIC CLEANING"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Description *
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                    Service Options
                  </h3>
                  <div className="flex items-center">
                    <label className="mr-2 flex items-center">
                      <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleChange}
                          className="h-4 w-4 text-purple-600 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                  </div>
                </div>

                {/* Options list */}
                <div className="mt-4 border dark:border-gray-700 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Icon
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {formData.options.length === 0 ? (
                        <tr>
                          <td
                              colSpan="5"
                              className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                          >
                            No options added yet
                          </td>
                        </tr>
                    ) : (
                        formData.options.map((option, index) => (
                            <tr key={option._id || index}>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {option.name}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                <span className="text-xl">{option.icon}</span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {option.price}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                                {option.description}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    type="button"
                                    onClick={() => removeOption(index)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                        ))
                    )}
                    {/* Add new option row */}
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <td className="px-4 py-2">
                        <input
                            type="text"
                            name="name"
                            value={newOption.name}
                            onChange={handleOptionChange}
                            placeholder="Option name"
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                            name="icon"
                            value={newOption.icon}
                            onChange={handleOptionChange}
                            className="w-full px-2 py-1 text-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded"
                        >
                          {icons.map((icon) => (
                              <option key={icon} value={icon}>
                                {icon}
                              </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                            type="text"
                            name="price"
                            value={newOption.price}
                            onChange={handleOptionChange}
                            placeholder="€25"
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                            type="text"
                            name="description"
                            value={newOption.description}
                            onChange={handleOptionChange}
                            placeholder="Description"
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded"
                        />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right">
                        <button
                            type="button"
                            onClick={addOption}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
                        >
                          <Plus size={16} className="mr-1" />
                          Add
                        </button>
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
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
                {service ? 'Update Service' : 'Create Service'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default ServiceModal;