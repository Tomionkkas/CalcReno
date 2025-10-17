import React from "react";
import { TouchableOpacity, Text, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Plus } from "lucide-react-native";
import { GlassmorphicView } from "../../ui";
import { colors, gradients, typography, spacing, borderRadius, shadows } from "../../../utils/theme";

interface AddRoomButtonProps {
  onPress: () => void;
  animations?: {
    addButtonScale: Animated.AnimatedInterpolation<string | number>;
    addButtonOpacity: Animated.AnimatedInterpolation<string | number>;
  };
}

export default function AddRoomButton({ onPress, animations }: AddRoomButtonProps) {
  return (
    <Animated.View
      style={{
        ...(animations && {
          transform: [{ scale: animations.addButtonScale }],
          opacity: animations.addButtonOpacity,
        }),
        marginBottom: spacing.lg,
      }}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <GlassmorphicView intensity="light" style={{ borderRadius: borderRadius.xl }}>
          <LinearGradient
            colors={gradients.primary.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: borderRadius.xl,
              padding: spacing.lg,
              alignItems: 'center',
              justifyContent: 'center',
              ...shadows.medium,
            }}
          >
            <Plus size={32} color={colors.text.primary} style={{ marginBottom: spacing.sm }} />
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.sizes.lg,
                fontWeight: 600,
                fontFamily: typography.fonts.primary,
                textAlign: 'center',
              }}
            >
              Dodaj Pomieszczenie
            </Text>
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.sizes.sm,
                fontFamily: typography.fonts.primary,
                textAlign: 'center',
                marginTop: spacing.xs,
              }}
            >
              Utwórz nowe pomieszczenie w projekcie
            </Text>
          </LinearGradient>
        </GlassmorphicView>
      </TouchableOpacity>
    </Animated.View>
  );
}
