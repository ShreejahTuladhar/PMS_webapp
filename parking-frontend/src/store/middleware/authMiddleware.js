import { createListenerMiddleware } from '@reduxjs/toolkit';
import { initializeAuth } from '../slices/authSlice';

// Create listener middleware for auth state synchronization
export const authMiddleware = createListenerMiddleware();

// Initialize auth state from localStorage on app start
authMiddleware.startListening({
  actionCreator: initializeAuth,
  effect: async (action, listenerApi) => {
    const { dispatch } = listenerApi;
    
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        // Dispatch initialization with stored data
        console.log('🔐 Initializing auth from localStorage:', { user: user.username, token: token.substring(0, 20) + '...' });
      } else {
        console.log('🔓 No stored auth data found');
      }
    } catch (error) {
      console.error('❌ Failed to initialize auth from localStorage:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
});

// Auto-initialize auth when the app starts
export const initializeAuthOnStart = () => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  if (token && userData) {
    try {
      const user = JSON.parse(userData);
      return initializeAuth({ user, token });
    } catch (error) {
      console.error('Failed to parse stored user data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
  
  return initializeAuth({ user: null, token: null });
};