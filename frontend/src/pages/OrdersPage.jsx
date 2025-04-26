import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useOrderStore } from '../store/orderStore';
import SearchBar from '../components/SearchBar';
import toast from 'react-hot-toast';

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { orders, fetchUserOrders, isLoading, error } = useOrderStore();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUserOrders();
  }, [fetchUserOrders]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredOrders = orders.filter((order) => {
    if (filterStatus !== 'all' && order.status !== filterStatus) {
      return false;
    }
    if (
      searchQuery &&
      !order.service?.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !order._id.includes(searchQuery)
    ) {
      return false;
    }
    return true;
  });

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const statusOptions = [
    { label: 'All', status: 'all', color: 'gray' },
    { label: 'Pending', status: 'pending', color: 'yellow' },
    { label: 'Confirmed', status: 'confirmed', color: 'blue' },
    { label: 'In Progress', status: 'in-progress', color: 'purple' },
    { label: 'Completed', status: 'completed', color: 'green' },
    { label: 'Cancelled', status: 'cancelled', color: 'red' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex flex-col">
      {/* Top bar */}
      <div className="w-full bg-white flex flex-col">
        <div className="w-full p-4 flex items-center shadow-md">
          <Link to="/" className="text-blue-600 flex items-center mr-4">
            <ArrowLeft className="mr-1" /> Back
          </Link>
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg shadow-md"></div>
          <div className="flex-grow pl-6 text-gray-700 font-semibold">
            My very special address...
          </div>
          <button
            onClick={handleLogout}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-all"
          >
            Logout
          </button>
        </div>

        {/* Search bar */}
        <div className="w-full p-4 bg-white shadow sticky top-0 z-30">
          <SearchBar
            placeholder="Search orders..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center py-8">
        <div className="w-[90vw] md:w-[80vw] max-w-6xl bg-white rounded-3xl shadow-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              My Orders
            </h1>
            <div className="text-gray-600">
              {filteredOrders.length} order{filteredOrders.length !== 1 && 's'}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
            {statusOptions.map(({ label, status, color }) => {
              const isActive = filterStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`
                    px-4 py-2 min-w-[110px] text-center rounded-full border text-sm font-medium transition-all
                    ${
                      isActive
                        ? `bg-${color}-100 text-${color}-800 border-${color}-400`
                        : `bg-${color}-50 text-${color}-700 border-${color}-200 hover:bg-${color}-100`
                    }
                  `}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Orders List */}
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[500px] pr-2">
              {filteredOrders.map((order) => (
                <Link
                  to={`/orders/${order._id}`}
                  key={order._id}
                  className="border border-gray-200 rounded-xl shadow hover:shadow-lg transition-all"
                >
                  <div className="p-4 md:p-5">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-semibold">
                        {order.service?.name}
                      </h2>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <Package size={16} className="mr-2" />
                      <span>Order ID: {order._id.slice(-8)}</span>
                    </div>

                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <Clock size={16} className="mr-2" />
                      <span>
                        Scheduled for {formatDate(order.scheduledDate)},{' '}
                        {order.timeSlot.start} - {order.timeSlot.end}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center text-sm">
                        {order.paymentStatus === 'completed' ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircle size={16} className="mr-1" /> Payment
                            completed
                          </span>
                        ) : (
                          <span className="flex items-center text-yellow-600">
                            <Clock size={16} className="mr-1" /> Payment{' '}
                            {order.paymentStatus}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-green-600">
                        €{order.grandTotal}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500 mt-10">
              <Package size={48} className="mb-4 text-gray-400" />
              <p className="text-xl font-semibold mb-2">No orders found</p>
              <p className="text-center mb-6">
                {searchQuery
                  ? "We couldn't find any orders matching your search."
                  : filterStatus !== 'all'
                  ? `You don't have any ${filterStatus} orders.`
                  : "You haven't placed any orders yet."}
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <Link
                  to="/"
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Services
                </Link>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer Wave */}
      <div className="relative w-full overflow-hidden">
        <svg
          className="w-full h-24"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            fill="white"
            d="M0,224 C480,-40 960,-40 1440,224 L1440,320 L0,320 Z"
          />
        </svg>

        <footer className="w-full bg-white text-center py-6 shadow-md">
          <Link
            to="/"
            className="text-blue-600 flex items-center justify-center font-semibold hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="mr-2" /> Back to Home
          </Link>
        </footer>
      </div>
    </div>
  );
};

export default OrdersPage;
