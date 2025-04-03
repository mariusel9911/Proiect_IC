import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

// Responsive Service Circle Component
const ServiceCircle = ({ service, index, total, baseRadius, screenWidth }) => {
  // Calculate responsive radius based on screen width
  const radius =
    screenWidth < 768
      ? baseRadius * 0.6
      : screenWidth < 1024
      ? baseRadius * 0.8
      : baseRadius;

  // Calculate circle size based on screen width
  const circleSize =
    screenWidth < 768
      ? 'w-20 h-20'
      : screenWidth < 1024
      ? 'w-24 h-24'
      : 'w-28 h-28';

  // Calculate angle starting from the top position (270 degrees)
  const angle = 270 + (index * 360) / total;
  const radian = (angle * Math.PI) / 180;

  return (
    <motion.div
      key={service.id}
      className="absolute"
      style={{
        left: `calc(50% + ${radius * Math.cos(radian)}px)`,
        top: `calc(50% + ${radius * Math.sin(radian)}px)`,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 10,
        delay: index * 0.1,
      }}
      whileHover={{ scale: 1.1 }}
    >
      <Link to={`/service/${service.id}`}>
        <div
          className={`${circleSize} rounded-full border-4 border-gray-100 bg-white shadow-lg flex items-center justify-center hover:bg-blue-50 transition-colors`}
        >
          <p className="text-gray-700 font-semibold text-sm text-center">
            {service.name}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

const HomePage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const services = [
    { id: 1, name: 'Service 1' },
    { id: 2, name: 'Service 2' },
    { id: 3, name: 'Service 3' },
    { id: 4, name: 'Service 4' },
    { id: 5, name: 'Service 5' },
    { id: 6, name: 'Main Service' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex flex-col items-center justify-between">
      {/* Header */}
      <header className="w-full p-4 md:p-6 bg-white shadow-lg flex justify-between items-center px-4 md:px-12 sticky top-0 z-50">
        <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg shadow-md"></div>
        <input
          type="text"
          placeholder="Search..."
          className="w-1/2 p-2 md:p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
        />
        <button
          onClick={handleLogout}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 md:px-8 md:py-3 rounded-xl shadow-md hover:shadow-lg transition-all text-sm md:text-base"
        >
          Logout
        </button>
      </header>

      {/* Flower Layout */}
      <main className="flex-grow flex items-center justify-center w-full h-[600px] md:h-[800px]">
        {/* Principal div (80% of screen width) */}
        <div className="relative w-[90vw] md:w-[80vw] max-w-6xl h-[400px] md:h-[600px] bg-white rounded-3xl shadow-2xl flex items-center justify-center">
          {/* Centered container for the circles - responsive width and left margin */}
          <div
            className={`relative flex items-center justify-center ${containerMargin}`}
            style={{
              width: `${containerWidth}px`,
              height: `${containerWidth}px`,
            }}
          >
            {/* Service Circles */}
            {services.slice(0, 5).map((service, index) => (
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
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 100, damping: 10 }}
            >
              <Link to={`/service/${services[5].id}`}>
                <div
                  className={`${mainCircleSize} rounded-full border-4 border-gray-100 bg-white shadow-2xl flex items-center justify-center hover:bg-blue-50 transition-colors`}
                >
                  <p className="text-gray-700 font-semibold text-sm md:text-base text-center">
                    {services[5].name}
                  </p>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full p-4 md:p-8 bg-white/80 backdrop-blur-sm text-center rounded-t-3xl shadow-lg flex flex-col items-center">
        <div className="w-48 md:w-72 h-3 md:h-4 bg-gradient-to-r from-blue-500 to-purple-500 mb-4 md:mb-6 rounded-full shadow"></div>
        <Link
          to="/login"
          className="text-blue-600 flex items-center justify-center text-base md:text-xl font-semibold hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="mr-2" /> Back to Login
        </Link>
      </footer>
    </div>
  );
};

export default HomePage;
