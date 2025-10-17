import React, { useState, useEffect, useRef } from "react";
import { View, Text, Modal, TouchableOpacity, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { X, TrendingUp, Home, Calculator, Package, DollarSign } from "lucide-react-native";
import { GlassmorphicView } from "../../ui";
import { colors, gradients, typography, spacing, borderRadius, shadows } from "../../../utils/theme";
import { Project, Room } from "../../../utils/storage";
import { aggregateMaterials, getMaterialDisplayData } from "../utils/materialCalculations";
import MaterialBreakdown from "./components/MaterialBreakdown";
import RoomDetailsList from "./components/RoomDetailsList";

interface MaterialDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  project: Project;
  roomsWithMaterials: Room[];
  totalCost: number;
}

export default function MaterialDetailsModal({
  visible,
  onClose,
  project,
  roomsWithMaterials,
  totalCost,
}: MaterialDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'breakdown' | 'rooms'>('breakdown');
  const modalAnim = useRef(new Animated.Value(0)).current;

  const allMaterials = aggregateMaterials(project);
  const { roomMaterialNames, roomMaterialUnits } = getMaterialDisplayData(project);

  useEffect(() => {
    if (visible) {
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const modalScale = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const modalOpacity = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const tabIcons = {
    breakdown: TrendingUp,
    rooms: Home,
  };

  const tabLabels = {
    breakdown: 'Łączne materiały',
    rooms: 'Według pomieszczeń',
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing.lg,
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale: modalScale }],
            opacity: modalOpacity,
            width: '100%',
            maxWidth: 400,
          }}
        >
          <GlassmorphicView intensity="heavy" style={{ borderRadius: borderRadius.xl }}>
            <LinearGradient
              colors={gradients.background.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                borderRadius: borderRadius.xl,
                padding: spacing.xl,
                ...shadows.lg,
              }}
            >
              {/* Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontSize: typography.sizes.xl,
                      fontWeight: 700,
                      fontFamily: typography.fonts.primary,
                      marginBottom: spacing.xs,
                    }}
                  >
                    Szczegóły Materiałów
                  </Text>
                  <Text
                    style={{
                      color: colors.text.secondary,
                      fontSize: typography.sizes.sm,
                      fontFamily: typography.fonts.primary,
                    }}
                  >
                    {totalCost.toFixed(2)} zł • {roomsWithMaterials.length} pomieszczeń
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={{ padding: spacing.xs }}>
                  <X size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>

              {/* Tab Navigation */}
              <View style={{ 
                flexDirection: 'row', 
                marginBottom: spacing.lg, 
                backgroundColor: colors.glass.background,
                borderWidth: 1,
                borderColor: colors.glass.border,
                borderRadius: borderRadius.lg, 
                padding: spacing.xs 
              }}>
                {(['breakdown', 'rooms'] as const).map((tab) => {
                  const Icon = tabIcons[tab];
                  const isActive = activeTab === tab;
                  
                  return (
                    <TouchableOpacity
                      key={tab}
                      onPress={() => setActiveTab(tab)}
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: spacing.sm,
                        paddingHorizontal: spacing.md,
                        borderRadius: borderRadius.md,
                        backgroundColor: isActive ? colors.primary.start + '20' : 'transparent',
                        borderWidth: isActive ? 1 : 0,
                        borderColor: isActive ? colors.primary.start : 'transparent',
                      }}
                    >
                      <Icon size={16} color={isActive ? colors.primary.start : colors.text.tertiary} style={{ marginRight: spacing.xs }} />
                      <Text
                        style={{
                          color: isActive ? colors.primary.start : colors.text.tertiary,
                          fontSize: typography.sizes.sm,
                          fontWeight: isActive ? 600 : 500,
                          fontFamily: typography.fonts.primary,
                        }}
                      >
                        {tabLabels[tab]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Content */}
              {activeTab === 'breakdown' ? (
                <MaterialBreakdown
                  allMaterials={allMaterials}
                  roomMaterialNames={roomMaterialNames}
                  roomMaterialUnits={roomMaterialUnits}
                />
              ) : (
                <RoomDetailsList
                  roomsWithMaterials={roomsWithMaterials}
                  roomMaterialNames={roomMaterialNames}
                  roomMaterialUnits={roomMaterialUnits}
                />
              )}
            </LinearGradient>
          </GlassmorphicView>
        </Animated.View>
      </View>
    </Modal>
  );
}
