import React from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, gradients, borderRadius, shadows } from "../../../utils/theme";
import { RoomDisplayData } from "../utils/roomCalculations";

interface RoomCardPreviewProps {
  room: RoomDisplayData;
  size?: number;
}

export default function RoomCardPreview({ room, size = 60 }: RoomCardPreviewProps) {
  const renderRectanglePreview = () => (
    <View
      style={{
        width: size,
        height: size * 0.7,
        borderRadius: borderRadius.sm,
        overflow: 'hidden',
        ...shadows.sm,
      }}
    >
      <LinearGradient
        colors={gradients.secondary.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </View>
  );

  const renderLShapePreview = () => {
    const cornerSize = size * 0.3;
    
    return (
      <View
        style={{
          width: size,
          height: size * 0.7,
          borderRadius: borderRadius.sm,
          overflow: 'hidden',
          position: 'relative',
          ...shadows.sm,
        }}
      >
        <LinearGradient
          colors={gradients.secondary.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
        
        {/* L-shape cutout */}
        <View
          style={{
            position: 'absolute',
            top: cornerSize,
            left: cornerSize,
            width: size - cornerSize,
            height: size * 0.7 - cornerSize,
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: borderRadius.xs,
          }}
        />
      </View>
    );
  };

  return (
    <View style={{ marginRight: 12 }}>
      {room.shape === 'rectangle' ? renderRectanglePreview() : renderLShapePreview()}
    </View>
  );
}

