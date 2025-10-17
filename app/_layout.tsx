import { DefaultTheme, ThemeProvider, Theme } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import "../global.css";
import { Platform, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { AuthScreen } from "./auth/AuthScreen";
import { MigrationScreen } from "./components/MigrationScreen";
import { DataMigrationService } from "./utils/migration";
import { View, Text } from "react-native";
import { PushNotificationService } from './utils/pushNotifications';
import { LinearGradient } from 'expo-linear-gradient';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Custom dark navigation theme
const DarkNavigationTheme: Theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3B82F6', // Blue primary
    background: '#0A0B1E', // Deep navy background
    card: '#151829', // Slightly lighter for cards
    text: '#FFFFFF', // White text
    border: 'rgba(255, 255, 255, 0.1)', // Subtle borders
    notification: '#3B82F6', // Blue for notifications
  },
};

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
      <LinearGradient
        colors={['#0A0B1E', '#151829', '#1E2139']}
        style={{ flex: 1 }}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 32,
        }}>
          {/* App Logo/Icon */}
          <LinearGradient
            colors={['#6C63FF', '#4DABF7']}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 32,
              shadowColor: '#6C63FF',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#FFFFFF',
              opacity: 0.9,
            }} />
          </LinearGradient>
          
          {/* App Name */}
          <Text style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: '#FFFFFF',
            textAlign: 'center',
            marginBottom: 8,
          }}>
            CalcReno
          </Text>
          
          <Text style={{
            fontSize: 16,
            color: '#B8BCC8',
            textAlign: 'center',
            marginBottom: 32,
          }}>
            Kalkulator remontowy
          </Text>
          
          {/* Loading Indicator */}
          <ActivityIndicator size="large" color="#6C63FF" />
          
          <Text style={{
            fontSize: 16,
            color: '#B8BCC8',
            textAlign: 'center',
            marginTop: 16,
          }}>
            Ładowanie...
          </Text>
      </View>
      </LinearGradient>
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
        // Dark background for all screens to prevent white flash
        contentStyle: { backgroundColor: '#0A0B1E' },
        // Ultra-fast transitions - no time wasted
        animation: 'slide_from_right',
        animationDuration: 100, // Instant feel
        // Ensure proper background during transitions
        cardStyle: { backgroundColor: '#0A0B1E' },
        // Instant response easing
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 100,
              easing: 'cubic-bezier(0.4, 0.0, 1, 1)', // Immediate snap
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 80, // Instant close
              easing: 'cubic-bezier(0.4, 0.0, 1, 1)', // Sharp exit
            },
          },
        },
        // Instant slide animation - no wasted time
        cardStyleInterpolator: ({ current, layouts }) => ({
          cardStyle: {
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width * 0.6, 0], // Very direct slide
                }),
              },
            ],
            opacity: current.progress.interpolate({
              inputRange: [0, 0.8, 1],
              outputRange: [0, 1, 1], // Instant opacity
            }),
          },
        }),
      })}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          contentStyle: { backgroundColor: '#0A0B1E' },
        }} 
      />
      <Stack.Screen 
        name="add-project" 
        options={{ 
          headerShown: false,
          contentStyle: { backgroundColor: '#0A0B1E' },
          animation: 'slide_from_right',
          // Instant form access
          animationDuration: 80,
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 80,
                easing: 'cubic-bezier(0.4, 0.0, 1, 1)', // Immediate snap
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 60, // Instant close
                easing: 'cubic-bezier(0.4, 0.0, 1, 1)', // Sharp exit
              },
            },
          },
        }} 
      />
      <Stack.Screen 
        name="project/[id]" 
        options={{ 
          headerShown: false,
          contentStyle: { backgroundColor: '#0A0B1E' },
          animation: 'slide_from_right',
          // Instant content access
          animationDuration: 90,
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 90,
                easing: 'cubic-bezier(0.4, 0.0, 1, 1)', // Immediate snap
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 70, // Instant exit
                easing: 'cubic-bezier(0.4, 0.0, 1, 1)', // Sharp exit
              },
            },
          },
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Removed tempo-devtools import to fix build error
  // useEffect(() => {
  //   if (process.env.EXPO_PUBLIC_TEMPO && Platform.OS === "web") {
  //     const { TempoDevtools } = require("tempo-devtools");
  //     TempoDevtools.init();
  //   }
  // }, []);

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
    <SafeAreaProvider>
      <ThemeProvider value={DarkNavigationTheme}>
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0A0B1E' }}>
            <AppContent />
          </GestureHandlerRootView>
        <StatusBar
          style="light"
          backgroundColor="#0A0B1E"
          translucent={false}
        />
      </ThemeProvider>
    </SafeAreaProvider>
    </AuthProvider>
  );
}
