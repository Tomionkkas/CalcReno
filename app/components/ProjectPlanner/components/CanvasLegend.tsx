import React from "react";
import { View, Text } from "react-native";
import { GlassmorphicView } from "../../ui";
import { colors, typography, spacing, borderRadius, shadows } from "../../../utils/theme";

interface CanvasLegendProps {
  hasElements: boolean;
  isCleanMode: boolean;
}

export default function CanvasLegend({ hasElements, isCleanMode }: CanvasLegendProps) {
  if (!hasElements) return null;

  return (
    <GlassmorphicView intensity="light" style={{ 
      borderRadius: borderRadius.lg,
      marginBottom: spacing.lg,
      ...shadows.md,
    }}>
      <View style={{ 
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        flexDirection: "row", 
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <Text style={{ 
          color: colors.text.primary, 
          fontSize: typography.sizes.sm, 
          fontWeight: '600',
          fontFamily: typography.fonts.primary,
          marginRight: spacing.md,
        }}>
          Legenda:
        </Text>
        
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ 
              width: 16, 
              height: 12, 
              backgroundColor: "#FCD34D", 
              marginRight: spacing.xs, 
              borderRadius: borderRadius.xs,
              borderWidth: 1,
              borderColor: "#F59E0B",
            }} />
            <Text style={{ 
              color: colors.text.secondary, 
              fontSize: typography.sizes.xs,
              fontWeight: '500',
              fontFamily: typography.fonts.primary,
            }}>
              Drzwi
            </Text>
          </View>
          
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ 
              width: 16, 
              height: 12, 
              backgroundColor: "#60A5FA", 
              marginRight: spacing.xs, 
              borderRadius: borderRadius.xs,
              borderWidth: 1,
              borderColor: "#3B82F6",
            }} />
            <Text style={{ 
              color: colors.text.secondary, 
              fontSize: typography.sizes.xs,
              fontWeight: '500',
              fontFamily: typography.fonts.primary,
            }}>
              Okna
            </Text>
          </View>
        </View>
      </View>
    </GlassmorphicView>
  );
}
