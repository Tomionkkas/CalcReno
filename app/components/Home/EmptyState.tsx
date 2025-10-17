import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Plus, FolderPlus } from "lucide-react-native";
import { GlassmorphicView } from "../ui";
import { colors, gradients, typography, spacing, borderRadius, shadows, animations } from "../../utils/theme";
import { useAccessibility } from "../../hooks/useAccessibility";

interface EmptyStateProps {
  onAddProject: () => void;
}

export default function EmptyState({ onAddProject }: EmptyStateProps) {
  // Professional approach: Start visible (1), animate if enabled
  const containerAnim = useRef(new Animated.Value(1)).current;
  const iconAnim = useRef(new Animated.Value(1)).current;
  const buttonAnim = useRef(new Animated.Value(1)).current;
  const { getAnimationDuration, shouldDisableAnimations, getAccessibilityProps } = useAccessibility();
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    if (shouldDisableAnimations()) {
      // Already visible - do nothing
      return;
    }
    
    // Reset to 0, then animate to 1
    containerAnim.setValue(0);
    iconAnim.setValue(0);
    buttonAnim.setValue(0);
    
    Animated.sequence([
      Animated.timing(containerAnim, {
        toValue: 1,
        duration: getAnimationDuration('normal'),
        useNativeDriver: true,
      }),
      Animated.timing(iconAnim, {
        toValue: 1,
        duration: getAnimationDuration('fast'),
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: getAnimationDuration('fast'),
        useNativeDriver: true,
      }),
    ]).start();
  }, [shouldDisableAnimations, getAnimationDuration]);

  const containerTranslateY = containerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  const containerOpacity = containerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const iconScale = iconAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const buttonScale = buttonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.xl,
      }}
    >
              <Animated.View
          style={{
            transform: [
              { translateY: containerTranslateY },
            ],
            opacity: containerOpacity,
          }}
        >
        <GlassmorphicView
          intensity="heavy"
          style={{
            borderRadius: borderRadius.xl,
            padding: spacing.xl,
            alignItems: "center",
            maxWidth: 320,
            ...shadows.xl,
          }}
        >
          {/* Icon with Gradient Background */}
          <Animated.View
            style={{
              transform: [{ scale: iconScale }],
              marginBottom: spacing.lg,
            }}
          >
            <LinearGradient
              colors={gradients.primary.colors}
              start={gradients.primary.start}
              end={gradients.primary.end}
              style={{
                width: 80,
                height: 80,
                borderRadius: borderRadius.full,
                justifyContent: "center",
                alignItems: "center",
                ...shadows.lg,
              }}
            >
              <FolderPlus size={32} color={colors.text.primary} />
            </LinearGradient>
          </Animated.View>

          {/* Title */}
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.xl,
              fontWeight: 'bold',
              marginBottom: spacing.md,
              textAlign: "center",
              fontFamily: typography.fonts.primary,
            }}
          >
            Brak projektów
          </Text>

          {/* Description */}
          <Text
            style={{
              color: colors.text.secondary,
              textAlign: "center",
              marginBottom: spacing.xl,
              fontSize: typography.sizes.base,
              lineHeight: 24,
              fontFamily: typography.fonts.primary,
            }}
          >
            Dodaj swój pierwszy projekt remontowy, aby rozpocząć korzystanie z
            kalkulatora materiałów.
          </Text>

          {/* Action Button */}
          <Animated.View
            style={{
              transform: [{ scale: buttonScale }],
            }}
          >
            <TouchableOpacity
              onPress={onAddProject}
              style={{
                borderRadius: borderRadius.full,
                overflow: "hidden",
                ...shadows.lg,
              }}
              activeOpacity={0.8}
              {...getAccessibilityProps('Dodaj projekt', 'Utwórz nowy projekt remontowy')}
            >
              <LinearGradient
                colors={gradients.primary.colors}
                start={gradients.primary.start}
                end={gradients.primary.end}
                style={{
                  paddingHorizontal: spacing.xl,
                  paddingVertical: spacing.md,
                  flexDirection: "row",
                  alignItems: "center",
                  minHeight: 48,
                }}
              >
                <Plus size={20} color={colors.text.primary} />
                <Text
                  style={{
                    color: colors.text.primary,
                    fontWeight: '600',
                    marginLeft: spacing.sm,
                    fontSize: typography.sizes.base,
                    fontFamily: typography.fonts.primary,
                  }}
                >
                  Dodaj projekt
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </GlassmorphicView>
      </Animated.View>
    </View>
  );
}
