import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, Linking } from 'react-native';
import { supabase } from './supabase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class PushNotificationService {
  static async registerForPushNotifications() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'CalcReno Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4F46E5',
      });

      // Channel for high priority notifications
      await Notifications.setNotificationChannelAsync('high-priority', {
        name: 'High Priority Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#EF4444',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }
      
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        
        token = (await Notifications.getExpoPushTokenAsync({
          projectId,
        })).data;
        
        console.log('Push token registered:', token);
        
        // Save token to Supabase for the current user
        await this.savePushTokenToDatabase(token);
        
      } catch (error) {
        console.log('Error getting push token:', error);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  static async savePushTokenToDatabase(token: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Store in user_profiles table with push_token field for now
      // We'll create the user_push_tokens table later in migration
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          push_token: token,
          platform: Platform.OS,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving push token:', error);
      } else {
        console.log('Push token saved successfully');
      }
    } catch (error) {
      console.error('Error in savePushTokenToDatabase:', error);
    }
  }

  static async handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data;
    
    if (data?.type === 'renotimeline_notification') {
      console.log('Handling RenoTimeline notification:', data);
      
      // Handle different notification types with deep linking
      switch (data.notification_type) {
        case 'progress_update':
          if (data.project_id && typeof data.project_id === 'string') {
            await Linking.openURL(`calcreno://project/${data.project_id}`);
          }
          break;
        case 'budget_alert':
          if (data.project_id && typeof data.project_id === 'string') {
            await Linking.openURL(`calcreno://project/${data.project_id}/budget`);
          }
          break;
        case 'milestone':
          if (data.action_url && typeof data.action_url === 'string') {
            await Linking.openURL(data.action_url);
          } else if (data.project_id && typeof data.project_id === 'string') {
            await Linking.openURL(`calcreno://project/${data.project_id}`);
          }
          break;
        case 'delay_warning':
          if (data.action_url && typeof data.action_url === 'string') {
            await Linking.openURL(data.action_url);
          }
          break;
        default:
          // Open notification center by default
          console.log('Opening notification center');
          break;
      }
    }
  }

  static setupNotificationListeners() {
    // Handle notifications when app is running (foreground)
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
      
      // Update badge count
      const currentBadgeCount = notification.request.content.badge || 0;
      Notifications.setBadgeCountAsync(currentBadgeCount);
    });

    // Handle notification taps (when user taps notification)
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      this.handleNotificationResponse
    );

    // Handle notifications when app comes to foreground
    const backgroundListener = Notifications.addNotificationReceivedListener(notification => {
      if (notification.request.content.data?.type === 'renotimeline_notification') {
        // Optionally show in-app notification or update UI
        console.log('Background notification from RenoTimeline:', notification);
      }
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
      backgroundListener.remove();
    };
  }

  // Clear all notifications
  static async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
    await Notifications.setBadgeCountAsync(0);
  }

  // Clear only RenoTimeline notifications
  static async clearRenoTimelineNotifications() {
    try {
      // Get all delivered notifications
      const deliveredNotifications = await Notifications.getPresentedNotificationsAsync();
      
      // Filter for RenoTimeline notifications and dismiss them
      const renoTimelineNotifications = deliveredNotifications.filter(
        notification => notification.request.content.data?.type === 'renotimeline_notification'
      );
      
      // Dismiss each RenoTimeline notification
      for (const notification of renoTimelineNotifications) {
        await Notifications.dismissNotificationAsync(notification.request.identifier);
      }
      
      console.log(`Cleared ${renoTimelineNotifications.length} RenoTimeline notifications`);
    } catch (error) {
      console.error('Error clearing RenoTimeline notifications:', error);
    }
  }

  // Get current badge count
  static async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  // Update badge count
  static async updateBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }

  // Send local notification when new notification arrives
  static async sendLocalNotification(notification: any) {
    try {
      const isHighPriority = notification.priority === 'high';
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.message,
          data: {
            type: 'renotimeline_notification',
            notification_type: notification.notification_type,
            project_id: notification.project_id,
            calcreno_project_id: notification.calcreno_project_id,
            notification_id: notification.id,
            action_url: notification.data?.renotimeline_url,
          },
          sound: true,
          ...(Platform.OS === 'android' && {
            channelId: isHighPriority ? 'high-priority' : 'default'
          })
        },
        trigger: null, // Show immediately
      });
      
      console.log('Local notification sent:', notification.title);
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }
} 