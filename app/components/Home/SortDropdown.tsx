import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming 
} from 'react-native-reanimated';
import { GlassmorphicView } from "../ui";
import { colors, gradients, typography, spacing, borderRadius, shadows, animations } from "../../utils/theme";

interface SortDropdownProps {
  visible: boolean;
  onSortSelect: (sortType: string) => void;
}

export default function SortDropdown({
  visible,
  onSortSelect,
}: SortDropdownProps) {
  const translateY = useSharedValue(-10);
  const scale = useSharedValue(0.95);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(1, { duration: 200 });
      opacity.value = withTiming(1, { duration: 150 });
    } else {
      translateY.value = withTiming(-10, { duration: 150 });
      scale.value = withTiming(0.95, { duration: 150 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  if (!visible) return null;

  const sortOptions = [
    { key: "name", label: "Alfabetycznie" },
    { key: "date", label: "Data rozpoczęcia" },
    { key: "status", label: "Status" },
  ];

  return (
    <Animated.View
      style={[
        {
          marginHorizontal: spacing.md,
          marginTop: spacing.xs,
          zIndex: 1000,
        },
        animatedStyle
      ]}
    >
      <GlassmorphicView
        intensity="heavy"
        style={{
          borderRadius: borderRadius.lg,
          padding: spacing.sm,
          ...shadows.xl,
        }}
      >
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            onPress={() => onSortSelect(option.key)}
            style={{
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              borderRadius: borderRadius.md,
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderColor: 'transparent',
              minHeight: 44,
              marginBottom: spacing.xs,
            }}
            activeOpacity={0.7}
          >
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.sizes.base,
                fontWeight: typography.weights.normal,
                fontFamily: typography.fonts.primary,
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </GlassmorphicView>
    </Animated.View>
  );
}
