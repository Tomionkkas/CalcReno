import React, { useEffect, useRef } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolate,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  deviceCapabilities?: {
    isHighEnd?: boolean;
    isLowEnd?: boolean;
  };
}

export function AnimatedBackground({ children, deviceCapabilities }: AnimatedBackgroundProps) {
  
  // Enhanced parallax animation values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(0);

  // Enhanced gradient animation values
  const gradientOpacity = useSharedValue(0.8);
  const gradientRotation = useSharedValue(0);
  const colorShift = useSharedValue(0);

  useEffect(() => {
    // Enhanced gradient animation with color shifts
    gradientOpacity.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    gradientRotation.value = withRepeat(
      withTiming(360, { duration: 25000, easing: Easing.linear }),
      -1,
      false
    );

    // Color temperature shifts
    colorShift.value = withRepeat(
      withTiming(1, { duration: 12000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Breathing pulse effect
    pulse.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

      // Enhanced background movement with varying speeds
  const moveBackground = () => {
    const durationX = deviceCapabilities?.isHighEnd ? 10000 : deviceCapabilities?.isLowEnd ? 15000 : 12000;
    const durationY = deviceCapabilities?.isHighEnd ? 6000 : deviceCapabilities?.isLowEnd ? 10000 : 8000;
    
    translateX.value = withRepeat(
      withTiming(15, { duration: durationX, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    translateY.value = withRepeat(
      withTiming(8, { duration: durationY, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  };

    moveBackground();
  }, []);

  // Enhanced animated styles
  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    const pulseScale = interpolate(
      pulse.value,
      [0, 1],
      [1, 1.02],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value * pulseScale },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  const gradientAnimatedStyle = useAnimatedStyle(() => {
    const colorOpacity = interpolate(
      colorShift.value,
      [0, 1],
      [0.8, 1.2],
      Extrapolate.CLAMP
    );
    
    return {
      opacity: gradientOpacity.value * colorOpacity,
      transform: [
        { rotate: `${gradientRotation.value}deg` },
      ],
    };
  });

  const particlesAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value * 0.5 },
      { translateY: translateY.value * 0.5 },
    ],
  }));

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Base Gradient Background */}
      <LinearGradient
        colors={['#0A0B1E', '#151829', '#1E2139', '#2A2D4A']}
        style={styles.baseGradient}
      />

      {/* Animated Gradient Overlay */}
      <Animated.View style={[styles.gradientOverlay, gradientAnimatedStyle]}>
        <LinearGradient
          colors={[
            'rgba(108, 99, 255, 0.1)',
            'rgba(108, 99, 255, 0.05)',
            'rgba(108, 99, 255, 0.1)',
          ]}
          style={styles.animatedGradient}
        />
      </Animated.View>

      {/* Animated Background Elements */}
      <Animated.View style={[styles.backgroundElements, backgroundAnimatedStyle]} pointerEvents="none">
        {/* Glow Orbs */}
        <View style={[styles.glowOrb, styles.glowOrb1]} />
        <View style={[styles.glowOrb, styles.glowOrb2]} />
        <View style={[styles.glowOrb, styles.glowOrb3]} />
        
        {/* Geometric Shapes */}
        <View style={[styles.geometricShape, styles.shape1]} />
        <View style={[styles.geometricShape, styles.shape2]} />
        <View style={[styles.geometricShape, styles.shape3]} />
      </Animated.View>

      {/* Animated Particles */}
      <Animated.View style={[styles.particlesContainer, particlesAnimatedStyle]}>
        <View style={styles.particle1} />
        <View style={styles.particle2} />
        <View style={styles.particle3} />
      </Animated.View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  baseGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  animatedGradient: {
    flex: 1,
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  glowOrb: {
    position: 'absolute',
    borderRadius: 50,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  glowOrb1: {
    width: 120,
    height: 120,
    top: '10%',
    left: '10%',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  glowOrb2: {
    width: 80,
    height: 80,
    top: '60%',
    right: '15%',
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
  },
  glowOrb3: {
    width: 60,
    height: 60,
    bottom: '20%',
    left: '20%',
    backgroundColor: 'rgba(108, 99, 255, 0.06)',
  },
  geometricShape: {
    position: 'absolute',
    opacity: 0.1,
  },
  shape1: {
    width: 40,
    height: 40,
    top: '30%',
    right: '10%',
    backgroundColor: '#6C63FF',
    transform: [{ rotate: '45deg' }],
  },
  shape2: {
    width: 30,
    height: 30,
    bottom: '40%',
    left: '5%',
    backgroundColor: '#6C63FF',
    borderRadius: 15,
  },
  shape3: {
    width: 50,
    height: 25,
    top: '70%',
    right: '25%',
    backgroundColor: '#6C63FF',
    borderRadius: 12.5,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  particle1: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(108, 99, 255, 0.3)',
    top: '20%',
    left: '15%',
  },
  particle2: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
    top: '60%',
    right: '20%',
  },
  particle3: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(108, 99, 255, 0.25)',
    bottom: '30%',
    left: '25%',
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
});
