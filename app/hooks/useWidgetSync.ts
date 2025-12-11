import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { Platform, NativeModules } from 'react-native';

const { WidgetModule, WidgetBridgeModule } = NativeModules;

export function useWidgetSync() {
  const { session, user } = useAuth();

  useEffect(() => {
    // Choose the correct native module based on platform
    const widgetModule = Platform.OS === 'android' ? WidgetModule : WidgetBridgeModule;

    console.log(`🔧 [Widget Sync] Platform: ${Platform.OS}`);
    console.log(`🔧 [Widget Sync] Module available:`, !!widgetModule);
    console.log(`🔧 [Widget Sync] Has session:`, !!session);
    console.log(`🔧 [Widget Sync] User ID:`, user?.id);

    if (!widgetModule) {
      console.warn(`❌ [Widget Sync] Widget module not available for ${Platform.OS}`);
      console.warn(`Available modules:`, { WidgetModule, WidgetBridgeModule });
      return;
    }

    const syncToWidget = async () => {
      try {
        if (session?.access_token && user?.id) {
          console.log(`📲 [Widget Sync] Syncing data for user ${user.id.substring(0, 8)}...`);

          // Save the token to shared storage
          console.log(`🔑 [Widget Sync] Saving auth token (length: ${session.access_token.length})`);
          widgetModule.setData('auth_token', session.access_token);

          // iOS: Fetch and cache tasks data proactively (Android fetches in widget)
          if (Platform.OS === 'ios') {
            console.log(`📊 [Widget Sync] Fetching tasks for iOS widget...`);
            const tasks = await fetchTopTasks(session.access_token);
            if (tasks) {
              console.log(`📊 [Widget Sync] Saving ${tasks.length} tasks to widget storage`);
              widgetModule.setData('tasks_data', JSON.stringify(tasks));
            } else {
              console.warn(`⚠️ [Widget Sync] No tasks received from API`);
            }
          } else {
            // Android: Also save user ID (Android widget uses it)
            widgetModule.setData('user_id', user.id);
          }

          console.log(`✅ [Widget Sync] Data synced successfully to ${Platform.OS} widget`);
        } else {
          // Clear the data if logged out
          console.log(`🗑️ [Widget Sync] Clearing widget data (logged out)`);
          if (Platform.OS === 'ios') {
            widgetModule.clearWidgetData();
          } else {
            widgetModule.setData('auth_token', '');
            widgetModule.setData('user_id', '');
          }
          console.log(`✅ [Widget Sync] Widget data cleared`);
        }
      } catch (error) {
        console.error('❌ [Widget Sync] Error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
      }
    };

    syncToWidget();
  }, [session, user]);
}

// Helper function to fetch tasks from Supabase
// iOS widgets cannot make network requests, so we fetch and cache data in RN app
async function fetchTopTasks(token: string): Promise<any[] | null> {
  try {
    console.log('🔍 [Widget Sync] Fetching tasks from Supabase RPC...');
    const response = await fetch(
      'https://kralcmyhjvoiywcpntkg.supabase.co/rest/v1/rpc/get_user_top_tasks',
      {
        method: 'POST',
        headers: {
          'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      }
    );

    console.log(`🔍 [Widget Sync] Response status: ${response.status}`);

    if (response.ok) {
      const result = await response.json();
      console.log(`🔍 [Widget Sync] Raw response:`, JSON.stringify(result).substring(0, 200));

      // The RPC function returns a JSONB array directly
      // Supabase might wrap it in different ways depending on the return type
      let tasks: any[] = [];

      if (Array.isArray(result)) {
        // Direct array response
        tasks = result;
      } else if (result && typeof result === 'object') {
        // Could be wrapped in an object, check common patterns
        tasks = result.data || result[0] || [];
      }

      console.log(`✅ [Widget Sync] Fetched ${tasks?.length || 0} tasks for iOS widget`);
      if (tasks && tasks.length > 0) {
        console.log(`🔍 [Widget Sync] First task:`, JSON.stringify(tasks[0], null, 2));
        console.log(`🔍 [Widget Sync] Task priority:`, tasks[0].priority);
        console.log(`🔍 [Widget Sync] Task assigned_to:`, JSON.stringify(tasks[0].assigned_to));
        console.log(`🔍 [Widget Sync] Task status:`, tasks[0].status);
      }
      return tasks;
    } else {
      const errorText = await response.text();
      console.warn(`⚠️ [Widget Sync] Failed to fetch tasks (${response.status}): ${errorText}`);
    }
  } catch (error) {
    console.error('❌ [Widget Sync] Failed to fetch tasks for widget:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  }
  return null;
}
