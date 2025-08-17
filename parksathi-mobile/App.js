/**
 * ParkSathi Mobile App - Main Application Component
 * Author: Shreeraj Tuladhar - 1Ox4Fox LLC
 * React Native mobile application for intelligent parking management
 */

import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Platform,
  AppState,
  Alert
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import SplashScreen from 'react-native-splash-screen';
import { requestUserPermission, notificationListener } from './src/services/NotificationService';
import { AuthProvider } from './src/contexts/AuthContext';
import { LocationProvider } from './src/contexts/LocationContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import NetworkStatusProvider from './src/contexts/NetworkStatusContext';
import LoadingOverlay from './src/components/common/LoadingOverlay';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    // Initialize app
    initializeApp();
    
    // Setup app state listener
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      appStateSubscription?.remove();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // Request permissions
      await requestUserPermission();
      
      // Setup notification listeners
      const unsubscribe = notificationListener();
      
      // Hide splash screen after initialization
      setTimeout(() => {
        if (SplashScreen) {
          SplashScreen.hide();
        }
        setIsLoading(false);
      }, 2000);
      
      return unsubscribe;
    } catch (error) {
      console.error('App initialization error:', error);
      Alert.alert(
        'Initialization Error',
        'There was a problem starting the app. Please restart.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleAppStateChange = (nextAppState) => {
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to the foreground
      console.log('App has come to the foreground!');
    }
    setAppState(nextAppState);
  };

  if (isLoading) {
    return <LoadingOverlay visible={true} message="Initializing ParkSathi..." />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <ThemeProvider>
            <NetworkStatusProvider>
              <AuthProvider>
                <LocationProvider>
                  <StatusBar
                    barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
                    backgroundColor="#3B82F6"
                    translucent={Platform.OS === 'android'}
                  />
                  <NavigationContainer>
                    <AppNavigator />
                  </NavigationContainer>
                  <Toast />
                </LocationProvider>
              </AuthProvider>
            </NetworkStatusProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  }
});

export default App;