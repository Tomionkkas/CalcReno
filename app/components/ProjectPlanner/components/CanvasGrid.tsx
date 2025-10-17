import React from "react";
import { View } from "react-native";
import { GRID_SIZE } from "../utils/canvasCalculations";
import { colors } from "../../../utils/theme";

interface CanvasGridProps {
  width: number;
  height: number;
  isCleanMode: boolean;
}

export default function CanvasGrid({ width, height, isCleanMode }: CanvasGridProps) {
  const gridLines = [];
  const gridColor = isCleanMode ? "#E5E7EB" : colors.glass.border;
  
  // Vertical lines
  for (let x = 0; x <= width; x += GRID_SIZE) {
    gridLines.push(
      <View
        key={`v-${x}`}
        style={{
          position: "absolute",
          left: x,
          top: 0,
          width: 1,
          height: height,
          backgroundColor: gridColor,
          opacity: isCleanMode ? 0.4 : 0.2,
        }}
      />
    );
  }
  
  // Horizontal lines
  for (let y = 0; y <= height; y += GRID_SIZE) {
    gridLines.push(
      <View
        key={`h-${y}`}
        style={{
          position: "absolute",
          left: 0,
          top: y,
          width: width,
          height: 1,
          backgroundColor: gridColor,
          opacity: isCleanMode ? 0.4 : 0.2,
        }}
      />
    );
  }
  
  return (
    <View style={{ position: "absolute", top: 0, left: 0, width, height }}>
      {gridLines}
    </View>
  );
}
