import API, { apiCall } from "./axiosInstance";
import { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout as logoutAction 
} from "../store/authSlice";
import { resetUserState } from "../store/userSlice";
import { resetBookingState } from "../store/bookingSlice";
import { resetParkingState } from "../store/parkingSlice";
import { toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

// Enhanced login with better error handling and security
export const loginUser = (credentials) => async (dispatch) => {
  dispatch(loginStart());
  
  try {
    // Validate input
    if (!credentials.username || !credentials.password) {
      throw new Error('Username and password are required');
    }
    
    const res = await API.post("/auth/login", credentials);
    const { token, user } = res.data;
    
    // Validate token
    if (!token) {
      throw new Error('No authentication token received');
    }
    
    // Decode and validate token structure
    try {
      const decodedToken = jwtDecode(token);
      if (!decodedToken.userId) {
        throw new Error('Invalid token structure');
      }
    } catch (tokenError) {
      throw new Error('Invalid authentication token');
    }
    
    dispatch(loginSuccess({ token, user }));
    
    toast.success("Login successful!", {
      duration: 3000,
      position: 'top-right',
    });

    // Enhanced role-based redirection
    const userRole = user?.role || 'customer';
    const redirectPaths = {
      customer: "/user/dashboard",
      parking_admin: "/admin/dashboard", 
      super_admin: "/superadmin/dashboard"
    };
    
    // Use React Router navigation instead of direct href
    const redirectPath = redirectPaths[userRole] || "/";
    setTimeout(() => {
      window.location.href = redirectPath;
    }, 1000);
    
  } catch (err) {
    const errorMessage = err.userMessage || err.response?.data?.message || err.message || "Login failed";
    dispatch(loginFailure(errorMessage));
    
    toast.error(errorMessage, {
      duration: 4000,
      position: 'top-right',
    });
  }
};

// Enhanced registration with validation
export const registerUser = (formData) => async (dispatch) => {
  try {
    // Client-side validation
    const required = ['username', 'email', 'password', 'firstName', 'lastName'];
    for (const field of required) {
      if (!formData[field]?.trim()) {
        throw new Error(`${field} is required`);
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      throw new Error('Please enter a valid email address');
    }
    
    // Password strength validation
    if (formData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    const res = await API.post("/auth/register", formData);
    
    toast.success("Registration successful! You can now log in.", {
      duration: 4000,
      position: 'top-right',
    });
    
    // Redirect to login page instead of auto-login for security
    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
    
  } catch (err) {
    const errorMessage = err.userMessage || err.response?.data?.message || err.message || "Registration failed";
    
    toast.error(errorMessage, {
      duration: 4000,
      position: 'top-right',
    });
  }
};

// Enhanced logout with cleanup
export const logout = () => async (dispatch) => {
  try {
    // Call logout endpoint to invalidate token on server
    await apiCall(() => API.post("/auth/logout"));
  } catch (error) {
    // Continue with logout even if server call fails
    console.warn('Logout API call failed:', error.message);
  } finally {
    // Clear all Redux state
    dispatch(logoutAction());
    dispatch(resetUserState());
    dispatch(resetBookingState());
    dispatch(resetParkingState());
    
    toast.success("Logged out successfully", {
      duration: 2000,
      position: 'top-right',
    });
    
    // Redirect to home page
    window.location.href = "/";
  }
};

// Get current user profile
export const getCurrentUser = () => async (dispatch) => {
  try {
    const result = await apiCall(() => API.get("/auth/me"));
    
    if (result.success) {
      return result.data.user;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Failed to fetch current user:', error.message);
    throw error;
  }
};

// Request password reset
export const requestPasswordReset = async (email) => {
  try {
    if (!email?.trim()) {
      throw new Error('Email is required');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address');
    }
    
    const result = await apiCall(() => API.post("/auth/forgot-password", { email }));
    
    if (result.success) {
      toast.success("Password reset instructions sent to your email", {
        duration: 5000,
        position: 'top-right',
      });
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    const errorMessage = error.userMessage || error.message || "Failed to send password reset email";
    toast.error(errorMessage, {
      duration: 4000,
      position: 'top-right',
    });
    throw error;
  }
};

// Reset password with token
export const resetPassword = async (token, newPassword) => {
  try {
    if (!token || !newPassword) {
      throw new Error('Token and new password are required');
    }
    
    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    const result = await apiCall(() => API.post("/auth/reset-password", { 
      token, 
      newPassword 
    }));
    
    if (result.success) {
      toast.success("Password reset successfully. You can now log in with your new password.", {
        duration: 5000,
        position: 'top-right',
      });
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    const errorMessage = error.userMessage || error.message || "Failed to reset password";
    toast.error(errorMessage, {
      duration: 4000,
      position: 'top-right',
    });
    throw error;
  }
};
