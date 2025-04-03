import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react'
import ServiceCircle from "../components/ServiceCircle";
import SearchBar from "../components/SearchBar";

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

  const handleLogout = () => {
    logout();
    navigate('/login');
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
  const services = [
    { id: 1, name: 'Service 1' },
    { id: 2, name: 'Service 2' },
    { id: 3, name: 'Service 3' },
    { id: 4, name: 'Service 4' },
    { id: 5, name: 'Service 5' },
    { id: 6, name: 'Main Service' },
  ];

  return (

    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex-col items-center justify-between">

      <div className={"w-full bg-white flex flex-col"}>
        <div className={"w-full p-3 bg-white shadow-lg flex justify-center items-center"}>
          <div className="w-10 h-10 md:w-14 md:h-14  bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg shadow-md"></div>
          <div className="w-3/4 py-2.5 text-center pl-12 pr-4 ml-8 mr-6">My very special address...</div>
          <button
              onClick={handleLogout}
              className="bg-blue-600 text-white px-4 py-2 md:px-8 md:py-3 rounded-xl shadow-md hover:shadow-lg transition-all text-sm md:text-base"
          >
            Logout
          </button>
        </div>

        <div className="w-full p-4 md:p-6 bg-white shadow-lg flex justify-center items-center px-4 md:px-12 sticky top-0 z-50">
          <SearchBar placeholder="Search..."/>
        </div>
      </div>

      {/* Flower Layout */}
      <main className="flex-grow flex items-center justify-center w-full h-[600px] md:h-[800px]">
        {/* Principal div (80% of screen width) */}
        <div className="relative w-[90vw] md:w-[80vw] max-w-6xl h-[400px] md:h-[600px] bg-white rounded-3xl shadow-2xl flex items-center justify-center">
          {/* Centered container for the circles - responsive width and left margin */}
          <div
              className={`relative flex items-center justify-center ${containerMargin} mt-[50px] md:mt-[-100px]`}
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

      <div className="relative w-full">
        {/* SVG Arch */}
        <div className="absolute top-[-70px] left-0 w-full h-[100px] overflow-hidden z-10">
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
        <footer className="w-full p-4 md:p-8 bg-white text-center shadow-lg flex flex-col items-center relative z-20 mt-[60px] rounded-t-[30px]">
          <Link
              to="/login"
              className="text-blue-600 flex items-center justify-center text-base md:text-xl font-semibold hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="mr-2" /> Back to Login
          </Link>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
