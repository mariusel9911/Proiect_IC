import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    MapPin,
    Clock,
    Package,
    CreditCard,
    CheckCircle,
    XCircle,
    AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useOrderStore } from '../store/orderStore';
import toast from 'react-hot-toast';

const OrderDetailsPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const {
        currentOrder,
        fetchOrderById,
        cancelOrder,
        isLoading,
        error,
        message,
    } = useOrderStore();

    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        fetchOrderById(orderId);
    }, [orderId, fetchOrderById]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
        if (message) {
            toast.success(message);
        }
    }, [error, message]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleCancelOrder = async () => {
        setIsCancelling(true);
        try {
            await cancelOrder(orderId);
            setCancelModalOpen(false);
        } finally {
            setIsCancelling(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'in-progress':
                return 'bg-purple-100 text-purple-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="p-8 bg-white rounded-xl shadow-lg text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-700">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!currentOrder) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="p-8 bg-white rounded-xl shadow-lg text-center">
                    <AlertTriangle size={48} className="text-yellow-500 mx-auto mb-4" />
                    <p className="text-gray-700 mb-4">Order not found</p>
                    <Link
                        to="/orders"
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex flex-col items-center justify-between">
            <div className="w-full bg-white flex flex-col">
                <div className="w-full p-3 bg-white shadow-lg flex justify-center items-center">
                    <Link to="/orders" className="text-blue-600 flex items-center mr-4">
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
            </div>

            <main className="flex-grow flex items-center justify-center w-full h-[600px] md:h-[800px]">
                <div className="relative w-[90vw] md:w-[80vw] max-w-6xl h-[400px] md:h-[600px] bg-white rounded-3xl shadow-2xl p-6">
                    <div className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                                    Order Details
                                </h1>
                                <p className="text-gray-600">ID: {currentOrder._id}</p>
                            </div>
                            <span
                                className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusStyles(
                                    currentOrder.status
                                )}`}
                            >
                {currentOrder.status.charAt(0).toUpperCase() +
                    currentOrder.status.slice(1)}
              </span>
                        </div>

                        <div className="flex-grow overflow-y-auto pr-2">
                            {/* Service Info */}
                            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                                <h2 className="text-xl font-semibold mb-2">
                                    {currentOrder.service.name}
                                </h2>
                                <p className="text-gray-600">
                                    {currentOrder.service.description}
                                </p>
                                <div className="flex justify-between items-center mt-2">
                  <span className="text-green-600 font-bold">
                    {currentOrder.service.type}
                  </span>
                                </div>
                            </div>

                            {/* Selected Items */}
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">
                                    Selected Services
                                </h2>
                                <div className="space-y-4">
                                    {currentOrder.selectedOptions.map((option) => (
                                        <div
                                            key={option.optionId}
                                            className="flex items-center justify-between border-b border-gray-100 pb-3"
                                        >
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center mr-3">
                          <span className="text-lg">
                            {option.name.slice(0, 1)}
                          </span>
                                                </div>
                                                <span className="text-gray-700">{option.name}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="mr-4 font-medium">{option.price}</span>
                                                <span className="bg-gray-100 px-3 py-1 rounded-full">
                          x{option.quantity}
                        </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Location and Schedule */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Location Section */}
                                <div className="border-b border-gray-200 pb-4 md:border-b-0 md:pb-0 md:border-r md:pr-4">
                                    <h2 className="font-semibold text-gray-800 mb-3 flex items-center">
                                        <MapPin size={18} className="mr-2" /> Service Location
                                    </h2>
                                    <div className="bg-gray-100 rounded-lg p-3">
                                        <p className="text-sm font-medium">
                                            {currentOrder.address.street}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {currentOrder.address.city},{' '}
                                            {currentOrder.address.zipCode}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {currentOrder.address.country}
                                        </p>
                                    </div>
                                </div>

                                {/* Schedule Section */}
                                <div>
                                    <h2 className="font-semibold text-gray-800 mb-3 flex items-center">
                                        <Clock size={18} className="mr-2" /> Schedule
                                    </h2>
                                    <div className="bg-gray-100 rounded-lg p-3">
                                        <p className="text-sm font-medium">
                                            {formatDate(currentOrder.scheduledDate)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Between {currentOrder.timeSlot.start} -{' '}
                                            {currentOrder.timeSlot.end}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2 flex items-center">
                                    <CreditCard size={18} className="mr-2" /> Payment Information
                                </h2>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-600">Payment Method:</span>
                                    <span className="font-medium">
                    {currentOrder.paymentMethod === 'card'
                        ? 'Credit / Debit Card'
                        : currentOrder.paymentMethod}
                  </span>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-600">Payment Status:</span>
                                    <span
                                        className={`font-medium flex items-center ${
                                            currentOrder.paymentStatus === 'completed'
                                                ? 'text-green-600'
                                                : currentOrder.paymentStatus === 'failed'
                                                    ? 'text-red-600'
                                                    : 'text-yellow-600'
                                        }`}
                                    >
                    {currentOrder.paymentStatus === 'completed' ? (
                        <>
                            <CheckCircle size={16} className="mr-1" /> Completed
                        </>
                    ) : currentOrder.paymentStatus === 'failed' ? (
                        <>
                            <XCircle size={16} className="mr-1" /> Failed
                        </>
                    ) : (
                        <>
                            <Clock size={16} className="mr-1" />{' '}
                            {currentOrder.paymentStatus.charAt(0).toUpperCase() +
                                currentOrder.paymentStatus.slice(1)}
                        </>
                    )}
                  </span>
                                </div>
                            </div>
                        </div>

                        {/* Order Total */}
                        <div className="mt-4 border-t border-gray-200 pt-3">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">€{currentOrder.totalAmount}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Tax (20%):</span>
                                <span className="font-medium">€{currentOrder.tax}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-lg font-semibold">Total:</span>
                                <span className="text-lg font-bold">
                  €{currentOrder.grandTotal}
                </span>
                            </div>

                            {/* Action buttons */}
                            <div className="flex justify-between">
                                <Link
                                    to="/orders"
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg flex items-center hover:bg-gray-100 transition-colors"
                                >
                                    <ArrowLeft size={18} className="mr-2" /> Back to Orders
                                </Link>

                                {/* Only show cancel button if order is pending or confirmed */}
                                {(currentOrder.status === 'pending' ||
                                    currentOrder.status === 'confirmed') && (
                                    <button
                                        onClick={() => setCancelModalOpen(true)}
                                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg flex items-center hover:bg-red-50 transition-colors"
                                    >
                                        <XCircle size={18} className="mr-2" /> Cancel Order
                                    </button>
                                )}
                            </div>
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
                        to="/"
                        className="text-blue-600 flex items-center justify-center mt-[-20px] text-base md:text-xl font-semibold hover:text-purple-600 transition-colors"
                    >
                        <ArrowLeft className="mr-2" /> Back to Home
                    </Link>
                </footer>
            </div>

            {/* Cancel Order Modal */}
            {cancelModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Cancel Order</h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to cancel this order? This action cannot be
                            undone.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setCancelModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                disabled={isCancelling}
                            >
                                No, Keep Order
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                                disabled={isCancelling}
                            >
                                {isCancelling ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Cancelling...
                                    </>
                                ) : (
                                    <>Yes, Cancel Order</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetailsPage;