import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, Animated, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Edit, Trash2, Home, Package } from "lucide-react-native";
import { GlassmorphicView } from "../../ui";
import { colors, gradients, typography, spacing, borderRadius, shadows } from "../../../utils/theme";
import { RoomDisplayData } from "../utils/roomCalculations";
import RoomCardHeader from "./RoomCardHeader";
import RoomCardContent from "./RoomCardContent";
import RoomCardActions from "./RoomCardActions";

interface RoomCardProps {
  room: RoomDisplayData;
  onEdit: (roomId: string) => void;
  onDelete: (roomId: string) => void;
  onPress: (roomId: string) => void;
  onCalculate: (roomId: string) => void;
  animations?: {
    translateY: Animated.AnimatedInterpolation<string | number>;
    opacity: Animated.AnimatedInterpolation<string | number>;
  };
}

export default function RoomCard({ 
  room, 
  onEdit, 
  onDelete, 
  onPress, 
  onCalculate,
  animations 
}: RoomCardProps) {
  // Android-specific: Memoize styles to prevent unnecessary re-renders
  const cardStyles = useMemo(() => [
    {
      marginBottom: spacing.md,
      // Android-specific: Force visibility
      ...(Platform.OS === 'android' && {
        opacity: 1,
        minHeight: 100,
        backgroundColor: 'transparent',
      }),
    },
    animations && Platform.OS !== 'android' && {
      transform: [{ translateY: animations.translateY }],
      opacity: animations.opacity,
    },
  ], [animations]);

  const gradientStyles = useMemo(() => ({
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
    // Android-specific: Ensure proper rendering
    ...(Platform.OS === 'android' && {
      minHeight: 80,
    }),
  }), []);

  const handlePress = () => {
    console.log("RoomCard: Room pressed", { roomId: room.id, platform: Platform.OS });
    onPress(room.id);
  };

  return (
    <Animated.View
      style={cardStyles}
      // Android-specific: Ensure proper rendering
      collapsable={Platform.OS === 'android' ? false : undefined}
      // Android-specific: Force layout
      needsOffscreenAlphaCompositing={Platform.OS === 'android' ? false : undefined}
    >
      <TouchableOpacity 
        onPress={handlePress} 
        activeOpacity={0.8}
        // Android-specific: Enhanced touch handling
        delayPressIn={Platform.OS === 'android' ? 0 : undefined}
        // Android-specific: Force touch target
        hitSlop={Platform.OS === 'android' ? { top: 10, bottom: 10, left: 10, right: 10 } : undefined}
      >
        <GlassmorphicView intensity="light" style={{ borderRadius: borderRadius.xl }}>
          <LinearGradient
            colors={gradients.secondary.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={gradientStyles}
          >
            {/* Header */}
            <RoomCardHeader room={room} />
            
            {/* Content */}
            <RoomCardContent room={room} />
            
            {/* Actions */}
            <RoomCardActions 
              room={room}
              onEdit={() => onEdit(room.id)}
              onDelete={() => onDelete(room.id)}
              onCalculate={() => onCalculate(room.id)}
            />
          </LinearGradient>
        </GlassmorphicView>
      </TouchableOpacity>
    </Animated.View>
  );
}
