import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bookings: [],
  currentBooking: null,
  isLoading: false,
  error: null,
  searchResults: [],
  availableSlots: [],
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    
    // Bookings management
    setBookings: (state, action) => {
      state.bookings = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addBooking: (state, action) => {
      state.bookings.unshift(action.payload);
      state.currentBooking = action.payload;
    },
    updateBooking: (state, action) => {
      const index = state.bookings.findIndex(b => b._id === action.payload._id);
      if (index !== -1) {
        state.bookings[index] = { ...state.bookings[index], ...action.payload };
      }
      if (state.currentBooking?._id === action.payload._id) {
        state.currentBooking = { ...state.currentBooking, ...action.payload };
      }
    },
    removeBooking: (state, action) => {
      state.bookings = state.bookings.filter(b => b._id !== action.payload);
      if (state.currentBooking?._id === action.payload) {
        state.currentBooking = null;
      }
    },
    
    // Current booking
    setCurrentBooking: (state, action) => {
      state.currentBooking = action.payload;
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    
    // Search and availability
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
      state.isLoading = false;
    },
    setAvailableSlots: (state, action) => {
      state.availableSlots = action.payload;
      state.isLoading = false;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.availableSlots = [];
    },
    
    // Reset state
    resetBookingState: (state) => {
      return initialState;
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setBookings,
  addBooking,
  updateBooking,
  removeBooking,
  setCurrentBooking,
  clearCurrentBooking,
  setSearchResults,
  setAvailableSlots,
  clearSearchResults,
  resetBookingState,
} = bookingSlice.actions;

export default bookingSlice.reducer;