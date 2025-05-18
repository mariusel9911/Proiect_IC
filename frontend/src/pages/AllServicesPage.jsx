import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  LogOut,
  ShoppingCart,
  LayoutDashboard,
  Grid,
  Search,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useServiceStore } from '../store/serviceStore';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { useUserAddressStore } from '../store/userAddressStore.js';
import LocationSelector from '../components/LocationSelector.jsx';
import ProfileHeader from "../components/ProfileHeader.jsx";

const AllServicesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { services, fetchServices, searchServices, isLoading, error } =
    useServiceStore();
  const { address, updateUserAddress, setAddressLocally } =
    useUserAddressStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Get search query from URL if present
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const queryFromUrl = queryParams.get('query');

    if (queryFromUrl) {
      setSearchQuery(queryFromUrl);
    }
  }, [location.search]);

  // Initial fetch of services
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Filter services based on search query
  useEffect(() => {
    if (services && searchQuery) {
      setIsSearching(true);
      const filtered = services.filter(
        (service) =>
          service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          service.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredServices(filtered);
      setIsSearching(false);
    } else {
      setFilteredServices(services || []);
    }
  }, [services, searchQuery]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddressSelect = (addressData, formattedAddr) => {
    // Update the address in store
    setAddressLocally(addressData, formattedAddr);

    // Save to backend
    updateUserAddress(addressData);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);

    // If search is cleared, reset URL
    if (!e.target.value.trim()) {
      navigate('/all-services', { replace: true });
    } else {
      // Update URL with search query
      navigate(`/all-services?query=${encodeURIComponent(e.target.value)}`, {
        replace: true,
      });
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      navigate('/all-services', { replace: true });
    } else {
      navigate(`/all-services?query=${encodeURIComponent(query)}`, {
        replace: true,
      });
    }
  };

  // Group services by type
  const groupedServices = filteredServices.reduce((groups, service) => {
    const type = service.type || 'Other';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(service);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex-col items-center justify-between">
      {/* Top bar */}
      <div className={'w-full bg-white flex flex-col'}>
        <div
          className={
            'w-full p-3 bg-white shadow-lg flex justify-center items-center'
          }
        >
          <ProfileHeader size="md" />
          {/* LocationSelector component */}
          <LocationSelector
              initialAddress={address ? {
                ...address,
                coordinates: address.coordinates || { lat: null, lng: null }
              } : null}
              onSelectAddress={handleAddressSelect}
          />

          {/* Using the same icon styling as HomePage */}
          <div className="flex items-center gap-4">
            {user.isAdmin && (
              <Link
                to="/admin/dashboard"
                className="bg-white text-gray-700 p-2 rounded-full hover:shadow-lg hover:bg-gray-300 transition-all flex items-center justify-center"
                aria-label="Admin Dashboard"
                title="Admin Dashboard"
              >
                <LayoutDashboard size={20} />
              </Link>
            )}

            <Link
              to="/orders"
              className="hidden md:flex items-center justify-center text-gray-700 p-2 rounded-full hover:shadow-lg hover:bg-gray-300 transition-all"
              aria-label="My Orders"
              title="My Orders"
            >
              <ShoppingCart size={20} />
            </Link>

            <button
              onClick={handleLogout}
              className="bg-white text-gray-700 p-2 rounded-full hover:shadow-lg hover:bg-gray-300 transition-all flex items-center justify-center"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <div className="w-full p-4 md:p-6 bg-white shadow-lg flex justify-center items-center px-4 md:px-12 sticky top-0 z-10">
          <SearchBar
            placeholder="Search services..."
            value={searchQuery}
            onChange={handleSearchChange}
            onSearch={handleSearch}
          />
        </div>
      </div>

      {/* Mobile-only orders link */}
      <div className="md:hidden w-full flex justify-center mt-4">
        <Link
          to="/orders"
          className="px-5 py-2 text-blue-600 bg-white rounded-lg shadow-md hover:bg-blue-50 transition-colors flex items-center"
        >
          View My Orders
        </Link>
      </div>

      {/* Main Content - FIXED HEIGHT CONTAINER */}
      <main className="flex-grow flex flex-col items-center py-8 px-4 w-full">
        <div
          className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl p-6"
          style={{ height: '650px' }}
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              All Services
            </h1>
            <div className="text-gray-600">
              {filteredServices.length} service
              {filteredServices.length !== 1 && 's'}
            </div>
          </div>

          {/* Content area with fixed height */}
          <div className="overflow-auto" style={{ height: '550px' }}>
            {isLoading || isSearching ? (
              <div className="flex justify-center items-center h-full">
                <LoadingSpinner
                  text={
                    searchQuery
                      ? `Searching for "${searchQuery}"...`
                      : 'Loading services...'
                  }
                />
              </div>
            ) : filteredServices.length > 0 ? (
              <div className="space-y-8">
                {Object.entries(groupedServices).map(([type, services]) => (
                  <div key={type} className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-700 border-b border-gray-200 pb-2">
                      {type}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {services.map((service) => (
                        <Link
                          to={`/service/${service._id}`}
                          key={service._id}
                          className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all bg-white p-4 flex flex-col"
                        >
                          <div className="flex items-center mb-3">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <Grid className="text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-lg">
                              {service.name}
                            </h3>
                          </div>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {service.description}
                          </p>
                          <div className="mt-auto">
                            <span className="text-sm font-medium text-blue-600">
                              {service.type}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Search size={40} className="text-gray-300" />
                </div>
                <h2 className="text-xl font-medium mb-2 text-gray-700">
                  No services found
                </h2>
                <p className="text-center text-gray-500 mb-6">
                  {searchQuery
                    ? `We couldn't find any services matching "${searchQuery}"`
                    : 'There are no services available at the moment.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      navigate('/all-services', { replace: true });
                    }}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    View All Services
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="relative w-full">
        {/* SVG Arch */}
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

        {/* Footer */}
        <footer className="w-full p-4 md:p-8 bg-white text-center shadow-lg flex flex-col items-center relative z-20 mt-[-30px] rounded-t-[30px]">
          <Link
            to="/"
            className="text-blue-600 flex items-center justify-center text-base md:text-xl font-semibold hover:text-purple-600 transition-colors"
          >
            Back to Home <ArrowLeft className="ml-2" />
          </Link>
        </footer>
      </div>
    </div>
  );
};

export default AllServicesPage;
