import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { animations } from '../utils/theme';

export function useAccessibility() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);

  useEffect(() => {
    // Check initial accessibility settings
    const checkAccessibilitySettings = async () => {
      try {
        const reducedMotion = await AccessibilityInfo.isReduceMotionEnabled();
        const screenReader = await AccessibilityInfo.isScreenReaderEnabled();
        
        setPrefersReducedMotion(reducedMotion);
        setIsScreenReaderEnabled(screenReader);
      } catch (error) {
        console.warn('Error checking accessibility settings:', error);
      }
    };

    checkAccessibilitySettings();

    // Listen for changes in accessibility settings
    const reducedMotionSubscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setPrefersReducedMotion
    );

    const screenReaderSubscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );

    return () => {
      reducedMotionSubscription?.remove();
      screenReaderSubscription?.remove();
    };
  }, []);

  // Get appropriate animation duration based on accessibility preferences
  const getAnimationDuration = (type: 'fast' | 'normal' | 'slow' | 'accessible' = 'normal') => {
    if (prefersReducedMotion) {
      return animations.reducedMotion.duration;
    }
    return animations.duration[type];
  };

  // Get appropriate animation easing based on accessibility preferences
  const getAnimationEasing = (type: 'ease' | 'easeIn' | 'easeOut' | 'easeInOut' | 'accessible' = 'easeOut') => {
    if (prefersReducedMotion) {
      return animations.reducedMotion.easing;
    }
    return animations.easing[type];
  };

  // Check if animations should be disabled
  const shouldDisableAnimations = () => {
    return prefersReducedMotion;
  };

  // Get accessibility props for interactive elements
  const getAccessibilityProps = (label: string, hint?: string) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: 'button' as const,
    accessibilityState: { disabled: false },
  });

  return {
    prefersReducedMotion,
    isScreenReaderEnabled,
    getAnimationDuration,
    getAnimationEasing,
    shouldDisableAnimations,
    getAccessibilityProps,
  };
}
