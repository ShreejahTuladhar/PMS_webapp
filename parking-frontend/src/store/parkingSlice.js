import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  locations: [],
  nearbyLocations: [],
  selectedLocation: null,
  isLoading: false,
  error: null,
  searchFilters: {
    radius: 5000,
    vehicleType: 'car',
    amenities: [],
    priceRange: [0, 1000],
  },
  mapCenter: {
    lat: 27.7172,
    lng: 85.3240 // Kathmandu coordinates as default
  },
  userLocation: null,
};

const parkingSlice = createSlice({
  name: "parking",
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
    
    // Locations management
    setLocations: (state, action) => {
      state.locations = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setNearbyLocations: (state, action) => {
      state.nearbyLocations = action.payload;
      state.isLoading = false;
    },
    addLocation: (state, action) => {
      state.locations.unshift(action.payload);
    },
    updateLocation: (state, action) => {
      const index = state.locations.findIndex(l => l._id === action.payload._id);
      if (index !== -1) {
        state.locations[index] = { ...state.locations[index], ...action.payload };
      }
      
      const nearbyIndex = state.nearbyLocations.findIndex(l => l._id === action.payload._id);
      if (nearbyIndex !== -1) {
        state.nearbyLocations[nearbyIndex] = { ...state.nearbyLocations[nearbyIndex], ...action.payload };
      }
      
      if (state.selectedLocation?._id === action.payload._id) {
        state.selectedLocation = { ...state.selectedLocation, ...action.payload };
      }
    },
    
    // Selected location
    setSelectedLocation: (state, action) => {
      state.selectedLocation = action.payload;
    },
    clearSelectedLocation: (state) => {
      state.selectedLocation = null;
    },
    
    // Search and filters
    setSearchFilters: (state, action) => {
      state.searchFilters = { ...state.searchFilters, ...action.payload };
    },
    resetSearchFilters: (state) => {
      state.searchFilters = initialState.searchFilters;
    },
    
    // Map and location
    setMapCenter: (state, action) => {
      state.mapCenter = action.payload;
    },
    setUserLocation: (state, action) => {
      state.userLocation = action.payload;
      // Also update map center to user location
      state.mapCenter = action.payload;
    },
    
    // Real-time updates (for socket connections)
    updateLocationAvailability: (state, action) => {
      const { locationId, availableSpaces } = action.payload;
      
      const updateLocationSpaces = (location) => {
        if (location._id === locationId) {
          location.availableSpaces = availableSpaces;
        }
      };
      
      state.locations.forEach(updateLocationSpaces);
      state.nearbyLocations.forEach(updateLocationSpaces);
      
      if (state.selectedLocation?._id === locationId) {
        state.selectedLocation.availableSpaces = availableSpaces;
      }
    },
    
    // Reset state
    resetParkingState: (state) => {
      return { ...initialState, mapCenter: state.mapCenter, userLocation: state.userLocation };
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setLocations,
  setNearbyLocations,
  addLocation,
  updateLocation,
  setSelectedLocation,
  clearSelectedLocation,
  setSearchFilters,
  resetSearchFilters,
  setMapCenter,
  setUserLocation,
  updateLocationAvailability,
  resetParkingState,
} = parkingSlice.actions;

export default parkingSlice.reducer;