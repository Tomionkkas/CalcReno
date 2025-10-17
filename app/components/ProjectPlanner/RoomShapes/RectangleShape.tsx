import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, gradients, typography, spacing, borderRadius, shadows } from "../../../utils/theme";
import { CanvasDimensions } from "../utils/canvasCalculations";

interface RectangleShapeProps {
  dimensions: CanvasDimensions;
  name: string;
  isSelected?: boolean;
}

export default function RectangleShape({ dimensions, name, isSelected = false }: RectangleShapeProps) {
  return (
    <View
      style={{
        width: dimensions.width,
        height: dimensions.height,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        borderWidth: isSelected ? 2 : 1,
        borderColor: isSelected ? colors.primary.start : colors.glass.border,
        ...shadows.md,
      }}
    >
      <LinearGradient
        colors={isSelected ? gradients.primary.colors : gradients.secondary.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing.sm,
        }}
      >
        <Text
          style={{
            color: colors.text.primary,
            fontSize: typography.sizes.sm,
            fontWeight: 600,
            fontFamily: typography.fonts.primary,
            textAlign: 'center',
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
            letterSpacing: 0.1,
          }}
          numberOfLines={2}
        >
          {name}
        </Text>
        
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.xs,
            fontFamily: typography.fonts.primary,
            textAlign: 'center',
            marginTop: spacing.xs,
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
            fontWeight: '500',
            letterSpacing: 0.05,
          }}
        >
          {(dimensions.width / 100).toFixed(1)}m × {(dimensions.height / 100).toFixed(1)}m
        </Text>
      </LinearGradient>
    </View>
  );
}
