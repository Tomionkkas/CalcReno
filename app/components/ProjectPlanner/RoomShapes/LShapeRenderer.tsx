import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, gradients, typography, spacing, borderRadius, shadows } from "../../../utils/theme";
import { CanvasDimensions } from "../utils/canvasCalculations";

interface LShapeRendererProps {
  dimensions: CanvasDimensions;
  name: string;
  orientation: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  isSelected?: boolean;
}

export default function LShapeRenderer({ 
  dimensions, 
  name, 
  orientation, 
  isSelected = false 
}: LShapeRendererProps) {
  const getLShapePath = () => {
    const { width, height } = dimensions;
    const cornerSize = Math.min(width, height) * 0.3;
    
    switch (orientation) {
      case 'top-right':
        return [
          { x: 0, y: 0, width: width - cornerSize, height: cornerSize },
          { x: 0, y: 0, width: cornerSize, height: height },
        ];
      case 'top-left':
        return [
          { x: cornerSize, y: 0, width: width - cornerSize, height: cornerSize },
          { x: 0, y: 0, width: cornerSize, height: height },
        ];
      case 'bottom-right':
        return [
          { x: 0, y: height - cornerSize, width: width - cornerSize, height: cornerSize },
          { x: 0, y: 0, width: cornerSize, height: height },
        ];
      case 'bottom-left':
        return [
          { x: cornerSize, y: height - cornerSize, width: width - cornerSize, height: cornerSize },
          { x: 0, y: 0, width: cornerSize, height: height },
        ];
    }
  };

  const segments = getLShapePath();

  return (
    <View
      style={{
        width: dimensions.width,
        height: dimensions.height,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        borderWidth: isSelected ? 2 : 1,
        borderColor: isSelected ? colors.primary.start : colors.glass.border,
        ...shadows.md,
      }}
    >
      <View style={{ width: '100%', height: '100%', position: 'relative' }}>
        {segments.map((segment, index) => {
          // Main room (index 1 - larger segment) vs Extension (index 0 - smaller segment)
          const isMainRoom = index === 1;
          const mainColors = isSelected ? gradients.primary.colors : gradients.secondary.colors;
          const extensionColors = isSelected
            ? ['#8B5CF6', '#A78BFA'] // Brighter purple for extension when selected
            : ['rgba(139, 92, 246, 0.6)', 'rgba(167, 139, 250, 0.6)']; // Lighter purple for extension

          return (
            <View
              key={index}
              style={{
                position: 'absolute',
                left: segment.x,
                top: segment.y,
                width: segment.width,
                height: segment.height,
                borderWidth: isMainRoom ? 0 : 1,
                borderColor: 'rgba(139, 92, 246, 0.4)',
                borderStyle: isMainRoom ? 'solid' : 'dashed',
              }}
            >
              <LinearGradient
                colors={isMainRoom ? mainColors : extensionColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
            </View>
          );
        })}
        
        {/* Room name overlay */}
        <View
          style={{
            position: 'absolute',
            top: spacing.sm,
            left: spacing.sm,
            right: spacing.sm,
            bottom: spacing.sm,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.sm,
              fontWeight: 600,
              fontFamily: typography.fonts.primary,
              textAlign: 'center',
              textShadowColor: 'rgba(0, 0, 0, 0.5)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 3,
            }}
            numberOfLines={2}
          >
            {name}
          </Text>
          
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.xs,
              fontFamily: typography.fonts.primary,
              textAlign: 'center',
              marginTop: spacing.xs,
              textShadowColor: 'rgba(0, 0, 0, 0.5)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 3,
            }}
          >
            {(dimensions.width / 100).toFixed(1)}m × {(dimensions.height / 100).toFixed(1)}m
          </Text>
        </View>
      </View>
    </View>
  );
}
