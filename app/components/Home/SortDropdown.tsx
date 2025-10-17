import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
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

  const sortOptions = [
    { key: "name", label: "Alfabetycznie" },
    { key: "date", label: "Data rozpoczęcia" },
    { key: "status", label: "Status" },
  ];

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
