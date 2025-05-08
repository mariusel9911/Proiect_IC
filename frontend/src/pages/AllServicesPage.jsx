import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Grid, Search } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useServiceStore } from '../store/serviceStore';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AllServicesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { services, fetchServices, searchServices, isLoading, error } =
    useServiceStore();
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex flex-col">
      {/* Top bar */}
      <div className="w-full bg-white flex flex-col">
        <div className="w-full p-4 flex items-center shadow-md">
          <Link to="/" className="text-blue-600 flex items-center mr-4">
            <ArrowLeft className="mr-1" /> Back to Home
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
            placeholder="Search services..."
            value={searchQuery}
            onChange={handleSearchChange}
            onSearch={handleSearch}
          />
        </div>
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

      {/* Footer */}
      <div className="w-full bg-white mt-8 p-6 shadow-md">
        <Link
          to="/"
          className="text-blue-600 flex items-center justify-center font-semibold hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="mr-2" /> Back to Home
        </Link>
      </div>
    </div>
  );
};

export default AllServicesPage;
