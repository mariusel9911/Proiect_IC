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
  Loader,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCheckoutStore } from '../store/checkoutStore';
import { useOrderStore } from '../store/orderStore';
import SearchBar from '../components/SearchBar';
import Input from '../components/Input';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    selectedService,
    selectedOptions,
    calculateTotal,
    calculateTax,
    calculateGrandTotal,
    setAddress,
    address,
    setSchedule,
    updateCardDetails,
    cardDetails,
    validateCardDetails,
    clearCheckout,
    setSelectedService,
    prepareOrderData,
  } = useCheckoutStore();
  const {
    createOrder,
    isLoading: orderLoading,
    error: orderError,
  } = useOrderStore();

  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // 'pending', 'processing', 'completed'
  const [scheduledDate, setScheduledDate] = useState('');
  const [timeSlot, setTimeSlot] = useState({ start: '09:00', end: '12:00' });
  const [showErrors, setShowErrors] = useState(false);

  // Get data from navigation state
  const serviceId = location.state?.serviceId;
  const initialService = location.state?.service;

  useEffect(() => {
    if (!serviceId && !selectedService) {
      navigate('/');
      return;
    }

    // If no selected service in store, but we have it in location state
    if (!selectedService && initialService) {
      // Set it in the checkout store
      setSelectedService(initialService);
    }

    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduledDate(tomorrow.toISOString().split('T')[0]);

    setIsLoading(false);
  }, [
    serviceId,
    selectedService,
    initialService,
    navigate,
    setSelectedService,
  ]);

  // Handle errors
  useEffect(() => {
    if (orderError) {
      toast.error(`Error: ${orderError}`);
      setPaymentStatus('pending');
    }
  }, [orderError]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Address fields
    if (['street', 'city', 'zipCode', 'country'].includes(name)) {
      setAddress({ ...address, [name]: value });
      return;
    }

    // Card fields
    if (name === 'cardNumber') {
      // Format card number with spaces every 4 digits
      const formatted = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim();
      updateCardDetails({ [name]: formatted });
      return;
    }

    if (name === 'expiryDate') {
      // Format expiry date as MM/YY
      const formatted = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/, '$1/$2')
        .slice(0, 5);
      updateCardDetails({ [name]: formatted });
      return;
    }

    if (['name', 'cvv'].includes(name)) {
      updateCardDetails({ [name]: value });
      return;
    }

    // Date and time
    if (name === 'scheduledDate') {
      setScheduledDate(value);
      return;
    }

    if (name === 'timeSlotStart' || name === 'timeSlotEnd') {
      const newTimeSlot = {
        ...timeSlot,
        [name === 'timeSlotStart' ? 'start' : 'end']: value,
      };
      setTimeSlot(newTimeSlot);
      return;
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Validate form
    setShowErrors(true);

    // Validate card details
    if (!validateCardDetails()) {
      toast.error('Please complete all payment fields correctly');
      return;
    }

    // Validate address
    if (
      !address.street ||
      !address.city ||
      !address.zipCode ||
      !address.country
    ) {
      toast.error('Please complete all address fields');
      return;
    }

    // Set scheduled date and time in checkout store
    setSchedule(scheduledDate, timeSlot);

    // Start payment processing
    setPaymentStatus('processing');

    try {
      // Use the prepareOrderData function to get properly formatted data
      const orderData = prepareOrderData();

      if (!orderData) {
        throw new Error('Failed to prepare order data');
      }

      if (
        !orderData.selectedOptions ||
        orderData.selectedOptions.length === 0
      ) {
        toast.error('Please select at least one service option');
        setPaymentStatus('pending');
        return;
      }

      // Debug log - remove in production
      console.log('Submitting order data:', JSON.stringify(orderData, null, 2));

      // Create order in backend
      const order = await createOrder(orderData);

      if (order) {
        // Set payment status
        setPaymentStatus('completed');

        // Show success message
        toast.success('Order placed successfully!');

        // Clear checkout data
        clearCheckout();

        // Redirect to home after payment completion
        setTimeout(() => {
          navigate('/', {
            state: {
              orderCompleted: true,
              orderId: order._id,
            },
          });
        }, 2000);
      }
    } catch (error) {
      // Revert to pending state if error
      setPaymentStatus('pending');
      console.error('Order creation error:', error);
      toast.error(error.message || 'Failed to create order. Please try again.');
    }
  };

  if (isLoading || !selectedService) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner text="Loading checkout details..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex flex-col items-center justify-between">
      <div className="w-full bg-white flex flex-col">
        <div className="w-full p-3 bg-white shadow-lg flex justify-center items-center">
          <Link
            to={`/cleaning/${
              serviceId || selectedService._id || selectedService.id
            }`}
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

      <main className="flex-grow w-full md:py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Checkout
              </h1>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* Left Column */}
              <div className="space-y-6">
                {/* Service Summary */}
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-xl font-semibold mb-2">
                    {selectedService.name}
                  </h2>
                  <p className="text-gray-600">{selectedService.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-green-600 font-bold">
                      {selectedService.type}
                    </span>
                  </div>
                </div>

                {/* Selected Items */}
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-lg font-semibold mb-4">
                    Selected Services
                  </h2>
                  <div className="space-y-4">
                    {(selectedService.options || []).map((option) => {
                      const optionId = option._id || option.id;
                      const quantity = selectedOptions[optionId] || 0;
                      if (quantity === 0) return null;

                      return (
                        <div
                          key={optionId}
                          className="flex items-center justify-between border-b border-gray-100 pb-3"
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center mr-3">
                              <span className="text-lg">{option.icon}</span>
                            </div>
                            <span className="text-gray-700">{option.name}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-4 font-medium">
                              {option.price}
                            </span>
                            <span className="bg-gray-100 px-3 py-1 rounded-full">
                              x{quantity}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Schedule Section */}
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <Clock size={20} className="mr-2 text-blue-600" />
                    Schedule Service
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="w-full">
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        name="scheduledDate"
                        value={scheduledDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]} // Can't select past dates
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Start Time
                        </label>
                        <select
                          name="timeSlotStart"
                          value={timeSlot.start}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        >
                          <option value="08:00">8:00 AM</option>
                          <option value="09:00">9:00 AM</option>
                          <option value="10:00">10:00 AM</option>
                          <option value="11:00">11:00 AM</option>
                          <option value="12:00">12:00 PM</option>
                          <option value="13:00">1:00 PM</option>
                          <option value="14:00">2:00 PM</option>
                          <option value="15:00">3:00 PM</option>
                          <option value="16:00">4:00 PM</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          End Time
                        </label>
                        <select
                          name="timeSlotEnd"
                          value={timeSlot.end}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        >
                          <option value="10:00">10:00 AM</option>
                          <option value="11:00">11:00 AM</option>
                          <option value="12:00">12:00 PM</option>
                          <option value="13:00">1:00 PM</option>
                          <option value="14:00">2:00 PM</option>
                          <option value="15:00">3:00 PM</option>
                          <option value="16:00">4:00 PM</option>
                          <option value="17:00">5:00 PM</option>
                          <option value="18:00">6:00 PM</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Location Section */}
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <MapPin size={20} className="mr-2 text-blue-600" />
                    Service Location
                  </h2>

                  <div className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Street Address"
                      name="street"
                      value={address.street}
                      onChange={handleInputChange}
                      error={
                        showErrors && !address.street
                          ? 'Address is required'
                          : null
                      }
                      required
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="text"
                        placeholder="City"
                        name="city"
                        value={address.city}
                        onChange={handleInputChange}
                        error={
                          showErrors && !address.city
                            ? 'City is required'
                            : null
                        }
                        required
                      />

                      <Input
                        type="text"
                        placeholder="Zip Code"
                        name="zipCode"
                        value={address.zipCode}
                        onChange={handleInputChange}
                        error={
                          showErrors && !address.zipCode
                            ? 'Zip code is required'
                            : null
                        }
                        required
                      />
                    </div>

                    <Input
                      type="text"
                      placeholder="Country"
                      name="country"
                      value={address.country}
                      onChange={handleInputChange}
                      error={
                        showErrors && !address.country
                          ? 'Country is required'
                          : null
                      }
                      required
                    />
                  </div>
                </div>

                {/* Payment Information */}
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <CreditCard size={20} className="mr-2 text-blue-600" />
                    Payment Details
                  </h2>

                  <div className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Name on Card"
                      name="name"
                      value={cardDetails.name}
                      onChange={handleInputChange}
                      error={
                        showErrors && !cardDetails.name
                          ? 'Name is required'
                          : null
                      }
                      required
                    />

                    <Input
                      type="text"
                      placeholder="Card Number"
                      name="cardNumber"
                      value={cardDetails.cardNumber}
                      onChange={handleInputChange}
                      error={
                        showErrors &&
                        (!cardDetails.cardNumber ||
                          cardDetails.cardNumber.replace(/\s/g, '').length !==
                            16)
                          ? 'Valid card number is required'
                          : null
                      }
                      required
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="text"
                        placeholder="MM/YY"
                        name="expiryDate"
                        value={cardDetails.expiryDate}
                        onChange={handleInputChange}
                        error={
                          showErrors &&
                          (!cardDetails.expiryDate ||
                            !/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate))
                            ? 'Valid expiry date required'
                            : null
                        }
                        required
                      />

                      <Input
                        type="text"
                        placeholder="CVV"
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleInputChange}
                        error={
                          showErrors &&
                          (!cardDetails.cvv ||
                            !/^\d{3,4}$/.test(cardDetails.cvv))
                            ? 'Valid CVV required'
                            : null
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>€{calculateTotal()}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (20%):</span>
                      <span>€{calculateTax()}</span>
                    </div>

                    <div className="border-t border-gray-300 my-2 pt-2 flex justify-between font-bold">
                      <span>Total:</span>
                      <span>€{calculateGrandTotal()}</span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={paymentStatus !== 'pending' || orderLoading}
                  className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
                >
                  {paymentStatus === 'pending' ? (
                    'Confirm Order'
                  ) : paymentStatus === 'processing' ? (
                    <>
                      <Loader size={20} className="mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check size={20} className="mr-2" />
                      Order Confirmed!
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <div className="relative w-full mt-8">
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
            to={`/cleaning/${
              serviceId || selectedService._id || selectedService.id
            }`}
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
