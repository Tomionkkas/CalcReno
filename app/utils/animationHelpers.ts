import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { useAccessibility } from '../hooks/useAccessibility';

/**
 * Professional animation hook that ensures components are ALWAYS visible
 * Strategy: Start visible (1), then animate from 0->1 if animations enabled
 * This prevents invisible components during initial render
 */
export function useSafeAnimation(config: {
  initialValue?: number;
  toValue?: number;
  duration?: number;
  delay?: number;
  useNativeDriver?: boolean;
} = {}) {
  const {
    initialValue = 1, // Always start visible
    toValue = 1,
    duration,
    delay = 0,
    useNativeDriver = true,
  } = config;

  const animValue = useRef(new Animated.Value(initialValue)).current;
  const { shouldDisableAnimations, getAnimationDuration } = useAccessibility();
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Only animate once on mount
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    if (shouldDisableAnimations()) {
      // No animation - ensure it's visible
      animValue.setValue(toValue);
      return;
    }

    // Animate: Reset to 0, then animate to toValue
    animValue.setValue(0);
    
    Animated.timing(animValue, {
      toValue,
      duration: duration || getAnimationDuration('normal'),
      delay,
      useNativeDriver,
    }).start();
  }, [shouldDisableAnimations]);

  return animValue;
}

/**
 * Hook for multiple sequential animations
 */
export function useSafeSequenceAnimations(count: number) {
  const animations = useRef(
    Array.from({ length: count }, () => new Animated.Value(1))
  ).current;
  
  const { shouldDisableAnimations, getAnimationDuration } = useAccessibility();
  const hasAnimated = useRef(false);

  const startAnimations = () => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    if (shouldDisableAnimations()) {
      animations.forEach(anim => anim.setValue(1));
      return;
    }

    // Reset all to 0
    animations.forEach(anim => anim.setValue(0));

    // Create staggered sequence
    const duration = getAnimationDuration('normal');
    const animSequence = animations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration,
        delay: index * 50, // Stagger by 50ms
        useNativeDriver: true,
      })
    );

    Animated.stagger(50, animSequence).start();
  };

  useEffect(() => {
    startAnimations();
  }, [shouldDisableAnimations]);

  return animations;
}

/**
 * Hook for glow/pulse animations
 */
export function useGlowAnimation(isActive: boolean) {
  const glowAnim = useRef(new Animated.Value(0)).current;
  const { shouldDisableAnimations, getAnimationDuration } = useAccessibility();

  useEffect(() => {
    if (shouldDisableAnimations()) {
      glowAnim.setValue(isActive ? 0.5 : 0);
      return;
    }

    Animated.timing(glowAnim, {
      toValue: isActive ? 1 : 0,
      duration: getAnimationDuration('fast'),
      useNativeDriver: false,
    }).start();
  }, [isActive, shouldDisableAnimations]);

  return glowAnim;
}


