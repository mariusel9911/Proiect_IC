import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

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

  // Get service ID
  const serviceId = service._id || service.id;

  return (
    <motion.div
      key={serviceId}
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
      <Link to={`/service/${serviceId}`}>
        <div
          className={`${circleSize} rounded-full border-4 border-gray-100 bg-white shadow-lg flex items-center justify-center hover:bg-blue-50 transition-colors`}
        >
          <p className="text-gray-700 font-semibold text-sm text-center px-2">
            {service.name}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default ServiceCircle;
