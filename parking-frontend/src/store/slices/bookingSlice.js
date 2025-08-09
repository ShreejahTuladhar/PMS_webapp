import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import bookingService from '../../services/bookingService';

export const createBooking = createAsyncThunk(
  'bookings/create',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await bookingService.createBooking(bookingData);
      if (response.success) {
        return response.booking;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getBookings = createAsyncThunk(
  'bookings/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingService.getBookings();
      if (response.success) {
        return response.bookings;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getBookingById = createAsyncThunk(
  'bookings/getById',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await bookingService.getBookingById(bookingId);
      if (response.success) {
        return response.booking;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancel',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await bookingService.cancelBooking(bookingId);
      if (response.success) {
        return bookingId;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  currentBooking: null,
  bookingHistory: [],
  loading: false,
  error: null,
  bookingStep: 'selection', // 'selection', 'payment', 'confirmed', 'navigation'
  isNavigationUnlocked: false,
  navigationData: null,
};

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setBookingStep: (state, action) => {
      state.bookingStep = action.payload;
    },
    startLocalBooking: (state, action) => {
      const { parkingSpot, duration, vehicleType } = action.payload;
      const totalCost = parkingSpot.vehicleTypes[vehicleType] * duration;
      
      state.currentBooking = {
        parkingSpot,
        duration,
        vehicleType,
        totalCost,
        bookingId: `PMS${Date.now()}`,
        startTime: new Date().toISOString(),
        status: 'pending',
      };
      state.bookingStep = 'payment';
      state.error = null;
    },
    confirmLocalBooking: (state, action) => {
      if (state.currentBooking) {
        const confirmedBooking = {
          ...state.currentBooking,
          ...action.payload,
          status: 'confirmed',
          confirmationTime: new Date().toISOString(),
          qrCode: `QR${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        };
        
        state.currentBooking = confirmedBooking;
        state.bookingHistory.push(confirmedBooking);
        state.isNavigationUnlocked = true;
        state.navigationData = {
          destination: {
            lat: state.currentBooking.parkingSpot.coordinates.lat,
            lng: state.currentBooking.parkingSpot.coordinates.lng,
            name: state.currentBooking.parkingSpot.name,
            address: state.currentBooking.parkingSpot.address,
          },
          bookingId: confirmedBooking.bookingId,
        };
        state.bookingStep = 'confirmed';
      }
    },
    startNavigation: (state) => {
      state.bookingStep = 'navigation';
    },
    completeBooking: (state) => {
      state.currentBooking = null;
      state.isNavigationUnlocked = false;
      state.navigationData = null;
      state.bookingStep = 'selection';
    },
    cancelCurrentBooking: (state) => {
      state.currentBooking = null;
      state.isNavigationUnlocked = false;
      state.navigationData = null;
      state.bookingStep = 'selection';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
        state.bookingHistory.push(action.payload);
        state.bookingStep = 'confirmed';
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get bookings
      .addCase(getBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingHistory = action.payload;
      })
      .addCase(getBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Cancel booking
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.bookingHistory = state.bookingHistory.map(booking =>
          booking.id === action.payload 
            ? { ...booking, status: 'cancelled' }
            : booking
        );
        if (state.currentBooking && state.currentBooking.id === action.payload) {
          state.currentBooking = null;
          state.bookingStep = 'selection';
        }
      });
  },
});

export const {
  clearError,
  setBookingStep,
  startLocalBooking,
  confirmLocalBooking,
  startNavigation,
  completeBooking,
  cancelCurrentBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;