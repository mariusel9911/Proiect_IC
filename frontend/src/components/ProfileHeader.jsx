import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProfileHeader = ({ size = 'md', showName = false }) => {
    const { user } = useAuthStore();
    const [profileImage, setProfileImage] = useState(null);

    // Size classes based on the size prop
    const sizeClasses = {
        sm: 'w-8 h-8 md:w-10 md:h-10',
        md: 'w-10 h-10 md:w-14 md:h-14',
        lg: 'w-14 h-14 md:w-20 md:h-20',
    };

    // Icon sizes based on the size prop
    const iconSizes = {
        sm: 'w-4 h-4 md:w-5 md:h-5',
        md: 'w-5 h-5 md:w-7 md:h-7',
        lg: 'w-7 h-7 md:w-10 md:h-10',
    };

    // Attempt to load profile image from localStorage on component mount
    useEffect(() => {
        const savedProfileImage = localStorage.getItem('profileImage');
        if (savedProfileImage) {
            setProfileImage(savedProfileImage);
        }
    }, []);

    return (
        <Link
            to="/profile"
            className="flex items-center"
        >
            {/* Profile Image Container */}
            <div
                className={`${sizeClasses[size]} bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-md flex items-center justify-center overflow-hidden`}
            >
                {profileImage ? (
                    <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <User className={`${iconSizes[size]} text-white`} />
                )}
            </div>

            {/* Show name if required */}
            {showName && user && (
                <span className="ml-2 text-gray-800 font-medium">
          {user.name || 'User'}
        </span>
            )}
        </Link>
    );
};

export default ProfileHeader;