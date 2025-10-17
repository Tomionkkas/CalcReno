import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FileText, Download } from "lucide-react-native";
import { GlassmorphicView } from "../../ui";
import { colors, gradients, typography, spacing, borderRadius, shadows } from "../../../utils/theme";
import { ProjectSummaryData } from "../utils/materialCalculations";

interface ExportControlsProps {
  summaryData: ProjectSummaryData;
  onExportPDF: () => void;
  onExportCSV: () => void;
}

export default function ExportControls({ 
  summaryData, 
  onExportPDF, 
  onExportCSV 
}: ExportControlsProps) {
  return (
    <View
      style={{
        marginBottom: spacing.lg,
      }}
    >
      <Text
        style={{
          color: colors.text.primary,
          fontSize: typography.sizes.lg,
          fontWeight: 600,
          fontFamily: typography.fonts.primary,
          marginBottom: spacing.md,
        }}
      >
        Eksport Kosztorysu
      </Text>
      
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        {/* PDF Export Button */}
        <TouchableOpacity onPress={onExportPDF} activeOpacity={0.8} style={{ flex: 1 }}>
          <GlassmorphicView intensity="light" style={{ borderRadius: borderRadius.lg }}>
            <LinearGradient
              colors={gradients.primary.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
                alignItems: 'center',
                ...shadows.medium,
              }}
            >
              <FileText size={24} color={colors.text.primary} style={{ marginBottom: spacing.sm }} />
              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: typography.sizes.sm,
                  fontWeight: 600,
                  fontFamily: typography.fonts.primary,
                  textAlign: 'center',
                }}
              >
                Eksport PDF
              </Text>
            </LinearGradient>
          </GlassmorphicView>
        </TouchableOpacity>
        
        {/* CSV Export Button */}
        <TouchableOpacity onPress={onExportCSV} activeOpacity={0.8} style={{ flex: 1 }}>
          <GlassmorphicView intensity="light" style={{ borderRadius: borderRadius.lg }}>
            <LinearGradient
              colors={gradients.secondary.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
                alignItems: 'center',
                ...shadows.medium,
              }}
            >
              <Download size={24} color={colors.text.primary} style={{ marginBottom: spacing.sm }} />
              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: typography.sizes.sm,
                  fontWeight: 600,
                  fontFamily: typography.fonts.primary,
                  textAlign: 'center',
                }}
              >
                Eksport CSV
              </Text>
            </LinearGradient>
          </GlassmorphicView>
        </TouchableOpacity>
      </View>
    </View>
  );
}
