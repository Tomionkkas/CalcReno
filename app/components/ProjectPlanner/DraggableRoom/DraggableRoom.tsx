import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from "react-native-reanimated";
import Svg, { Path, Circle, Text as SvgText } from "react-native-svg";
import { getWallsForShape } from "../../../utils/shapeCalculations";
import { CanvasRoom, CANVAS_WIDTH, CANVAS_HEIGHT, GRID_SIZE, METERS_TO_GRID } from "../utils/canvasCalculations";
import { typography } from "../../../utils/theme";

interface DraggableRoomProps {
  room: CanvasRoom;
  isSelected: boolean;
  onSelect: (roomId: string) => void;
  onMove: (roomId: string, position: { x: number; y: number }) => void;
  onRemove: (roomId: string) => void;
  onRotate: (roomId: string) => void;
  existingRooms: CanvasRoom[];
  setIsDragging: (isDragging: boolean) => void;
  snapToGrid: (value: number) => number;
  getRoomWidth: (room: any) => number;
  getRoomHeight: (room: any) => number;
  isCleanMode: boolean;
}

export default function DraggableRoom({
  room,
  isSelected,
  onSelect,
  onMove,
  onRemove,
  onRotate,
  existingRooms,
  setIsDragging,
  snapToGrid,
  getRoomWidth,
  getRoomHeight,
  isCleanMode,
}: DraggableRoomProps) {
  // React state for JS thread synchronization
  const [isLocalDragging, setIsLocalDragging] = useState(false);
  
  // Shared values for smooth animation
  const translateX = useSharedValue(room.x);
  const translateY = useSharedValue(room.y);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  
  // Shared values for dimensions and selection state
  const roomWidth = useSharedValue(getRoomWidth(room));
  const roomHeight = useSharedValue(getRoomHeight(room));
  const isSelectedShared = useSharedValue(isSelected);

  // Pan gesture definition
  const pan = Gesture.Pan()
    .onBegin(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
      isDragging.value = true;
      runOnJS(setIsDragging)(true);
      runOnJS(onSelect)(room.id);
      runOnJS(setIsLocalDragging)(true);
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
    })
    .onEnd(() => {
      // Snap to grid and apply boundaries
      const snappedX = Math.round(translateX.value / GRID_SIZE) * GRID_SIZE;
      const snappedY = Math.round(translateY.value / GRID_SIZE) * GRID_SIZE;
      
      const maxX = CANVAS_WIDTH - roomWidth.value;
      const maxY = CANVAS_HEIGHT - roomHeight.value;
      
      const finalX = Math.max(0, Math.min(snappedX, maxX));
      const finalY = Math.max(0, Math.min(snappedY, maxY));
      
      translateX.value = withSpring(finalX);
      translateY.value = withSpring(finalY);
      
      runOnJS(onMove)(room.id, { x: finalX, y: finalY });
      runOnJS(setIsDragging)(false);
      runOnJS(setIsLocalDragging)(false);
      isDragging.value = false;
    })
    .activeOffsetX([-10, 10])
    .activeOffsetY([-10, 10]);

  // Update position when room position changes externally
  React.useEffect(() => {
    if (!isLocalDragging) {
      translateX.value = room.x;
      translateY.value = room.y;
    }
  }, [room.x, room.y, isLocalDragging]);

  // Sync dimensions when room changes
  React.useEffect(() => {
    roomWidth.value = getRoomWidth(room);
    roomHeight.value = getRoomHeight(room);
  }, [room.dimensions, room.shape, room.dimensions.width, room.dimensions.length, room.dimensions.width2, room.dimensions.length2, room.corner]);

  // Sync selection state
  React.useEffect(() => {
    isSelectedShared.value = isSelected;
  }, [isSelected]);

  // Animated style for smooth position updates
  const animatedStyle = useAnimatedStyle(() => {
    const rotation = room.rotation || 0;
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
      ],
      opacity: isDragging.value ? 0.8 : 1,
      zIndex: isSelectedShared.value ? 1000 : 1,
    };
  });

  const renderRoomShape = () => {
    const width = getRoomWidth(room);
    const height = getRoomHeight(room);
    const rotation = room.rotation || 0;

    if (room.shape === "rectangle") {
      return (
        <View
          style={{
            width: width,
            height: height,
            backgroundColor: isCleanMode
              ? (isSelected ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.08)")
              : (isSelected ? "rgba(108, 99, 255, 0.6)" : "rgba(108, 99, 255, 0.4)"),
            borderWidth: isSelected ? 3 : 2,
            borderColor: isCleanMode
              ? (isSelected ? "#3B82F6" : "#6B7280")
              : (isSelected ? "#8B5CF6" : "#6C63FF"),
            shadowColor: isCleanMode ? "#000000" : "#000",
            shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
            shadowOpacity: isSelected ? 0.4 : 0.2,
            shadowRadius: isSelected ? 8 : 4,
            elevation: isSelected ? 12 : 6,
            borderRadius: 6,
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Counter-rotate text to keep it upright */}
          <View style={{ transform: [{ rotate: `${-rotation}deg` }] }}>
            <Text style={{
              color: isCleanMode ? "#000000" : "white",
              fontSize: 10,
              fontWeight: '600',
              textAlign: "center",
              marginBottom: 2,
              fontFamily: typography.fonts.primary,
              letterSpacing: 0.1,
              textShadowColor: isCleanMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.3)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 1,
            }}>
              {room.name}
            </Text>
            <Text style={{
              color: isCleanMode ? "#6B7280" : "#B8BCC8",
              fontSize: 8,
              textAlign: "center",
              fontWeight: '500',
              fontFamily: typography.fonts.primary,
              letterSpacing: 0.05,
            }}>
              {(room.dimensions.width / 100).toFixed(1)}m × {(room.dimensions.length / 100).toFixed(1)}m
            </Text>
          </View>
          
          {/* Render doors and windows as small colored indicators */}
          {room.elements?.map((element, index) => {
            // Get the correct wall using the new system
            const walls = getWallsForShape("rectangle", room.dimensions);
            const wall = walls[element.wall];

            if (!wall) return null;

            const position = element.position / 100;
            let elementStyle: any = {
              position: "absolute",
              width: 8,
              height: 8,
              backgroundColor: element.type === "door" ? "#FCD34D" : "#60A5FA",
              borderRadius: 2,
              borderWidth: 1,
              borderColor: element.type === "door" ? "#F59E0B" : "#3B82F6",
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.3,
              shadowRadius: 2,
              elevation: 2,
            };

            // Use wall startPoint and endPoint for accurate positioning
            // This handles wall direction correctly (some walls go right-to-left or bottom-to-top)
            if (wall.direction === 'horizontal') {
              // Horizontal wall - interpolate X position
              const startX = (wall.startPoint.x / 100) * METERS_TO_GRID;
              const endX = (wall.endPoint.x / 100) * METERS_TO_GRID;
              const elementX = startX + (endX - startX) * position;

              elementStyle.left = elementX - 4;

              // Determine if top or bottom wall
              if (wall.startPoint.y === 0) {
                elementStyle.top = -4;
              } else {
                elementStyle.bottom = -4;
              }
            } else {
              // Vertical wall - interpolate Y position
              const startY = (wall.startPoint.y / 100) * METERS_TO_GRID;
              const endY = (wall.endPoint.y / 100) * METERS_TO_GRID;
              const elementY = startY + (endY - startY) * position;

              elementStyle.top = elementY - 4;

              // Determine if left or right wall
              if (wall.startPoint.x === 0) {
                elementStyle.left = -4;
              } else {
                elementStyle.right = -4;
              }
            }

            return <View key={`element-${index}`} style={elementStyle} />;
          })}
        </View>
      );
    } else {
      // L-shape rendering with dynamic corner-based paths
      const { width: roomWidth, length: roomLength, width2: roomWidth2 = 0, length2: roomLength2 = 0 } = room.dimensions;
      
      // Convert dimensions from cm to grid units (1m = 20px) - use raw dimensions to avoid double calculation
      const mainWidth = (roomWidth / 100) * METERS_TO_GRID;
      const height = (roomLength / 100) * METERS_TO_GRID;  // Use direct calculation instead of getRoomHeight
      const width2 = (roomWidth2 / 100) * METERS_TO_GRID;
      const length2 = (roomLength2 / 100) * METERS_TO_GRID;

      // Get corner orientation first
      const corner = room.corner || "top-right";

      // Calculate actual SVG dimensions based on corner orientation
      let svgWidth: number;
      let svgHeight: number;

      switch (corner) {
        case "top-right":
        case "bottom-right":
          svgWidth = mainWidth + width2;           // Extension extends RIGHT
          svgHeight = Math.max(height, length2);   // Extension may be taller/deeper
          break;
        case "top-left":
        case "bottom-left":
          svgWidth = mainWidth + width2;           // Extension extends LEFT
          svgHeight = Math.max(height, length2);   // Extension may be taller/deeper
          break;
        default:
          svgWidth = mainWidth + width2;
          svgHeight = Math.max(height, length2);
      }

      // Generate SVG path based on corner orientation
      let pathData = "";
      
      switch (corner) {
        case "top-right":
          if (length2 > height) {
            // Extension is taller - main room is shifted down
            const mainTop = length2 - height;
            pathData = `M 0 ${mainTop} L ${mainWidth} ${mainTop} L ${mainWidth} 0 L ${mainWidth + width2} 0 L ${mainWidth + width2} ${length2} L ${mainWidth} ${length2} L ${mainWidth} ${length2} L 0 ${length2} Z`;
          } else {
            // Main is taller - normal case
            pathData = `M 0 0 L ${mainWidth} 0 L ${mainWidth + width2} 0 L ${mainWidth + width2} ${length2} L ${mainWidth} ${length2} L ${mainWidth} ${height} L 0 ${height} Z`;
          }
          break;
        case "top-left":
          if (length2 > height) {
            // Extension is taller - main room is shifted down
            const mainTop = length2 - height;
            pathData = `M 0 0 L ${width2} 0 L ${width2} ${length2} L ${width2 + mainWidth} ${length2} L ${width2 + mainWidth} ${mainTop} L ${width2} ${mainTop} L ${width2} ${length2} L 0 ${length2} Z`;
          } else {
            // Main is taller - normal case
            pathData = `M 0 0 L ${width2} 0 L ${width2 + mainWidth} 0 L ${width2 + mainWidth} ${height} L ${width2} ${height} L ${width2} ${length2} L 0 ${length2} Z`;
          }
          break;
        case "bottom-right":
          if (length2 > height) {
            // Extension taller - apply Y offset to maintain visual orientation
            const yOffset = length2 - height;
            pathData = `M 0 ${yOffset} L ${mainWidth} ${yOffset} L ${mainWidth} 0 L ${mainWidth + width2} 0 L ${mainWidth + width2} ${length2} L ${mainWidth} ${length2} L 0 ${length2} Z`;
          } else {
            // Main taller - standard case
            pathData = `M 0 0 L ${mainWidth} 0 L ${mainWidth} ${height - length2} L ${mainWidth + width2} ${height - length2} L ${mainWidth + width2} ${height} L ${mainWidth} ${height} L 0 ${height} Z`;
          }
          break;
        case "bottom-left":
          if (length2 > height) {
            // Extension taller - apply Y offset
            const yOffset = length2 - height;
            pathData = `M 0 0 L ${width2} 0 L ${width2} ${length2} L ${width2 + mainWidth} ${length2} L ${width2 + mainWidth} ${yOffset} L ${width2} ${yOffset} L 0 ${length2} Z`;
          } else {
            // Main taller - standard case
            pathData = `M ${width2} 0 L ${width2 + mainWidth} 0 L ${width2 + mainWidth} ${height} L 0 ${height} L 0 ${height - length2} L ${width2} ${height - length2} Z`;
          }
          break;
      }

      // Calculate center of the entire L-shape bounding box for proper text centering
      const totalWidth = svgWidth;
      const centerX = totalWidth / 2;
      const centerY = svgHeight / 2;

      return (
        <Svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        >
          {/* L-shape outline path - dynamic based on corner */}
          <Path
            d={pathData}
            fill={isCleanMode ? "rgba(229, 231, 235, 0.5)" : "rgba(108, 99, 255, 0.1)"}
            stroke={isCleanMode
              ? (isSelected ? "#3B82F6" : "#6B7280")
              : (isSelected ? "#8B5CF6" : "#6C63FF")
            }
            strokeWidth={isSelected ? 3 : 2}
          />

          {/* Room name - centered on the entire L-shape with counter-rotation */}
          <SvgText
            x={centerX}
            y={centerY - 6}
            fontSize="10"
            fontWeight="600"
            fill={isCleanMode ? "#000000" : "white"}
            textAnchor="middle"
            transform={`rotate(${-rotation}, ${centerX}, ${centerY - 6})`}
          >
            {room.name}
          </SvgText>

          {/* Dimensions with counter-rotation */}
          <SvgText
            x={centerX}
            y={centerY + 6}
            fontSize="8"
            fill={isCleanMode ? "#6B7280" : "#B8BCC8"}
            textAnchor="middle"
            transform={`rotate(${-rotation}, ${centerX}, ${centerY + 6})`}
          >
            L-shape
          </SvgText>
          
          {/* Render doors and windows as small circles on the path */}
          {room.elements?.map((element, index) => {
            // Get the correct wall using the new system for L-shape
            const walls = getWallsForShape("l-shape", room.dimensions, corner);
            const wall = walls[element.wall];

            if (!wall) return null;

            const position = element.position / 100;
            let elementX = 0, elementY = 0;

            // Calculate position using linear interpolation between wall start and end points
            // This correctly handles wall direction (right-to-left, bottom-to-top, etc.)
            if (wall.direction === 'horizontal') {
              elementX = wall.startPoint.x + (wall.endPoint.x - wall.startPoint.x) * position;
              elementY = wall.startPoint.y;
            } else {
              elementX = wall.startPoint.x;
              elementY = wall.startPoint.y + (wall.endPoint.y - wall.startPoint.y) * position;
            }

            // Convert real-world coordinates (cm) to grid coordinates (pixels)
            elementX = (elementX / 100) * METERS_TO_GRID;
            elementY = (elementY / 100) * METERS_TO_GRID;

            // Ensure element stays within SVG boundaries
            const elementRadius = 4;
            elementX = Math.max(elementRadius, Math.min(elementX, svgWidth - elementRadius));
            elementY = Math.max(elementRadius, Math.min(elementY, svgHeight - elementRadius));

            return (
              <Circle
                key={`element-${index}`}
                cx={elementX}
                cy={elementY}
                r="4"
                fill={element.type === "door" ? "#FCD34D" : "#60A5FA"}
                stroke={element.type === "door" ? "#F59E0B" : "#3B82F6"}
                strokeWidth="1"
              />
            );
          })}
        </Svg>
      );
    }
  };

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          {
            position: "absolute",
            left: 0,
            top: 0,
            width: getRoomWidth(room),
            height: getRoomHeight(room),
            overflow: "visible",
          },
          animatedStyle,
        ]}
      >
        {/* Room click handler to prevent background deselection */}
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
          }}
          activeOpacity={1}
          onPress={() => onSelect(room.id)}
        />
        
        {renderRoomShape()}

        {/* Rotate button - shown when selected and not in clean mode */}
        {!isCleanMode && isSelected && (
          <TouchableOpacity
            onPress={() => onRotate(room.id)}
            style={{
              position: "absolute",
              top: -8,
              right: 24,
              backgroundColor: "#3B82F6",
              borderRadius: 12,
              width: 20,
              height: 20,
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10,
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
              borderWidth: 1,
              borderColor: "#2563EB",
            }}
            activeOpacity={0.8}
          >
            <Text style={{
              color: "white",
              fontSize: 10,
              fontWeight: '700',
              lineHeight: 10,
            }}>
              ↻
            </Text>
          </TouchableOpacity>
        )}

        {/* Remove button - hidden in clean mode */}
        {!isCleanMode && (
          <TouchableOpacity
            onPress={() => onRemove(room.id)}
            style={{
              position: "absolute",
              top: -8,
              right: -8,
              backgroundColor: "#EF4444",
              borderRadius: 12,
              width: 20,
              height: 20,
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10,
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
              borderWidth: 1,
              borderColor: "#DC2626",
            }}
            activeOpacity={0.8}
          >
            <Text style={{
              color: "white",
              fontSize: 12,
              fontWeight: '600',
              lineHeight: 12,
            }}>
              ×
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </GestureDetector>
  );
}
