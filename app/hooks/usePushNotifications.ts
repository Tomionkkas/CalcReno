import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { PushNotificationService } from '../utils/pushNotifications';

export function usePushNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    // Setup notification listeners
    try {
      cleanup = PushNotificationService.setupNotificationListeners();
    } catch (error) {
      console.error('Failed to setup notification listeners:', error);
    }
    
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  useEffect(() => {
    // Register for push notifications when user logs in
    if (user) {
      const registerToken = async () => {
        try {
          await PushNotificationService.registerForPushNotifications();
        } catch (error) {
          console.error('Failed to register for push notifications:', error);
        }
      };
      
      registerToken();
    }
  }, [user]);

  return {
    // Could expose push notification methods here if needed
  };
} 