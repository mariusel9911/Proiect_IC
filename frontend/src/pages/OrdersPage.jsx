import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
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

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Show error toast if API request fails
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    // Filter orders based on status and search query
    const filteredOrders = orders.filter((order) => {
        // Apply status filter
        if (filterStatus !== 'all' && order.status !== filterStatus) {
            return false;
        }

        // Apply search filter (search in service name or order ID)
        if (searchQuery && !order.service?.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !order._id.includes(searchQuery)) {
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
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex flex-col items-center justify-between">
            <div className="w-full bg-white flex flex-col">
                <div className="w-full p-3 bg-white shadow-lg flex justify-center items-center">
                    <Link
                        to="/"
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
                    <SearchBar
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            <main className="flex-grow flex items-center justify-center w-full h-[600px] md:h-[800px]">
                <div className="relative w-[90vw] md:w-[80vw] max-w-6xl h-[400px] md:h-[600px] bg-white rounded-3xl shadow-2xl p-6">
                    <div className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                                My Orders
                            </h1>
                            <div className="text-gray-600">
                                {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
                            </div>
                        </div>

                        {/* Filter tabs */}
                        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`px-4 py-2 rounded-full ${
                                    filterStatus === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                } transition-colors`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilterStatus('pending')}
                                className={`px-4 py-2 rounded-full ${
                                    filterStatus === 'pending'
                                        ? 'bg-yellow-600 text-white'
                                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                } transition-colors`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => setFilterStatus('confirmed')}
                                className={`px-4 py-2 rounded-full ${
                                    filterStatus === 'confirmed'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                } transition-colors`}
                            >
                                Confirmed
                            </button>
                            <button
                                onClick={() => setFilterStatus('in-progress')}
                                className={`px-4 py-2 rounded-full ${
                                    filterStatus === 'in-progress'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                } transition-colors`}
                            >
                                In Progress
                            </button>
                            <button
                                onClick={() => setFilterStatus('completed')}
                                className={`px-4 py-2 rounded-full ${
                                    filterStatus === 'completed'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                } transition-colors`}
                            >
                                Completed
                            </button>
                            <button
                                onClick={() => setFilterStatus('cancelled')}
                                className={`px-4 py-2 rounded-full ${
                                    filterStatus === 'cancelled'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                                } transition-colors`}
                            >
                                Cancelled
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="flex-grow flex items-center justify-center">
                                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : filteredOrders.length > 0 ? (
                            <div className="flex-grow overflow-y-auto pr-2">
                                <div className="flex flex-col gap-4">
                                    {filteredOrders.map((order) => (
                                        <Link
                                            to={`/orders/${order._id}`}
                                            key={order._id}
                                            className="border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden cursor-pointer"
                                        >
                                            <div className="p-4 md:p-5">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h2 className="text-lg font-semibold">
                                                        {order.service.name}
                                                    </h2>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                                                </div>

                                                <div className="flex items-center text-gray-600 text-sm mb-3">
                                                    <Package size={16} className="mr-2" />
                                                    <span>Order ID: {order._id.slice(-8)}</span>
                                                </div>

                                                <div className="flex items-center text-gray-600 text-sm mb-3">
                                                    <Clock size={16} className="mr-2" />
                                                    <span>
                            Scheduled for {formatDate(order.scheduledDate)}, {' '}
                                                        {order.timeSlot.start} - {order.timeSlot.end}
                          </span>
                                                </div>

                                                <div className="flex justify-between items-center mt-4">
                                                    <div className="flex items-center text-gray-600 text-sm">
                                                        {order.paymentStatus === 'completed' ? (
                                                            <span className="flex items-center text-green-600">
                                <CheckCircle size={16} className="mr-1" />
                                Payment completed
                              </span>
                                                        ) : (
                                                            <span className="flex items-center text-yellow-600">
                                <Clock size={16} className="mr-1" />
                                Payment {order.paymentStatus}
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
                            </div>
                        ) : (
                            <div className="flex-grow flex flex-col items-center justify-center text-gray-500">
                                <Package size={48} className="mb-4 text-gray-400" />
                                <p className="text-xl font-medium mb-2">No orders found</p>
                                <p className="text-center mb-6">
                                    {searchQuery
                                        ? "We couldn't find any orders matching your search."
                                        : filterStatus !== 'all'
                                            ? `You don't have any ${filterStatus} orders.`
                                            : "You haven't placed any orders yet."}
                                </p>
                                {(!searchQuery && filterStatus === 'all') && (
                                    <Link
                                        to="/"
                                        className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Browse Services
                                    </Link>
                                )}
                            </div>
                        )}
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
        </div>
    );
};

export default OrdersPage;