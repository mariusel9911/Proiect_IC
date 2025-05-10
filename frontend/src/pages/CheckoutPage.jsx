import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  Clock,
  MapPin,
  Check,
  Loader,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCheckoutStore } from '../store/checkoutStore';
import { useOrderStore } from '../store/orderStore';
import { useUserAddressStore } from '../store/userAddressStore';
import SearchBar from '../components/SearchBar';
import Input from '../components/Input';
import LocationSelector from '../components/LocationSelector';
import LocationMap from '../components/LocationMap';
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
    setPaymentMethod,
    paymentMethod,
  } = useCheckoutStore();
  const {
    createOrder,
    updatePaymentStatus,
    isLoading: orderLoading,
    error: orderError,
  } = useOrderStore();
  const { address: userAddress, fetchUserAddress } = useUserAddressStore();

  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // 'pending', 'processing', 'completed'
  const [scheduledDate, setScheduledDate] = useState('');
  const [timeSlot, setTimeSlot] = useState({ start: '09:00', end: '12:00' });
  const [showErrors, setShowErrors] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [addressCompleted, setAddressCompleted] = useState(false);
  const [paypalButtonRendered, setPaypalButtonRendered] = useState(false);
  // Create a ref for the PayPal button container
  const paypalButtonRef = useRef(null);

  // Get data from navigation state
  const serviceId = location.state?.serviceId;
  const initialService = location.state?.service;

  // Function to validate if address is complete
  const isAddressValid = () => {
    return (
        address.street &&
        address.street.trim() !== '' &&
        address.city &&
        address.city.trim() !== '' &&
        address.zipCode &&
        address.zipCode.trim() !== '' &&
        address.country &&
        address.country.trim() !== ''
    );
  };

  // Check if address is valid whenever address changes
  useEffect(() => {
    setAddressCompleted(isAddressValid());
  }, [address]);

  // Fetch user address and use it if form address is empty
  useEffect(() => {
    fetchUserAddress();
  }, [fetchUserAddress]);

  // Autofill address from user profile if available
  useEffect(() => {
    if (userAddress && (!address.street || !address.city)) {
      setAddress({
        street: userAddress.street || '',
        city: userAddress.city || '',
        zipCode: userAddress.zipCode || '',
        country: userAddress.country || '',
      });
    }
  }, [userAddress, address, setAddress]);

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

  // Handle address selection from the location selector
  const handleAddressSelect = (addressData, formattedAddr) => {
    setAddress({
      street: addressData.street || '',
      city: addressData.city || '',
      zipCode: addressData.zipCode || '',
      country: addressData.country || '',
    });
  };

  // Improved PayPal SDK Loading
  useEffect(() => {
    const loadPayPalScript = () => {
      // Don't reload if already loaded
      if (window.paypal) {
        setPaypalLoaded(true);
        return;
      }

      const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
      console.log('Using PayPal client ID:', PAYPAL_CLIENT_ID);

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=EUR`;
      script.async = true;

      script.onload = () => {
        console.log('PayPal SDK loaded successfully');
        setPaypalLoaded(true);
      };

      script.onerror = (err) => {
        console.error('Failed to load PayPal SDK:', err);
        toast.error(
            'Failed to load PayPal payment system. Please try another payment method.'
        );
      };

      document.body.appendChild(script);
    };

    // Only load when needed
    if (paymentMethod === 'paypal' && !window.paypal) {
      loadPayPalScript();
    } else if (window.paypal) {
      setPaypalLoaded(true);
    }
  }, [paymentMethod]);

  // Function to check if popups are allowed
  const ensurePopupsAllowed = () => {
    try {
      // Create a test popup
      const testPopup = window.open(
          'about:blank',
          '_blank',
          'width=1,height=1'
      );

      // Check if popup was blocked
      if (
          !testPopup ||
          testPopup.closed ||
          typeof testPopup.closed === 'undefined'
      ) {
        toast.error('Please allow popups for this site to use PayPal checkout');
        return false;
      }

      // Close the test popup
      testPopup.close();
      return true;
    } catch (error) {
      console.error('Error checking popups:', error);
      return false;
    }
  };

  // Separate effect for PayPal button rendering
  useEffect(() => {
    // Only try to render if all conditions are met and we haven't rendered yet
    if (
        paypalLoaded &&
        paymentMethod === 'paypal' &&
        addressCompleted &&
        paypalButtonRef.current &&
        !paypalButtonRendered
    ) {
      // Clear the container first to avoid potential rendering issues
      try {

        if (paypalButtonRef.current) {
          paypalButtonRef.current.style.position = 'relative';
          paypalButtonRef.current.style.zIndex = '10';
        }
        // Create the PayPal button
        const button = window.paypal.Buttons({
          // Set funding source - this can help with popup handling
          fundingSource: window.paypal.FUNDING.PAYPAL,

          // Use recommended styles
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal',
          },

          // Order creation handler
          createOrder: async (data, actions) => {
            try {
              // Prepare order data
              const orderData = prepareOrderData();
              if (!orderData) {
                toast.error('Invalid order data');
                throw new Error('Failed to prepare order data');
              }

              // Set payment processing state
              setPaymentStatus('processing');

              // Create the order in your backend
              const order = await createOrder(orderData);

              // Store order reference
              setCreatedOrder(order);
              localStorage.setItem('currentOrder', JSON.stringify(order));
              console.log('Order created and stored:', order);

              // Return actions for PayPal to create order
              return actions.order.create({
                intent: 'CAPTURE',
                purchase_units: [
                  {
                    amount: {
                      value: order.grandTotal.toFixed(2),
                      currency_code: 'EUR',
                    },
                    description: `Order for ${selectedService.name}`,
                    reference_id: order._id,
                  },
                ],
              });
            } catch (error) {
              console.error('Order creation error:', error);
              toast.error(error.message || 'Order creation failed');
              setPaymentStatus('pending');
              throw error;
            }
          },

          // Payment approval handler
          onApprove: async (data, actions) => {
            try {
              console.log('Payment approved, capturing funds...');
              const captureResult = await actions.order.capture();
              console.log('Capture result:', captureResult);

              // Get order reference - from state or localStorage
              let orderRef = createdOrder;
              if (!orderRef) {
                try {
                  const savedOrder = localStorage.getItem('currentOrder');
                  if (savedOrder) {
                    orderRef = JSON.parse(savedOrder);
                  }
                } catch (e) {
                  console.error('Error retrieving order from localStorage:', e);
                }
              }

              // If still no order ref, try to get from PayPal data
              if (!orderRef) {
                const referenceId =
                    captureResult.purchase_units?.[0]?.reference_id;
                if (!referenceId) {
                  toast.error('Could not find order reference');
                  throw new Error('Missing order reference');
                }
                orderRef = { _id: referenceId };
              }

              // Update payment status in backend
              await updatePaymentStatus(orderRef._id, 'completed', {
                paypalOrderId: data.orderID,
                paypalPayerId: captureResult.payer?.payer_id,
                paypalCapture: {
                  id: captureResult.purchase_units?.[0]?.payments?.captures?.[0]
                      ?.id,
                  status:
                  captureResult.purchase_units?.[0]?.payments?.captures?.[0]
                      ?.status,
                },
              });

              // Clean up
              localStorage.removeItem('currentOrder');

              // Show success and redirect
              toast.success('Payment completed successfully!');
              clearCheckout();
              navigate('/', {
                state: {
                  orderCompleted: true,
                  orderId: orderRef._id,
                },
              });
            } catch (error) {
              console.error('Payment processing error:', error);
              toast.error(
                  'Failed to complete payment: ' +
                  (error.message || 'Unknown error')
              );
              setPaymentStatus('pending');
            }
          },

          // Error handler
          onError: (err) => {
            console.error('PayPal error:', err);
            toast.error('Payment process failed. Please try again.');
            setPaymentStatus('pending');

            // Try to update order status
            try {
              let orderRef = createdOrder;
              if (!orderRef) {
                const savedOrder = localStorage.getItem('currentOrder');
                if (savedOrder) {
                  orderRef = JSON.parse(savedOrder);
                }
              }

              if (orderRef) {
                updatePaymentStatus(orderRef._id, 'failed').catch((error) =>
                    console.error('Failed to update payment status:', error)
                );
              }
            } catch (e) {
              console.error('Error handling payment failure:', e);
            }
          },

          // Cancel handler
          onCancel: () => {
            toast.info('Payment canceled');
            setPaymentStatus('pending');

            // Try to update order status
            try {
              let orderRef = createdOrder;
              if (!orderRef) {
                const savedOrder = localStorage.getItem('currentOrder');
                if (savedOrder) {
                  orderRef = JSON.parse(savedOrder);
                }
              }

              if (orderRef) {
                updatePaymentStatus(orderRef._id, 'pending').catch((error) =>
                    console.error('Failed to update payment status:', error)
                );
              }
            } catch (e) {
              console.error('Error handling payment cancellation:', e);
            }
          },
        });

        // Render the button
        button
            .render(paypalButtonRef.current)
            .then(() => {
              console.log('PayPal button rendered successfully');
              setPaypalButtonRendered(true);
            })
            .catch((err) => {
              console.error('PayPal render error:', err);
              toast.error(
                  'Failed to initialize PayPal button. Please try refreshing the page.'
              );
            });
      } catch (err) {
        console.error('Error setting up PayPal button:', err);
        toast.error(
            'Failed to load PayPal. Please try another payment method.'
        );
      }
    }

    // Reset the rendered state when payment method changes or address becomes incomplete
    if (paymentMethod !== 'paypal' || !addressCompleted) {
      setPaypalButtonRendered(false);
    }

    // Clean up function
    return () => {
      // Don't manually remove the button through DOM manipulation
      // Just reset the state so React can handle it properly
      if (paymentMethod !== 'paypal') {
        setPaypalButtonRendered(false);
      }
    };
  }, [
    paypalLoaded,
    paymentMethod,
    addressCompleted,
    paypalButtonRendered,
    selectedService,
    createOrder,
    updatePaymentStatus,
    clearCheckout,
    navigate,
    prepareOrderData,
    createdOrder,
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

  // Updated payment method change handler
  const handlePaymentMethodChange = (method) => {
    // Don't do anything if attempting to set the same payment method
    if (method === paymentMethod) {
      return;
    }

    if (method === 'paypal') {
      if (!ensurePopupsAllowed()) {
        // If popups are blocked, default to card payment
        method = 'card';
        toast.warning(
            'Please allow popups to use PayPal checkout. Using card payment instead.'
        );
      }
    }

    // Reset any created order since payment method changed
    setCreatedOrder(null);
    // Finally, set the payment method
    setPaymentMethod(method);
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

    // Payment method - use the new handler
    if (name === 'paymentMethod') {
      handlePaymentMethodChange(value);
      return;
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // If PayPal is selected, don't proceed with form submission logic
    if (paymentMethod === 'paypal') {
      // PayPal button handles the payment flow
      return;
    }

    // Validate form for card payment
    setShowErrors(true);

    // Validate address first
    if (!isAddressValid()) {
      toast.error('Please complete all address fields');
      return;
    }

    // Validate card details
    if (!validateCardDetails()) {
      toast.error('Please complete all payment fields correctly');
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

      // Debug log
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
              Checkout for {selectedService.name}
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
                            min={new Date().toISOString().split('T')[0]}
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

                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <MapPin size={20} className="mr-2 text-blue-600" />
                        Service Location
                      </div>
                      <span className="text-xs text-red-600 font-medium">
                      * Required for payment
                    </span>
                    </h2>

                    {/* Enhanced Location Selector with better UX */}
                    <div className="mb-4">
                      <LocationSelector
                          initialAddress={userAddress}
                          onSelectAddress={handleAddressSelect}
                          buttonClassName="w-full py-3 px-4 mb-3 flex items-center justify-center bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-200 shadow-sm"
                      />
                      <p className="text-sm text-gray-500 italic mb-4">
                        Click the button above to select your address using Google Maps
                      </p>
                    </div>

                    {/* Map with better styling and clear placeholder when no location */}
                    <div className="mb-5 rounded-xl overflow-hidden shadow-md">
                      <LocationMap
                          address={{
                            ...address,
                            coordinates: userAddress?.coordinates
                          }}
                          height={220}
                      />
                    </div>

                  </div>

                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Location Section - Enhanced with map and selector */}
                  <div className="border-b border-gray-200 pb-6">

                    {/* Address form fields with improved layout */}
                    <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
                      <h3 className="text-md font-medium text-gray-700 mb-1">
                        Delivery Address Details
                      </h3>

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
                          icon={MapPin}
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

                      {/* Additional delivery instructions */}
                      <div className="mt-3">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Delivery Instructions (Optional)
                        </label>
                        <textarea
                            name="deliveryInstructions"
                            placeholder="Any special instructions for the service provider (gate code, parking information, etc.)"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 min-h-[80px]"
                            onChange={(e) => setAddress({...address, instructions: e.target.value})}
                            value={address.instructions || ''}
                        />
                      </div>
                    </div>

                    {/* Save address for future use checkbox */}
                    <div className="mt-4 flex items-center">
                      <input
                          type="checkbox"
                          id="saveAddress"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          defaultChecked={true}
                      />
                      <label htmlFor="saveAddress" className="ml-2 block text-sm text-gray-700">
                        Save this address for future orders
                      </label>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                      <CreditCard size={20} className="mr-2 text-blue-600" />
                      Payment Method
                    </h2>

                    <div className="flex gap-4 mb-4">
                      <div
                          className={`border p-4 rounded-lg cursor-pointer flex-grow ${
                              paymentMethod === 'card'
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-300'
                          }`}
                          onClick={() =>
                              handleInputChange({
                                target: { name: 'paymentMethod', value: 'card' },
                              })
                          }
                      >
                        <div className="flex items-center">
                          <div
                              className={`w-4 h-4 rounded-full ${
                                  paymentMethod === 'card'
                                      ? 'bg-blue-500'
                                      : 'border border-gray-300'
                              } mr-2`}
                          ></div>
                          <span>Credit Card</span>
                        </div>
                      </div>
                      <div
                          className={`border p-4 rounded-lg cursor-pointer flex-grow ${
                              paymentMethod === 'paypal'
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-300'
                          }`}
                          onClick={() =>
                              handleInputChange({
                                target: { name: 'paymentMethod', value: 'paypal' },
                              })
                          }
                      >
                        <div className="flex items-center">
                          <div
                              className={`w-4 h-4 rounded-full ${
                                  paymentMethod === 'paypal'
                                      ? 'bg-blue-500'
                                      : 'border border-gray-300'
                              } mr-2`}
                          ></div>
                          <span>PayPal</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Details */}
                    {paymentMethod === 'card' && (
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
                    )}

                    {/* PayPal Button Container */}
                    {paymentMethod === 'paypal' && (
                        <div className="mt-4">
                          {!paypalLoaded && (
                              <div className="flex items-center justify-center p-6">
                                <Loader className="animate-spin mr-2" />
                                <span>Loading PayPal...</span>
                              </div>
                          )}

                          {paypalLoaded && !addressCompleted && (
                              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                                <p className="font-medium">
                                  Please complete your address information before
                                  proceeding with payment.
                                </p>
                              </div>
                          )}

                          {paypalLoaded && addressCompleted && (
                              <div
                                  id="paypal-button-container"
                                  ref={paypalButtonRef}
                              ></div>
                          )}
                        </div>
                    )}
                  </div>

                  {/* Submit Button (only for card payments) - With address validation */}
                  {paymentMethod === 'card' && (
                      <button
                          type="submit"
                          disabled={
                              paymentStatus !== 'pending' ||
                              orderLoading ||
                              !addressCompleted
                          }
                          className={`w-full py-3 rounded-lg font-medium flex items-center justify-center ${
                              !addressCompleted
                                  ? 'bg-gray-400 cursor-not-allowed text-white'
                                  : paymentStatus !== 'pending' || orderLoading
                                      ? 'bg-gray-400 cursor-not-allowed text-white'
                                      : 'bg-black text-white hover:bg-gray-800 transition-colors'
                          }`}
                      >
                        {!addressCompleted ? (
                            'Please complete address'
                        ) : paymentStatus === 'pending' ? (
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
                  )}
                </div>
              </form>

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