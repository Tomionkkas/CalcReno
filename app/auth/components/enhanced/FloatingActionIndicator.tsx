import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { CheckCircle, AlertCircle, Info, Loader } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  Extrapolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

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
  const translateY = useSharedValue(-20);
  const scale = useSharedValue(0.95);
  const iconRotation = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      // Reset values
      opacity.value = 0;
      translateY.value = -20;
      scale.value = 0.95;
      progressWidth.value = 0;

      // Entrance animation - smooth slide down and fade in
      opacity.value = withSpring(1, { damping: 20, stiffness: 300 });
      translateY.value = withSpring(0, { damping: 18, stiffness: 280 });
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });

      // Progress bar animation (shows auto-dismiss timing)
      progressWidth.value = withTiming(100, {
        duration: 3000,
        easing: Easing.linear
      });

      // Only rotate icon for loading state
      if (type === 'loading') {
        iconRotation.value = withRepeat(
          withTiming(360, { duration: 1000, easing: Easing.linear }),
          -1,
          false
        );
      } else {
        iconRotation.value = 0;
      }

      // Auto-hide after 3 seconds
      const hideTimer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 200 });
        translateY.value = withTiming(-20, { duration: 200 });
        scale.value = withTiming(0.95, { duration: 200 });

        setTimeout(() => {
          onComplete?.();
        }, 250);
      }, 3000);

      return () => clearTimeout(hideTimer);
    }
  }, [isVisible, type]);

  const getIndicatorConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          borderColor: 'rgba(34, 197, 94, 0.3)',
          iconColor: '#22C55E',
          textColor: '#22C55E',
          progressColor: '#22C55E',
          Icon: CheckCircle,
        };
      case 'error':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          iconColor: '#EF4444',
          textColor: '#EF4444',
          progressColor: '#EF4444',
          Icon: AlertCircle,
        };
      case 'loading':
        return {
          backgroundColor: 'rgba(108, 99, 255, 0.15)',
          borderColor: 'rgba(108, 99, 255, 0.3)',
          iconColor: '#6C63FF',
          textColor: '#6C63FF',
          progressColor: '#6C63FF',
          Icon: Loader,
        };
      default:
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          iconColor: '#3B82F6',
          textColor: '#3B82F6',
          progressColor: '#3B82F6',
          Icon: Info,
        };
    }
  };

  const getPositionStyle = () => {
    switch (position) {
      case 'top':
        return { top: Platform.OS === 'ios' ? 60 : 40 };
      case 'bottom':
        return { bottom: Platform.OS === 'ios' ? 100 : 80 };
      case 'center':
        return { top: '40%' };
      default:
        return { top: Platform.OS === 'ios' ? 60 : 40 };
    }
  };

  const config = getIndicatorConfig();
  const positionStyle = getPositionStyle();
  const IconComponent = config.Icon;

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotation.value}deg` }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${100 - progressWidth.value}%`,
  }));

  if (!isVisible && opacity.value === 0) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, positionStyle, containerAnimatedStyle]}>
      <View
        style={[
          styles.indicator,
          {
            backgroundColor: config.backgroundColor,
            borderColor: config.borderColor,
          },
        ]}
      >
        {/* Icon */}
        <Animated.View style={iconAnimatedStyle}>
          <IconComponent size={18} color={config.iconColor} />
        </Animated.View>

        {/* Message */}
        {message && (
          <Text
            style={[styles.message, { color: config.textColor }]}
            numberOfLines={2}
          >
            {message}
          </Text>
        )}

        {/* Progress bar (shows remaining time) */}
        <View style={styles.progressContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              { backgroundColor: config.progressColor },
              progressAnimatedStyle,
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
    elevation: 9999,
    alignItems: 'center',
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: width - 40,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: 'rgba(30, 33, 57, 0.95)',
    overflow: 'hidden',
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
    lineHeight: 18,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    borderRadius: 3,
  },
});
