import React from "react";
import { View, Text, Animated } from "react-native";
import { Home } from "lucide-react-native";
import { colors, typography, spacing } from "../../../utils/theme";
import { StatusPill } from "../../ui";
import type { Project } from "../../../utils/storage";

interface RoomsHeaderProps {
  roomCount: number;
  projectProgress: number;
  projectStatus: Project["status"];
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
  const getStatusConfig = (status: Project["status"]) => {
    switch (status) {
      case "Zakończony":
        return { type: "completed" as const, label: "Zakończony" };
      case "W trakcie":
        return { type: "inProgress" as const, label: "W trakcie" };
      case "Wstrzymany":
        return { type: "paused" as const, label: "Wstrzymany" };
      case "Planowany":
      default:
        return { type: "planned" as const, label: "Planowany" };
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
