import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import { Eye } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GlassmorphicView } from "../ui";
import { colors, gradients, typography, spacing, borderRadius, shadows } from "../../utils/theme";
import { Project } from "../../utils/storage";
import { useToast } from "../../hooks/useToast";
import { calculateProjectSummary } from "./utils/materialCalculations";
import { exportToPDF, exportToCSV } from "./MaterialDetailsModal/utils/materialExportUtils";
import SummaryHeader from "./components/SummaryHeader";
import CostOverviewCard from "./components/CostOverviewCard";
import RoomCostCard from "./components/RoomCostCard";
import ExportControls from "./components/ExportControls";
import MaterialDetailsModal from "./MaterialDetailsModal/MaterialDetailsModal";

interface ProjectSummaryTabProps {
  project: Project;
}

export default function ProjectSummaryTab({ project }: ProjectSummaryTabProps) {
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);
  const { showError, showSuccess } = useToast();
  
  const summaryData = calculateProjectSummary(project);

  const handleExportPDF = () => {
    exportToPDF(project, summaryData.totalCost, summaryData.roomsWithMaterials, showError, showSuccess);
  };

  const handleExportCSV = () => {
    exportToCSV(project, summaryData.totalCost, summaryData.roomsWithMaterials, showError, showSuccess);
  };

  const handleShowAdvancedDetails = () => {
    setShowAdvancedDetails(true);
  };

  return (
    <ScrollView 
      style={{ flex: 1 }} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      {/* Header */}
      <SummaryHeader 
        summaryData={summaryData}
      />

      {/* Main Cost Card */}
      <CostOverviewCard 
        summaryData={summaryData}
      />

      {/* Advanced Details Button */}
      {summaryData.roomsWithMaterials.length > 0 && (
        <TouchableOpacity onPress={handleShowAdvancedDetails} activeOpacity={0.8} style={{ marginBottom: spacing.lg }}>
          <GlassmorphicView intensity="light" style={{ borderRadius: borderRadius.lg }}>
            <LinearGradient
              colors={gradients.secondary.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                ...shadows.medium,
              }}
            >
              <Eye size={20} color={colors.text.primary} style={{ marginRight: spacing.sm }} />
              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: typography.sizes.md,
                  fontWeight: 600,
                  fontFamily: typography.fonts.primary,
                }}
              >
                Pokaż szczegóły materiałów
              </Text>
            </LinearGradient>
          </GlassmorphicView>
        </TouchableOpacity>
      )}

      {/* Export Controls */}
      <ExportControls 
        summaryData={summaryData}
        onExportPDF={handleExportPDF}
        onExportCSV={handleExportCSV}
      />

      {/* Room Cost Cards */}
      {summaryData.roomsWithMaterials.length > 0 && (
        <View style={{ marginBottom: spacing.lg }}>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.lg,
              fontWeight: 600,
              fontFamily: typography.fonts.primary,
              marginBottom: spacing.md,
            }}
          >
            Koszty według pomieszczeń
          </Text>
          
          {summaryData.roomsWithMaterials.map((room) => (
            <RoomCostCard
              key={room.id}
              room={room}
              onPress={handleShowAdvancedDetails}
            />
          ))}
        </View>
      )}

      {/* Empty State */}
      {summaryData.roomsWithMaterials.length === 0 && (
        <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
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
                Brak wycen materiałów
              </Text>
              <Text
                style={{
                  color: colors.text.tertiary,
                  fontSize: typography.sizes.sm,
                  fontFamily: typography.fonts.primary,
                  textAlign: 'center',
                }}
              >
                Dodaj materiały do pomieszczeń, aby zobaczyć podsumowanie kosztów
              </Text>
            </LinearGradient>
          </GlassmorphicView>
        </View>
      )}

      {/* Material Details Modal */}
      <MaterialDetailsModal
        visible={showAdvancedDetails}
        onClose={() => setShowAdvancedDetails(false)}
        project={project}
        roomsWithMaterials={summaryData.roomsWithMaterials}
        totalCost={summaryData.totalCost}
      />
    </ScrollView>
  );
}
