import { useState, useEffect } from 'react';
import {
  User,
  Settings,
  ClipboardList,
  LogOut,
  Camera,
  ChevronLeft,
  ExternalLink,
  X,
  Shield,
  Trash2,
  Key,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { useUserAddressStore } from '../store/userAddressStore';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuthStore();
  const { updateUserProfile, deleteUserAccount, requestPasswordReset } =
    useUserStore();
  const { updateUserAddress } = useUserAddressStore();
  const [activeTab, setActiveTab] = useState('account');
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    profileImage: null,
  });

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Update user state from auth store when available
  useEffect(() => {
    if (authUser) {
      setUser((prevUser) => ({
        ...prevUser,
        name: authUser.name || '',
        email: authUser.email || '',
        // Keep other fields as they might not be in authUser
      }));

      const savedProfileImage = localStorage.getItem('profileImage');
      if (savedProfileImage) {
        setUser((prevUser) => ({
          ...prevUser,
          profileImage: savedProfileImage,
        }));
      }

      // Fetch additional user data
      fetchUserData();
    }
  }, [authUser]);

  // Fetch user details from backend
  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      // Fetch user address
      const addressResponse = await fetch(
        'http://localhost:5000/api/users/address',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (addressResponse.ok) {
        const addressData = await addressResponse.json();
        if (addressData.success && addressData.address) {
          setUser((prevUser) => ({
            ...prevUser,
            address: formatAddress(addressData.address),
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format address object into string
  const formatAddress = (addressObj) => {
    if (!addressObj) return '';

    const parts = [
      addressObj.street,
      addressObj.city,
      addressObj.zipCode,
      addressObj.country,
    ].filter(Boolean);

    return parts.join(', ');
  };

  // Fetch user orders from backend
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setIsOrdersLoading(true);
    try {
      const response = await fetch(
        'http://localhost:5000/api/orders/my-orders',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        setUser({ ...user, profileImage: imageData });

        // Save to localStorage for persistence
        localStorage.setItem('profileImage', imageData);
        toast.success('Profile image updated');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Split address string into components
      const addressParts = user.address.split(',').map((part) => part.trim());
      const addressObj = {
        street: addressParts[0] || '',
        city: addressParts[1] || '',
        zipCode: addressParts[2] || '',
        country: addressParts[3] || '',
      };

      // Update profile info (name, phone)
      await updateUserProfile({
        name: user.name,
        phone: user.phone || '',
      });

      // Update address in backend
      await updateUserAddress(addressObj);

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred while updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password reset request
  const handlePasswordReset = async () => {
    setIsResettingPassword(true);
    try {
      await requestPasswordReset(user.email);
      toast.success('Password reset email sent! Check your inbox.');
      setShowPasswordResetModal(false);
    } catch (error) {
      toast.error('Failed to send password reset email');
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      toast.error('Please enter your password to confirm deletion');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteUserAccount(deletePassword);
      toast.success('Account deleted successfully');

      // Clear local storage
      localStorage.clear();

      // Logout and redirect
      logout();
      navigate('/signup');
    } catch (error) {
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date string
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO');
  };

  // Get status color class
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Get payment status color class
  const getPaymentStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Function to handle when an order is clicked
  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-blue-50 to-purple-50">
      {/* Navigation Bar */}
      <div className="w-full bg-white shadow-md p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft size={20} />
            <span className="ml-1">Back to Home</span>
          </button>

          <div className="text-lg font-semibold">Profile</div>

          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Sidebar */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              {/* Profile Image with Upload Option */}
              <div className="relative mx-auto mb-4">
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                <label
                  htmlFor="profile-image-upload"
                  className="absolute bottom-0 right-0 md:right-[calc(50%-3rem)] bg-blue-500 hover:bg-blue-600 text-white p-1 rounded-full cursor-pointer transition-colors"
                >
                  <Camera size={16} />
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              <h2 className="text-xl font-bold mb-1">{user.name}</h2>
              <p className="text-gray-500 mb-4">{user.email}</p>

              {/* Navigation Tabs */}
              <div className="flex flex-col space-y-2 mt-6">
                <button
                  onClick={() => setActiveTab('account')}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    activeTab === 'account'
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <User size={18} className="mr-3" />
                  <span>Account</span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <ClipboardList size={18} className="mr-3" />
                  <span>Orders</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Settings size={18} className="mr-3" />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Account Tab */}
              {activeTab === 'account' && (
                <div>
                  <h3 className="text-xl font-bold mb-6">
                    Account Information
                  </h3>

                  {isLoading ? (
                    <div className="flex justify-center my-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={user.name}
                          onChange={(e) =>
                            setUser({ ...user, name: e.target.value })
                          }
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={user.email}
                          readOnly
                          className="w-full p-2 border border-gray-200 bg-gray-50 rounded-md text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Email cannot be changed
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={user.phone}
                          onChange={(e) =>
                            setUser({ ...user, phone: e.target.value })
                          }
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+40 123 456 789"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <textarea
                          value={user.address}
                          onChange={(e) =>
                            setUser({ ...user, address: e.target.value })
                          }
                          rows={3}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Street, City, Zip Code, Country"
                        />
                      </div>

                      <button
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                        className="mt-4 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h3 className="text-xl font-bold mb-6">Order History</h3>

                  {isOrdersLoading ? (
                    <div className="flex justify-center my-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order._id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleOrderClick(order)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">
                                {order.service?.name || 'Service'}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <div>
                              <span
                                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
                                  order.status
                                )}`}
                              >
                                {order.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="font-medium text-gray-900">
                              €{order.grandTotal}
                            </p>
                            <span className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              View Summary
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <ClipboardList
                        size={48}
                        className="mx-auto text-gray-400 mb-4"
                      />
                      <p className="text-gray-500">
                        You haven't placed any orders yet.
                      </p>
                      <Link
                        to="/"
                        className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Browse Services
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div>
                  <h3 className="text-xl font-bold mb-6">Settings</h3>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">Security</h4>
                      <div className="space-y-3">
                        <button
                          onClick={() => setShowPasswordResetModal(true)}
                          className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Key className="h-4 w-4 mr-2" />
                          Change Password
                        </button>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h4 className="font-medium mb-3 text-red-600">
                        Danger Zone
                      </h4>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center px-4 py-2 border border-red-300 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </button>
                      <p className="text-xs text-gray-500 mt-2">
                        This action cannot be undone. This will permanently
                        delete your account and all associated data.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showPasswordResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center">
                <Key className="h-5 w-5 mr-2 text-blue-600" />
                Reset Password
              </h3>
              <button
                onClick={() => setShowPasswordResetModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                We'll send a password reset link to your email address:{' '}
                <strong>{user.email}</strong>
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPasswordResetModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isResettingPassword}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordReset}
                  disabled={isResettingPassword}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center"
                >
                  {isResettingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center text-red-600">
                <Trash2 className="h-5 w-5 mr-2" />
                Delete Account
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <Shield className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">
                      This action cannot be undone
                    </h4>
                    <p className="text-sm text-red-700 mt-1">
                      This will permanently delete your account, all your
                      orders, and personal data.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your password to confirm deletion:
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter your current password"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || !deletePassword.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Summary Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Order Summary</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Service</span>
                <span>{selectedOrder.service?.name || 'Service'}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Date</span>
                <span>{formatDate(selectedOrder.createdAt)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Status</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Payment Status</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusClass(
                    selectedOrder.paymentStatus
                  )}`}
                >
                  {selectedOrder.paymentStatus}
                </span>
              </div>

              {selectedOrder.selectedOptions &&
                selectedOrder.selectedOptions.length > 0 && (
                  <div className="py-2 border-b">
                    <p className="font-medium mb-2">Selected Services:</p>
                    <ul className="space-y-1">
                      {selectedOrder.selectedOptions.map((option, idx) => (
                        <li key={idx} className="flex justify-between text-sm">
                          <span>{option.name || 'Service Option'}</span>
                          <span>
                            {option.quantity} x {option.price || '€0'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Total Amount</span>
                <span className="font-bold">€{selectedOrder.grandTotal}</span>
              </div>

              {selectedOrder.scheduledDate && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Scheduled For</span>
                  <span>
                    {formatDate(selectedOrder.scheduledDate)}
                    {selectedOrder.timeSlot?.start &&
                    selectedOrder.timeSlot?.end
                      ? ` ${selectedOrder.timeSlot.start}-${selectedOrder.timeSlot.end}`
                      : ''}
                  </span>
                </div>
              )}

              {selectedOrder.address && (
                <div className="py-2 border-b">
                  <p className="font-medium mb-2">Delivery Address:</p>
                  <p className="text-sm">
                    {[
                      selectedOrder.address.street,
                      selectedOrder.address.city,
                      selectedOrder.address.zipCode,
                      selectedOrder.address.country,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Link
                  to={`/orders/${selectedOrder._id}`}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  View Full Details <ExternalLink size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
