// AdminOrdersPanel.jsx
import { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  Check,
  X as XIcon,
  RefreshCcw,
  Trash2,
  Edit,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAdminStore } from '../../store/adminStore';
import OrderDetailsModal from '../../components/modals/OrderDetailsModal';
import { useDarkMode } from '../../contexts/DarkModeContext';
import DeleteConfirmModal from '../../components/modals/DeleteConfirmModal';

const AdminOrdersPanel = () => {
  const { darkMode } = useDarkMode();
  const {
    adminOrders,
    isLoading,
    error,
    pagination,
    setPagination,
    fetchAdminOrders,
    updateOrderStatus,
    deleteOrder,
  } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [editingStatusOrderId, setEditingStatusOrderId] = useState(null);

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

  const handleCloseOrderModal = () => {
    setSelectedOrderId(null);
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Order status updated to ${status}`);
      setEditingStatusOrderId(null); // Close the status editor after update
    } catch (error) {
      // Error is shown from the store effect
    }
  };

  const toggleStatusEditor = (orderId) => {
    if (editingStatusOrderId === orderId) {
      setEditingStatusOrderId(null);
    } else {
      setEditingStatusOrderId(orderId);
    }
  };

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteOrder(orderToDelete._id);
      toast.success('Order deleted successfully');
      setShowDeleteModal(false);
      setOrderToDelete(null);
    } catch (error) {
      // Error is shown from the store
    }
  };

  // Filter orders based on search query
  const filteredOrders =
    adminOrders && adminOrders.length > 0
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

  // Status badge color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Payment status badge color mapping
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'refunded':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
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

  // Refresh handler
  const handleRefresh = () => {
    fetchAdminOrders(statusFilter);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Manage Orders
          </h2>

          <div className="mt-4 md:mt-0 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-2 pl-10 pr-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Loading orders...
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <span className="font-mono">
                        {order._id?.slice(-8) || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.user?.name || 'Unknown User'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {order.user?.email || 'No email'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {order.service?.name || 'Unknown Service'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {order.selectedOptions?.length || 0} options
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      €{order.grandTotal?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(order.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
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
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {order.paymentMethod || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {editingStatusOrderId === order._id ? (
                        <select
                          className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                          value={order.status}
                          onChange={(e) =>
                            handleUpdateStatus(order._id, e.target.value)
                          }
                          autoFocus
                          onBlur={() => setEditingStatusOrderId(null)}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status || 'Unknown'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewOrderDetails(order._id)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => toggleStatusEditor(order._id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit Status"
                        >
                          <Edit size={18} />
                        </button>
                        {order.status === 'pending' && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(order._id, 'confirmed')
                            }
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Confirm Order"
                          >
                            <Check size={18} />
                          </button>
                        )}
                        {(order.status === 'pending' ||
                          order.status === 'confirmed') && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(order._id, 'cancelled')
                            }
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Cancel Order"
                          >
                            <XIcon size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClick(order)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete Order"
                        >
                          <Trash2 size={18} />
                        </button>
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
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() =>
                setPagination({
                  ...pagination,
                  page: Math.max(1, pagination.page - 1),
                })
              }
              disabled={!pagination || pagination.page <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setPagination({
                  ...pagination,
                  page: Math.min(pagination.pages, pagination.page + 1),
                })
              }
              disabled={!pagination || pagination.page >= pagination.pages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing{' '}
                <span className="font-medium">{filteredOrders.length}</span> of{' '}
                <span className="font-medium">{pagination?.total || 0}</span>{' '}
                results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      page: Math.max(1, pagination.page - 1),
                    })
                  }
                  disabled={!pagination || pagination.page <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500"
                >
                  <span className="sr-only">Previous</span>
                  &laquo;
                </button>

                {pagination &&
                  pagination.pages > 0 &&
                  [...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        setPagination({ ...pagination, page: i + 1 })
                      }
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pagination.page === i + 1
                          ? 'z-10 bg-purple-50 dark:bg-purple-900 border-purple-500 dark:border-purple-600 text-purple-600 dark:text-purple-300'
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                <button
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      page: Math.min(pagination.pages, pagination.page + 1),
                    })
                  }
                  disabled={!pagination || pagination.page >= pagination.pages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-500"
                >
                  <span className="sr-only">Next</span>
                  &raquo;
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrderId && (
        <OrderDetailsModal
          orderId={selectedOrderId}
          onClose={handleCloseOrderModal}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          title="Delete Order"
          message={`Are you sure you want to delete order ${orderToDelete?._id?.slice(
            -8
          )}? This action cannot be undone.`}
          onCancel={() => {
            setShowDeleteModal(false);
            setOrderToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

export default AdminOrdersPanel;
