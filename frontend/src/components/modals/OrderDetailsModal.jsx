import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { useDarkMode } from '../../contexts/DarkModeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const OrderDetailsModal = ({ orderId, onClose }) => {
    const { darkMode } = useDarkMode();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${API_URL}/orders/${orderId}`, {
                    withCredentials: true
                });

                if (response.data.success) {
                    setOrder(response.data.order);
                } else {
                    setError('Failed to load order details');
                }
            } catch (error) {
                console.error('Error fetching order details:', error);
                setError(error.response?.data?.message || 'Error fetching order details');
            } finally {
                setIsLoading(false);
            }
        };

        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'in-progress': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const getPaymentStatusBadgeClass = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'refunded': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Order Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-purple-500 border-r-transparent"></div>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading order details...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500 dark:text-red-400">
                            <p>{error}</p>
                        </div>
                    ) : order ? (
                        <div className="space-y-6">
                            {/* Order Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Order Information</h3>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <p className="mb-1 dark:text-white"><span className="font-semibold">Order ID:</span> {order._id}</p>
                                        <p className="mb-1 dark:text-white"><span className="font-semibold">Created:</span> {formatDate(order.createdAt)}</p>
                                        <p className="mb-1 dark:text-white">
                                            <span className="font-semibold">Status:</span>{" "}
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeClass(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </p>
                                        <p className="mb-1 dark:text-white">
                                            <span className="font-semibold">Payment:</span>{" "}
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${getPaymentStatusBadgeClass(order.paymentStatus)}`}>
                                                {order.paymentStatus}
                                            </span>
                                            {" via "}
                                            {order.paymentMethod}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Customer Information</h3>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <p className="mb-1 dark:text-white"><span className="font-semibold">Name:</span> {order.user?.name || 'N/A'}</p>
                                        <p className="mb-1 dark:text-white"><span className="font-semibold">Email:</span> {order.user?.email || 'N/A'}</p>
                                        {order.address && (
                                            <>
                                                <p className="font-semibold mt-2 mb-1 dark:text-white">Address:</p>
                                                <p className="mb-0 dark:text-white">{order.address.street || 'N/A'}</p>
                                                <p className="mb-0 dark:text-white">{order.address.city || 'N/A'}, {order.address.zipCode || 'N/A'}</p>
                                                <p className="mb-0 dark:text-white">{order.address.country || 'N/A'}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Service Information */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Service Information</h3>
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <p className="mb-1 dark:text-white"><span className="font-semibold">Service:</span> {order.service?.name || 'N/A'}</p>
                                    <p className="mb-1 dark:text-white"><span className="font-semibold">Type:</span> {order.service?.type || 'N/A'}</p>
                                    <p className="mb-1 dark:text-white"><span className="font-semibold">Scheduled Date:</span> {formatDate(order.scheduledDate)}</p>
                                    <p className="mb-1 dark:text-white"><span className="font-semibold">Time Slot:</span> {order.timeSlot?.start || 'N/A'} - {order.timeSlot?.end || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Selected Options */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Selected Options</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Option</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subtotal</th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {order.selectedOptions && order.selectedOptions.length > 0 ? (
                                            order.selectedOptions.map((option, index) => {
                                                const price = parseFloat(option.price.replace('€', ''));
                                                const subtotal = price * option.quantity;

                                                return (
                                                    <tr key={index}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {option.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {option.price}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {option.quantity}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            €{subtotal.toFixed(2)}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                    No options selected
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Order Totals */}
                            <div className="border-t dark:border-gray-700 pt-4">
                                <div className="flex justify-end">
                                    <div className="w-full md:w-1/3">
                                        <div className="flex justify-between py-2">
                                            <span className="font-medium dark:text-white">Subtotal:</span>
                                            <span className="dark:text-white">€{order.totalAmount?.toFixed(2) || '0.00'}</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="font-medium dark:text-white">Tax:</span>
                                            <span className="dark:text-white">€{order.tax?.toFixed(2) || '0.00'}</span>
                                        </div>
                                        <div className="flex justify-between py-2 font-bold">
                                            <span className="dark:text-white">Total:</span>
                                            <span className="dark:text-white">€{order.grandTotal?.toFixed(2) || '0.00'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Details */}
                            {order.paymentDetails && Object.keys(order.paymentDetails).length > 0 && (
                                <div className="border-t dark:border-gray-700 pt-4">
                                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Payment Details</h3>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        {order.paymentDetails.transactionId && (
                                            <p className="mb-1 dark:text-white"><span className="font-semibold">Transaction ID:</span> {order.paymentDetails.transactionId}</p>
                                        )}
                                        {order.paymentDetails.timestamp && (
                                            <p className="mb-1 dark:text-white"><span className="font-semibold">Transaction Date:</span> {formatDate(order.paymentDetails.timestamp)}</p>
                                        )}
                                        {order.paymentDetails.paypalOrderId && (
                                            <p className="mb-1 dark:text-white"><span className="font-semibold">PayPal Order ID:</span> {order.paymentDetails.paypalOrderId}</p>
                                        )}
                                        {order.paymentDetails.paypalPayerId && (
                                            <p className="mb-1 dark:text-white"><span className="font-semibold">PayPal Payer ID:</span> {order.paymentDetails.paypalPayerId}</p>
                                        )}
                                        {order.paymentDetails.paypalCapture && (
                                            <p className="mb-1 dark:text-white"><span className="font-semibold">PayPal Capture Status:</span> {order.paymentDetails.paypalCapture.status}</p>
                                        )}
                                        {order.paymentDetails.cardLast4 && (
                                            <p className="mb-1 dark:text-white"><span className="font-semibold">Card:</span> **** **** **** {order.paymentDetails.cardLast4} ({order.paymentDetails.cardBrand})</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <p>No order data available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;