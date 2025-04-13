import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  Clock,
  MapPin,
  Plus,
  Minus,
  Check,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import SearchBar from '../components/SearchBar';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [service, setService] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [paymentStatus, setPaymentStatus] = useState('pending'); // 'pending', 'processing', 'completed'
  const [formData, setFormData] = useState({
    name: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
  });

  // Get data from navigation state
  const serviceId = location.state?.serviceId;
  const initialSelectedOptions = location.state?.selectedOptions || {};
  const initialService = location.state?.service;

  useEffect(() => {
    if (!serviceId || !initialService) {
      navigate('/');
      return;
    }

    setIsLoading(true);
    setService(initialService);
    setSelectedOptions(initialSelectedOptions);
    setIsLoading(false);
  }, [serviceId, initialSelectedOptions, initialService, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Format card number with spaces every 4 digits
    if (name === 'cardNumber') {
      const formatted = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim();
      setFormData({ ...formData, [name]: formatted });
      return;
    }

    // Format expiry date as MM/YY
    if (name === 'expiryDate') {
      const formatted = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/, '$1/$2')
        .slice(0, 5);
      setFormData({ ...formData, [name]: formatted });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    // Simulate payment processing
    setPaymentStatus('processing');

    setTimeout(() => {
      setPaymentStatus('completed');
      // Redirect to home after payment completion
      setTimeout(() => {
        navigate('/', {
          state: {
            orderCompleted: true,
            orderId: Math.floor(Math.random() * 1000000),
          },
        });
      }, 2000);
    }, 1500);
  };

  const calculateTotal = () => {
    if (!service) return 0;

    return service.options.reduce((total, option) => {
      const quantity = selectedOptions[option.id] || 0;
      const price = parseInt(option.price.replace('€', '')) || 0;
      return total + price * quantity;
    }, 0);
  };

  const calculateTax = () => {
    return Math.round(calculateTotal() * 0.2); // 20% tax
  };

  const calculateGrandTotal = () => {
    return calculateTotal() + calculateTax();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="p-8 bg-white rounded-xl shadow-lg text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">Loading checkout details...</p>
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
                Checkout
              </h1>
            </div>

            {/* Service Summary */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">{service.description}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-green-600 font-bold">{service.type}</span>
              </div>
            </div>

            {/* Selected Items */}
            <div className="flex-grow overflow-y-auto pr-2">
              <div className="flex flex-col gap-4">
                {service.options.map((option) => {
                  const quantity = selectedOptions[option.id] || 0;
                  if (quantity === 0) return null;

                  return (
                    <div
                      key={option.id}
                      className="flex items-center justify-between border-b border-gray-200 pb-3"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center mr-3">
                          <span className="text-lg">{option.icon}</span>
                        </div>
                        <span className="text-gray-700">{option.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-4 font-medium">{option.price}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDecrement(option.id)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-6 text-center">{quantity}</span>
                          <button
                            onClick={() => handleIncrement(option.id)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Location Section */}
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h2 className="font-semibold text-gray-800 mb-3">
                  Service Location
                </h2>
                <div className="bg-gray-100 h-32 rounded-lg mb-3 relative">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <MapPin size={24} className="text-black" />
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin size={18} className="text-gray-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium">
                      123 Main Street, Apartment 4B
                    </p>
                    <p className="text-xs text-gray-500">New York, NY 10001</p>
                  </div>
                </div>
              </div>

              {/* Time Section */}
              <div className="mt-4 flex items-start space-x-2">
                <Clock size={18} className="text-gray-600 mt-1" />
                <div>
                  <p className="text-sm font-medium">
                    Scheduled for April 15, 2025
                  </p>
                  <p className="text-xs text-gray-500">
                    Between 9:00 AM - 12:00 PM
                  </p>
                </div>
              </div>

              {/* Terms Section */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. In
                  accumsan sit amet dui amore fringilla. Proin sit amet dapibus
                  nibh, non volutpat sem.
                </p>
              </div>
            </div>

            {/* Order Total */}
            <div className="mt-4 border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-lg font-bold">€{calculateTotal()}</span>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                {paymentStatus === 'pending'
                  ? 'Confirm Order'
                  : paymentStatus === 'processing'
                  ? 'Processing...'
                  : 'Order Confirmed!'}
              </button>
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

        <footer className="w-full p-4 md:p-8 bg-white text-center shadow-lg flex flex-col items-center">
          <Link
              to={`/cleaning/${serviceId}`}
              className="text-blue-600 flex items-center justify-center mt-[-20px] text-base md:text-xl font-semibold hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="mr-2" /> Back to Service
          </Link>
        </footer>
      </div>

    </div>
  );
};

export default CheckoutPage;
