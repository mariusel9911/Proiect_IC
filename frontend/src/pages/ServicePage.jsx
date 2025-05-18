import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Tag,
  User,
  Building,
  LogOut,
  ShoppingCart,
  LayoutDashboard,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useServiceStore } from '../store/serviceStore';
import { useProviderStore } from '../store/providerStore';
import { useUserAddressStore } from '../store/userAddressStore';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import DebugView from '../components/DebugView'; // Import debug component
import LocationSelector from '../components/LocationSelector';
import toast from 'react-hot-toast';
import ProfileHeader from "../components/ProfileHeader.jsx";

const ServicePage = () => {
  const { serviceId } = useParams();
  const { user, logout } = useAuthStore();
  const {
    currentService,
    fetchServiceById,
    clearCurrentService,
    error: serviceError,
  } = useServiceStore();
  const {
    providers,
    fetchProvidersForService,
    isLoading: providersLoading,
    error: providersError,
  } = useProviderStore();

  const { address, updateUserAddress, setAddressLocally } =
    useUserAddressStore();

  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [providerTypes, setProviderTypes] = useState([
    { id: 'person', name: 'Persons', icon: <User size={20} /> },
    { id: 'company', name: 'Companies', icon: <Building size={20} /> },
  ]);
  const [selectedType, setSelectedType] = useState(null);
  const [showDebug, setShowDebug] = useState(false); // Toggle for debug info

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Add key press handler for debug mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Shift+D to toggle debug mode
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setShowDebug((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch service data
  useEffect(() => {
    console.log('Fetching service with ID:', serviceId);
    fetchServiceById(serviceId);
    fetchProvidersForService(serviceId);

    // Cleanup function
    return () => {
      clearCurrentService();
    };
  }, [
    serviceId,
    fetchServiceById,
    fetchProvidersForService,
    clearCurrentService,
  ]);

  // Handle errors
  useEffect(() => {
    if (serviceError) {
      toast.error(`Service error: ${serviceError}`);
    }
    if (providersError) {
      toast.error(`Provider error: ${providersError}`);
    }
  }, [serviceError, providersError]);

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

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  // Add debug logs
  useEffect(() => {
    console.log('Current service:', currentService);
    console.log('Providers:', providers);
  }, [currentService, providers]);

  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      provider.name.toLowerCase().includes(search.toLowerCase()) ||
      provider.title.toLowerCase().includes(search.toLowerCase()) ||
      (provider.description &&
        provider.description.toLowerCase().includes(search.toLowerCase()));

    const matchesType = selectedType ? provider.type === selectedType : true;
    return matchesSearch && matchesType;
  });

  if (providersLoading || !currentService) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner text="Loading service details..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex flex-col items-center justify-between">
      <div className="w-full bg-white flex flex-col">
        <div className="w-full p-3 bg-white shadow-lg flex justify-center items-center">
          <Link to="/" className="text-blue-600 flex items-center mr-4">
            <ArrowLeft className="mr-1" /> Back
          </Link>
          <ProfileHeader size="md" />

          {/* Replace the static address display with LocationSelector */}
          <LocationSelector
              initialAddress={address ? {
                ...address,
                coordinates: address.coordinates || { lat: null, lng: null }
              } : null}
              onSelectAddress={handleAddressSelect}
          />

          {/* Updated icon-based buttons consistent with HomePage */}
          <div className="flex items-center gap-4">
            {user && user.isAdmin && (
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
            placeholder="Search providers..."
            value={search}
            onChange={handleSearch}
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

      <main className="flex-grow flex items-center justify-center w-full h-[600px] md:h-[800px]">
        <div className="relative w-[90vw] md:w-[80vw] max-w-6xl h-[400px] md:h-[600px] bg-white rounded-3xl shadow-2xl p-6">
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {currentService.name}
              </h1>
              <div className="text-gray-600">
                {filteredProviders.length} / {providers.length}
              </div>
            </div>

            {/* Debug section (only visible when triggered) */}
            {showDebug && (
              <div className="mb-4">
                <DebugView data={currentService} title="Service Data" />
                <DebugView data={providers[0]} title="First Provider Sample" />
              </div>
            )}

            {/* Service description */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">{currentService.description}</p>
              <div className="mt-2">
                <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  {currentService.type}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-6 mb-8">
              {providerTypes.map((type) => (
                <div key={type.id} className="flex flex-col items-center">
                  <button
                    onClick={() =>
                      setSelectedType(selectedType === type.id ? null : type.id)
                    }
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-2 ${
                      selectedType === type.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 bg-white'
                    } flex items-center justify-center shadow-md hover:shadow-lg transition-all`}
                  >
                    <div className="flex items-center justify-center">
                      {type.icon}
                    </div>
                  </button>
                  <span className="mt-2 text-sm text-gray-700">
                    {type.name}
                  </span>
                </div>
              ))}
            </div>

            {providersLoading ? (
              <div className="flex-grow flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="flex-grow overflow-y-auto pr-2">
                <div className="flex flex-col gap-4">
                  {filteredProviders.length > 0 ? (
                    filteredProviders.map((provider) => {
                      // Use provider's processed options if available
                      const providerOptions =
                        provider.options || currentService.options;

                      // Show sample of first option if in debug mode
                      if (showDebug && providerOptions?.length > 0) {
                        console.log(
                          `Provider ${provider.name} first option:`,
                          providerOptions[0]
                        );
                      }

                      return (
                        <Link
                          to={`/cleaning/${serviceId}`}
                          key={provider._id || provider.id}
                          state={{
                            provider: {
                              ...provider,
                              // Include service with any processed options
                              service: {
                                ...currentService,
                                options: providerOptions,
                              },
                            },
                            serviceId,
                          }}
                        >
                          <div className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden cursor-pointer">
                            <div className="p-4 md:p-6 flex flex-col relative">
                              <h2 className="text-xl md:text-2xl font-semibold mb-2">
                                {provider.name}
                              </h2>
                              <div className="bg-gray-800 h-10 w-3/4 rounded mb-4">
                                <div className="text-white text-sm p-2 truncate">
                                  {provider.title}
                                </div>
                              </div>

                              <p className="text-gray-600 mb-4">
                                {provider.description}
                              </p>

                              {/* Show a sample of pricing if available */}
                              {showDebug && providerOptions?.length > 0 && (
                                <div className="bg-gray-100 p-2 mb-3 rounded">
                                  <p className="text-xs text-gray-600">
                                    Example pricing:
                                  </p>
                                  <p className="text-sm">
                                    {providerOptions[0].name}:{' '}
                                    {providerOptions[0].price}
                                  </p>
                                </div>
                              )}

                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  {provider.isPopular && (
                                    <div className="flex items-center text-blue-600 mr-4">
                                      <Tag size={16} className="mr-1" />
                                      <span className="text-sm font-medium">
                                        HOT
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center text-amber-500">
                                    <span className="text-sm font-medium mr-1">
                                      ★
                                    </span>
                                    <span className="text-sm text-gray-700">
                                      {provider.rating || 'New'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 bg-white rounded-xl shadow-md">
                      No providers found matching your criteria.
                    </div>
                  )}
                </div>
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

        <footer className="w-full p-4 md:p-8 bg-white text-center shadow-lg flex flex-col items-center relative z-20 mt-[-30px] rounded-t-[30px]">
          <Link
            to="/"
            className="text-blue-600 flex items-center justify-center text-base md:text-xl font-semibold hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="mr-2" /> Back to Home
          </Link>
        </footer>
      </div>
    </div>
  );
};

export default ServicePage;
