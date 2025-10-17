import React from "react";
import { View } from "react-native";
import { spacing, borderRadius, shadows } from "../../../utils/theme";
import GlassmorphicView from "../../ui/GlassmorphicView";

interface CanvasContainerProps {
  children: React.ReactNode;
  isCleanMode: boolean;
}

export default function CanvasContainer({ children, isCleanMode }: CanvasContainerProps) {
  return (
    <GlassmorphicView 
      intensity="light" 
      style={{
        borderRadius: borderRadius.xl,
        marginBottom: spacing.lg,
        ...shadows.lg,
        borderWidth: isCleanMode ? 0 : 1,
        borderColor: isCleanMode ? 'transparent' : 'rgba(255, 255, 255, 0.1)',
      }}
    >
      <View style={{
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.xl,
        backgroundColor: isCleanMode ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
      }}>
        {children}
      </View>
    </GlassmorphicView>
  );
}
