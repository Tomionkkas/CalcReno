import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
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
  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(dropdownAnim, {
          toValue: 1,
          duration: animations.duration.normal,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: animations.duration.fast,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(dropdownAnim, {
          toValue: 0,
          duration: animations.duration.fast,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: animations.duration.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const dropdownTranslateY = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });

  const dropdownScale = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [
          { translateY: dropdownTranslateY },
          { scale: dropdownScale },
        ],
        marginHorizontal: spacing.md,
        marginTop: spacing.xs,
        zIndex: 1000,
      }}
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
