import { useRef, useEffect } from "react";
import { Animated } from "react-native";

export interface SummaryAnimations {
  containerAnim: Animated.Value;
  headerAnim: Animated.Value;
  cardAnim: Animated.Value;
  exportAnim: Animated.Value;
  modalAnim: Animated.Value;
}

export const useSummaryAnimations = (): SummaryAnimations => {
  // Always visible - no entrance animations
  const containerAnim = useRef(new Animated.Value(1)).current;
  const headerAnim = useRef(new Animated.Value(1)).current;
  const cardAnim = useRef(new Animated.Value(1)).current;
  const exportAnim = useRef(new Animated.Value(1)).current;
  const modalAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    console.log('[SummaryAnimations] Initialized - all values at 1');
  }, []);

  return {
    containerAnim,
    headerAnim,
    cardAnim,
    exportAnim,
    modalAnim,
  };
};

export const getAnimationInterpolations = (animations: SummaryAnimations) => {
  const containerTranslateY = animations.containerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });
  const containerOpacity = animations.containerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const headerTranslateY = animations.headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });
  const headerOpacity = animations.headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const cardScale = animations.cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  });
  const cardOpacity = animations.cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const exportScale = animations.exportAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });
  const exportOpacity = animations.exportAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return {
    containerTranslateY,
    containerOpacity,
    headerTranslateY,
    headerOpacity,
    cardScale,
    cardOpacity,
    exportScale,
    exportOpacity,
  };
};
