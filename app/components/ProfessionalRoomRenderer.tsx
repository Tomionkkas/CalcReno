import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Rect, Line, Circle, Text as SvgText, Path } from "react-native-svg";
import { WallInfo, calculateElementPosition } from "../utils/shapeCalculations";
import { DoorOpen, Square, Trash2 } from "lucide-react-native";

type RoomShape = "rectangle" | "l-shape";
type ElementType = "door" | "window";

interface Element {
  id: string;
  type: ElementType;
  width: number;
  height: number;
  position: number;
  wall: number;
}

interface ProfessionalRoomRendererProps {
  shape: RoomShape;
  dimensions: {
    width: number;
    length: number;
    height: number;
    width2?: number;
    length2?: number;
  };
  corner?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  elements: Element[];
  availableWalls: WallInfo[];
  activeWall: number | null;
  onWallSelect: (wallIndex: number) => void;
  onElementRemove: (elementId: string) => void;
  scale?: number;
}

interface RenderedElement {
  element: Element;
  x: number;
  y: number;
  rotation: number;
  wall: WallInfo;
}

const SCALE_FACTOR = 0.4; // cm to pixels conversion
const MIN_ROOM_SIZE = 150; // Minimum size in pixels
const MAX_ROOM_SIZE = 300; // Maximum size in pixels

