import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, gradients, typography, spacing, borderRadius } from "../../../utils/theme";

interface ProgressBarProps {
  progress: number;
  height?: number;
  showLabel?: boolean;
  labelColor?: string;
  animated?: boolean;
  duration?: number;
}

export default function ProgressBar({ 
  progress, 
  height = 8, 
  showLabel = true, 
  labelColor = colors.text.secondary,
  animated = true,
  duration = 1000
}: ProgressBarProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(progressAnim, {
          toValue: progress,
          duration: duration,
          useNativeDriver: false,
        }),
        Animated.timing(widthAnim, {
          toValue: progress,
          duration: duration,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      progressAnim.setValue(progress);
      widthAnim.setValue(progress);
    }
  }, [progress, animated, duration]);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return ['#10B981', '#059669']; // Green
    if (progress >= 50) return ['#3B82F6', '#2563EB']; // Blue
    if (progress >= 20) return ['#F59E0B', '#D97706']; // Yellow
    return ['#EF4444', '#DC2626']; // Red
  };

  const progressColors = getProgressColor(progress);

  return (
    <View style={{ marginVertical: spacing.xs }}>
      {showLabel && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
          <Text
            style={{
              color: labelColor,
              fontSize: typography.sizes.xs,
              fontFamily: typography.fonts.primary,
            }}
          >
            Postęp
          </Text>
          <Text
            style={{
              color: labelColor,
              fontSize: typography.sizes.xs,
              fontFamily: typography.fonts.primary,
              fontWeight: 600,
            }}
          >
            {Math.round(progress)}%
          </Text>
        </View>
      )}
      
      <View
        style={{
          height,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: borderRadius.full,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            height: '100%',
            width: widthAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
            borderRadius: borderRadius.full,
          }}
        >
          <LinearGradient
            colors={progressColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </Animated.View>
      </View>
    </View>
  );
}

