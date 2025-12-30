import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../../../utils/theme';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: string;
  size: number;
  color: string;
  initialX: number;
  initialY: number;
  duration: number;
  delay: number;
  floatDistance: number;
  rotationDuration: number;
}

interface ParticleBackgroundProps {
  deviceCapabilities?: {
    isLowEnd?: boolean;
    isMidRange?: boolean;
    isHighEnd?: boolean;
  };
}

// Generate random particle configurations
const generateParticles = (count: number): Particle[] => {
  const particleColors = [
    colors.particles.primary,   // Cyan
    colors.particles.secondary, // Purple
    colors.particles.tertiary,  // Magenta
  ];

  const sizes = [3, 4, 5, 6]; // Smaller, more subtle particles

  return Array.from({ length: count }, (_, index) => ({
    id: `particle-${index}`,
    size: sizes[Math.floor(Math.random() * sizes.length)],
    color: particleColors[Math.floor(Math.random() * particleColors.length)],
    initialX: Math.random() * width,
    initialY: Math.random() * height,
    duration: 3000 + Math.random() * 5000, // 3000-8000ms
    delay: Math.random() * 2000,
    floatDistance: 15 + Math.random() * 10, // 15-25px
    rotationDuration: 12000 + Math.random() * 6000, // 12000-18000ms
  }));
};

function AnimatedParticle({ particle }: { particle: Particle }) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0.2);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Vertical float animation
    translateY.value = withDelay(
      particle.delay,
      withRepeat(
        withSequence(
          withTiming(-particle.floatDistance, {
            duration: particle.duration,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(particle.floatDistance, {
            duration: particle.duration,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1, // Infinite repeat
        false
      )
    );

    // Horizontal drift animation
    translateX.value = withDelay(
      particle.delay + 500,
      withRepeat(
        withSequence(
          withTiming(particle.floatDistance * 0.5, {
            duration: particle.duration * 1.5,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(-particle.floatDistance * 0.5, {
            duration: particle.duration * 1.5,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      )
    );

    // Opacity pulse animation (more subtle)
    opacity.value = withDelay(
      particle.delay,
      withRepeat(
        withSequence(
          withTiming(0.3, {
            duration: particle.duration,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0.15, {
            duration: particle.duration,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        false
      )
    );

    // Rotation animation (for visual interest)
    rotation.value = withDelay(
      particle.delay,
      withRepeat(
        withTiming(360, {
          duration: particle.rotationDuration,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: particle.initialX,
          top: particle.initialY,
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
          borderRadius: particle.size / 2,
        },
        animatedStyle,
      ]}
    />
  );
}

// Helper function for withDelay (creating a simple delay)
function withDelay(delay: number, animation: any) {
  'worklet';
  return withSequence(
    withTiming(0, { duration: delay }),
    animation
  );
}

export function ParticleBackground({ deviceCapabilities }: ParticleBackgroundProps) {
  // Determine particle count based on device capability (reduced for minimal design)
  const getParticleCount = () => {
    if (deviceCapabilities?.isLowEnd) return 5;
    if (deviceCapabilities?.isMidRange) return 8;
    return 12; // High-end or default (reduced from 20)
  };

  const particles = React.useMemo(
    () => generateParticles(getParticleCount()),
    [deviceCapabilities]
  );

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle) => (
        <AnimatedParticle key={particle.id} particle={particle} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
});
