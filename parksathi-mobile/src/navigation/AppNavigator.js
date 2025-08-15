/**
 * Main App Navigator for ParkSathi Mobile
 * Author: Shreeraj Tuladhar - 1Ox4Fox LLC
 * Navigation structure for the mobile application
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../contexts/AuthContext';

// Auth Screens
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import SearchScreen from '../screens/main/SearchScreen';
import ParkingListScreen from '../screens/main/ParkingListScreen';
import ParkingDetailScreen from '../screens/main/ParkingDetailScreen';
import MapScreen from '../screens/main/MapScreen';
import BookingScreen from '../screens/booking/BookingScreen';
import BookingConfirmationScreen from '../screens/booking/BookingConfirmationScreen';
import BookingHistoryScreen from '../screens/booking/BookingHistoryScreen';
import ActiveBookingScreen from '../screens/booking/ActiveBookingScreen';

// Profile & Settings
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import PaymentMethodsScreen from '../screens/profile/PaymentMethodsScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';

// Additional Screens
import QRScannerScreen from '../screens/utils/QRScannerScreen';
import HelpScreen from '../screens/utils/HelpScreen';
import AboutScreen from '../screens/utils/AboutScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Theme colors
const Colors = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  white: '#FFFFFF',
  gray: '#6B7280',
  dark: '#1F2937'
};

// Auth Stack Navigator
const AuthNavigator = () => (
  <Stack.Navigator 
    initialRouteName="Splash"
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: Colors.white }
    }}
  >
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

// Home Stack Navigator
const HomeStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: Colors.primary },
      headerTintColor: Colors.white,
      headerTitleStyle: { fontWeight: 'bold' }
    }}
  >
    <Stack.Screen 
      name="HomeMain" 
      component={HomeScreen} 
      options={{ title: 'ParkSathi' }}
    />
    <Stack.Screen 
      name="Search" 
      component={SearchScreen} 
      options={{ title: 'Find Parking' }}
    />
    <Stack.Screen 
      name="ParkingList" 
      component={ParkingListScreen} 
      options={{ title: 'Available Parking' }}
    />
    <Stack.Screen 
      name="ParkingDetail" 
      component={ParkingDetailScreen} 
      options={{ title: 'Parking Details' }}
    />
    <Stack.Screen 
      name="Booking" 
      component={BookingScreen} 
      options={{ title: 'Book Parking' }}
    />
    <Stack.Screen 
      name="BookingConfirmation" 
      component={BookingConfirmationScreen} 
      options={{ title: 'Booking Confirmed' }}
    />
  </Stack.Navigator>
);

// Map Stack Navigator
const MapStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: Colors.primary },
      headerTintColor: Colors.white,
      headerTitleStyle: { fontWeight: 'bold' }
    }}
  >
    <Stack.Screen 
      name="MapMain" 
      component={MapScreen} 
      options={{ title: 'Parking Map' }}
    />
    <Stack.Screen 
      name="ParkingDetail" 
      component={ParkingDetailScreen} 
      options={{ title: 'Parking Details' }}
    />
  </Stack.Navigator>
);

// Bookings Stack Navigator
const BookingsStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: Colors.primary },
      headerTintColor: Colors.white,
      headerTitleStyle: { fontWeight: 'bold' }
    }}
  >
    <Stack.Screen 
      name="BookingHistory" 
      component={BookingHistoryScreen} 
      options={{ title: 'My Bookings' }}
    />
    <Stack.Screen 
      name="ActiveBooking" 
      component={ActiveBookingScreen} 
      options={{ title: 'Active Booking' }}
    />
    <Stack.Screen 
      name="QRScanner" 
      component={QRScannerScreen} 
      options={{ title: 'Scan QR Code' }}
    />
  </Stack.Navigator>
);

// Profile Stack Navigator
const ProfileStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: Colors.primary },
      headerTintColor: Colors.white,
      headerTitleStyle: { fontWeight: 'bold' }
    }}
  >
    <Stack.Screen 
      name="ProfileMain" 
      component={ProfileScreen} 
      options={{ title: 'Profile' }}
    />
    <Stack.Screen 
      name="Settings" 
      component={SettingsScreen} 
      options={{ title: 'Settings' }}
    />
    <Stack.Screen 
      name="PaymentMethods" 
      component={PaymentMethodsScreen} 
      options={{ title: 'Payment Methods' }}
    />
    <Stack.Screen 
      name="Notifications" 
      component={NotificationsScreen} 
      options={{ title: 'Notifications' }}
    />
    <Stack.Screen 
      name="Help" 
      component={HelpScreen} 
      options={{ title: 'Help & Support' }}
    />
    <Stack.Screen 
      name="About" 
      component={AboutScreen} 
      options={{ title: 'About ParkSathi' }}
    />
  </Stack.Navigator>
);

// Tab Navigator
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        
        switch (route.name) {
          case 'Home':
            iconName = 'home';
            break;
          case 'Map':
            iconName = 'map';
            break;
          case 'Bookings':
            iconName = 'bookmark';
            break;
          case 'Profile':
            iconName = 'person';
            break;
          default:
            iconName = 'help';
        }
        
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.gray,
      tabBarStyle: {
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        height: 60,
        paddingBottom: 8,
        paddingTop: 8
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600'
      }
    })}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeStackNavigator} 
      options={{ tabBarLabel: 'Home' }}
    />
    <Tab.Screen 
      name="Map" 
      component={MapStackNavigator} 
      options={{ tabBarLabel: 'Map' }}
    />
    <Tab.Screen 
      name="Bookings" 
      component={BookingsStackNavigator} 
      options={{ tabBarLabel: 'Bookings' }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileStackNavigator} 
      options={{ tabBarLabel: 'Profile' }}
    />
  </Tab.Navigator>
);

// Main App Navigator
const AppNavigator = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <SplashScreen />;
  }
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={TabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;