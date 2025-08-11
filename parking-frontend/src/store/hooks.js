import { useDispatch, useSelector } from 'react-redux';

// Typed hooks for better TypeScript support and convenience
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Auth-specific hooks
export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  
  return {
    ...auth,
    dispatch,
  };
};

// Booking-specific hooks
export const useBooking = () => {
  const bookings = useAppSelector((state) => state.bookings);
  const dispatch = useAppDispatch();
  
  return {
    ...bookings,
    dispatch,
  };
};

// Parking-specific hooks  
export const useParking = () => {
  const parking = useAppSelector((state) => state.parking);
  const dispatch = useAppDispatch();
  
  return {
    ...parking,
    dispatch,
  };
};

// Combined hook for common data
export const useAppData = () => {
  const auth = useAppSelector((state) => state.auth);
  const bookings = useAppSelector((state) => state.bookings);
  const parking = useAppSelector((state) => state.parking);
  const dispatch = useAppDispatch();
  
  return {
    auth,
    bookings,
    parking,
    dispatch,
    isLoading: auth.loading || bookings.loading || parking.loading,
    hasErrors: !!(auth.error || bookings.error || parking.error),
    errors: {
      auth: auth.error,
      bookings: bookings.error,
      parking: parking.error,
    },
  };
};