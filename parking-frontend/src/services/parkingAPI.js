import API, { apiCall } from "./axiosInstance";
import { toast } from "react-hot-toast";
import { 
  setLoading, 
  setError, 
  setLocations, 
  setNearbyLocations,
  setSelectedLocation,
  setUserLocation,
  setMapCenter
} from "../store/parkingSlice";

// Get all parking locations with optional filtering
export const getParkingLocations = (params = {}) => async (dispatch) => {
  dispatch(setLoading(true));
  
  try {
    const result = await apiCall(() => API.get("/locations", { params }));
    
    if (result.success) {
      dispatch(setLocations(result.data.locations || []));
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    const errorMessage = error.userMessage || error.message || "Failed to fetch parking locations";
    dispatch(setError(errorMessage));
    console.error('Failed to fetch parking locations:', error);
    throw error;
  }
};

// Search nearby parking locations by coordinates
export const searchNearbyParkingLocations = ({ latitude, longitude, maxDistance = 5000, ...params }) => async (dispatch) => {
  dispatch(setLoading(true));
  
  try {
    const searchParams = {
      latitude,
      longitude,
      maxDistance,
      ...params
    };
    
    const result = await apiCall(() => API.get("/locations", { params: searchParams }));
    
    if (result.success) {
      const locations = result.data.locations || [];
      dispatch(setNearbyLocations(locations));
      dispatch(setMapCenter({ lat: latitude, lng: longitude }));
      return { locations, total: result.data.total || locations.length };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    const errorMessage = error.userMessage || error.message || "Failed to search parking locations";
    dispatch(setError(errorMessage));
    console.error('Failed to search nearby parking:', error);
    throw error;
  }
};

// Get single parking location by ID
export const getParkingLocationById = (locationId) => async (dispatch) => {
  dispatch(setLoading(true));
  
  try {
    const result = await apiCall(() => API.get(`/locations/${locationId}`));
    
    if (result.success) {
      dispatch(setSelectedLocation(result.data.location));
      return result.data.location;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    const errorMessage = error.userMessage || error.message || "Failed to fetch parking location";
    dispatch(setError(errorMessage));
    console.error('Failed to fetch parking location:', error);
    throw error;
  }
};

// Get user's current location using browser geolocation API
export const getUserLocation = () => async (dispatch) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      const error = new Error('Geolocation is not supported by this browser');
      dispatch(setError(error.message));
      reject(error);
      return;
    }

    dispatch(setLoading(true));

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 600000 // Cache for 10 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        dispatch(setUserLocation(location));
        dispatch(setLoading(false));
        resolve(location);
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred while getting location.';
            break;
        }
        
        dispatch(setError(errorMessage));
        dispatch(setLoading(false));
        reject(new Error(errorMessage));
      },
      options
    );
  });
};

// Geocoding function to convert address to coordinates
export const geocodeAddress = async (address) => {
  try {
    // Using Nominatim (OpenStreetMap) geocoding service (free alternative to Google Maps)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&countrycodes=np`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }
    
    const data = await response.json();
    
    if (data.length === 0) {
      throw new Error('Location not found');
    }
    
    return data.map(item => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      display_name: item.display_name,
      address: {
        city: item.address?.city || item.address?.town || item.address?.village,
        state: item.address?.state,
        country: item.address?.country
      }
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Failed to find location. Please try a different search term.');
  }
};

// Search locations by address/name
export const searchLocationsByAddress = (searchTerm, radius = 5000) => async (dispatch) => {
  if (!searchTerm || searchTerm.trim().length < 2) {
    dispatch(setError('Please enter at least 2 characters to search'));
    return;
  }

  dispatch(setLoading(true));
  
  try {
    // First, geocode the search term to get coordinates
    const geocodeResults = await geocodeAddress(searchTerm.trim());
    
    if (geocodeResults.length === 0) {
      dispatch(setError('Location not found. Please try a different search term.'));
      return;
    }
    
    // Use the first (best match) result
    const location = geocodeResults[0];
    
    // Then search for parking locations near those coordinates
    const result = await dispatch(searchNearbyParkingLocations({
      latitude: location.lat,
      longitude: location.lng,
      maxDistance: radius
    }));
    
    toast.success(`Found ${result.locations.length} parking locations near "${location.display_name}"`, {
      duration: 3000,
      position: 'top-right',
    });
    
    return {
      searchLocation: location,
      parkingLocations: result.locations,
      total: result.total
    };
  } catch (error) {
    const errorMessage = error.message || 'Failed to search locations';
    dispatch(setError(errorMessage));
    
    toast.error(errorMessage, {
      duration: 4000,
      position: 'top-right',
    });
    
    throw error;
  }
};