import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { Platform, NativeModules } from 'react-native';

const { WidgetModule } = NativeModules;

export function useWidgetSync() {
  const { session, user } = useAuth();

  useEffect(() => {
    if (Platform.OS !== 'android' || !WidgetModule) return;

    const syncToWidget = async () => {
      try {
        if (session?.access_token && user?.id) {
          // Save the token and user ID to shared preferences using our native module
          WidgetModule.setData('auth_token', session.access_token);
          WidgetModule.setData('user_id', user.id);
          console.log('✅ Widget Sync: Auth token synced to Android Widget via Native Module');
        } else {
          // Clear the data if logged out
          WidgetModule.setData('auth_token', '');
          WidgetModule.setData('user_id', '');
          console.log('✅ Widget Sync: Auth token cleared from Android Widget');
        }
      } catch (error) {
        console.error('❌ Widget Sync Error:', error);
      }
    };

    syncToWidget();
  }, [session, user]);
}
