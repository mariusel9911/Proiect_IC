import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Grid, Search } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useServiceStore } from '../store/serviceStore';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AllServicesPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { services, fetchServices, isLoading, error } = useServiceStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (services) {
      setFilteredServices(
        services.filter(
          (service) =>
            service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            service.type.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [services, searchQuery]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
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
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center py-8 px-4">
        <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              All Services
            </h1>
            <div className="text-gray-600">
              {filteredServices.length} service
              {filteredServices.length !== 1 && 's'}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <LoadingSpinner />
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
            <div className="flex flex-col items-center justify-center text-gray-500 mt-10">
              <Search size={48} className="mb-4 text-gray-400" />
              <p className="text-xl font-semibold mb-2">No services found</p>
              <p className="text-center mb-6">
                {searchQuery
                  ? "We couldn't find any services matching your search."
                  : 'There are no services available at the moment.'}
              </p>
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

export default AllServicesPage;
