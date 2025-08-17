import React from 'react';

const LoadingSpinner = ({ size = 'large', message = 'Loading...', className = '' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xlarge: 'h-16 w-16'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl'
  };

  return (
    <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${className}`}>
      <div className="text-center">
        <div className="relative">
          {/* Main spinner */}
          <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto`}></div>
          
          {/* Secondary ring for more visual appeal */}
          <div className={`${sizeClasses[size]} border-2 border-transparent border-t-blue-300 rounded-full animate-spin absolute top-0 left-1/2 transform -translate-x-1/2`} style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
        </div>
        
        {message && (
          <p className={`mt-4 text-gray-600 ${textSizeClasses[size]}`}>
            {message}
          </p>
        )}
        
        {/* Animated dots */}
        <div className="flex justify-center mt-2 space-x-1">
          <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse"></div>
          <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

// Inline loading spinner for components
export const InlineSpinner = ({ size = 'small', className = '' }) => (
  <div className={`inline-flex items-center ${className}`}>
    <div className={`${sizeClasses[size]} border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin`}></div>
  </div>
);

// Button loading spinner
export const ButtonSpinner = ({ className = '' }) => (
  <div className={`inline-flex items-center ${className}`}>
    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default LoadingSpinner;