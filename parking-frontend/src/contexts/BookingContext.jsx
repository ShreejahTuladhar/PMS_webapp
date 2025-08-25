import React, { createContext, useReducer } from 'react';

const BookingContext = createContext();
export { BookingContext };

const initialState = {
  currentBooking: null,
  bookingHistory: [],
  isNavigationUnlocked: false,
  navigationData: null,
  bookingStep: 'selection', // 'selection', 'payment', 'confirmed', 'journey', 'navigation', 'completed'
  isJourneyActive: false,
  journeyStep: null, // 'ticket_generation', 'qr_code_display', 'gps_lock', 'navigation_start', 'in_transit', 'arrived'
};

function bookingReducer(state, action) {
  switch (action.type) {
    case 'START_BOOKING':
      return {
        ...state,
        currentBooking: {
          ...action.payload,
          bookingId: `PMS${Date.now()}`,
          startTime: new Date().toISOString(),
        },
        bookingStep: 'payment',
      };
    
    case 'CONFIRM_BOOKING': {
      const confirmedBooking = {
        ...state.currentBooking,
        status: 'confirmed',
        confirmationTime: new Date().toISOString(),
        qrCode: `QR${Date.now()}${Math.random().toString(36).substring(2, 11)}`,
        plateNumber: action.payload.plateNumber || state.currentBooking.plateNumber,
        spaceId: action.payload.spaceId || state.currentBooking.spaceId,
      };
      
      return {
        ...state,
        currentBooking: confirmedBooking,
        bookingHistory: [...state.bookingHistory, confirmedBooking],
        isNavigationUnlocked: true,
        navigationData: {
          destination: {
            lat: action.payload.parkingSpot.coordinates?.lat || action.payload.parkingSpot.lat || 27.7172,
            lng: action.payload.parkingSpot.coordinates?.lng || action.payload.parkingSpot.lng || 85.3240,
            name: action.payload.parkingSpot.name || 'Parking Location',
            address: action.payload.parkingSpot.address || action.payload.parkingSpot.location?.address || 'Unknown Address',
          },
          bookingId: confirmedBooking.bookingId,
        },
        bookingStep: 'confirmed',
        isJourneyActive: true,
        journeyStep: 'ticket_generation',
      };
    }
    
    case 'START_JOURNEY':
      return {
        ...state,
        bookingStep: 'journey',
        isJourneyActive: true,
        journeyStep: action.payload.step || 'ticket_generation',
      };
    
    case 'UPDATE_JOURNEY_STEP':
      return {
        ...state,
        journeyStep: action.payload.step,
      };
    
    case 'START_NAVIGATION':
      return {
        ...state,
        bookingStep: 'navigation',
        journeyStep: 'in_transit',
      };
    
    case 'COMPLETE_BOOKING':
      return {
        ...state,
        currentBooking: null,
        isNavigationUnlocked: false,
        navigationData: null,
        bookingStep: 'selection',
        isJourneyActive: false,
        journeyStep: null,
      };
    
    case 'CANCEL_BOOKING':
      return {
        ...state,
        currentBooking: null,
        isNavigationUnlocked: false,
        navigationData: null,
        bookingStep: 'selection',
        isJourneyActive: false,
        journeyStep: null,
      };
    
    default:
      return state;
  }
}

export function BookingProvider({ children }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const startBooking = (parkingSpot, duration, vehicleType) => {
    // Calculate cost with fallback values
    const vehicleRate = parkingSpot.vehicleTypes?.[vehicleType] || parkingSpot.hourlyRate || 50;
    const totalCost = vehicleRate * duration;
    
    // Ensure parkingSpot has proper coordinate structure
    const normalizedParkingSpot = {
      ...parkingSpot,
      coordinates: parkingSpot.coordinates || {
        lat: parkingSpot.lat || 27.7172,
        lng: parkingSpot.lng || 85.3240
      }
    };
    
    dispatch({
      type: 'START_BOOKING',
      payload: {
        parkingSpot: normalizedParkingSpot,
        duration,
        vehicleType,
        totalCost,
      },
    });
  };

  const confirmBooking = (paymentDetails, bookingData = {}) => {
    if (!state.currentBooking) {
      console.error('❌ BookingContext: Cannot confirm booking - no current booking exists');
      return;
    }
    
    dispatch({
      type: 'CONFIRM_BOOKING',
      payload: {
        paymentDetails,
        parkingSpot: state.currentBooking.parkingSpot,
        plateNumber: bookingData.plateNumber,
        spaceId: bookingData.spaceId,
        ...bookingData,
      },
    });
  };

  const startJourney = (step = 'ticket_generation') => {
    dispatch({ 
      type: 'START_JOURNEY',
      payload: { step }
    });
  };
  
  const updateJourneyStep = (step) => {
    dispatch({
      type: 'UPDATE_JOURNEY_STEP',
      payload: { step }
    });
  };
  
  const startNavigation = () => {
    dispatch({ type: 'START_NAVIGATION' });
  };

  const completeBooking = () => {
    dispatch({ type: 'COMPLETE_BOOKING' });
  };

  const cancelBooking = () => {
    dispatch({ type: 'CANCEL_BOOKING' });
  };

  const value = {
    ...state,
    startBooking,
    confirmBooking,
    startJourney,
    updateJourneyStep,
    startNavigation,
    completeBooking,
    cancelBooking,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

