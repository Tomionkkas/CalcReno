import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { spacing, borderRadius, colors, typography, shadows, gradients } from "../../../utils/theme";
import GlassmorphicView from "../../ui/GlassmorphicView";

interface PlannerHeaderProps {
  onExport: () => void;
  hasRooms: boolean;
  hasCaptureRef: boolean;
  isCleanMode: boolean;
  onToggleCleanMode: () => void;
}

export default function PlannerHeader({
  onExport,
  hasRooms,
  hasCaptureRef,
  isCleanMode,
  onToggleCleanMode
}: PlannerHeaderProps) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      {/* Main Title */}
      <Text
        style={{
          color: colors.text.primary,
          fontSize: typography.sizes['2xl'],
          fontWeight: '700',
          fontFamily: typography.fonts.primary,
          marginBottom: spacing.md,
          textAlign: 'center',
          letterSpacing: -0.5,
          textShadowColor: 'rgba(0, 0, 0, 0.3)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        }}
      >
        Planer 2D
      </Text>
      
      {/* Header Container */}
      <GlassmorphicView intensity="medium" style={{ borderRadius: borderRadius.xl }}>
        <LinearGradient
          colors={gradients.card.colors}
          start={gradients.card.start}
          end={gradients.card.end}
          style={{
            borderRadius: borderRadius.xl,
            padding: spacing.lg,
            ...shadows.lg,
          }}
        >
          {/* Header Content */}
          <View style={{
            flexDirection: "column",
            gap: spacing.md
          }}>
            {/* Top Row - Title and Buttons */}
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: spacing.sm,
            }}>
              <Text style={{
                color: colors.text.primary,
                fontSize: typography.sizes.base,
                fontWeight: '600',
                fontFamily: typography.fonts.primary,
                letterSpacing: -0.2,
                textShadowColor: 'rgba(0, 0, 0, 0.2)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 1,
                flexShrink: 1,
                numberOfLines: 1,
              }}>
                Płótno planowania
              </Text>
              
              {/* Action Buttons */}
              <View style={{ flexDirection: "row", gap: spacing.xs, flexShrink: 1 }}>
                {/* Clean Mode Toggle */}
                <TouchableOpacity
                  onPress={onToggleCleanMode}
                  style={{
                    backgroundColor: isCleanMode ? colors.status.success.start : colors.glass.background,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    borderRadius: borderRadius.md,
                    borderWidth: 1,
                    borderColor: isCleanMode ? colors.status.success.end : colors.glass.border,
                    minHeight: 36,
                    justifyContent: 'center',
                    alignItems: 'center',
                    ...shadows.sm,
                    flexShrink: 1,
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{
                    color: colors.text.primary,
                    fontSize: typography.sizes.xs,
                    fontWeight: '600',
                    fontFamily: typography.fonts.primary,
                    letterSpacing: 0.1,
                    textAlign: 'center',
                  }}>
                    {isCleanMode ? "Tryb normalny" : "Tryb czysty"}
                  </Text>
                </TouchableOpacity>
                
                {/* Export Button */}
                <TouchableOpacity
                  onPress={onExport}
                  disabled={!hasRooms || !hasCaptureRef}
                  style={{
                    backgroundColor: (!hasRooms || !hasCaptureRef)
                      ? colors.glass.background
                      : colors.primary.start,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    borderRadius: borderRadius.md,
                    minHeight: 36,
                    justifyContent: 'center',
                    alignItems: 'center',
                    opacity: (!hasRooms || !hasCaptureRef) ? 0.6 : 1,
                    ...shadows.sm,
                    flexShrink: 1,
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{
                    color: colors.text.primary,
                    fontSize: typography.sizes.xs,
                    fontWeight: '600',
                    fontFamily: typography.fonts.primary,
                    letterSpacing: 0.1,
                    textAlign: 'center',
                  }}>
                    Eksport PNG
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Bottom Row - Mode and Status */}
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <Text style={{
                color: colors.text.secondary,
                fontSize: typography.sizes.sm,
                fontFamily: typography.fonts.primary,
                fontWeight: '500',
                letterSpacing: 0.1,
              }}>
                {isCleanMode ? "Tryb eksportu" : "Tryb edycji"}
              </Text>
              
              {/* Status Indicator */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: hasRooms ? colors.status.success.start : colors.status.warning.start,
                  marginRight: spacing.xs,
                }} />
                <Text style={{
                  color: colors.text.secondary,
                  fontSize: typography.sizes.xs,
                  fontWeight: '500',
                  fontFamily: typography.fonts.primary,
                  letterSpacing: 0.1,
                }}>
                  {hasRooms ? 'Pomieszczenia na planie' : 'Brak pomieszczeń'}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </GlassmorphicView>
    </View>
  );
}
