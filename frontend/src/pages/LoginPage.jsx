import { useState, useEffect } from 'react'; // Added useEffect for event listener
import { motion } from 'framer-motion';
import { User, Loader, Lock, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import Input from '../components/Input.jsx';
import { useAuthStore } from '../store/authStore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin(e);
    }
  };

  useEffect(() => {
    const handleEnter = (e) => handleKeyPress(e);
    document.addEventListener('keydown', handleEnter);
    return () => document.removeEventListener('keydown', handleEnter); // Cleanup
  }, [isLoading]);

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-white bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-500">
            Login
          </h2>

          <form onSubmit={handleLogin}>
            <Input
                icon={Mail}
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
            />

            <Input
                icon={Lock}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
            />

            <div className="flex items-center mb-6">
              <Link
                  to="/forgot-password"
                  className="text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            {error && <p className="text-red-500 font-semibold mb-2">{error}</p>}
          </form>
        </div>

        <div className="px-8 py-4 bg-gray-200 bg-opacity-50">
          <div className="flex justify-start mb-2">
            <p className="text-sm text-gray-600">Don't have an account yet?</p>
          </div>
          <div className="flex justify-between items-center">
            <Link to="/signup">
              <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="py-2 px-4 bg-blue-600 text-white font-bold rounded-lg focus:outline-none transition duration-200"
              >
                SIGN UP
              </motion.button>
            </Link>
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="py-2 px-4 bg-blue-600 text-white font-bold rounded-lg focus:outline-none transition duration-200"
                onClick={handleLogin}
                disabled={isLoading}
            >
              {isLoading ? (
                  <Loader className="w-6 h-6 animate-spin mx-auto" />
              ) : (
                  'Log In'
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
  );
};

export default LoginPage;