import React from "react";
import { View, Text, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GlassmorphicView } from "../../../ui";
import { colors, gradients, typography, spacing, borderRadius, shadows } from "../../../../utils/theme";
import { Room } from "../../../../utils/storage";

interface RoomDetailsListProps {
  roomsWithMaterials: Room[];
  roomMaterialNames: { [key: string]: string };
  roomMaterialUnits: { [key: string]: string };
}

export default function RoomDetailsList({ 
  roomsWithMaterials, 
  roomMaterialNames, 
  roomMaterialUnits 
}: RoomDetailsListProps) {
  // Helper functions to avoid complex expressions in JSX
  const getRoomTitle = (room: Room) => {
    const cost = room.materials?.totalCost.toFixed(2) || '0.00';
    return `${room.name} - ${cost} zł`;
  };

  const getRoomDimensions = (room: Room) => {
    const width = (room.dimensions.width / 100).toFixed(2);
    const length = (room.dimensions.length / 100).toFixed(2);
    return `${width}m × ${length}m`;
  };

  return (
    <ScrollView 
      style={{ maxHeight: 300 }} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: spacing.md }}
    >
      {roomsWithMaterials.map((room) => (
        <View key={room.id} style={{ marginBottom: spacing.lg }}>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.lg,
              fontWeight: 600,
              fontFamily: typography.fonts.primary,
              marginBottom: spacing.sm,
            }}
          >
            {getRoomTitle(room)}
          </Text>
          
          <Text
            style={{
              color: colors.text.tertiary,
              fontSize: typography.sizes.sm,
              fontFamily: typography.fonts.primary,
              marginBottom: spacing.sm,
            }}
          >
            {getRoomDimensions(room)}
          </Text>
          
          {Object.entries(room.materials?.materials || {}).map(([material, quantity]) => (
            <GlassmorphicView 
              key={material} 
              intensity="light" 
              style={{ 
                borderRadius: borderRadius.md, 
                marginBottom: spacing.sm 
              }}
            >
              <View
                style={{
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                  backgroundColor: colors.glass.background,
                  borderWidth: 1,
                  borderColor: colors.glass.border,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontSize: typography.sizes.sm,
                      fontWeight: 500,
                      fontFamily: typography.fonts.primary,
                      flex: 1,
                    }}
                  >
                    {roomMaterialNames[material] || material}
                  </Text>
                  
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontSize: typography.sizes.sm,
                        fontWeight: 600,
                        fontFamily: typography.fonts.primary,
                      }}
                    >
                      {quantity}
                    </Text>
                    
                    <Text
                      style={{
                        color: colors.text.tertiary,
                        fontSize: typography.sizes.xs,
                        fontFamily: typography.fonts.primary,
                      }}
                    >
                      {roomMaterialUnits[material] || 'szt'}
                    </Text>
                  </View>
                </View>
              </View>
            </GlassmorphicView>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
