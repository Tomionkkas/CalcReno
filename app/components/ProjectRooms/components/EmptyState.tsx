import React from "react";
import { View, Text, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Home } from "lucide-react-native";
import { GlassmorphicView } from "../../ui";
import { colors, gradients, typography, spacing, borderRadius, shadows } from "../../../utils/theme";

interface EmptyStateProps {
  animations?: {
    roomsTranslateY: Animated.AnimatedInterpolation<string | number>;
    roomsOpacity: Animated.AnimatedInterpolation<string | number>;
  };
}

export default function EmptyState({ animations }: EmptyStateProps) {
  return (
    <Animated.View
      style={{
        ...(animations && {
          transform: [{ translateY: animations.roomsTranslateY }],
          opacity: animations.roomsOpacity,
        }),
        alignItems: 'center',
        paddingVertical: spacing.xl,
      }}
    >
      <GlassmorphicView intensity="light" style={{ borderRadius: borderRadius.xl, padding: spacing.xl }}>
        <LinearGradient
          colors={gradients.secondary.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: borderRadius.xl,
            padding: spacing.xl,
            alignItems: 'center',
            ...shadows.medium,
          }}
        >
          <Home size={48} color={colors.text.secondary} style={{ marginBottom: spacing.md }} />
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.lg,
              fontWeight: 600,
              fontFamily: typography.fonts.primary,
              textAlign: 'center',
              marginBottom: spacing.sm,
            }}
          >
            Brak pomieszczeń
          </Text>
          <Text
            style={{
              color: colors.text.tertiary,
              fontSize: typography.sizes.sm,
              fontFamily: typography.fonts.primary,
              textAlign: 'center',
            }}
          >
            Dodaj pierwsze pomieszczenie, aby rozpocząć planowanie projektu
          </Text>
        </LinearGradient>
      </GlassmorphicView>
    </Animated.View>
  );
}
