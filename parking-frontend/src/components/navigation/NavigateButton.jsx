import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractCoordinates } from '../../utils/navigationUtils';
import toast from 'react-hot-toast';

const NavigateButton = ({ 
  selectedSpot, 
  isActive = false, 
  className = '',
  onNavigationStart,
  size = 'medium' // 'small', 'medium', 'large'
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [hasValidCoordinates, setHasValidCoordinates] = useState(false);

  // Validate coordinates when spot changes
  useEffect(() => {
    if (!selectedSpot) {
      setHasValidCoordinates(false);
      return;
    }

    const coords = extractCoordinates(selectedSpot);
    setHasValidCoordinates(coords.valid);
    
    if (!coords.valid) {
      console.warn('⚠️ NavigateButton: Invalid coordinates for spot:', selectedSpot.name, coords.error);
    }
  }, [selectedSpot]);

  // Size configurations
  const sizeConfig = {
    small: {
      button: 'px-4 py-2 text-sm',
      icon: 'w-4 h-4',
      text: 'Navigate'
    },
    medium: {
      button: 'px-6 py-3 text-base',
      icon: 'w-5 h-5',
      text: 'Navigate Here'
    },
    large: {
      button: 'px-8 py-4 text-lg',
      icon: 'w-6 h-6',
      text: 'Start Navigation'
    }
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  const handleNavigateClick = async () => {
    if (!selectedSpot || !hasValidCoordinates) {
      toast.error('Please select a valid parking location first');
      return;
    }

    setIsLoading(true);

    try {
      // Get current location for navigation
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };

          console.log('🧭 NavigateButton: Starting navigation from:', currentLocation, 'to:', selectedSpot);

          // Notify parent component
          if (onNavigationStart) {
            onNavigationStart(selectedSpot, currentLocation);
          }

          // Navigate to full-screen navigation view
          navigate('/navigation', {
            state: {
              destination: selectedSpot,
              startLocation: currentLocation,
              journeyStartTime: new Date().toISOString(),
              source: 'navigate-button'
            }
          });

          toast.success(`🧭 Navigation started to ${selectedSpot.name}`);
        },
        (error) => {
          console.error('❌ NavigateButton: Location error:', error);
          let message = 'Unable to get your current location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied. Please enable location services.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out.';
              break;
          }
          
          toast.error(message);
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } catch (error) {
      console.error('❌ NavigateButton: Navigation failed:', error);
      toast.error(`Navigation failed: ${error.message}`);
      setIsLoading(false);
    }
  };

  const isButtonActive = isActive && selectedSpot && hasValidCoordinates;
  const isButtonDisabled = isLoading || !isButtonActive;

  return (
    <button
      onClick={handleNavigateClick}
      disabled={isButtonDisabled}
      className={`
        ${config.button}
        font-semibold rounded-lg transition-all duration-300 transform
        flex items-center justify-center space-x-2
        ${isButtonActive
          ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
        }
        ${isLoading ? 'animate-pulse' : ''}
        ${className}
      `}
      title={
        !selectedSpot
          ? 'Select a parking location first'
          : !hasValidCoordinates
          ? 'Invalid location coordinates'
          : isLoading
          ? 'Getting your location...'
          : `Navigate to ${selectedSpot.name}`
      }
    >
      {isLoading ? (
        <>
          <div className={`${config.icon} border-2 border-white border-t-transparent rounded-full animate-spin`}></div>
          <span>Getting Location...</span>
        </>
      ) : (
        <>
          <svg 
            className={`${config.icon} ${isButtonActive ? 'text-white' : 'text-gray-400'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V4m0 0L9 7" 
            />
          </svg>
          <span>{config.text}</span>
        </>
      )}
    </button>
  );
};

export default NavigateButton;