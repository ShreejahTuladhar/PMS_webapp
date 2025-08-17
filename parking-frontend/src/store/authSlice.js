import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

// Helper function to safely decode token (only for validation)
const validateToken = (token) => {
  try {
    if (!token) return false;
    
    const decoded = jwtDecode(token);
    
    // Check if token is expired
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      console.log('Token expired, removing...');
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Invalid token:', error);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return false;
  }
};

// Helper function to safely get data from localStorage
const getStoredData = () => {
  try {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    
    if (!token || !validateToken(token)) {
      return { token: null, user: null };
    }
    
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user };
  } catch (error) {
    console.error('Failed to access localStorage:', error);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return { token: null, user: null };
  }
};

const { token, user } = getStoredData();

const initialState = {
  token,
  user,
  isLoading: false,
  error: null,
  isAuthenticated: Boolean(token && user),
};


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isLoading = false;
      state.error = null;
      state.isAuthenticated = true;
      
      try {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      } catch (error) {
        console.error('Failed to save auth data:', error);
      }
    },
    loginFailure: (state, action) => {
      state.token = null;
      state.user = null;
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch (error) {
        console.error('Failed to remove auth data:', error);
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isLoading = false;
      state.error = null;
      state.isAuthenticated = false;
      
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch (error) {
        console.error('Failed to remove auth data:', error);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  clearError, 
  updateUser 
} = authSlice.actions;

export default authSlice.reducer;
