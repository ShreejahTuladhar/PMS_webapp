import { createContext, useContext, useReducer } from 'react';

const BookingContext = createContext();

const initialState = {
  currentBooking: null,
  bookingHistory: [],
  isNavigationUnlocked: false,
  navigationData: null,
  bookingStep: 'selection', // 'selection', 'payment', 'confirmed', 'navigation'
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
    
    case 'CONFIRM_BOOKING':
      const confirmedBooking = {
        ...state.currentBooking,
        status: 'confirmed',
        confirmationTime: new Date().toISOString(),
        qrCode: `QR${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      };
      
      return {
        ...state,
        currentBooking: confirmedBooking,
        bookingHistory: [...state.bookingHistory, confirmedBooking],
        isNavigationUnlocked: true,
        navigationData: {
          destination: {
            lat: action.payload.parkingSpot.coordinates.lat,
            lng: action.payload.parkingSpot.coordinates.lng,
            name: action.payload.parkingSpot.name,
            address: action.payload.parkingSpot.address,
          },
          bookingId: confirmedBooking.bookingId,
        },
        bookingStep: 'confirmed',
      };
    
    case 'START_NAVIGATION':
      return {
        ...state,
        bookingStep: 'navigation',
      };
    
    case 'COMPLETE_BOOKING':
      return {
        ...state,
        currentBooking: null,
        isNavigationUnlocked: false,
        navigationData: null,
        bookingStep: 'selection',
      };
    
    case 'CANCEL_BOOKING':
      return {
        ...state,
        currentBooking: null,
        isNavigationUnlocked: false,
        navigationData: null,
        bookingStep: 'selection',
      };
    
    default:
      return state;
  }
}

export function BookingProvider({ children }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const startBooking = (parkingSpot, duration, vehicleType) => {
    const totalCost = parkingSpot.vehicleTypes[vehicleType] * duration;
    
    dispatch({
      type: 'START_BOOKING',
      payload: {
        parkingSpot,
        duration,
        vehicleType,
        totalCost,
      },
    });
  };

  const confirmBooking = (paymentDetails) => {
    dispatch({
      type: 'CONFIRM_BOOKING',
      payload: {
        paymentDetails,
        parkingSpot: state.currentBooking.parkingSpot,
      },
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

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}