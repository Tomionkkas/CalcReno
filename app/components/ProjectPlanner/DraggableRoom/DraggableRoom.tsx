import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
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
  existingRooms,
  setIsDragging,
  snapToGrid,
  getRoomWidth,
  getRoomHeight,
  isCleanMode,
}: DraggableRoomProps) {
  const [localPosition, setLocalPosition] = useState({ x: room.x, y: room.y });
  const [isLocalDragging, setIsLocalDragging] = useState(false);

  const handlePanGesture = (event: any) => {
    const { state, translationX, translationY } = event.nativeEvent;
    
    if (state === State.BEGAN) {
      setIsLocalDragging(true);
      onSelect(room.id);
      setIsDragging(true);
    } else if (state === State.ACTIVE) {
      const newX = room.x + translationX;
      const newY = room.y + translationY;
      setLocalPosition({ x: newX, y: newY });
    } else if (state === State.END || state === State.CANCELLED) {
      setIsLocalDragging(false);
      setIsDragging(false);
      
      // Snap to grid and apply boundaries
      const snappedX = snapToGrid(localPosition.x);
      const snappedY = snapToGrid(localPosition.y);
      
      const maxX = CANVAS_WIDTH - getRoomWidth(room);
      const maxY = CANVAS_HEIGHT - getRoomHeight(room);
      
      const finalX = Math.max(0, Math.min(snappedX, maxX));
      const finalY = Math.max(0, Math.min(snappedY, maxY));
      
      onMove(room.id, { x: finalX, y: finalY });
      setLocalPosition({ x: finalX, y: finalY });
    }
  };

  // Update local position when room position changes externally
  React.useEffect(() => {
    if (!isLocalDragging) {
      setLocalPosition({ x: room.x, y: room.y });
    }
  }, [room.x, room.y, isLocalDragging]);

  const renderRoomShape = () => {
    const width = getRoomWidth(room);
    const height = getRoomHeight(room);

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
            
            // Map walls correctly: 0=top, 1=right, 2=bottom, 3=left
            if (wall.id === 0) { // Top wall (północna)
              elementStyle.top = -4;
              elementStyle.left = position * width - 4;
            } else if (wall.id === 1) { // Right wall (wschodnia)
              elementStyle.right = -4;
              elementStyle.top = position * height - 4;
            } else if (wall.id === 2) { // Bottom wall (południowa)
              elementStyle.bottom = -4;
              elementStyle.left = position * width - 4;
            } else if (wall.id === 3) { // Left wall (zachodnia)
              elementStyle.left = -4;
              elementStyle.top = position * height - 4;
            }

            return <View key={`element-${index}`} style={elementStyle} />;
          })}
        </View>
      );
    } else {
      // L-shape rendering with dynamic corner-based paths
      const { width: roomWidth, length: roomLength, width2: roomWidth2 = 0, length2: roomLength2 = 0 } = room.dimensions;
      
      // Convert dimensions from cm to grid units (1m = 20px) - use raw dimensions to avoid double calculation
      const mainWidth = Math.max(40, (roomWidth / 100) * METERS_TO_GRID);
      const height = getRoomHeight(room);
      const width2 = Math.max(20, (roomWidth2 / 100) * METERS_TO_GRID);
      const length2 = (roomLength2 / 100) * METERS_TO_GRID;
      
      // Generate SVG path based on corner orientation
      let pathData = "";
      const corner = room.corner || "top-right";
      
      switch (corner) {
        case "top-right":
          pathData = `M 0 0 L ${mainWidth} 0 L ${mainWidth + width2} 0 L ${mainWidth + width2} ${length2} L ${mainWidth} ${length2} L ${mainWidth} ${height} L 0 ${height} Z`;
          break;
        case "top-left":
          pathData = `M 0 0 L ${width2} 0 L ${width2 + mainWidth} 0 L ${width2 + mainWidth} ${height} L ${width2} ${height} L ${width2} ${length2} L 0 ${length2} Z`;
          break;
        case "bottom-right":
          pathData = `M 0 0 L ${mainWidth} 0 L ${mainWidth} ${height - length2} L ${mainWidth + width2} ${height - length2} L ${mainWidth + width2} ${height} L 0 ${height} Z`;
          break;
        case "bottom-left":
          pathData = `M ${width2} 0 L ${width2 + mainWidth} 0 L ${width2 + mainWidth} ${height} L 0 ${height} L 0 ${height - length2} L ${width2} ${height - length2} Z`;
          break;
      }

      return (
        <Svg width={mainWidth + width2} height={height}>
          {/* L-shape outline path - dynamic based on corner */}
          <Path
            d={pathData}
            fill="none"
            stroke={isCleanMode 
              ? (isSelected ? "#3B82F6" : "#6B7280")
              : (isSelected ? "#8B5CF6" : "#6C63FF")
            }
            strokeWidth={isSelected ? 3 : 2}
          />
          
          {/* Room name - positioned in the main part of the L-shape */}
          <SvgText
            x={mainWidth / 2}
            y={height * 0.75}
            fontSize="10"
            fontWeight="600"
            fill={isCleanMode ? "#000000" : "white"}
            textAnchor="middle"
          >
            {room.name}
          </SvgText>
          
          {/* Dimensions */}
          <SvgText
            x={mainWidth / 2}
            y={height * 0.75 + 12}
            fontSize="8"
            fill={isCleanMode ? "#6B7280" : "#B8BCC8"}
            textAnchor="middle"
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
            
            // Use the same coordinate calculation logic as calculateElementPosition
            if (wall.direction === 'horizontal') {
              elementX = wall.startPoint.x + (wall.endPoint.x - wall.startPoint.x) * position;
              elementY = wall.startPoint.y;
            } else {
              elementX = wall.startPoint.x;
              elementY = wall.startPoint.y + (wall.endPoint.y - wall.startPoint.y) * position;
            }
            
            // Convert real-world coordinates to grid coordinates
            elementX = (elementX / 100) * METERS_TO_GRID;
            elementY = (elementY / 100) * METERS_TO_GRID;
            
            // Ensure element stays within SVG boundaries
            const elementRadius = 4;
            elementX = Math.max(elementRadius, Math.min(elementX, mainWidth + width2 - elementRadius));
            elementY = Math.max(elementRadius, Math.min(elementY, height - elementRadius));

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
    <PanGestureHandler 
      onGestureEvent={handlePanGesture}
      onHandlerStateChange={handlePanGesture}
      activeOffsetX={[-10, 10]}
      activeOffsetY={[-10, 10]}
    >
      <Animated.View
        style={{
          position: "absolute",
          left: localPosition.x,
          top: localPosition.y,
          width: getRoomWidth(room),
          height: getRoomHeight(room),
          zIndex: isSelected ? 1000 : 1,
          opacity: isLocalDragging ? 0.8 : 1,
          transform: [{ scale: isLocalDragging ? 1.05 : 1 }],
        }}
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
    </PanGestureHandler>
  );
}
