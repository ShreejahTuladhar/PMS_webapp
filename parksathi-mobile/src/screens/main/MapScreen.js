/**
 * Map Screen for ParkSathi Mobile
 * Author: Shreeraj Tuladhar - 1Ox4Fox LLC
 * Interactive map view with parking locations
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Dimensions,
  Platform
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLocation } from '../../contexts/LocationContext';
import { parkingService } from '../../services/ParkingService';
import ParkingMarkerCallout from '../../components/map/ParkingMarkerCallout';
import MapFilters from '../../components/map/MapFilters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';

const { width, height } = Dimensions.get('window');

const MapScreen = ({ navigation, route }) => {
  const { location, requestLocation } = useLocation();
  const mapRef = useRef(null);
  
  const [parkingLocations, setParkingLocations] = useState([]);
  const [selectedParking, setSelectedParking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 27.7172, // Kathmandu default
    longitude: 85.3240,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    maxPrice: null,
    amenities: [],
    availability: 'all',
    distance: 5000 // 5km default
  });

  useEffect(() => {
    initializeMap();
  }, []);

  useEffect(() => {
    if (location) {
      setMapRegion({
        ...mapRegion,
        latitude: location.latitude,
        longitude: location.longitude
      });
      loadNearbyParkings();
    }
  }, [location]);

  useEffect(() => {
    loadNearbyParkings();
  }, [filters]);

  const initializeMap = async () => {
    try {
      await requestLocationPermission();
      if (!location) {
        await requestLocation();
      }
    } catch (error) {
      console.error('Map initialization error:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE 
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
        
      const result = await request(permission);
      
      if (result !== RESULTS.GRANTED) {
        Alert.alert(
          'Location Permission',
          'Location permission is required to show nearby parking spaces.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Linking.openSettings() }
          ]
        );
      }
    } catch (error) {
      console.error('Permission request error:', error);
    }
  };

  const loadNearbyParkings = async () => {
    if (!location) return;
    
    setLoading(true);
    try {
      const response = await parkingService.searchParkings({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: filters.distance,
        maxPrice: filters.maxPrice,
        amenities: filters.amenities,
        availability: filters.availability
      });

      if (response.success) {
        setParkingLocations(response.data);
      }
    } catch (error) {
      console.error('Error loading parkings:', error);
      Alert.alert('Error', 'Failed to load parking locations');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (parking) => {
    setSelectedParking(parking);
    
    // Animate to marker
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: parking.coordinates.lat,
        longitude: parking.coordinates.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handleCalloutPress = (parking) => {
    navigation.navigate('ParkingDetail', { parking });
  };

  const handleMyLocationPress = async () => {
    if (!location) {
      await requestLocation();
      return;
    }

    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handleRegionChangeComplete = (region) => {
    setMapRegion(region);
  };

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  const getMarkerColor = (parking) => {
    if (parking.availableSpaces === 0) return '#EF4444'; // Red
    if (parking.availableSpaces < 5) return '#F59E0B'; // Orange
    return '#10B981'; // Green
  };

  const renderParkingMarkers = () => {
    return parkingLocations.map((parking) => (
      <Marker
        key={parking._id}
        coordinate={{
          latitude: parking.coordinates.lat,
          longitude: parking.coordinates.lng
        }}
        onPress={() => handleMarkerPress(parking)}
        pinColor={getMarkerColor(parking)}
      >
        <ParkingMarkerCallout
          parking={parking}
          onPress={() => handleCalloutPress(parking)}
        />
      </Marker>
    ));
  };

  const mapStyle = [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'transit',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }]
    }
  ];

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={mapRegion}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        customMapStyle={mapStyle}
        loadingEnabled={true}
        loadingIndicatorColor="#3B82F6"
      >
        {renderParkingMarkers()}
      </MapView>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <LoadingSpinner />
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {/* Filter Button */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowFilters(true)}
        >
          <Icon name="tune" size={24} color="#3B82F6" />
        </TouchableOpacity>

        {/* My Location Button */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleMyLocationPress}
        >
          <Icon name="my-location" size={24} color="#3B82F6" />
        </TouchableOpacity>

        {/* Refresh Button */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={loadNearbyParkings}
        >
          <Icon name="refresh" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Search in Area Button */}
      <View style={styles.searchContainer}>
        <Button
          title="Search in this area"
          onPress={loadNearbyParkings}
          variant="primary"
          size="medium"
          icon="search"
        />
      </View>

      {/* Filter Modal */}
      <MapFilters
        visible={showFilters}
        filters={filters}
        onApply={applyFilters}
        onClose={() => setShowFilters(false)}
      />

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Availability</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Limited</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Full</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    position: 'absolute',
    right: 16,
    top: 100,
  },
  controlButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchContainer: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
  },
  legend: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default MapScreen;