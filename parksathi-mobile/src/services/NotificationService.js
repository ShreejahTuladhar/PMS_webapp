/**
 * Push Notification Service for ParkSathi Mobile
 * Author: Shreeraj Tuladhar - 1Ox4Fox LLC
 * Firebase Cloud Messaging integration
 */

import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import { Platform, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from './ApiService';

class NotificationService {
  constructor() {
    this.isInitialized = false;
    this.fcmToken = null;
  }

  // Initialize notification service
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Configure local notifications
      this.configureLocalNotifications();
      
      // Request permission for notifications
      await this.requestUserPermission();
      
      // Get FCM token
      await this.getFCMToken();
      
      // Setup message handlers
      this.setupMessageHandlers();
      
      this.isInitialized = true;
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Notification service initialization error:', error);
    }
  }

  // Configure local push notifications
  configureLocalNotifications() {
    PushNotification.configure({
      // Called when token is generated
      onRegister: (token) => {
        console.log('Local notification token:', token);
      },

      // Called when a remote or local notification is opened or received
      onNotification: (notification) => {
        console.log('Notification received:', notification);
        this.handleNotificationReceived(notification);
      },

      // iOS only - called when the user fails to register for remote notifications
      onRegistrationError: (error) => {
        console.error('Notification registration error:', error);
      },

      // IOS only - Required for notification completion
      onAction: (notification) => {
        console.log('Notification action:', notification.action);
        this.handleNotificationAction(notification);
      },

      // Called when the user registers for remote notifications
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      popInitialNotification: true,
      requestPermissions: true,
    });

    // Create notification channels (Android)
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'parksathi-default',
          channelName: 'ParkSathi Notifications',
          channelDescription: 'Default notifications for ParkSathi app',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log('Default channel created:', created)
      );

      PushNotification.createChannel(
        {
          channelId: 'parksathi-booking',
          channelName: 'Booking Updates',
          channelDescription: 'Notifications for parking booking updates',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log('Booking channel created:', created)
      );

      PushNotification.createChannel(
        {
          channelId: 'parksathi-reminders',
          channelName: 'Parking Reminders',
          channelDescription: 'Reminders for parking expiry and extensions',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log('Reminders channel created:', created)
      );
    }
  }

  // Request permission to receive notifications
  async requestUserPermission() {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Notification permission granted');
        return true;
      } else {
        console.log('Notification permission denied');
        Alert.alert(
          'Notification Permission',
          'Enable notifications to receive booking updates and reminders.',
          [
            { text: 'Not Now', style: 'cancel' },
            { text: 'Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Get FCM token for this device
  async getFCMToken() {
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log('FCM Token:', fcmToken);
        this.fcmToken = fcmToken;
        
        // Save token locally
        await AsyncStorage.setItem('fcm_token', fcmToken);
        
        // Send token to backend
        await this.registerTokenWithBackend(fcmToken);
        
        return fcmToken;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
  }

  // Register FCM token with backend
  async registerTokenWithBackend(token) {
    try {
      await ApiService.post('/notifications/register-token', {
        token,
        platform: Platform.OS,
        appVersion: '1.0.0'
      });
      console.log('FCM token registered with backend');
    } catch (error) {
      console.error('Error registering FCM token:', error);
    }
  }

  // Setup message handlers
  setupMessageHandlers() {
    // Handle background messages
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Message handled in background:', remoteMessage);
      this.handleBackgroundMessage(remoteMessage);
    });

    // Handle foreground messages
    messaging().onMessage(async (remoteMessage) => {
      console.log('Message received in foreground:', remoteMessage);
      this.handleForegroundMessage(remoteMessage);
    });

    // Handle notification opened when app was closed
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('App opened from notification:', remoteMessage);
          this.handleNotificationOpened(remoteMessage);
        }
      });

    // Handle notification opened when app was in background
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('App opened from background notification:', remoteMessage);
      this.handleNotificationOpened(remoteMessage);
    });

    // Handle token refresh
    messaging().onTokenRefresh((token) => {
      console.log('FCM token refreshed:', token);
      this.fcmToken = token;
      AsyncStorage.setItem('fcm_token', token);
      this.registerTokenWithBackend(token);
    });
  }

  // Handle background message
  handleBackgroundMessage(remoteMessage) {
    // Process notification silently in background
    if (remoteMessage.data?.type === 'booking_reminder') {
      this.scheduleLocalNotification({
        title: 'Parking Reminder',
        message: remoteMessage.notification?.body || 'Your parking is expiring soon',
        data: remoteMessage.data
      });
    }
  }

  // Handle foreground message
  handleForegroundMessage(remoteMessage) {
    // Show local notification when app is in foreground
    this.showLocalNotification({
      title: remoteMessage.notification?.title || 'ParkSathi',
      message: remoteMessage.notification?.body || 'You have a new notification',
      data: remoteMessage.data
    });
  }

  // Handle notification opened
  handleNotificationOpened(remoteMessage) {
    const { data } = remoteMessage;
    
    if (data?.type === 'booking_update') {
      // Navigate to booking details
      this.navigateToScreen('Bookings', {
        screen: 'BookingHistory',
        params: { bookingId: data.bookingId }
      });
    } else if (data?.type === 'payment_required') {
      // Navigate to payment screen
      this.navigateToScreen('Profile', {
        screen: 'PaymentMethods'
      });
    }
  }

  // Handle notification received
  handleNotificationReceived(notification) {
    // Update badge count
    if (Platform.OS === 'ios') {
      PushNotification.setApplicationIconBadgeNumber(
        (notification.badge || 0) + 1
      );
    }
  }

  // Handle notification action
  handleNotificationAction(notification) {
    if (notification.action === 'extend_parking') {
      this.navigateToScreen('Bookings', {
        screen: 'ActiveBooking',
        params: { action: 'extend' }
      });
    } else if (notification.action === 'pay_now') {
      this.navigateToScreen('Profile', {
        screen: 'PaymentMethods'
      });
    }
  }

  // Show local notification
  showLocalNotification({ title, message, data = {}, channelId = 'parksathi-default' }) {
    PushNotification.localNotification({
      channelId,
      title,
      message,
      playSound: true,
      soundName: 'default',
      userInfo: data,
      actions: this.getNotificationActions(data.type),
    });
  }

  // Schedule local notification
  scheduleLocalNotification({ 
    title, 
    message, 
    data = {}, 
    date, 
    channelId = 'parksathi-reminders' 
  }) {
    PushNotification.localNotificationSchedule({
      channelId,
      title,
      message,
      date: date || new Date(Date.now() + 5000), // 5 seconds from now
      playSound: true,
      soundName: 'default',
      userInfo: data,
      actions: this.getNotificationActions(data.type),
    });
  }

  // Get notification actions based on type
  getNotificationActions(type) {
    switch (type) {
      case 'booking_expiring':
        return ['extend_parking', 'view_booking'];
      case 'payment_required':
        return ['pay_now', 'view_details'];
      case 'booking_confirmed':
        return ['view_booking', 'get_directions'];
      default:
        return ['view'];
    }
  }

  // Navigation helper (would integrate with navigation service)
  navigateToScreen(navigator, params) {
    // This would be handled by your navigation service
    console.log('Navigate to:', navigator, params);
  }

  // Send parking expiry reminder
  async scheduleParkingReminder(bookingId, expiryTime, reminderMinutes = 15) {
    try {
      const reminderTime = new Date(expiryTime.getTime() - (reminderMinutes * 60 * 1000));
      
      this.scheduleLocalNotification({
        title: 'Parking Expiring Soon',
        message: `Your parking expires in ${reminderMinutes} minutes. Extend now to avoid penalties.`,
        date: reminderTime,
        data: {
          type: 'booking_expiring',
          bookingId,
          reminderMinutes
        },
        channelId: 'parksathi-reminders'
      });
      
      console.log('Parking reminder scheduled for:', reminderTime);
    } catch (error) {
      console.error('Error scheduling parking reminder:', error);
    }
  }

  // Cancel scheduled notification
  cancelScheduledNotification(notificationId) {
    PushNotification.cancelLocalNotifications({ id: notificationId });
  }

  // Clear all notifications
  clearAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
    if (Platform.OS === 'ios') {
      PushNotification.setApplicationIconBadgeNumber(0);
    }
  }

  // Get notification settings
  async getNotificationSettings() {
    try {
      const settings = await AsyncStorage.getItem('notification_settings');
      return settings ? JSON.parse(settings) : {
        bookingUpdates: true,
        reminders: true,
        promotions: false,
        nearbyParking: true
      };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return {};
    }
  }

  // Update notification settings
  async updateNotificationSettings(settings) {
    try {
      await AsyncStorage.setItem('notification_settings', JSON.stringify(settings));
      
      // Update backend preferences
      await ApiService.put('/notifications/settings', settings);
      
      console.log('Notification settings updated');
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  }

  // Test notification (for development)
  testNotification() {
    this.showLocalNotification({
      title: 'Test Notification',
      message: 'This is a test notification from ParkSathi',
      data: { type: 'test' }
    });
  }
}

// Singleton instance
const notificationService = new NotificationService();

// Export convenience functions
export const requestUserPermission = () => notificationService.initialize();
export const notificationListener = () => notificationService.setupMessageHandlers();

export default notificationService;