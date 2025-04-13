import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import SearchBar from '../components/SearchBar';

const CleaningServicePage = () => {
  const { serviceId } = useParams();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [service, setService] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [view, setView] = useState('options'); // 'options' or 'request'

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Add this effect to check if all items are removed in preview mode
  useEffect(() => {
    // Only run this check when in 'request' view
    if (view === 'request') {
      // Check if any options are selected
      const hasSelectedItems = Object.values(selectedOptions).some(quantity => quantity > 0);

      // If no items are selected, redirect back to options view
      if (!hasSelectedItems) {
        setView('options');
      }
    }
  }, [selectedOptions, view]);

  useEffect(() => {
    setIsLoading(true);

    const fetchServiceData = async () => {
      try {
        // Get provider data from navigation state if available
        const provider = location.state?.provider;

        const mockService = {
          id: serviceId,
          name: provider?.name || 'Cleaning Service',
          description:
              provider?.description ||
              'Professional cleaning service with various options',
          type: 'DOMESTIC CLEANING',
          price: provider?.price || 'FREE',
          options: [
            {
              id: 1,
              name: 'Bathroom Cleaning',
              icon: '🛁',
              price: '€25',
              quantity: 0,
            },
            {
              id: 2,
              name: 'Kitchen Cleaning',
              icon: '🍳',
              price: '€30',
              quantity: 0,
            },
            {
              id: 3,
              name: 'Living Room',
              icon: '🛋️',
              price: '€20',
              quantity: 0,
            },
          ],
        };

        setService(mockService);

        // Initialize selected options
        const initialOptions = {};
        mockService.options.forEach((option) => {
          initialOptions[option.id] = 0;
        });
        setSelectedOptions(initialOptions);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching service data:', error);
        setIsLoading(false);
      }
    };

    fetchServiceData();
  }, [serviceId, location.state]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleIncrement = (optionId) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: (prev[optionId] || 0) + 1,
    }));
  };

  const handleDecrement = (optionId) => {
    if (selectedOptions[optionId] > 0) {
      setSelectedOptions((prev) => ({
        ...prev,
        [optionId]: prev[optionId] - 1,
      }));
    }
  };

  const handleRequestService = () => {
    const selectedItems = Object.entries(selectedOptions)
        .filter(([_, quantity]) => quantity > 0)
        .map(([id]) => parseInt(id));

    if (selectedItems.length === 0) {
      alert('Please select at least one cleaning option');
      return;
    }

    // Instead of navigating, switch to the request view
    setView('request');
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout', {
      state: {
        serviceId,
        selectedOptions,
        service,
      },
    });
  };

  const handleBackToOptions = () => {
    setView('options');
  };

  const calculateTotal = () => {
    if (!service) return 0;

    return service.options.reduce((total, option) => {
      const quantity = selectedOptions[option.id] || 0;
      const price = parseInt(option.price.replace('€', '')) || 0;
      return total + price * quantity;
    }, 0);
  };

  if (isLoading) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
          <div className="p-8 bg-white rounded-xl shadow-lg text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700">Loading service details...</p>
          </div>
        </div>
    );
  }

  if (!service) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
          <div className="p-8 bg-white rounded-xl shadow-lg text-center">
            <p className="text-gray-700">Service not found</p>
            <Link to="/" className="text-blue-600 mt-4 inline-block">
              Return to Home
            </Link>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex flex-col items-center justify-between">
        <div className="w-full bg-white flex flex-col">
          <div className="w-full p-3 bg-white shadow-lg flex justify-center items-center">
            {view === 'options' ? (
                <Link
                    to={`/service/${serviceId}`}
                    className="text-blue-600 flex items-center mr-4"
                >
                  <ArrowLeft className="mr-1" /> Back
                </Link>
            ) : (
                <button
                    onClick={handleBackToOptions}
                    className="text-blue-600 flex items-center mr-4"
                >
                  <ArrowLeft className="mr-1" /> Back to Options
                </button>
            )}
            <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg shadow-md"></div>
            <div className="w-3/4 py-2.5 text-center pl-12 pr-4 ml-8 mr-6">
              My very special address...
            </div>
            <button
                onClick={handleLogout}
                className="bg-blue-600 text-white px-4 py-2 md:px-8 md:py-3 rounded-xl shadow-md hover:shadow-lg transition-all text-sm md:text-base"
            >
              Logout
            </button>
          </div>

          <div className="w-full p-4 md:p-6 bg-white shadow-lg flex justify-center items-center px-4 md:px-12 sticky top-0 z-50">
            <SearchBar placeholder="Search services..." />
          </div>
        </div>

        <main className="flex-grow flex items-center justify-center w-full h-[600px] md:h-[800px]">
          <div className="relative w-[90vw] md:w-[80vw] max-w-6xl h-[400px] md:h-[600px] bg-white rounded-3xl shadow-2xl p-6">
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {view === 'options' ? service.name : 'Review Request'}
                </h1>
              </div>

              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">{service.description}</p>
                <div className="flex justify-between items-center mt-4">
                <span className="text-green-600 font-bold">
                  {service.price}
                </span>
                  <div className="w-6 h-6 flex items-center justify-center">
                    <span className="text-xl">❌</span>
                  </div>
                </div>
              </div>

              <div className="text-center mb-4">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  {service.type}
                </h2>
              </div>

              <div className="flex-grow overflow-y-auto pr-2">
                <div className="flex flex-col gap-6">
                  {view === 'options'
                      ? service.options.map((option) => (
                          <div
                              key={option.id}
                              className="flex items-center justify-between border-b border-gray-200 pb-4"
                          >
                            <div className="flex items-center">
                              <div className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center mr-4">
                                <span className="text-xl">{option.icon}</span>
                              </div>
                              <span className="text-lg text-gray-700">
                            {option.name}
                          </span>
                            </div>

                            <div className="flex items-center">
                          <span className="mr-4 text-lg font-medium">
                            {option.price}
                          </span>
                              <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleDecrement(option.id)}
                                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                                >
                                  <Minus size={18} />
                                </button>
                                <span className="w-6 text-center">
                              {selectedOptions[option.id] || 0}
                            </span>
                                <button
                                    onClick={() => handleIncrement(option.id)}
                                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                                >
                                  <Plus size={18} />
                                </button>
                              </div>
                            </div>
                          </div>
                      ))
                      : // View for the request summary
                      service.options.map((option) => {
                        const quantity = selectedOptions[option.id] || 0;
                        if (quantity === 0) return null;

                        return (
                            <div
                                key={option.id}
                                className="flex items-center justify-between border-b border-gray-200 pb-4"
                            >
                              <div className="flex items-center">
                                <div className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center mr-4">
                                  <span className="text-xl">{option.icon}</span>
                                </div>
                                <span className="text-lg text-gray-700">
                              {option.name}
                            </span>
                              </div>

                              <div className="flex items-center">
                            <span className="mr-4 text-lg font-medium">
                              {option.price}
                            </span>
                                <div className="flex items-center gap-2">
                                  <button
                                      onClick={() => handleDecrement(option.id)}
                                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                                  >
                                    <Minus size={18} />
                                  </button>
                                  <span className="w-6 text-center">
                                {quantity}
                              </span>
                                  <button
                                      onClick={() => handleIncrement(option.id)}
                                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                                  >
                                    <Plus size={18} />
                                  </button>
                                </div>
                              </div>
                            </div>
                        );
                      })}
                </div>
              </div>

              <div className="mt-6">
                {view === 'request' && (
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-semibold">Total:</span>
                      <span className="text-xl font-bold">€{calculateTotal()}</span>
                    </div>
                )}

                {view === 'options' ? (
                    <button
                        onClick={handleRequestService}
                        className={`w-full py-3 rounded-lg font-medium transition-colors ${
                            Object.values(selectedOptions).some((qty) => qty > 0)
                                ? 'bg-black text-white hover:bg-gray-800'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={
                          !Object.values(selectedOptions).some((qty) => qty > 0)
                        }
                    >
                      Review Request
                    </button>
                ) : (
                    <button
                        onClick={handleProceedToCheckout}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <ShoppingCart className="mr-2" /> Proceed to Checkout
                    </button>
                )}
              </div>
            </div>
          </div>
        </main>

        <div className="relative w-full">
          <div className="relative top left-0 w-full h-[100px] overflow-hidden z-10">
            <svg
                className="w-full h-full"
                viewBox="0 0 1440 320"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
            >
              <path
                  fill="white"
                  d="M0,224 C480,-40 960,-40 1440,224 L1440,320 L0,320 Z"
              />
            </svg>
          </div>

          <footer className="w-full p-4 md:p-8 bg-white text-center shadow-lg flex flex-col items-center relative z-20 mt-[-30px] rounded-t-[30px]">
            <Link
                to="/"
                className="text-blue-600 flex items-center justify-center text-base md:text-xl font-semibold hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="mr-2" /> Back to Home
            </Link>
          </footer>
        </div>
      </div>
  );
};

export default CleaningServicePage;