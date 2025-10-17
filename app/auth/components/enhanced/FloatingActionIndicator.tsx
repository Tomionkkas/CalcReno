import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  interpolate,
  Extrapolate,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface FloatingActionIndicatorProps {
  type?: 'success' | 'error' | 'info' | 'loading';
  position?: 'top' | 'bottom' | 'center';
  message?: string;
  isVisible?: boolean;
  onComplete?: () => void;
}

export function FloatingActionIndicator({
  type = 'info',
  position = 'top',
  message,
  isVisible = false,
  onComplete,
}: FloatingActionIndicatorProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const translateY = useSharedValue(-50);
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      // Entrance animation
      opacity.value = withSpring(1, { damping: 15, stiffness: 150 });
      scale.value = withSpring(1, { damping: 12, stiffness: 180 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });

      // Start continuous animations
      rotation.value = withRepeat(
        withTiming(360, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );

      pulse.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );

      // Auto-hide after 2.5 seconds for subtle feedback
      setTimeout(() => {
        opacity.value = withSpring(0, { damping: 15, stiffness: 150 });
        scale.value = withSpring(0.8, { damping: 12, stiffness: 180 });
        translateY.value = withSpring(-50, { damping: 15, stiffness: 150 });
        
        setTimeout(() => {
          onComplete?.();
        }, 300);
      }, 2500);
    }
  }, [isVisible]);

  const getIndicatorStyle = () => {
    switch (type) {
      case 'success':
        return {
          colors: ['#4ADE80', '#22C55E'],
          icon: '✓',
        };
      case 'error':
        return {
          colors: ['rgba(239, 68, 68, 0.9)', 'rgba(220, 38, 38, 0.9)'],
          icon: '!',
        };
      case 'loading':
        return {
          colors: ['#6C63FF', '#8B5CF6'],
          icon: '⟳',
        };
      default:
        return {
          colors: ['#6C63FF', '#8B5CF6'],
          icon: 'ℹ',
        };
    }
  };

  const getPositionStyle = () => {
    switch (position) {
      case 'top':
        return { top: height * 0.1 };
      case 'bottom':
        return { bottom: height * 0.1 };
      case 'center':
        return { top: height * 0.4 };
      default:
        return { top: height * 0.1 };
    }
  };

  const indicatorStyle = getIndicatorStyle();
  const positionStyle = getPositionStyle();

  const animatedStyle = useAnimatedStyle(() => {
    const pulseScale = interpolate(
      pulse.value,
      [0, 1],
      [1, 1.05],
      Extrapolate.CLAMP
    );

    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value * pulseScale },
        { translateY: translateY.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    const iconRotation = type === 'loading' ? rotation.value : 0;
    return {
      transform: [{ rotate: `${iconRotation}deg` }],
    };
  });

  return (
    <Animated.View style={[styles.container, positionStyle, animatedStyle]}>
      <LinearGradient
        colors={indicatorStyle.colors}
        style={styles.indicator}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.Text style={[styles.icon, iconAnimatedStyle]}>
          {indicatorStyle.icon}
        </Animated.Text>
        {message && <Animated.Text style={styles.message}>{message}</Animated.Text>}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  icon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 6,
  },
  message: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
