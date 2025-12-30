import React, { useRef } from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  Extrapolate,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Check, X } from 'lucide-react-native';
import { HapticFeedback } from './HapticFeedback';

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'large' | 'medium' | 'small';
}

export function AuthButton({
  title,
  onPress,
  isDisabled = false,
  isLoading = false,
  isSuccess = false,
  isError = false,
  variant = 'primary',
  size = 'large',
}: AuthButtonProps) {
  const scaleAnim = useSharedValue(1);
  const rippleAnim = useSharedValue(0);
  const successAnim = useSharedValue(0);
  const errorAnim = useSharedValue(0);
  const pressAnim = useSharedValue(0);

  // Handle press animations
  const handlePressIn = () => {
    if (!isDisabled && !isLoading) {
      // Enhanced press animation with bounce
      scaleAnim.value = withSpring(0.92, { 
        damping: 12, 
        stiffness: 180,
        mass: 0.8,
      });
      pressAnim.value = withSpring(1, { damping: 15, stiffness: 150 });
      HapticFeedback.lightImpact();
    }
  };

  const handlePressOut = () => {
    if (!isDisabled && !isLoading) {
      // Enhanced release animation with overshoot
      scaleAnim.value = withSpring(1, { 
        damping: 10, 
        stiffness: 200,
        mass: 0.6,
      });
      pressAnim.value = withSpring(0, { damping: 15, stiffness: 150 });
    }
  };

  const handlePress = () => {
    if (!isDisabled && !isLoading) {
      // Enhanced ripple effect with multiple waves
      rippleAnim.value = withSequence(
        withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
      );

      // Enhanced success/error animations
      if (isSuccess) {
        successAnim.value = withSequence(
          withSpring(1.2, { damping: 8, stiffness: 200 }),
          withSpring(1, { damping: 15, stiffness: 150 })
        );
        HapticFeedback.success();
      } else if (isError) {
        errorAnim.value = withSequence(
          withSpring(1, { damping: 8, stiffness: 200 }),
          withSpring(0, { damping: 15, stiffness: 150 })
        );
        HapticFeedback.error();
      } else {
        HapticFeedback.buttonPress();
      }

      onPress();
    }
  };

  // Animated styles
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAnim.value }],
    };
  });

  const rippleAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(rippleAnim.value, [0, 1], [0, 2], Extrapolate.CLAMP);
    const opacity = interpolate(rippleAnim.value, [0, 1], [0.3, 0], Extrapolate.CLAMP);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const successAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(successAnim.value, [0, 1], [0, 1], Extrapolate.CLAMP);
    const opacity = interpolate(successAnim.value, [0, 1], [0, 1], Extrapolate.CLAMP);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const errorAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      errorAnim.value,
      [0, 1],
      [0, 10],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateX }],
    };
  });

  // Get button styles based on variant and size
  const getButtonStyles = () => {
    const baseStyles = {
      borderRadius: 25, // Match input field border radius for consistency
      paddingVertical: size === 'large' ? 18 : size === 'medium' ? 16 : 12,
      paddingHorizontal: size === 'large' ? 40 : size === 'medium' ? 32 : 24,
      minHeight: size === 'large' ? 56 : size === 'medium' ? 48 : 40,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
        };
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(30, 33, 57, 0.8)',
          borderWidth: 1,
          borderColor: 'rgba(108, 99, 255, 0.3)',
        };
      case 'ghost':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
        };
      default:
        return baseStyles;
    }
  };

  const getTextStyles = () => {
    const baseStyles = {
      fontSize: size === 'large' ? 18 : size === 'medium' ? 14 : 12,
      fontWeight: '700' as const,
    };

    switch (variant) {
      case 'primary':
        return { ...baseStyles, color: '#FFFFFF' };
      case 'secondary':
        return { ...baseStyles, color: '#6C63FF' };
      case 'ghost':
        return { ...baseStyles, color: 'rgba(255, 255, 255, 0.7)' };
      default:
        return { ...baseStyles, color: '#FFFFFF' };
    }
  };

  const buttonStyles = getButtonStyles();
  const textStyles = getTextStyles();

  return (
    <View style={styles.container}>
      <Animated.View style={[buttonAnimatedStyle, errorAnimatedStyle]}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          disabled={isDisabled || isLoading}
          style={({ pressed }) => [
            styles.button,
            buttonStyles,
            (isDisabled || isLoading) && styles.disabled,
          ]}
          accessible={true}
          accessibilityLabel={title}
          accessibilityHint={`Double tap to ${title.toLowerCase()}`}
          accessibilityRole="button"
          accessibilityState={{ 
            disabled: isDisabled || isLoading,
            busy: isLoading,
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {/* Ripple Effect */}
          <Animated.View style={[styles.ripple, rippleAnimatedStyle]} />

          {/* Glow Background */}
          {variant === 'primary' && (
            <View style={styles.glowBackground}>
              <LinearGradient
                colors={['rgba(93, 213, 213, 0.15)', 'rgba(168, 85, 247, 0.1)', 'rgba(236, 72, 153, 0.05)']}
                style={StyleSheet.absoluteFillObject}
              />
            </View>
          )}

          {/* Primary Gradient Background - RenoTimeline style (Blue → Purple → Magenta) */}
          {variant === 'primary' && (
            <LinearGradient
              colors={['#3B82F6', '#A855F7', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
          )}

          {/* Content */}
          <View style={styles.content}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : isSuccess ? (
              <Animated.View style={[styles.iconContainer, successAnimatedStyle]}>
                <Check size={20} color="#FFFFFF" />
              </Animated.View>
            ) : (
              <Text style={[styles.text, textStyles]}>{title}</Text>
            )}
          </View>

          {/* Success/Error Icons */}
          {isSuccess && (
            <Animated.View style={[styles.statusIcon, successAnimatedStyle]}>
              <Check size={16} color="#4ADE80" />
            </Animated.View>
          )}
          {isError && (
            <Animated.View style={[styles.statusIcon, errorAnimatedStyle]}>
              <X size={16} color="#FF6B6B" />
            </Animated.View>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  button: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5DD5D5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(30, 33, 57, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(93, 213, 213, 0.4)',
    backdropFilter: 'blur(10px)',
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  glowBackground: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 44,
    zIndex: -1,
  },
  ripple: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    top: '50%',
    left: '50%',
    marginTop: -50,
    marginLeft: -50,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  iconContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -8,
  },
});
