import React from "react";
import { View, Text } from "react-native";
import { Home } from "lucide-react-native";
import { colors, typography, spacing } from "../../../utils/theme";
import { StatusPill } from "../../ui";
import { RoomDisplayData, formatRoomDimensions } from "../utils/roomCalculations";

interface RoomCardHeaderProps {
  room: RoomDisplayData;
}

export default function RoomCardHeader({ room }: RoomCardHeaderProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { type: 'completed' as const, label: 'Ukończone', color: '#10B981' };
      case 'in-progress':
        return { type: 'inProgress' as const, label: 'W trakcie', color: '#3B82F6' };
      case 'planned':
        return { type: 'planned' as const, label: 'Planowane', color: '#F59E0B' };
      default:
        return { type: 'planned' as const, label: 'Planowane', color: '#F59E0B' };
    }
  };

  const statusConfig = getStatusConfig(room.status);

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md }}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
          <Home size={16} color={colors.text.secondary} style={{ marginRight: spacing.xs }} />
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.lg,
              fontWeight: 600,
              fontFamily: typography.fonts.primary,
            }}
          >
            {room.name}
          </Text>
        </View>
        
        <Text
          style={{
            color: colors.text.tertiary,
            fontSize: typography.sizes.sm,
            fontFamily: typography.fonts.primary,
          }}
        >
          {formatRoomDimensions(room)}
        </Text>
      </View>
      
      <StatusPill 
        status={statusConfig.type}
        label={statusConfig.label}
        style={{ marginLeft: spacing.sm }}
      />
    </View>
  );
}
