import { useState, useEffect } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

interface AccessibilityState {
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isHighContrastEnabled: boolean;
  isLargeTextEnabled: boolean;
  isBoldTextEnabled: boolean;
}

export function useAccessibility() {
  const [accessibilityState, setAccessibilityState] = useState<AccessibilityState>({
    isScreenReaderEnabled: false,
    isReduceMotionEnabled: false,
    isHighContrastEnabled: false,
    isLargeTextEnabled: false,
    isBoldTextEnabled: false,
  });

  useEffect(() => {
    // Check initial accessibility state
    const checkAccessibilityState = async () => {
      const screenReader = await AccessibilityInfo.isScreenReaderEnabled();
      const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
      
      setAccessibilityState(prev => ({
        ...prev,
        isScreenReaderEnabled: screenReader,
        isReduceMotionEnabled: reduceMotion,
      }));
    };

    checkAccessibilityState();

    // Listen for accessibility changes
    const screenReaderSubscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (isEnabled) => {
        setAccessibilityState(prev => ({
          ...prev,
          isScreenReaderEnabled: isEnabled,
        }));
      }
    );

    const reduceMotionSubscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (isEnabled) => {
        setAccessibilityState(prev => ({
          ...prev,
          isReduceMotionEnabled: isEnabled,
        }));
      }
    );

    return () => {
      screenReaderSubscription?.remove();
      reduceMotionSubscription?.remove();
    };
  }, []);

  // Helper functions for accessibility props
  const getAccessibilityProps = (label: string, hint?: string) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: 'button' as const,
    accessibilityState: { disabled: false },
  });

  const getInputAccessibilityProps = (label: string, hint?: string, isError?: boolean) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: 'text' as const,
    accessibilityState: { 
      disabled: false,
      invalid: isError || false,
    },
  });

  const getLargeTapAreaProps = () => ({
    hitSlop: { top: 10, bottom: 10, left: 10, right: 10 },
    minTouchTargetSize: 44,
  });

  const getHighContrastProps = () => ({
    style: accessibilityState.isHighContrastEnabled ? {
      borderWidth: 2,
      borderColor: '#FFFFFF',
    } : {},
  });

  const getReducedMotionProps = () => ({
    style: accessibilityState.isReduceMotionEnabled ? {
      // Disable animations for users with motion sensitivity
    } : {},
  });

  const getLargeTextProps = () => ({
    style: accessibilityState.isLargeTextEnabled ? {
      fontSize: 18, // Larger text for accessibility
    } : {},
  });

  // Platform-specific accessibility helpers
  const getPlatformAccessibilityProps = (label: string, hint?: string) => {
    const baseProps = getAccessibilityProps(label, hint);
    
    if (Platform.OS === 'ios') {
      return {
        ...baseProps,
        accessibilityTraits: ['button'],
      };
    } else {
      return {
        ...baseProps,
        accessibilityComponentType: 'button',
      };
    }
  };

  return {
    accessibilityState,
    getAccessibilityProps,
    getInputAccessibilityProps,
    getLargeTapAreaProps,
    getHighContrastProps,
    getReducedMotionProps,
    getLargeTextProps,
    getPlatformAccessibilityProps,
  };
}

