import React from 'react';

const ParkSathiLogo = ({ className = "h-8 w-auto", showText = true }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon */}
      <div className="relative">
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12"
        >
          {/* Mobile Phone Base */}
          <rect
            x="8"
            y="12"
            width="32"
            height="24"
            rx="4"
            ry="4"
            fill="#1E3A8A"
            stroke="#1D4ED8"
            strokeWidth="1"
          />
          
          {/* Phone Screen */}
          <rect
            x="10"
            y="14"
            width="28"
            height="18"
            rx="2"
            ry="2"
            fill="#3B82F6"
          />
          
          {/* Screen Gradient Overlay */}
          <rect
            x="10"
            y="14"
            width="28"
            height="18"
            rx="2"
            ry="2"
            fill="url(#screenGradient)"
          />
          
          {/* Phone Home Button */}
          <circle
            cx="24"
            cy="38"
            r="2"
            fill="#1E3A8A"
          />
          
          {/* Car Body */}
          <ellipse
            cx="24"
            cy="18"
            rx="12"
            ry="4"
            fill="#2563EB"
            transform="rotate(-5 24 18)"
          />
          
          {/* Car Main Body */}
          <rect
            x="14"
            y="15"
            width="20"
            height="6"
            rx="3"
            ry="3"
            fill="#3B82F6"
            transform="rotate(-5 24 18)"
          />
          
          {/* Car Windshield */}
          <rect
            x="16"
            y="16"
            width="16"
            height="4"
            rx="2"
            ry="2"
            fill="#60A5FA"
            transform="rotate(-5 24 18)"
          />
          
          {/* Car Windows */}
          <rect
            x="17"
            y="16.5"
            width="6"
            height="3"
            rx="1.5"
            ry="1.5"
            fill="#93C5FD"
            transform="rotate(-5 20 18)"
          />
          <rect
            x="25"
            y="16.5"
            width="6"
            height="3"
            rx="1.5"
            ry="1.5"
            fill="#93C5FD"
            transform="rotate(-5 28 18)"
          />
          
          {/* Car Front Lights */}
          <circle
            cx="33"
            cy="17"
            r="1.5"
            fill="#FBBF24"
            transform="rotate(-5 24 18)"
          />
          <circle
            cx="33"
            cy="19"
            r="1.5"
            fill="#FBBF24"
            transform="rotate(-5 24 18)"
          />
          
          {/* Car Wheels */}
          <circle
            cx="18"
            cy="21"
            r="2.5"
            fill="#374151"
            transform="rotate(-5 24 18)"
          />
          <circle
            cx="30"
            cy="21"
            r="2.5"
            fill="#374151"
            transform="rotate(-5 24 18)"
          />
          
          {/* Wheel Rims */}
          <circle
            cx="18"
            cy="21"
            r="1.5"
            fill="#9CA3AF"
            transform="rotate(-5 24 18)"
          />
          <circle
            cx="30"
            cy="21"
            r="1.5"
            fill="#9CA3AF"
            transform="rotate(-5 24 18)"
          />
          
          {/* Motion Lines */}
          <line
            x1="6"
            y1="16"
            x2="10"
            y2="16"
            stroke="#60A5FA"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="5"
            y1="19"
            x2="9"
            y2="19"
            stroke="#60A5FA"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="4"
            y1="22"
            x2="8"
            y2="22"
            stroke="#60A5FA"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          
          {/* Parking Symbol on Screen */}
          <text
            x="24"
            y="26"
            textAnchor="middle"
            fontSize="8"
            fontWeight="bold"
            fill="white"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            P
          </text>
          
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#2563EB" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.9" />
            </linearGradient>
          </defs>
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