export default function ProfessionalRoomRenderer({
  shape,
  dimensions,
  corner = "bottom-left",
  elements,
  availableWalls,
  activeWall,
  onWallSelect,
  onElementRemove,
  scale = 1,
}: ProfessionalRoomRendererProps) {
  
  // Calculate optimal scale to fit room nicely
  const { scaledDimensions, scaleFactor } = useMemo(() => {
    const maxDim = Math.max(dimensions.width, dimensions.length);
    const minDim = Math.min(dimensions.width, dimensions.length);
    
    // Calculate scale to fit nicely
    let factor = SCALE_FACTOR * scale;
    const scaledMax = maxDim * factor;
    const scaledMin = minDim * factor;
    
    // Adjust if too small or too large
    if (scaledMax < MIN_ROOM_SIZE) {
      factor = MIN_ROOM_SIZE / maxDim;
    } else if (scaledMax > MAX_ROOM_SIZE) {
      factor = MAX_ROOM_SIZE / maxDim;
    }
    
    return {
      scaledDimensions: {
        width: dimensions.width * factor,
        length: dimensions.length * factor,
        width2: (dimensions.width2 || 0) * factor,
        length2: (dimensions.length2 || 0) * factor,
      },
      scaleFactor: factor,
    };
  }, [dimensions, scale]);

  // Calculate SVG dimensions
  const svgWidth = shape === "rectangle" 
    ? scaledDimensions.width + 60 
    : Math.max(scaledDimensions.width + scaledDimensions.width2, scaledDimensions.width) + 60;
  
  const svgHeight = shape === "rectangle"
    ? scaledDimensions.length + 60
    : Math.max(scaledDimensions.length, scaledDimensions.length2) + 60;

  // Calculate element positions
  const renderedElements: RenderedElement[] = useMemo(() => {
    return elements.map((element) => {
      const wall = availableWalls[element.wall];
      if (!wall) return null;

      // Calculate element position based on wall and position percentage
      const wallStartX = wall.startPoint.x * scaleFactor + 30;
      const wallStartY = wall.startPoint.y * scaleFactor + 30;
      const wallEndX = wall.endPoint.x * scaleFactor + 30;
      const wallEndY = wall.endPoint.y * scaleFactor + 30;

      const position = element.position / 100;
      const elementX = wallStartX + (wallEndX - wallStartX) * position;
      const elementY = wallStartY + (wallEndY - wallStartY) * position;

      let rotation = 0;
      if (wall.direction === "vertical") {
        rotation = 90;
      }

      return {
        element,
        x: elementX,
        y: elementY,
        rotation,
        wall,
      };
    }).filter(Boolean) as RenderedElement[];
  }, [elements, availableWalls, scaleFactor]);

  const renderRectangleRoom = () => {
    const { width, length } = scaledDimensions;
    const offsetX = 30;
    const offsetY = 30;

    return (
      <Svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        {/* Main room rectangle */}
        <Rect
          x={offsetX}
          y={offsetY}
          width={width}
          height={length}
          fill="rgba(108, 99, 255, 0.1)"
          stroke="#6C63FF"
          strokeWidth="2"
          rx="4"
        />

        {/* Wall lines with better visibility */}
        {availableWalls.map((wall, index) => {
          const isActive = activeWall === index;
          const x1 = wall.startPoint.x * scaleFactor + offsetX;
          const y1 = wall.startPoint.y * scaleFactor + offsetY;
          const x2 = wall.endPoint.x * scaleFactor + offsetX;
          const y2 = wall.endPoint.y * scaleFactor + offsetY;

          return (
            <Line
              key={wall.id}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isActive ? "#8B5CF6" : "#4B5563"}
              strokeWidth={isActive ? "4" : "2"}
              opacity={isActive ? 1 : 0.6}
            />
          );
        })}

        {/* Dimension labels */}
        <SvgText
          x={offsetX + width / 2}
          y={offsetY - 8}
          textAnchor="middle"
          fontSize="12"
          fill="#9CA3AF"
        >
          {(dimensions.width / 100).toFixed(2)}m
        </SvgText>
        <SvgText
          x={offsetX - 8}
          y={offsetY + length / 2}
          textAnchor="middle"
          fontSize="12"
          fill="#9CA3AF"
          transform={`rotate(-90, ${offsetX - 8}, ${offsetY + length / 2})`}
        >
          {(dimensions.length / 100).toFixed(2)}m
        </SvgText>

        {/* Elements */}
        {renderedElements.map((rendered, index) => {
          const { element, x, y } = rendered;
          const elementSize = Math.max(8, element.width * scaleFactor * 0.1);
          
          return (
            <Circle
              key={`element-${index}`}
              cx={x}
              cy={y}
              r={elementSize / 2}
              fill={element.type === "door" ? "#FCD34D" : "#60A5FA"}
              stroke={element.type === "door" ? "#F59E0B" : "#3B82F6"}
              strokeWidth="2"
            />
          );
        })}

        {/* Wall labels */}
        {availableWalls.map((wall, index) => {
          const midX = (wall.startPoint.x + wall.endPoint.x) * scaleFactor / 2 + offsetX;
          const midY = (wall.startPoint.y + wall.endPoint.y) * scaleFactor / 2 + offsetY;
          
          return (
            <SvgText
              key={`wall-label-${wall.id}`}
              x={midX}
              y={midY - 5}
              textAnchor="middle"
              fontSize="10"
              fill="#6C63FF"
              fontWeight="bold"
            >
              {index + 1}
            </SvgText>
          );
        })}
      </Svg>
    );
  };

  const renderLShapeRoom = () => {
    const { width, length, width2, length2 } = scaledDimensions;
    const offsetX = 30;
    const offsetY = 30;

    // L-shape path based on corner
    let pathData = "";
    
    switch (corner) {
      case "top-right":
        pathData = `M ${offsetX} ${offsetY} 
                   L ${offsetX + width} ${offsetY} 
                   L ${offsetX + width + width2} ${offsetY} 
                   L ${offsetX + width + width2} ${offsetY + length2} 
                   L ${offsetX + width} ${offsetY + length2} 
                   L ${offsetX + width} ${offsetY + length} 
                   L ${offsetX} ${offsetY + length} 
                   Z`;
        break;
      case "top-left":
        pathData = `M ${offsetX} ${offsetY} 
                   L ${offsetX + width2} ${offsetY} 
                   L ${offsetX + width2 + width} ${offsetY} 
                   L ${offsetX + width2 + width} ${offsetY + length} 
                   L ${offsetX + width2} ${offsetY + length} 
                   L ${offsetX + width2} ${offsetY + length2} 
                   L ${offsetX} ${offsetY + length2} 
                   Z`;
        break;
      case "bottom-right":
        pathData = `M ${offsetX} ${offsetY} 
                   L ${offsetX + width} ${offsetY} 
                   L ${offsetX + width} ${offsetY + length - length2} 
                   L ${offsetX + width + width2} ${offsetY + length - length2} 
                   L ${offsetX + width + width2} ${offsetY + length} 
                   L ${offsetX} ${offsetY + length} 
                   Z`;
        break;
      case "bottom-left":
        pathData = `M ${offsetX + width2} ${offsetY} 
                   L ${offsetX + width2 + width} ${offsetY} 
                   L ${offsetX + width2 + width} ${offsetY + length} 
                   L ${offsetX} ${offsetY + length} 
                   L ${offsetX} ${offsetY + length - length2} 
                   L ${offsetX + width2} ${offsetY + length - length2} 
                   Z`;
        break;
    }

    return (
      <Svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        {/* L-shape room */}
        <Path
          d={pathData}
          fill="rgba(108, 99, 255, 0.1)"
          stroke="#6C63FF"
          strokeWidth="2"
        />

        {/* Wall lines */}
        {availableWalls.map((wall, index) => {
          const isActive = activeWall === index;
          const x1 = wall.startPoint.x * scaleFactor + offsetX;
          const y1 = wall.startPoint.y * scaleFactor + offsetY;
          const x2 = wall.endPoint.x * scaleFactor + offsetX;
          const y2 = wall.endPoint.y * scaleFactor + offsetY;

          return (
            <Line
              key={wall.id}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isActive ? "#8B5CF6" : "#4B5563"}
              strokeWidth={isActive ? "4" : "2"}
              opacity={isActive ? 1 : 0.6}
            />
          );
        })}

        {/* Elements */}
        {renderedElements.map((rendered, index) => {
          const { element, x, y } = rendered;
          const elementSize = Math.max(8, element.width * scaleFactor * 0.1);
          
          return (
            <Circle
              key={`element-${index}`}
              cx={x}
              cy={y}
              r={elementSize / 2}
              fill={element.type === "door" ? "#FCD34D" : "#60A5FA"}
              stroke={element.type === "door" ? "#F59E0B" : "#3B82F6"}
              strokeWidth="2"
            />
          );
        })}

        {/* Wall labels */}
        {availableWalls.map((wall, index) => {
          const midX = (wall.startPoint.x + wall.endPoint.x) * scaleFactor / 2 + offsetX;
          const midY = (wall.startPoint.y + wall.endPoint.y) * scaleFactor / 2 + offsetY;
          
          return (
            <SvgText
              key={`wall-label-${wall.id}`}
              x={midX}
              y={midY - 5}
              textAnchor="middle"
              fontSize="10"
              fill="#6C63FF"
              fontWeight="bold"
            >
              {index + 1}
            </SvgText>
          );
        })}
      </Svg>
    );
  };

  const renderWallSelectionOverlay = () => {
    return (
      <View style={{ marginTop: 16 }}>
        <Text style={{ color: "white", fontSize: 14, marginBottom: 8 }}>
          Kliknij ścianę aby ją wybrać:
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {availableWalls.map((wall, index) => (
            <TouchableOpacity
              key={wall.id}
              onPress={() => onWallSelect(index)}
              style={{
                backgroundColor: activeWall === index ? "#6C63FF" : "#374151",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
                marginRight: 8,
                marginBottom: 8,
                minWidth: 80,
              }}
            >
              <Text style={{ color: "white", fontSize: 12, textAlign: "center" }}>
                Ściana {index + 1}
              </Text>
              <Text style={{ color: "#9CA3AF", fontSize: 10, textAlign: "center" }}>
                {(wall.length / 100).toFixed(1)}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderElementsList = () => {
    if (elements.length === 0) return null;

    return (
      <View style={{ marginTop: 16 }}>
        <Text style={{ color: "white", fontSize: 14, marginBottom: 8 }}>
          Elementy w pomieszczeniu:
        </Text>
        {elements.map((element) => {
          const wall = availableWalls[element.wall];
          return (
            <View
              key={element.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#374151",
                padding: 8,
                borderRadius: 6,
                marginBottom: 4,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                {element.type === "door" ? (
                  <DoorOpen size={16} color="#FCD34D" />
                ) : (
                  <Square size={16} color="#60A5FA" />
                )}
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text style={{ color: "white", fontSize: 12 }}>
                    {element.type === "door" ? "Drzwi" : "Okno"} - 
                    {(element.width / 100).toFixed(1)}×{(element.height / 100).toFixed(1)}m
                  </Text>
                  <Text style={{ color: "#9CA3AF", fontSize: 10 }}>
                    {wall?.name || `Ściana ${element.wall + 1}`} - {element.position.toFixed(1)}%
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => onElementRemove(element.id)}
                style={{ padding: 4 }}
              >
                <Trash2 size={14} color="#EF4444" />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View>
      <LinearGradient
        colors={["#1F2937", "#374151"]}
        style={{
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
          Wizualizacja pomieszczenia
        </Text>
        
        <View style={{ alignItems: "center" }}>
          {shape === "rectangle" ? renderRectangleRoom() : renderLShapeRoom()}
        </View>
        
        {renderWallSelectionOverlay()}
        {renderElementsList()}
      </LinearGradient>
    </View>
  );
} 