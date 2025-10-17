import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSettings } from '../hooks/useSettings';

const SETTINGS_KEY = 'calcreno_user_settings';

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

export const SettingsStorage = {
  async getSettings(): Promise<UserSettings> {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    try {
      return { ...defaultSettings, ...JSON.parse(raw) };
    } catch {
      return defaultSettings;
    }
  },
  async setSettings(settings: Partial<UserSettings>) {
    const current = await this.getSettings();
    const merged = { ...current, ...settings };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    return merged;
  },
  async resetSettings() {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    return defaultSettings;
  },
}; 