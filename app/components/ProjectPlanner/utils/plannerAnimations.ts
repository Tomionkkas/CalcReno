import { useRef, useEffect } from "react";
import { Animated } from "react-native";
import { useAccessibility } from "../../../hooks/useAccessibility";

export interface PlannerAnimations {
  containerAnim: Animated.Value;
  headerAnim: Animated.Value;
  canvasAnim: Animated.Value;
  controlsAnim: Animated.Value;
  roomsAnim: Animated.Value;
}

export const usePlannerAnimations = (): PlannerAnimations => {
  // Always visible - no entrance animations
  const containerAnim = useRef(new Animated.Value(1)).current;
  const headerAnim = useRef(new Animated.Value(1)).current;
  const canvasAnim = useRef(new Animated.Value(1)).current;
  const controlsAnim = useRef(new Animated.Value(1)).current;
  const roomsAnim = useRef(new Animated.Value(1)).current;

  return {
    containerAnim,
    headerAnim,
    canvasAnim,
    controlsAnim,
    roomsAnim,
  };
};

export const getAnimationInterpolations = (animations: PlannerAnimations) => {
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
  const canvasScale = animations.canvasAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  });
  const canvasOpacity = animations.canvasAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const controlsScale = animations.controlsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });
  const controlsOpacity = animations.controlsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const roomsTranslateY = animations.roomsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });
  const roomsOpacity = animations.roomsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return {
    containerTranslateY,
    containerOpacity,
    headerTranslateY,
    headerOpacity,
    canvasScale,
    canvasOpacity,
    controlsScale,
    controlsOpacity,
    roomsTranslateY,
    roomsOpacity,
  };
};
