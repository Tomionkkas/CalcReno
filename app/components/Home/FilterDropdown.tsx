import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming 
} from 'react-native-reanimated';
import { GlassmorphicView } from "../ui";
import { colors, gradients, typography, spacing, borderRadius, shadows, animations } from "../../utils/theme";

interface FilterDropdownProps {
  visible: boolean;
  statusFilters: string[];
  activeFilter: string;
  onFilterSelect: (filter: string) => void;
}

export default function FilterDropdown({
  visible,
  statusFilters,
  activeFilter,
  onFilterSelect,
}: FilterDropdownProps) {
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
        {statusFilters.map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => onFilterSelect(filter)}
            style={{
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              borderRadius: borderRadius.md,
              backgroundColor:
                activeFilter === filter 
                  ? colors.primary.start + '20' 
                  : 'transparent',
              borderWidth: 1,
              borderColor: activeFilter === filter 
                ? colors.primary.start 
                : 'transparent',
              minHeight: 44,
              marginBottom: spacing.xs,
            }}
            activeOpacity={0.7}
          >
            <Text
              style={{
                color: activeFilter === filter 
                  ? colors.primary.start 
                  : colors.text.primary,
                fontSize: typography.sizes.base,
                fontWeight: activeFilter === filter 
                  ? typography.weights.semibold 
                  : typography.weights.normal,
                fontFamily: typography.fonts.primary,
              }}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </GlassmorphicView>
    </Animated.View>
  );
}
