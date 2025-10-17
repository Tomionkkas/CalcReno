import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GlassmorphicView } from "../../ui";
import { colors, gradients, typography, spacing, borderRadius, shadows } from "../../../utils/theme";
import { Room } from "../../../utils/storage";

interface RoomCostCardProps {
  room: Room;
  onPress: () => void;
}

export default function RoomCostCard({ room, onPress }: RoomCostCardProps) {
  if (!room.materials) return null;

  // Helper functions to avoid complex expressions in JSX
  const getRoomDimensions = () => {
    const width = (room.dimensions.width / 100).toFixed(2);
    const length = (room.dimensions.length / 100).toFixed(2);
    return `${width}m × ${length}m`;
  };

  const getMaterialsCount = () => {
    const materialsCount = Object.keys(room.materials.materials || {}).length;
    return `${materialsCount} materiałów`;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <GlassmorphicView intensity="light" style={{ borderRadius: borderRadius.lg, marginBottom: spacing.md }}>
        <LinearGradient
          colors={gradients.secondary.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            ...shadows.medium,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: typography.sizes.lg,
                  fontWeight: 600,
                  fontFamily: typography.fonts.primary,
                  marginBottom: spacing.xs,
                }}
              >
                {room.name}
              </Text>
              
              <Text
                style={{
                  color: colors.text.tertiary,
                  fontSize: typography.sizes.sm,
                  fontFamily: typography.fonts.primary,
                }}
              >
                {getRoomDimensions()}
              </Text>
            </View>
            
            <View style={{ alignItems: 'flex-end' }}>
              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: typography.sizes.xl,
                  fontWeight: 700,
                  fontFamily: typography.fonts.primary,
                }}
              >
                {`${room.materials.totalCost.toFixed(2)} zł`}
              </Text>
              
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: typography.sizes.xs,
                  fontFamily: typography.fonts.primary,
                }}
              >
                {getMaterialsCount()}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </GlassmorphicView>
    </TouchableOpacity>
  );
}
