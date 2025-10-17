import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, sharedSupabase } from '../utils/supabase';

export interface UserSettings {
  theme: 'dark' | 'light';
  language: 'pl' | 'en';
  auto_save: boolean;
  quiet_hours: {
    end: string;
    start: string;
    enabled: boolean;
  };
  haptic_feedback: boolean;
  measurement_unit: 'metric' | 'imperial';
  notifications_enabled: boolean;
  default_project_status: string;
}

interface SettingsContextType extends UserSettings {
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  exportUserData: () => Promise<void>;
  loading: boolean;
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  language: 'pl',
  auto_save: true,
  quiet_hours: {
    end: '08:00',
    start: '22:00',
    enabled: false,
  },
  haptic_feedback: true,
  measurement_unit: 'metric',
  notifications_enabled: true,
  default_project_status: 'Planowany',
};

const SETTINGS_KEY = 'calcreno_user_settings';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Load settings from Supabase or AsyncStorage
  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await sharedSupabase
            .from('app_preferences')
            .select('preferences')
            .eq('user_id', user.id)
            .eq('app_name', 'calcreno')
            .single();
          if (!error && data && data.preferences) {
            setSettings({ ...defaultSettings, ...data.preferences });
            await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(data.preferences));
          } else {
            // fallback to AsyncStorage
            const local = await AsyncStorage.getItem(SETTINGS_KEY);
            if (local) setSettings({ ...defaultSettings, ...JSON.parse(local) });
          }
        } else {
          // fallback to AsyncStorage
          const local = await AsyncStorage.getItem(SETTINGS_KEY);
          if (local) setSettings({ ...defaultSettings, ...JSON.parse(local) });
        }
      } catch (e) {
        // fallback to defaults
        setSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Update settings in Supabase and AsyncStorage
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings((prev) => ({ ...prev, ...newSettings }));
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Use upsert to create or update app preferences
      await sharedSupabase
        .from('app_preferences')
        .upsert({
          user_id: user.id,
          app_name: 'calcreno',
          preferences: updatedSettings,
        })
        .select();
    }
  };

  // Reset settings to default
  const resetSettings = async () => {
    setSettings(defaultSettings);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await sharedSupabase
        .from('app_preferences')
        .upsert({
          user_id: user.id,
          app_name: 'calcreno',
          preferences: defaultSettings,
        })
        .select();
    }
  };

  // Placeholder for exportUserData
  const exportUserData = async () => {
    // To be implemented in Phase 4
    return;
  };

  return (
    <SettingsContext.Provider value={{ ...settings, updateSettings, resetSettings, exportUserData, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
} 