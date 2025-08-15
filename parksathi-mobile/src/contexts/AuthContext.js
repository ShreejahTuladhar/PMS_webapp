/**
 * Authentication Context for ParkSathi Mobile
 * Author: Shreeraj Tuladhar - 1Ox4Fox LLC
 * Global authentication state management
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import ApiService from '../services/ApiService';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
  refreshToken: null,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  RESTORE_TOKEN: 'RESTORE_TOKEN',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        isLoading: false,
        error: action.payload
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.RESTORE_TOKEN:
      return {
        ...state,
        isAuthenticated: !!action.payload.token,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isLoading: false
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore authentication state on app start
  useEffect(() => {
    restoreAuthState();
  }, []);

  const restoreAuthState = async () => {
    try {
      const [token, refreshToken, userData] = await AsyncStorage.multiGet([
        'auth_token',
        'refresh_token',
        'user_data'
      ]);

      const authToken = token[1];
      const authRefreshToken = refreshToken[1];
      const user = userData[1] ? JSON.parse(userData[1]) : null;

      if (authToken && user) {
        dispatch({
          type: AUTH_ACTIONS.RESTORE_TOKEN,
          payload: {
            token: authToken,
            refreshToken: authRefreshToken,
            user
          }
        });

        // Verify token is still valid
        const response = await ApiService.getCurrentUser();
        if (!response.success) {
          await logout();
        }
      } else {
        dispatch({
          type: AUTH_ACTIONS.SET_LOADING,
          payload: false
        });
      }
    } catch (error) {
      console.error('Error restoring auth state:', error);
      dispatch({
        type: AUTH_ACTIONS.SET_LOADING,
        payload: false
      });
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const response = await ApiService.login(credentials);

      if (response.success) {
        const { user, accessToken, refreshToken } = response.data;

        // Store tokens and user data
        await AsyncStorage.multiSet([
          ['auth_token', accessToken],
          ['refresh_token', refreshToken],
          ['user_data', JSON.stringify(user)]
        ]);

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user,
            token: accessToken,
            refreshToken
          }
        });

        return { success: true };
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: response.error
        });
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = 'Login failed. Please try again.';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const response = await ApiService.register(userData);

      if (response.success) {
        const { user, accessToken, refreshToken } = response.data;

        // Store tokens and user data
        await AsyncStorage.multiSet([
          ['auth_token', accessToken],
          ['refresh_token', refreshToken],
          ['user_data', JSON.stringify(user)]
        ]);

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user,
            token: accessToken,
            refreshToken
          }
        });

        return { success: true };
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: response.error
        });
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = 'Registration failed. Please try again.';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async (showConfirmation = true) => {
    const performLogout = async () => {
      try {
        // Call logout endpoint
        await ApiService.logout();
      } catch (error) {
        console.error('Logout API call failed:', error);
      } finally {
        // Clear local storage
        await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user_data']);
        
        // Update state
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    if (showConfirmation) {
      Alert.alert(
        'Confirm Logout',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: performLogout
          }
        ]
      );
    } else {
      await performLogout();
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await ApiService.updateProfile(profileData);

      if (response.success) {
        const updatedUser = response.data;
        
        // Update stored user data
        await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
        
        // Update state
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: updatedUser
        });

        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: 'Failed to update profile' };
    }
  };

  const uploadProfileImage = async (imageUri) => {
    try {
      const response = await ApiService.uploadProfileImage(imageUri);

      if (response.success) {
        const updatedUser = response.data;
        
        // Update stored user data
        await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
        
        // Update state
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: updatedUser
        });

        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: 'Failed to upload image' };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await ApiService.forgotPassword(email);
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to send reset email' };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await ApiService.resetPassword(token, password);
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to reset password' };
    }
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const refreshAuthToken = async () => {
    try {
      if (!state.refreshToken) {
        return { success: false, error: 'No refresh token available' };
      }

      const response = await ApiService.refreshAuthToken(state.refreshToken);
      
      if (response.success) {
        const { accessToken } = response.data;
        
        // Store new token
        await AsyncStorage.setItem('auth_token', accessToken);
        
        return { success: true };
      } else {
        await logout(false);
        return { success: false, error: 'Token refresh failed' };
      }
    } catch (error) {
      await logout(false);
      return { success: false, error: 'Token refresh failed' };
    }
  };

  // Context value
  const contextValue = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    token: state.token,
    error: state.error,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    uploadProfileImage,
    forgotPassword,
    resetPassword,
    clearError,
    refreshAuthToken
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;