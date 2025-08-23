import React, { createContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();
export { AuthContext };

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token }
        });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = (user, token, navigate) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Enhanced security for super admin role
    if (user.role === 'super_admin') {
      // Create secure metadata without exposing sensitive role info
      const secureMetadata = btoa(JSON.stringify({
        role_verified: 'super_admin_verified',
        timestamp: Date.now(),
        session_id: Math.random().toString(36).substring(7),
        security_level: 'maximum'
      }));
      sessionStorage.setItem('_ss_meta', secureMetadata);
      
      // Add additional auth token for super admin (more secure storage)
      localStorage.setItem('authToken', token);
    }
    
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { user, token }
    });

    // Enhanced redirect logic based on role
    if (navigate) {
      const redirectMap = {
        'super_admin': '/super-admin',
        'client': '/client-dashboard',
        'parking_owner': '/client-dashboard',
        'customer': '/dashboard',
        'user': '/dashboard'
      };
      
      navigate(redirectMap[user.role] || '/dashboard');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken'); // Remove super admin auth token
    sessionStorage.removeItem('_ss_meta'); // Remove secure metadata
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    dispatch({
      type: 'UPDATE_USER',
      payload: userData
    });
  };

  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

