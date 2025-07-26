import React, { useState } from 'react';
import { FiUser } from 'react-icons/fi';

interface AvatarProps {
  username: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  showOnlineIndicator?: boolean;
  isOnline?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ 
  username, 
  size = 'md', 
  className = '', 
  onClick,
  showOnlineIndicator = false,
  isOnline = false
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-24 h-24 text-3xl'
  };

  const indicatorSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError) {
    // Fallback avatar with user icon
    return (
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center text-gray-600 border-2 border-white ${className}`}
          onClick={onClick}
          style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
          <FiUser className="w-1/2 h-1/2" />
        </div>
        {showOnlineIndicator && isOnline && (
          <span className={`absolute bottom-0 right-0 ${indicatorSizes[size]} bg-green-500 border-2 border-white rounded-full`}></span>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(username || "user")}`}
        alt={`${username} avatar`}
        className={`${sizeClasses[size]} rounded-full bg-gray-200 object-cover border-2 border-white ${className}`}
        onError={handleImageError}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      />
      {showOnlineIndicator && isOnline && (
        <span className={`absolute bottom-0 right-0 ${indicatorSizes[size]} bg-green-500 border-2 border-white rounded-full`}></span>
      )}
    </div>
  );
};

export default Avatar; 