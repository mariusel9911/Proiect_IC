import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useServiceStore } from '../store/serviceStore';
import { useUserAddressStore } from '../store/userAddressStore';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LogOut, ShoppingCart, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import ServiceCircle from '../components/ServiceCircle';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import LocationSelector from '../components/LocationSelector';
import ProfileHeader from '../components/ProfileHeader';

const HomePage = () => {
  const {user, logout} = useAuthStore();
  const {services, fetchServices, isLoading, error} = useServiceStore();
  const {
    address,
    fetchUserAddress,
    updateUserAddress,
    setAddressLocally
  } = useUserAddressStore();

  const navigate = useNavigate();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [searchQuery, setSearchQuery] = useState('');

  // Track screen size changes
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Fetch services and user address on component mount
  useEffect(() => {
    fetchServices();
    fetchUserAddress();
  }, [fetchServices, fetchUserAddress]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = (query) => {
    // Navigate to all-services page with search query
    navigate(`/all-services?query=${encodeURIComponent(query)}`);
  };

  const handleAddressSelect = (addressData, formattedAddr) => {
    // Update the address in store
    setAddressLocally(addressData, formattedAddr);

    // Save to backend
    updateUserAddress(addressData);
  };

  // Calculate responsive values based on screen width
  const containerWidth =
      screenWidth < 768 ? 300 : screenWidth < 1024 ? 400 : 500;

  const containerMargin =
      screenWidth < 768 ? '-ml-12' : screenWidth < 1024 ? '-ml-20' : '-ml-32';

  const mainCircleSize =
      screenWidth < 768
          ? 'w-24 h-24'
          : screenWidth < 1024
              ? 'w-32 h-32'
              : 'w-36 h-36';

  const baseRadius = screenWidth < 768 ? 120 : screenWidth < 1024 ? 150 : 180;

  // Filter and prepare services for display
  const mainService =
      services.length > 0 ? services[0] : {id: 'main', name: 'Main Service'};
  const otherServices = services.slice(1, 6).map((service) => ({
    id: service._id || service.id,
    name: service.name,
  }));

  // Fill remaining slots with placeholder services if needed
  while (otherServices.length < 5) {
    otherServices.push({
      id: `placeholder-${otherServices.length}`,
      name: `Service ${otherServices.length + 1}`,
    });
  }

  // Combine main service with others for display
  const displayServices = [
    ...otherServices,
    {id: mainService._id || mainService.id, name: mainService.name},
  ];

  return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex-col items-center justify-between">
        <div className={'w-full bg-white flex flex-col'}>
          <div
              className={
                'w-full p-3 bg-white shadow-lg flex justify-center items-center'
              }
          >

          <ProfileHeader size="md" />

          {/* Replace the static address display with LocationSelector */}
            <LocationSelector
                initialAddress={address ? {
                  ...address,
                  coordinates: address.coordinates || { lat: null, lng: null }
                } : null}
                onSelectAddress={handleAddressSelect}
            />

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

          <div
              className="w-full p-4 md:p-6 bg-white shadow-lg flex justify-center items-center px-4 md:px-12 sticky top-0 z-10">
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

        {isLoading ? (
            <div className="flex-grow flex items-center justify-center">
              <LoadingSpinner fullScreen={false} text="Loading services..."/>
            </div>
        ) : (
            /* Flower Layout */
            <main className="flex-grow flex items-center justify-center w-full h-[600px] md:h-[800px]">
              {/* Principal div (80% of screen width) */}
              <div
                  className="relative w-[90vw] md:w-[80vw] max-w-6xl h-[400px] md:h-[600px] bg-white rounded-3xl shadow-2xl flex items-center justify-center">
                {/* Centered container for the circles - responsive width and left margin */}
                <div
                    className={`relative flex items-center justify-center ${containerMargin} mt-[50px] md:mt-[-100px]`}
                    style={{
                      width: `${containerWidth}px`,
                      height: `${containerWidth}px`,
                    }}
                >
                  {/* Service Circles */}
                  {displayServices.slice(0, 5).map((service, index) => (
                      <ServiceCircle
                          key={service.id}
                          service={service}
                          index={index}
                          total={5}
                          baseRadius={baseRadius}
                          screenWidth={screenWidth}
                      />
                  ))}

                  {/* Main Center Service */}
                  <motion.div
                      className="absolute"
                      style={{
                        top: '47%',
                        left: '47%',
                        transform: 'translate(-50%, -50%)',
                      }}
                      initial={{scale: 0}}
                      animate={{scale: 1}}
                      transition={{type: 'spring', stiffness: 100, damping: 10}}
                  >
                    <Link to={`/service/${mainService._id || mainService.id}`}>
                      <div
                          className={`${mainCircleSize} rounded-full border-4 border-gray-100 bg-white shadow-2xl flex items-center justify-center hover:bg-blue-50 transition-colors`}
                      >
                        <p className="text-gray-700 font-semibold text-sm md:text-base text-center px-2">
                          {mainService.name}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </main>
        )}

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
          <footer
              className="w-full p-4 md:p-8 bg-white text-center shadow-lg flex flex-col items-center relative z-20 mt-[-30px] rounded-t-[30px]">
            <Link
                to="/all-services"
                className="text-blue-600 flex items-center justify-center text-base md:text-xl font-semibold hover:text-purple-600 transition-colors"
            >
              View All Services <ArrowRight className="ml-2"/>
            </Link>
          </footer>
        </div>
      </div>
  );
}

export default HomePage;