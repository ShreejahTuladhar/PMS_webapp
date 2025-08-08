import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  profile: null,
  vehicles: [],
  notifications: [],
  preferences: {
    darkMode: false,
    language: 'en',
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
  },
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
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
    
    // Profile management
    setProfile: (state, action) => {
      state.profile = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    
    // Vehicle management
    setVehicles: (state, action) => {
      state.vehicles = action.payload;
    },
    addVehicle: (state, action) => {
      state.vehicles.push(action.payload);
    },
    updateVehicle: (state, action) => {
      const index = state.vehicles.findIndex(v => v._id === action.payload._id);
      if (index !== -1) {
        state.vehicles[index] = { ...state.vehicles[index], ...action.payload };
      }
    },
    removeVehicle: (state, action) => {
      state.vehicles = state.vehicles.filter(v => v._id !== action.payload);
    },
    
    // Notifications
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
    markNotificationRead: (state, action) => {
      const notification = state.notifications.find(n => n._id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach(n => n.read = true);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n._id !== action.payload);
    },
    
    // Preferences
    setPreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
      
      // Save to localStorage for persistence
      try {
        localStorage.setItem('userPreferences', JSON.stringify(state.preferences));
      } catch (error) {
        console.error('Failed to save preferences:', error);
      }
    },
    toggleDarkMode: (state) => {
      state.preferences.darkMode = !state.preferences.darkMode;
      try {
        localStorage.setItem('userPreferences', JSON.stringify(state.preferences));
      } catch (error) {
        console.error('Failed to save preferences:', error);
      }
    },
    
    // Load preferences from localStorage
    loadPreferences: (state) => {
      try {
        const saved = localStorage.getItem('userPreferences');
        if (saved) {
          state.preferences = { ...state.preferences, ...JSON.parse(saved) };
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    },
    
    // Reset state
    resetUserState: (state) => {
      return { ...initialState, preferences: state.preferences };
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setProfile,
  updateProfile,
  setVehicles,
  addVehicle,
  updateVehicle,
  removeVehicle,
  setNotifications,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotification,
  setPreferences,
  toggleDarkMode,
  loadPreferences,
  resetUserState,
} = userSlice.actions;

export default userSlice.reducer;