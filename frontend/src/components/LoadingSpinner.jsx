import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen w-screen bg-gray-100 flex items-center justify-center relative overflow-hidden">
      {/* Loading Spinner */}
      <motion.div
        className="w-16 h-16 border-4 border-t-4 border-t-blue-600 border-gray-200 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

export default LoadingSpinner;
