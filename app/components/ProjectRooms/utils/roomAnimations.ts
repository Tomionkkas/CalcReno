import { useRef, useEffect } from "react";
import { Animated } from "react-native";
import { useAccessibility } from "../../../hooks/useAccessibility";

export interface RoomAnimations {
  containerAnim: Animated.Value;
  headerAnim: Animated.Value;
  roomsAnim: Animated.Value;
  addButtonAnim: Animated.Value;
}

export const useRoomAnimations = (): RoomAnimations => {
  // Always visible - no entrance animations
  const containerAnim = useRef(new Animated.Value(1)).current;
  const headerAnim = useRef(new Animated.Value(1)).current;
  const roomsAnim = useRef(new Animated.Value(1)).current;
  const addButtonAnim = useRef(new Animated.Value(1)).current;

  return {
    containerAnim,
    headerAnim,
    roomsAnim,
    addButtonAnim,
  };
};

export const getAnimationInterpolations = (animations: RoomAnimations) => {
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
  const roomsTranslateY = animations.roomsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });
  const roomsOpacity = animations.roomsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const addButtonScale = animations.addButtonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });
  const addButtonOpacity = animations.addButtonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return {
    containerTranslateY,
    containerOpacity,
    headerTranslateY,
    headerOpacity,
    roomsTranslateY,
    roomsOpacity,
    addButtonScale,
    addButtonOpacity,
  };
};

export const createStaggeredRoomAnimations = (roomCount: number) => {
  const animations: Animated.Value[] = [];
  
  for (let i = 0; i < roomCount; i++) {
    animations.push(new Animated.Value(0));
  }
  
  const startStaggeredAnimations = () => {
    const animationsToRun = animations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      })
    );
    
    Animated.stagger(100, animationsToRun).start();
  };
  
  const getRoomAnimationInterpolations = (index: number) => {
    const anim = animations[index];
    if (!anim) return { translateY: new Animated.Value(0), opacity: new Animated.Value(1) };
    
    return {
      translateY: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [50, 0],
      }),
      opacity: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
    };
  };
  
  return {
    animations,
    startStaggeredAnimations,
    getRoomAnimationInterpolations,
  };
};
