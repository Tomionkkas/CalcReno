import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
  variant?: 'text' | 'button' | 'input' | 'card';
}

export function SkeletonLoader({
  width: skeletonWidth = '100%',
  height = 20,
  borderRadius = 4,
  style,
  variant = 'text',
}: SkeletonLoaderProps) {
  const shimmerAnim = useSharedValue(0);

  useEffect(() => {
    shimmerAnim.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      true
    );
  }, []);

  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerAnim.value,
      [0, 1],
      [-width, width],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX }],
    };
  });

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'button':
        return {
          height: 48,
          borderRadius: 24,
          width: skeletonWidth,
        };
      case 'input':
        return {
          height: 56,
          borderRadius: 28,
          width: skeletonWidth,
        };
      case 'card':
        return {
          height: 120,
          borderRadius: 16,
          width: skeletonWidth,
        };
      default: // text
        return {
          height,
          borderRadius,
          width: skeletonWidth,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View style={[styles.container, variantStyles, style]}>
      <Animated.View style={[styles.shimmer, shimmerAnimatedStyle]} />
    </View>
  );
}

// Skeleton form component
interface SkeletonFormProps {
  showLogo?: boolean;
  showInputs?: boolean;
  showButton?: boolean;
}

export function SkeletonForm({ 
  showLogo = true, 
  showInputs = true, 
  showButton = true 
}: SkeletonFormProps) {
  return (
    <View style={styles.formContainer}>
      {/* Logo skeleton */}
      {showLogo && (
        <View style={styles.logoContainer}>
          <SkeletonLoader
            width={100}
            height={100}
            borderRadius={50}
            variant="card"
          />
          <View style={styles.logoTextContainer}>
            <SkeletonLoader width={120} height={24} style={styles.logoText} />
            <SkeletonLoader width={200} height={16} style={styles.logoSubtext} />
          </View>
        </View>
      )}

      {/* Inputs skeleton */}
      {showInputs && (
        <View style={styles.inputsContainer}>
          <SkeletonLoader variant="input" style={styles.inputSkeleton} />
          <SkeletonLoader variant="input" style={styles.inputSkeleton} />
        </View>
      )}

      {/* Button skeleton */}
      {showButton && (
        <View style={styles.buttonContainer}>
          <SkeletonLoader variant="button" />
        </View>
      )}
    </View>
  );
}

// Skeleton list component
interface SkeletonListProps {
  count?: number;
  itemHeight?: number;
  spacing?: number;
}

export function SkeletonList({ 
  count = 3, 
  itemHeight = 60, 
  spacing = 12 
}: SkeletonListProps) {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonLoader
          key={index}
          height={itemHeight}
          borderRadius={8}
          style={{ marginBottom: spacing }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ translateX: -width }],
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoTextContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  logoText: {
    marginBottom: 8,
  },
  logoSubtext: {
    opacity: 0.7,
  },
  inputsContainer: {
    marginBottom: 24,
  },
  inputSkeleton: {
    marginBottom: 16,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  listContainer: {
    paddingHorizontal: 24,
  },
});
