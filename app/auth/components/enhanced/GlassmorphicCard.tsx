import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface GlassmorphicCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  glowColor?: string;
  borderRadius?: number;
  padding?: number;
}

export function GlassmorphicCard({
  children,
  style,
  intensity = 20,
  glowColor = '#6C63FF',
  borderRadius = 20,
  padding = 20,
}: GlassmorphicCardProps) {
  // Animation values
  const glowOpacity = useSharedValue(0.3);
  const scale = useSharedValue(1);
  const borderOpacity = useSharedValue(0.5);

  useEffect(() => {
    // Subtle glow animation
    glowOpacity.value = withRepeat(
      withTiming(0.6, { duration: 3000 }),
      -1,
      true
    );

    // Subtle border animation
    borderOpacity.value = withRepeat(
      withTiming(0.8, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const borderAnimatedStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
  }));

  return (
    <Animated.View
      style={[styles.container, cardAnimatedStyle, style]}
    >
      {/* Glow Background */}
      <Animated.View style={[styles.glowBackground, glowAnimatedStyle]}>
        <LinearGradient
          colors={[
            `${glowColor}20`,
            `${glowColor}10`,
            `${glowColor}05`,
          ]}
          style={[
            styles.glowGradient,
            { borderRadius: borderRadius + 10 },
          ]}
        />
      </Animated.View>

      {/* Blur Container */}
      <BlurView
        intensity={intensity}
        tint="dark"
        style={[
          styles.blurContainer,
          {
            borderRadius,
            padding,
          },
        ]}
      >
        {/* Animated Border */}
        <Animated.View
          style={[
            styles.animatedBorder,
            borderAnimatedStyle,
            {
              borderRadius,
              borderColor: glowColor,
            },
          ]}
        />

        {/* Content */}
        <View style={styles.content}>{children}</View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  glowBackground: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    zIndex: -1,
  },
  glowGradient: {
    flex: 1,
  },
  blurContainer: {
    position: 'relative',
    backgroundColor: 'rgba(30, 33, 57, 0.3)',
    overflow: 'hidden',
  },
  animatedBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderRadius: 20,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
