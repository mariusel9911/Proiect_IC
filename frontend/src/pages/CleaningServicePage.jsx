import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useServiceStore } from '../store/serviceStore';
import { useCheckoutStore } from '../store/checkoutStore';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const CleaningServicePage = () => {
  const { serviceId } = useParams();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const {
    currentService,
    fetchServiceById,
    isLoading: serviceLoading,
    error: serviceError,
  } = useServiceStore();
  const {
    selectedOptions,
    updateSelectedOption,
    setSelectedService,
    hasSelectedOptions,
  } = useCheckoutStore();

  const navigate = useNavigate();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [view, setView] = useState('options'); // 'options' or 'request'
  const [isLoading, setIsLoading] = useState(true);

  // Get provider from location state
  const provider = location.state?.provider;

  // State to track which service's options to display
  const [serviceOptions, setServiceOptions] = useState([]);

  // Debug location state
  useEffect(() => {
    console.log('Location state:', location.state);
    console.log('Provider from state:', provider);
  }, [location.state, provider]);

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
    if (view === 'request' && !hasSelectedOptions()) {
      setView('options');
    }
  }, [selectedOptions, view, hasSelectedOptions]);

  // Fetch service data and set up options
  useEffect(() => {
    setIsLoading(true);

    const processService = (service) => {
      if (!service) {
        console.error('No service data available');
        setIsLoading(false);
        return;
      }

      console.log('Processing service:', service);
      setSelectedService(service);

      // Process options
      let options;
      if (provider) {
        // If provider has specific options
        if (provider.options && Array.isArray(provider.options)) {
          options = provider.options;
          console.log("Using provider's specific options:", options);
        }
        // If provider has serviceOfferings with options for this service
        else if (provider.serviceOfferings) {
          const serviceOffering = provider.serviceOfferings.find(
            (so) => so.service === serviceId || so.service._id === serviceId
          );

          if (serviceOffering && serviceOffering.options) {
            options = serviceOffering.options.map((option) => ({
              _id: option.optionId,
              id: option.optionId,
              name: option.name,
              price: `€${option.price}`,
              icon: option.icon || '📦', // Default icon if not provided
              description: option.description,
            }));
            console.log('Using options from serviceOfferings:', options);
          }
        }
      }

      // Fallback to service options if no provider options available
      if (!options && service.options) {
        options = service.options;
        console.log('Using default service options:', options);
      }

      if (options) {
        setServiceOptions(options);
      } else {
        console.warn('No options found for this service');
        setServiceOptions([]);
      }

      setIsLoading(false);
    };

    // If the provider passed service info, use that
    if (provider && provider.service) {
      console.log('Using service from provider:', provider.service);
      processService(provider.service);
    } else {
      // Otherwise fetch from API
      console.log('Fetching service from API:', serviceId);
      fetchServiceById(serviceId)
        .then((service) => {
          if (service) {
            processService(service);
          } else {
            console.error('Failed to fetch service');
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error('Error fetching service:', err);
          setIsLoading(false);
        });
    }
  }, [serviceId, provider, fetchServiceById, setSelectedService]);

  // Handle errors
  useEffect(() => {
    if (serviceError) {
      toast.error(`Error: ${serviceError}`);
    }
  }, [serviceError]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleIncrement = (optionId) => {
    // Make sure optionId is a string
    const id = String(optionId);
    console.log('Incrementing option:', id);
    updateSelectedOption(id, (selectedOptions[id] || 0) + 1);
  };

  const handleDecrement = (optionId) => {
    // Make sure optionId is a string
    const id = String(optionId);
    console.log('Decrementing option:', id);
    if (selectedOptions[id] > 0) {
      updateSelectedOption(id, selectedOptions[id] - 1);
    }
  };

  const handleRequestService = () => {
    // Check if any options are selected
    if (!hasSelectedOptions()) {
      toast.error('Please select at least one cleaning option');
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
        service: currentService || provider?.service,
        provider: provider, // Pass provider information to checkout
      },
    });
  };

  const handleBackToOptions = () => {
    setView('options');
  };

  const calculateTotal = () => {
    if (!serviceOptions || serviceOptions.length === 0) return 0;

    return serviceOptions.reduce((total, option) => {
      const optionId = option._id || option.id;
      const quantity = selectedOptions[optionId] || 0;
      const price = parseInt(option.price?.replace('€', '')) || 0;
      return total + price * quantity;
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner text="Loading service details..." />
      </div>
    );
  }

  // Get service data either from provider or current service
  const service = provider?.service || currentService;

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Service Not Found
          </h2>
          <p className="mb-4">
            There was a problem loading the service information.
          </p>
          <Link to="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Use provider-specific details or fallback to service details
  const serviceName = provider?.name || service.name;
  const serviceDescription = provider?.description || service.description;
  const serviceType = service.type;

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
                {view === 'options' ? serviceName : 'Review Request'}
              </h1>
            </div>

            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">{serviceDescription}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-green-600 font-bold">
                  {provider?.price || service.price || 'FREE'}
                </span>
                {provider && provider.rating && (
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">
                      Provider Rating:
                    </span>
                    <div className="flex items-center text-amber-500">
                      <span className="text-sm font-medium mr-1">★</span>
                      <span className="text-sm text-gray-700">
                        {provider.rating || 'New'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                {serviceType}
              </h2>
            </div>

            <div className="flex-grow overflow-y-auto pr-2">
              <div className="flex flex-col gap-6">
                {view === 'options'
                  ? (serviceOptions || []).map((option) => {
                      const optionId = option._id || option.id;
                      return (
                        <div
                          key={optionId}
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
                                onClick={() => handleDecrement(optionId)}
                                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                              >
                                <Minus size={18} />
                              </button>
                              <span className="w-6 text-center">
                                {selectedOptions[optionId] || 0}
                              </span>
                              <button
                                onClick={() => handleIncrement(optionId)}
                                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                              >
                                <Plus size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  : // View for the request summary
                    (serviceOptions || []).map((option) => {
                      const optionId = option._id || option.id;
                      const quantity = selectedOptions[optionId] || 0;
                      if (quantity === 0) return null;

                      return (
                        <div
                          key={optionId}
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
                                onClick={() => handleDecrement(optionId)}
                                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                              >
                                <Minus size={18} />
                              </button>
                              <span className="w-6 text-center">
                                {quantity}
                              </span>
                              <button
                                onClick={() => handleIncrement(optionId)}
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
                    hasSelectedOptions()
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!hasSelectedOptions()}
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
