import React from "react";
import { View, Text, Animated } from "react-native";
import { Home } from "lucide-react-native";
import { colors, typography, spacing } from "../../../utils/theme";
import { StatusPill } from "../../ui";

interface RoomsHeaderProps {
  roomCount: number;
  projectProgress: number;
  projectStatus: 'completed' | 'in-progress' | 'planned';
  animations?: {
    headerTranslateY: Animated.AnimatedInterpolation<string | number>;
    headerOpacity: Animated.AnimatedInterpolation<string | number>;
  };
}

export default function RoomsHeader({ 
  roomCount, 
  projectProgress, 
  projectStatus, 
  animations 
}: RoomsHeaderProps) {
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

  const statusConfig = getStatusConfig(projectStatus);

  return (
    <Animated.View
      style={{
        marginBottom: spacing.lg,
        ...(animations && {
          transform: [{ translateY: animations.headerTranslateY }],
          opacity: animations.headerOpacity,
        }),
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
        <Home size={24} color={colors.text.primary} style={{ marginRight: spacing.sm }} />
        <Text
          style={{
            color: colors.text.primary,
            fontSize: typography.sizes.xl,
            fontWeight: 700,
            fontFamily: typography.fonts.primary,
          }}
        >
          Pomieszczenia
        </Text>
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <StatusPill 
            status={statusConfig.type}
            label={statusConfig.label}
            style={{ marginRight: spacing.sm }}
          />
          <Text
            style={{
              color: colors.text.tertiary,
              fontSize: typography.sizes.sm,
              fontFamily: typography.fonts.primary,
            }}
          >
            {projectProgress}% ukończone
          </Text>
        </View>
        
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.sizes.sm,
            fontFamily: typography.fonts.primary,
          }}
        >
          {roomCount} pomieszczeń
        </Text>
      </View>
    </Animated.View>
  );
}
