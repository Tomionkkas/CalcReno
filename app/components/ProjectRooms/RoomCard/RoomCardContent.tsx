import React from "react";
import { View, Text } from "react-native";
import { Package, DollarSign } from "lucide-react-native";
import { colors, typography, spacing } from "../../../utils/theme";
import { RoomDisplayData, getTopMaterials } from "../utils/roomCalculations";

interface RoomCardContentProps {
  room: RoomDisplayData;
}

export default function RoomCardContent({ room }: RoomCardContentProps) {
  const topMaterials = getTopMaterials(room as any, 3);

  return (
    <View style={{ marginBottom: spacing.md }}>
      {/* Progress and Cost */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
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
            {room.progress}% ukończone
          </Text>
        </View>
        
        {room.materials && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <DollarSign size={14} color={colors.text.secondary} style={{ marginRight: spacing.xs }} />
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.sizes.sm,
                fontWeight: 600,
                fontFamily: typography.fonts.primary,
              }}
            >
              {room.materials.totalCost.toFixed(2)} zł
            </Text>
          </View>
        )}
      </View>
      
      {/* Top Materials */}
      {topMaterials.length > 0 && (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
            <Package size={14} color={colors.text.secondary} style={{ marginRight: spacing.xs }} />
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.sizes.sm,
                fontFamily: typography.fonts.primary,
              }}
            >
              Główne materiały:
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {topMaterials.map((material, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 4, // Assuming borderRadius is defined elsewhere or needs to be added
                  paddingHorizontal: spacing.xs,
                  paddingVertical: spacing.xs / 2,
                }}
              >
                <Text
                  style={{
                    color: colors.text.secondary,
                    fontSize: typography.sizes.xs,
                    fontFamily: typography.fonts.primary,
                  }}
                >
                  {material.name} ({material.quantity} {material.unit})
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {/* No Materials State */}
      {(!room.materials || Object.keys(room.materials.materials || {}).length === 0) && (
        <View style={{ alignItems: 'center', paddingVertical: spacing.sm }}>
          <Text
            style={{
              color: colors.text.tertiary,
              fontSize: typography.sizes.sm,
              fontFamily: typography.fonts.primary,
              textAlign: 'center',
            }}
          >
            Brak dodanych materiałów
          </Text>
        </View>
      )}
    </View>
  );
}
