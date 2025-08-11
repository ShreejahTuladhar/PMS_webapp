import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import locationService from '../../services/locationService';

export const searchParkingSpots = createAsyncThunk(
  'parking/search',
  async ({ location, radius }, { rejectWithValue }) => {
    try {
      const response = await locationService.searchParkingSpots(location, radius);
      if (response.success) {
        return response.parkingSpots;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAllParkingSpots = createAsyncThunk(
  'parking/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await locationService.getAllParkingSpots();
      if (response.success) {
        return response.parkingSpots;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getParkingSpotById = createAsyncThunk(
  'parking/getById',
  async (spotId, { rejectWithValue }) => {
    try {
      const response = await locationService.getParkingSpotById(spotId);
      if (response.success) {
        return response.parkingSpot;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  searchResults: [],
  allParkingSpots: [],
  selectedSpot: null,
  searchLocation: null,
  searchRadius: 2,
  loading: false,
  error: null,
  isSearched: false,
  filters: {
    vehicleType: 'all',
    priceRange: [0, 1000],
    amenities: [],
    availability: 'all',
  },
};

const parkingSlice = createSlice({
  name: 'parking',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedSpot: (state, action) => {
      state.selectedSpot = action.payload;
    },
    setSearchRadius: (state, action) => {
      state.searchRadius = action.payload;
    },
    setSearchLocation: (state, action) => {
      state.searchLocation = action.payload;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSearch: (state) => {
      state.searchResults = [];
      state.selectedSpot = null;
      state.searchLocation = null;
      state.isSearched = false;
      state.error = null;
    },
    setLocalSearchResults: (state, action) => {
      state.searchResults = action.payload.results;
      state.searchLocation = action.payload.location;
      state.isSearched = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search parking spots
      .addCase(searchParkingSpots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchParkingSpots.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
        state.isSearched = true;
      })
      .addCase(searchParkingSpots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isSearched = true;
        state.searchResults = [];
      })
      
      // Get all parking spots
      .addCase(getAllParkingSpots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllParkingSpots.fulfilled, (state, action) => {
        state.loading = false;
        state.allParkingSpots = action.payload;
      })
      .addCase(getAllParkingSpots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get parking spot by ID
      .addCase(getParkingSpotById.fulfilled, (state, action) => {
        state.selectedSpot = action.payload;
      });
  },
});

export const {
  clearError,
  setSelectedSpot,
  setSearchRadius,
  setSearchLocation,
  updateFilters,
  clearSearch,
  setLocalSearchResults,
} = parkingSlice.actions;

export default parkingSlice.reducer;