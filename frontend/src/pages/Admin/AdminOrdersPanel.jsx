import { useState, useEffect } from 'react';
import { Search, Eye, Check, X as XIcon, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAdminStore } from '../../store/adminStore';
import OrderDetailsModal from '../../components/modals/OrderDetailsModal';

const AdminOrdersPanel = () => {
    const {
        adminOrders,
        isLoading,
        error,
        pagination,
        setPagination,
        fetchAdminOrders,
        updateOrderStatus
    } = useAdminStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    // Fetch orders when pagination or status filter changes
    useEffect(() => {
        fetchAdminOrders(statusFilter);
    }, [fetchAdminOrders, pagination?.page, statusFilter]);

    // Show error toast if there's an error from the store
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleViewOrderDetails = (orderId) => {
        setSelectedOrderId(orderId);
    };

    // Add this function to close the modal
    const handleCloseOrderModal = () => {
        setSelectedOrderId(null);
    };

    const handleUpdateStatus = async (orderId, status) => {
        try {
            await updateOrderStatus(orderId, status);
            toast.success(`Order status updated to ${status}`);
        } catch (error) {
            // Error is shown from the store effect
        }
    };

    // Filter orders based on search query
    const filteredOrders = adminOrders && adminOrders.length > 0
        ? adminOrders.filter((order) => {
            if (!searchQuery) return true;

            const searchLower = searchQuery.toLowerCase();

            // Search in user information if available
            const userName = order.user?.name?.toLowerCase() || '';
            const userEmail = order.user?.email?.toLowerCase() || '';

            // Search in service information if available
            const serviceName = order.service?.name?.toLowerCase() || '';

            // Search in order ID
            const orderId = order._id?.toLowerCase() || '';

            return (
                userName.includes(searchLower) ||
                userEmail.includes(searchLower) ||
                serviceName.includes(searchLower) ||
                orderId.includes(searchLower)
            );
        })
        : [];

    // Add these two functions that were missing
    // Status badge color mapping
    const getStatusColor = (status) => {
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

    // Payment status badge color mapping
    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'refunded':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    // Add a refresh handler that calls fetchAdminOrders
    const handleRefresh = () => {
        fetchAdminOrders(statusFilter);
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">Manage Orders</h2>

                    <div className="mt-4 md:mt-0 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <button
                            onClick={handleRefresh}
                            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <RefreshCcw className="h-4 w-4 mr-2" />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="p-6 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-purple-500 border-r-transparent"></div>
                    <p className="mt-2 text-gray-500">Loading orders...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Order ID
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Service
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Payment
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-4 py-4 text-center text-gray-500">
                                    No orders found
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order._id}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <span className="font-mono">{order._id?.slice(-8) || 'N/A'}</span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {order.user?.name || 'Unknown User'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {order.user?.email || 'No email'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {order.service?.name || 'Unknown Service'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {order.selectedOptions?.length || 0} options
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        €{order.grandTotal?.toFixed(2) || '0.00'}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {formatDate(order.createdAt)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatDate(order.scheduledDate)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                              <span
                                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(
                                      order.paymentStatus
                                  )}`}
                              >
                                {order.paymentStatus || 'Unknown'}
                              </span>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {order.paymentMethod || 'Unknown'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                              <span
                                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                      order.status
                                  )}`}
                              >
                                {order.status || 'Unknown'}
                              </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleViewOrderDetails(order._id)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            {order.status === 'pending' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(order._id, 'confirmed')}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Confirm Order"
                                                >
                                                    <Check size={18} />
                                                </button>
                                            )}
                                            {(order.status === 'pending' || order.status === 'confirmed') && (
                                                <button
                                                    onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Cancel Order"
                                                >
                                                    <XIcon size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages && pagination.pages > 1 && (
                <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                            disabled={!pagination || pagination.page <= 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPagination({ ...pagination, page: Math.min(pagination.pages, pagination.page + 1) })}
                            disabled={!pagination || pagination.page >= pagination.pages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{filteredOrders.length}</span> of{' '}
                                <span className="font-medium">{pagination?.total || 0}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                                    disabled={!pagination || pagination.page <= 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                    <span className="sr-only">Previous</span>
                                    &laquo;
                                </button>

                                {pagination && pagination.pages > 0 && [...Array(pagination.pages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPagination({ ...pagination, page: i + 1 })}
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                            pagination.page === i + 1
                                                ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setPagination({ ...pagination, page: Math.min(pagination.pages, pagination.page + 1) })}
                                    disabled={!pagination || pagination.page >= pagination.pages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                    <span className="sr-only">Next</span>
                                    &raquo;
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
            {selectedOrderId && (
                <OrderDetailsModal
                    orderId={selectedOrderId}
                    onClose={handleCloseOrderModal}
                />
            )}
        </div>
    );
};

export default AdminOrdersPanel;