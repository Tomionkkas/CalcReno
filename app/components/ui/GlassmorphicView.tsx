import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Platform } from 'react-native';
import { glassmorphism, colors } from '../../utils/theme';

interface GlassmorphicViewProps {
  children: React.ReactNode;
  intensity?: 'light' | 'medium' | 'heavy';
  style?: ViewStyle;
  blurIntensity?: number;
  tint?: 'light' | 'dark';
}

export default function GlassmorphicView({
  children,
  intensity = 'medium',
  style,
  blurIntensity = 20,
  tint = 'dark',
}: GlassmorphicViewProps) {
  const glassStyle = glassmorphism[intensity];

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={blurIntensity}
        tint={tint}
        style={[styles.container, glassStyle, style]}
      >
        {children}
      </BlurView>
    );
  }

  // Fallback for Android with custom glassmorphism effect
  return (
    <View style={[styles.container, glassStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
