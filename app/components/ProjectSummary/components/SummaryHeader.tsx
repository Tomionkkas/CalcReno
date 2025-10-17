import React from "react";
import { View, Text } from "react-native";
import { StatusPill } from "../../ui";
import { colors, typography, spacing } from "../../../utils/theme";
import { ProjectSummaryData } from "../utils/materialCalculations";

interface SummaryHeaderProps {
  summaryData: ProjectSummaryData;
}

export default function SummaryHeader({ summaryData }: SummaryHeaderProps) {
  console.log('[SummaryHeader] Rendering');

  return (
    <View
      style={{
        marginBottom: spacing.lg,
      }}
    >
      <Text
        style={{
          color: colors.text.primary,
          fontSize: typography.sizes.xl,
          fontWeight: 700,
          fontFamily: typography.fonts.primary,
          marginBottom: spacing.sm,
        }}
      >
        Podsumowanie Kosztów
      </Text>
      
      {/* Project Status */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
        <StatusPill 
          status={summaryData.projectStatus.type} 
          label={summaryData.projectStatus.label} 
          style={{ marginRight: spacing.sm }}
        />
        <Text style={{
          color: colors.text.tertiary,
          fontSize: typography.sizes.sm,
          fontFamily: typography.fonts.primary,
        }}>
          {`${summaryData.projectProgress}% ukończone`}
        </Text>
      </View>
    </View>
  );
}
