import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import bookingSlice from './slices/bookingSlice';
import parkingSlice from './slices/parkingSlice';
import { authMiddleware, initializeAuthOnStart } from './middleware/authMiddleware';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    bookings: bookingSlice,
    parking: parkingSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).prepend(authMiddleware.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Initialize auth state from localStorage
store.dispatch(initializeAuthOnStart());