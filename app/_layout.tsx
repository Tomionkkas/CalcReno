import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import "../global.css";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { AuthScreen } from "./auth/AuthScreen";
import { MigrationScreen } from "./components/MigrationScreen";
import { DataMigrationService } from "./utils/migration";
import { View, Text } from "react-native";
import { NotificationCenter } from './components/NotificationCenter';
import { PushNotificationService } from './utils/pushNotifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MigrationPrompt } from './components/MigrationPrompt';
import { OnboardingModal } from './components/OnboardingModal';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { user, loading, isGuest } = useAuth();
  const [showMigration, setShowMigration] = useState(false);
  const [migrationChecked, setMigrationChecked] = useState(false);

  // Reset migration check when user changes (login/logout)
  useEffect(() => {
    setMigrationChecked(false);
    setShowMigration(false);
  }, [user?.id]); // Reset when user ID changes (including logout)

  // Check if migration is needed when user logs in
  useEffect(() => {
    const checkMigration = async () => {
      if (user && !migrationChecked) {
        const shouldPrompt = await DataMigrationService.shouldPromptMigration();
        setShowMigration(shouldPrompt);
        setMigrationChecked(true);
      } else if (!user) {
        // Reset state when user logs out
        setShowMigration(false);
        setMigrationChecked(false);
      }
    };

    checkMigration();
  }, [user, migrationChecked]);

  // Show loading screen while checking auth
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-600">Ładowanie...</Text>
      </View>
    );
  }

  // Show auth screen if not logged in and not in guest mode
  if (!user && !isGuest) {
    return <AuthScreen />;
  }

  // Show migration screen if user needs to migrate
  if (user && showMigration) {
    return (
      <MigrationScreen
        onComplete={() => setShowMigration(false)}
        onSkip={() => setShowMigration(false)}
      />
    );
  }

  // Show main app
  return (
    <Stack
      screenOptions={({ route }) => ({
        headerShown: false,
      })}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="add-project" options={{ headerShown: false }} />
      <Stack.Screen name="project/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (process.env.EXPO_PUBLIC_TEMPO && Platform.OS === "web") {
      const { TempoDevtools } = require("tempo-devtools");
      TempoDevtools.init();
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    // Initialize notification listeners when app starts
    const cleanup = PushNotificationService.setupNotificationListeners();
    return cleanup;
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#4F46E5',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerRight: () => <NotificationCenter />,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth/AuthScreen" options={{ headerShown: false }} />
          <Stack.Screen name="migration/MigrationScreen" options={{ headerShown: false }} />
          <Stack.Screen name="project/[id]" options={{ title: 'Projekt' }} />
        </Stack>
        <MigrationPrompt />
        <OnboardingModal />
      </GestureHandlerRootView>
    </AuthProvider>
  );
}
