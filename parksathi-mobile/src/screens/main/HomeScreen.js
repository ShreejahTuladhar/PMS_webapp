/**
 * Home Screen for ParkSathi Mobile
 * Author: Shreeraj Tuladhar - 1Ox4Fox LLC
 * Main dashboard screen with quick actions and nearby parking
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { parkingService } from '../../services/ParkingService';
import QuickActionCard from '../../components/home/QuickActionCard';
import NearbyParkingCard from '../../components/home/NearbyParkingCard';
import WeatherWidget from '../../components/home/WeatherWidget';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { location, requestLocation } = useLocation();
  const [nearbyParkings, setNearbyParkings] = useState([]);
  const [activeBooking, setActiveBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHomeData();
  }, [location]);

  const loadHomeData = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      await Promise.all([
        loadNearbyParkings(),
        loadActiveBooking()
      ]);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyParkings = async () => {
    try {
      if (!location) {
        await requestLocation();
        return;
      }

      const response = await parkingService.getNearbyParkings({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 2000, // 2km radius
        limit: 5
      });

      if (response.success) {
        setNearbyParkings(response.data);
      }
    } catch (error) {
      console.error('Error loading nearby parkings:', error);
    }
  };

  const loadActiveBooking = async () => {
    try {
      const response = await parkingService.getActiveBooking();
      if (response.success && response.data) {
        setActiveBooking(response.data);
      }
    } catch (error) {
      console.error('Error loading active booking:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'find_parking':
        navigation.navigate('Search');
        break;
      case 'scan_qr':
        navigation.navigate('Bookings', { screen: 'QRScanner' });
        break;
      case 'my_bookings':
        navigation.navigate('Bookings');
        break;
      case 'quick_park':
        handleQuickPark();
        break;
      default:
        break;
    }
  };

  const handleQuickPark = async () => {
    if (!location) {
      Alert.alert(
        'Location Required',
        'Please enable location services to find nearby parking.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable Location', onPress: requestLocation }
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const response = await parkingService.findQuickParking({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 1000
      });

      if (response.success && response.data.length > 0) {
        const bestParking = response.data[0];
        navigation.navigate('ParkingDetail', { parking: bestParking });
      } else {
        Alert.alert(
          'No Parking Available',
          'Sorry, no parking spaces are available nearby right now.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to find quick parking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderActiveBookingCard = () => {
    if (!activeBooking) return null;

    return (
      <TouchableOpacity
        style={styles.activeBookingCard}
        onPress={() => navigation.navigate('Bookings', { 
          screen: 'ActiveBooking', 
          params: { booking: activeBooking } 
        })}
      >
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.activeBookingGradient}
        >
          <View style={styles.activeBookingContent}>
            <Icon name="local-parking" size={24} color="#FFFFFF" />
            <Text style={styles.activeBookingTitle}>Active Booking</Text>
          </View>
          <Text style={styles.activeBookingLocation}>
            {activeBooking.location?.name || 'Parking Location'}
          </Text>
          <Text style={styles.activeBookingTime}>
            Expires in {getRemainingTime(activeBooking.endTime)}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const getRemainingTime = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diffMs = end.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expired';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  const quickActions = [
    {
      id: 'find_parking',
      title: 'Find Parking',
      icon: 'search',
      color: '#3B82F6',
      description: 'Search nearby spots'
    },
    {
      id: 'quick_park',
      title: 'Quick Park',
      icon: 'flash-on',
      color: '#F59E0B',
      description: 'Instant booking'
    },
    {
      id: 'scan_qr',
      title: 'Scan QR',
      icon: 'qr-code-scanner',
      color: '#8B5CF6',
      description: 'Entry/Exit scan'
    },
    {
      id: 'my_bookings',
      title: 'My Bookings',
      icon: 'bookmark',
      color: '#10B981',
      description: 'View history'
    }
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Section */}
      <LinearGradient
        colors={['#3B82F6', '#2563EB']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>
            Hello, {user?.firstName || 'User'}!
          </Text>
          <Text style={styles.subGreeting}>
            Find your perfect parking spot
          </Text>
          
          {/* Weather Widget */}
          <WeatherWidget location={location} />
        </View>
      </LinearGradient>

      {/* Active Booking Card */}
      {renderActiveBookingCard()}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.id}
              {...action}
              onPress={() => handleQuickAction(action.id)}
            />
          ))}
        </View>
      </View>

      {/* Nearby Parking */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Parking</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Map')}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <LoadingSpinner />
        ) : nearbyParkings.length > 0 ? (
          nearbyParkings.map((parking) => (
            <NearbyParkingCard
              key={parking._id}
              parking={parking}
              onPress={() => navigation.navigate('ParkingDetail', { parking })}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="location-off" size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>
              {location ? 'No parking spots nearby' : 'Enable location to see nearby parking'}
            </Text>
            <TouchableOpacity
              style={styles.enableLocationButton}
              onPress={location ? loadNearbyParkings : requestLocation}
            >
              <Text style={styles.enableLocationText}>
                {location ? 'Refresh' : 'Enable Location'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2025 1Ox4Fox LLC - ParkSathi
        </Text>
        <Text style={styles.footerSubText}>
          Conceptualized by Shreeraj Tuladhar
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25
  },
  headerContent: {
    alignItems: 'flex-start'
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8
  },
  subGreeting: {
    fontSize: 16,
    color: '#E0E7FF',
    marginBottom: 20
  },
  activeBookingCard: {
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  activeBookingGradient: {
    padding: 20
  },
  activeBookingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  activeBookingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12
  },
  activeBookingLocation: {
    fontSize: 16,
    color: '#DCFCE7',
    marginBottom: 4
  },
  activeBookingTime: {
    fontSize: 14,
    color: '#BBF7D0',
    fontWeight: '600'
  },
  section: {
    padding: 20
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937'
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600'
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20
  },
  enableLocationButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25
  },
  enableLocationText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600'
  },
  footerSubText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4
  }
});

export default HomeScreen;