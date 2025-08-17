import React from 'react';

const ParkSathiLogo = ({ className = "h-8 w-auto", showText = true }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon */}
      <div className="relative">
        <svg
          width="40"
          height="32"
          viewBox="0 0 40 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-10"
        >
          {/* Mobile Phone (laying flat) */}
          <rect
            x="4"
            y="16"
            width="32"
            height="12"
            rx="3"
            ry="3"
            fill="#1E3A8A"
          />
          
          {/* Phone Screen */}
          <rect
            x="6"
            y="18"
            width="28"
            height="8"
            rx="1"
            ry="1"
            fill="#3B82F6"
          />
          
          {/* Car Body (on top of phone) */}
          <rect
            x="14"
            y="8"
            width="12"
            height="6"
            rx="2"
            ry="2"
            fill="#2563EB"
          />
          
          {/* Car Wheels */}
          <circle
            cx="17"
            cy="16"
            r="2"
            fill="#374151"
          />
          <circle
            cx="23"
            cy="16"
            r="2"
            fill="#374151"
          />
        </svg>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold text-gray-800 leading-tight">
            Park<span className="text-blue-600">Sathi</span>
          </span>
          <span className="text-xs text-gray-500 font-medium">
            Smart Parking Solutions
          </span>
        </div>
      )}
    </div>
  );
};

export default ParkSathiLogo;