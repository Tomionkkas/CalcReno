import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GlassmorphicView } from "../../ui";
import { colors, gradients, typography, spacing, borderRadius, shadows } from "../../../utils/theme";
import { ProjectSummaryData } from "../utils/materialCalculations";

interface CostOverviewCardProps {
  summaryData: ProjectSummaryData;
}

export default function CostOverviewCard({ summaryData }: CostOverviewCardProps) {
  // Calculate the text content to avoid complex expressions in JSX
  const getRoomsText = () => {
    const roomsWithMaterials = summaryData.roomsWithMaterials.length;
    const totalRooms = summaryData.totalRooms;
    return `${roomsWithMaterials} z ${totalRooms} pomieszczeń z wycenami`;
  };

  return (
    <View
      style={{
        marginBottom: spacing.lg,
      }}
    >
      <GlassmorphicView intensity="medium" style={{ borderRadius: borderRadius.xl }}>
        <LinearGradient
          colors={gradients.primary.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: borderRadius.xl,
            padding: spacing.xl,
            ...shadows.large,
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.sizes.sm,
                fontWeight: 600,
                fontFamily: typography.fonts.primary,
                marginBottom: spacing.xs,
                opacity: 0.9,
              }}
            >
              Całkowity Koszt Projektu
            </Text>
            
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.sizes.xxl,
                fontWeight: 700,
                fontFamily: typography.fonts.primary,
                marginBottom: spacing.sm,
              }}
            >
              {`${summaryData.totalCost.toFixed(2)} zł`}
            </Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.accent.primary,
                  marginRight: spacing.xs,
                }}
              />
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: typography.sizes.sm,
                  fontFamily: typography.fonts.primary,
                }}
              >
                {getRoomsText()}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </GlassmorphicView>
    </View>
  );
}
