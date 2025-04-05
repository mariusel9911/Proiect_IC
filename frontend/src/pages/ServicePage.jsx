import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Tag, User, Building } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import SearchBar from '../components/SearchBar';

const ServicePage = () => {
  const { serviceId } = useParams();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [service, setService] = useState(null);
  const [providers, setProviders] = useState([]);
  const [search, setSearch] = useState('');
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [providerTypes, setProviderTypes] = useState([
    { id: 'person', name: 'Persons', icon: <User size={20} /> },
    { id: 'company', name: 'Companies', icon: <Building size={20} /> },
  ]);
  const [selectedType, setSelectedType] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    setIsLoading(true);

    const fetchServiceData = async () => {
      try {
        // This would be API call

        const mockService = {
          id: serviceId,
          name: `Service ${serviceId}`,
          description:
            'This is a service description that provides detailed information about what the service offers.',
        };

        // Mock providers offering this service - will come from backend
        const mockProviders = [
          {
            id: 1,
            name: 'John Smith',
            title: 'Professional Consultant',
            description:
              'Experienced professional with 10+ years in the industry',
            price: 'FREE',
            type: 'person',
            rating: 4.8,
            isPopular: true,
            image: '/api/placeholder/80/80',
          },
          {
            id: 2,
            name: 'ABC Corporation',
            title: 'Enterprise Solutions',
            description:
              'Leading company providing comprehensive business solutions',
            price: 'FREE',
            type: 'company',
            rating: 4.5,
            image: '/api/placeholder/80/80',
          },
          {
            id: 3,
            name: 'Sarah Johnson',
            title: 'Expert Provider',
            description:
              'Specialized in delivering high-quality personalized service',
            price: 'FREE',
            type: 'person',
            rating: 4.9,
            image: '/api/placeholder/80/80',
          },
          {
            id: 4,
            name: 'XYZ Solutions',
            title: 'Technical Support',
            description:
              'Premium technical support and implementation services',
            price: 'FREE',
            type: 'company',
            rating: 4.3,
            isPopular: true,
            image: '/api/placeholder/80/80',
          },
        ];

        setService(mockService);
        setProviders(mockProviders);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching service data:', error);
        setIsLoading(false);
      }
    };

    fetchServiceData();
  }, [serviceId]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      provider.name.toLowerCase().includes(search.toLowerCase()) ||
      provider.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType ? provider.type === selectedType : true;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="p-8 bg-white rounded-xl shadow-lg text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">Loading service providers...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="p-8 bg-white rounded-xl shadow-lg text-center">
          <p className="text-gray-700">Service not found</p>
          <Link to="/" className="text-blue-600 mt-4 inline-block">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex flex-col items-center justify-between">
      <div className="w-full bg-white flex flex-col">
        <div className="w-full p-3 bg-white shadow-lg flex justify-center items-center">
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
            placeholder="Search providers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <main className="flex-grow flex items-center justify-center w-full h-[600px] md:h-[800px]">
        <div className="relative w-[90vw] md:w-[80vw] max-w-6xl h-[400px] md:h-[600px] bg-white rounded-3xl shadow-2xl p-6">
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {service.name}
              </h1>
              <div className="text-gray-600">
                {filteredProviders.length} / {providers.length}
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

            <div className="flex-grow overflow-y-auto pr-2">
              <div className="flex flex-col gap-4">
                {filteredProviders.length > 0 ? (
                  filteredProviders.map((provider) => (
                    <div
                      key={provider.id}
                      className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden"
                    >
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

                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {provider.isPopular && (
                              <div className="flex items-center text-blue-600 mr-4">
                                <Tag size={16} className="mr-1" />
                                <span className="text-sm font-medium">HOT</span>
                              </div>
                            )}
                            <div className="flex items-center text-amber-500">
                              <span className="text-sm font-medium mr-1">
                                ★
                              </span>
                              <span className="text-sm text-gray-700">
                                {provider.rating}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-green-600 font-bold">
                              {provider.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl shadow-md">
                    No providers found matching your criteria.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="relative w-full">
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
