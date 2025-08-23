import React from 'react';

const ParkSathiLogo = ({ className = "h-8 w-auto", showText = true }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon */}
      <div className="relative">
        <span className="text-4xl">🚗</span>
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