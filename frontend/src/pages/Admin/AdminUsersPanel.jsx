import { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, ShieldCheck, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAdminStore } from '../../store/adminStore';
import UserModal from '../../components/modals/UserModal';

const AdminUsersPanel = () => {
    const {
        users,
        isLoading,
        error,
        pagination,
        setPagination,
        fetchUsers,
        updateUser
    } = useAdminStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [showUserModal, setShowUserModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Fetch users on component mount
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers, pagination.page]);

    // Show error toast if there's an error from the store
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleUpdateUser = async (userId, updates) => {
        try {
            await updateUser(userId, updates);
            toast.success('User updated successfully');
        } catch (error) {
            // Error is shown from the store effect
        }
    };

    const handleEditUser = (user) => {
        setCurrentUser(user);
        setShowUserModal(true);
    };

    const handleUserSave = async (userData) => {
        try {
            if (currentUser && currentUser._id) {
                await updateUser(currentUser._id, userData);
                setShowUserModal(false);
            } else {
                toast.error('User ID is missing');
            }
        } catch (error) {
            // Error is shown from the store effect
        }
    };

    // Filter users based on search query
    const filteredUsers = users && users.length > 0
        ? users.filter((user) => {
            if (!searchQuery) return true;

            const searchLower = searchQuery.toLowerCase();

            return (
                (user.name?.toLowerCase() || '').includes(searchLower) ||
                (user.email?.toLowerCase() || '').includes(searchLower)
            );
        })
        : [];

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Never';

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

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">Manage Users</h2>

                    <div className="mt-4 md:mt-0 flex items-center space-x-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="p-6 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-purple-500 border-r-transparent"></div>
                    <p className="mt-2 text-gray-500">Loading users...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Joined
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Login
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
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user._id}>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-purple-200 flex items-center justify-center">
                                              <span className="text-purple-600 font-semibold">
                                                {user.name?.charAt(0)?.toUpperCase() || '?'}
                                              </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.name}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.email}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(user.createdAt)}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(user.lastLogin)}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex flex-col space-y-1">
                                            {user.isVerified ? (
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                  Verified
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                  Unverified
                                                </span>
                                            )}

                                            {user.isAdmin && (
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                                  Admin
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleUpdateUser(user._id, { isVerified: !user.isVerified })}
                                                className={`${
                                                    user.isVerified ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                                                }`}
                                                title={user.isVerified ? 'Mark as Unverified' : 'Mark as Verified'}
                                            >
                                                {user.isVerified ? <UserX size={18} /> : <UserCheck size={18} />}
                                            </button>

                                            <button
                                                onClick={() => handleUpdateUser(user._id, { isAdmin: !user.isAdmin })}
                                                className={`${
                                                    user.isAdmin ? 'text-red-600 hover:text-red-900' : 'text-blue-600 hover:text-blue-900'
                                                }`}
                                                title={user.isAdmin ? 'Remove Admin Rights' : 'Grant Admin Rights'}
                                            >
                                                <ShieldCheck size={18} />
                                            </button>

                                            <button
                                                onClick={() => handleEditUser(user)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title="Edit User"
                                            >
                                                <Edit size={18} />
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
                <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
                    <div className="flex-1 flex justify-between">
                        <button
                            onClick={() => pagination && setPagination({
                                ...pagination,
                                page: Math.max(1, pagination.page - 1)
                            })}
                            disabled={!pagination || pagination.page <= 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                        >
                            Previous
                        </button>

                        <div className="hidden md:flex">
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
                        </div>

                        <button
                            onClick={() => pagination && setPagination({
                                ...pagination,
                                page: Math.min(pagination.pages, pagination.page + 1)
                            })}
                            disabled={!pagination || pagination.page >= pagination.pages}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* User Edit Modal */}
            {showUserModal && (
                <UserModal
                    user={currentUser}
                    onClose={() => setShowUserModal(false)}
                    onSave={handleUserSave}
                />
            )}
        </div>
    );
};

export default AdminUsersPanel;