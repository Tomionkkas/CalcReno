import React, { useRef, useEffect } from 'react';
import { View, Text, Dimensions, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Extrapolate,
  Easing,
} from 'react-native-reanimated';

const { height } = Dimensions.get('window');

interface AnimatedLogoProps {
  isLogin: boolean;
  deviceCapabilities?: {
    isHighEnd?: boolean;
    isLowEnd?: boolean;
  };
}

export function AnimatedLogo({ isLogin, deviceCapabilities }: AnimatedLogoProps) {
  
  // Enhanced animation values
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);
  const rotation = useSharedValue(0);
  const colorShift = useSharedValue(0);
  const pulse = useSharedValue(0);

  // Enhanced entrance and continuous animations
  useEffect(() => {
    // Enhanced entrance animation with bounce
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 120,
      mass: 0.8,
    });
    opacity.value = withTiming(1, { duration: 800 });
    
    // Continuous glow pulse with varying intensity
    const glowDuration = deviceCapabilities?.isHighEnd ? 3000 : deviceCapabilities?.isLowEnd ? 5000 : 4000;
    glowOpacity.value = withRepeat(
      withTiming(0.8, { duration: glowDuration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Subtle rotation with easing
    const rotationDuration = deviceCapabilities?.isHighEnd ? 12000 : deviceCapabilities?.isLowEnd ? 18000 : 15000;
    rotation.value = withRepeat(
      withTiming(1, { duration: rotationDuration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Color temperature shifts
    const colorDuration = deviceCapabilities?.isHighEnd ? 6000 : deviceCapabilities?.isLowEnd ? 10000 : 8000;
    colorShift.value = withRepeat(
      withTiming(1, { duration: colorDuration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Breathing pulse effect
    const pulseDuration = deviceCapabilities?.isHighEnd ? 1500 : deviceCapabilities?.isLowEnd ? 2500 : 2000;
    pulse.value = withRepeat(
      withTiming(1, { duration: pulseDuration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  // Enhanced animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => {
    const pulseScale = interpolate(
      pulse.value,
      [0, 1],
      [1, 1.05],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [
        { scale: scale.value * pulseScale },
        { rotate: `${rotation.value * 2}deg` },
      ],
      opacity: opacity.value,
    };
  });

  // Static text styles - no pulse animation
  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [
      { scale: interpolate(pulse.value, [0, 1], [1, 1.1], Extrapolate.CLAMP) },
    ],
  }));

  const gradientAnimatedStyle = useAnimatedStyle(() => {
    const startColor = interpolate(
      colorShift.value,
      [0, 1],
      ['rgba(108, 99, 255, 0.2)', 'rgba(139, 92, 246, 0.2)'],
      Extrapolate.CLAMP
    );
    const endColor = interpolate(
      colorShift.value,
      [0, 1],
      ['rgba(108, 99, 255, 0.1)', 'rgba(168, 85, 247, 0.1)'],
      Extrapolate.CLAMP
    );
    
    return {
      backgroundColor: startColor,
    };
  });

  return (
    <View style={styles.container}>
      {/* Glow Background */}
      <Animated.View style={[styles.glowContainer, glowAnimatedStyle]}>
        <View style={styles.glowCircle} />
      </Animated.View>

      {/* Logo Container */}
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <Animated.View style={[styles.logoGradient, gradientAnimatedStyle]}>
          <View style={styles.logoInner}>
            <Image
              source={require('../../../../assets/images/calculator-house.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </Animated.View>
      </Animated.View>

      {/* Title */}
      <Animated.Text style={[styles.title, textAnimatedStyle]}>
        CalcReno
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, textAnimatedStyle]}>
        {isLogin 
          ? 'Witaj ponownie! Zaloguj się aby kontynuować' 
          : 'Utwórz konto i rozpocznij pierwszy projekt'
        }
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: height * 0.08,
    marginBottom: 40,
  },
  glowContainer: {
    position: 'absolute',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(108, 99, 255, 0.4)',
  },
  logoInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(108, 99, 255, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#B8BCC8',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
});
