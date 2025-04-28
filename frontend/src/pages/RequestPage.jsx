import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useServiceStore } from '../store/serviceStore';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const RequestPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { fetchServiceById } = useServiceStore();
  const [isLoading, setIsLoading] = useState(true);
  const [service, setService] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [requestStatus, setRequestStatus] = useState('pending');

  const serviceId = location.state?.serviceId;
  const initialSelectedOptions = location.state?.selectedOptions || {};
  const initialService = location.state?.service;
  const provider = location.state?.provider;

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!serviceId) {
      navigate('/');
      return;
    }

    setIsLoading(true);

    // If we already have the service data from the location state, use it
    if (initialService) {
      console.log('Using service from location state:', initialService);
      setService(initialService);
      setSelectedOptions(initialSelectedOptions);
      setIsLoading(false);
      return;
    }

    // Otherwise, fetch from the API
    const fetchServiceData = async () => {
      try {
        console.log('Fetching service data from API for ID:', serviceId);
        const serviceData = await fetchServiceById(serviceId);

        if (!serviceData) {
          throw new Error('Service not found');
        }

        console.log('Service data fetched:', serviceData);

        setService(serviceData);
        setSelectedOptions(initialSelectedOptions);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching service data:', error);
        toast.error('Failed to load service data');
        setIsLoading(false);
      }
    };

    fetchServiceData();
  }, [
    serviceId,
    initialSelectedOptions,
    initialService,
    navigate,
    fetchServiceById,
  ]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleIncrement = (optionId) => {
    const id = String(optionId);
    setSelectedOptions((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleDecrement = (optionId) => {
    const id = String(optionId);
    if (selectedOptions[id] > 0) {
      setSelectedOptions((prev) => ({
        ...prev,
        [id]: prev[id] - 1,
      }));
    }
  };

  const handleConfirmRequest = async () => {
    try {
      setRequestStatus('processing');

      // Here you would typically send the request to your backend
      // For example:
      /*
            const response = await axios.post(`${API_URL}/orders`, {
                serviceId,
                providerId: provider?._id,
                selectedOptions: Object.entries(selectedOptions).map(([id, quantity]) => ({
                    optionId: id,
                    quantity
                })),
                totalAmount: calculateTotal()
            }, { withCredentials: true });
            
            if (response.data.success) {
                setRequestStatus('confirmed');
                toast.success('Request submitted successfully!');
                setTimeout(() => {
                    navigate('/orders', {
                        state: { newOrder: response.data.order }
                    });
                }, 2000);
            }
            */

      // For now, we'll just simulate a successful request
      setRequestStatus('confirmed');
      toast.success('Request submitted successfully!');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request');
      setRequestStatus('pending');
    }
  };

  // Format price with € symbol
  const formatPrice = (price) => {
    if (!price && price !== 0) return '€0';

    if (typeof price === 'string' && price.includes('€')) {
      return price;
    }

    return `€${price}`;
  };

  const calculateTotal = () => {
    if (!service) return 0;

    return (service.options || []).reduce((total, option) => {
      const optionId = option._id || option.id;
      const quantity = selectedOptions[optionId] || 0;

      // Parse price regardless of format
      let price = 0;
      if (option.price) {
        // Remove € symbol and any non-numeric characters except decimal point
        const priceString = option.price.toString().replace(/[^0-9.]/g, '');
        price = parseFloat(priceString) || 0;
      }

      return total + price * quantity;
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner text="Loading request details..." />
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

  // Get service name from provider if available, otherwise from service
  const serviceName = provider?.name || service.name;
  const serviceDescription = provider?.description || service.description;

  // Get options from provider if available, otherwise from service
  const options = provider?.options || service.options || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex flex-col items-center justify-between">
      <div className="w-full bg-white flex flex-col">
        <div className="w-full p-3 bg-white shadow-lg flex justify-center items-center">
          <Link
            to={`/cleaning/${serviceId}`}
            className="text-blue-600 flex items-center mr-4"
          >
            <ArrowLeft className="mr-1" /> Back
          </Link>
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
                Request
              </h1>
            </div>

            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">{serviceDescription}</p>
              <div className="flex justify-between items-center mt-4">
                <span className="text-green-600 font-bold">
                  {service.price || 'FREE'}
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
                {service.type}
              </h2>
            </div>

            <div className="flex-grow overflow-y-auto pr-2">
              <div className="flex flex-col gap-6">
                {options.map((option) => {
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
                          {formatPrice(option.price)}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDecrement(optionId)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                          >
                            <Minus size={18} />
                          </button>
                          <span className="w-6 text-center">{quantity}</span>
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
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-semibold">Total:</span>
                <span className="text-xl font-bold">€{calculateTotal()}</span>
              </div>

              {requestStatus === 'pending' ? (
                <button
                  onClick={handleConfirmRequest}
                  className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Confirm Request
                </button>
              ) : requestStatus === 'processing' ? (
                <div className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium text-center flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : requestStatus === 'confirmed' ? (
                <div className="w-full bg-green-600 text-white py-3 rounded-lg font-medium text-center">
                  Request Confirmed!
                </div>
              ) : (
                <div className="w-full bg-red-600 text-white py-3 rounded-lg font-medium text-center">
                  Request Cancelled
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <div className="relative w-full">
        <div className="absolute top-[-70px] left-0 w-full h-[100px] overflow-hidden z-10">
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

        <footer className="w-full p-4 md:p-8 bg-white text-center shadow-lg flex flex-col items-center relative z-20 mt-[60px] rounded-t-[30px]">
          <Link
            to={`/service/${serviceId}`}
            className="text-blue-600 flex items-center justify-center text-base md:text-xl font-semibold hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="mr-2" /> Back to Service
          </Link>
        </footer>
      </div>
    </div>
  );
};

export default RequestPage;
