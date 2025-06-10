import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Project, Room } from "../utils/storage";
import { PanGestureHandler, State, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
  withSpring,
} from "react-native-reanimated";
import Svg, { Rect, Path, Circle, Text as SvgText } from "react-native-svg";
import { getWallsForShape, calculateElementPosition } from "../utils/shapeCalculations";
// @ts-ignore - react-native-view-shot types
let captureRef: any;
try {
  captureRef = require("react-native-view-shot").captureRef;
} catch (error) {
  console.log("react-native-view-shot not available");
}
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

interface ProjectPlannerTabProps {
  project: Project;
  showError?: (title: string, message?: string) => void;
  showSuccess?: (title: string, message?: string) => void;
}

interface CanvasRoom extends Room {
  x: number;
  y: number;
  isSelected?: boolean;
}

const CANVAS_WIDTH = Dimensions.get("window").width - 72; // 16px padding * 2 + 20px gradient padding * 2
const CANVAS_HEIGHT = 400;
const GRID_SIZE = 10;
const METERS_TO_GRID = 20; // 2 grid squares = 1 meter, so 20px = 1 meter

export default function ProjectPlannerTab({ 
  project, 
  showError, 
  showSuccess 
}: ProjectPlannerTabProps) {
  const [canvasRooms, setCanvasRooms] = useState<CanvasRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<View>(null);

  const addRoomToCanvas = (room: Room) => {
    const canvasRoom: CanvasRoom = {
      ...room,
      x: 50 + Math.random() * 100, // Better positioned start
      y: 50 + Math.random() * 100,
      isSelected: false,
    };
    setCanvasRooms([...canvasRooms, canvasRoom]);
  };

  const removeRoomFromCanvas = (roomId: string) => {
    setCanvasRooms(canvasRooms.filter((r) => r.id !== roomId));
    if (selectedRoomId === roomId) {
      setSelectedRoomId(null);
    }
  };

  const updateRoomPosition = (roomId: string, x: number, y: number) => {
    setCanvasRooms(prev => 
      prev.map(room => 
        room.id === roomId 
          ? { ...room, x: Math.max(0, Math.min(x, CANVAS_WIDTH - getRoomWidth(room))), y: Math.max(0, Math.min(y, CANVAS_HEIGHT - getRoomHeight(room))) }
          : room
      )
    );
  };

  const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

  const getRoomWidth = (room: Room) => Math.max(40, (room.dimensions.width / 100) * METERS_TO_GRID);
  const getRoomHeight = (room: Room) => Math.max(30, (room.dimensions.length / 100) * METERS_TO_GRID);

  const exportToPNG = async () => {
    if (!captureRef) {
      showError?.("Eksport niedostępny", "Funkcja eksportu PNG nie jest dostępna w tym środowisku");
      return;
    }

    if (!canvasRef.current) {
      showError?.("Błąd eksportu", "Nie można znaleźć płótna do eksportu");
      return;
    }

    try {
      const uri = await captureRef(canvasRef.current, {
        format: "png",
        quality: 1.0,
        result: "tmpfile",
      });

      const fileName = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_plan.png`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.moveAsync({
        from: uri,
        to: fileUri,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          UTI: '.png',
          mimeType: 'image/png',
        });
      } else {
        showSuccess?.("Sukces", `Plan zapisany w: ${fileUri}`);
      }
    } catch (error) {
      showError?.("Błąd eksportu", "Nie udało się wyeksportować planu do PNG");
    }
  };

    const renderRoomShape = (room: CanvasRoom) => {
    const width = getRoomWidth(room);
    const height = getRoomHeight(room);
    const isSelected = selectedRoomId === room.id;

    if (room.shape === "rectangle") {
      return (
        <View
          style={{
            width: width,
            height: height,
            backgroundColor: isSelected ? "rgba(108, 99, 255, 0.6)" : "rgba(108, 99, 255, 0.4)",
            borderWidth: isSelected ? 3 : 2,
            borderColor: isSelected ? "#8B5CF6" : "#6C63FF",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isSelected ? 0.3 : 0.1,
            shadowRadius: 4,
            elevation: isSelected ? 8 : 4,
            borderRadius: 4,
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          <Text style={{ color: "white", fontSize: 10, fontWeight: "bold", textAlign: "center" }}>
            {room.name}
          </Text>
          <Text style={{ color: "#B8BCC8", fontSize: 8, textAlign: "center" }}>
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
      // L-shape rendering with clean outline like second image
      // Main part: 4m x 4m, Small part: 2m x 2m (50% of main)
      const mainWidth = width * 0.5;  // 50% for main part
      const smallHeight = height * 0.5; // 50% for small part height

      return (
        <Svg width={width} height={height}>
          {/* L-shape outline path - small part at top-right */}
          <Path
            d={`M 0 0 L ${width} 0 L ${width} ${smallHeight} L ${mainWidth} ${smallHeight} L ${mainWidth} ${height} L 0 ${height} Z`}
            fill="none"
            stroke={isSelected ? "#8B5CF6" : "#6C63FF"}
            strokeWidth={isSelected ? 3 : 2}
          />
          
          {/* Room name */}
          <SvgText
            x={mainWidth / 2}
            y={height * 0.75}
            fontSize="10"
            fontWeight="bold"
            fill="white"
            textAnchor="middle"
          >
            {room.name}
          </SvgText>
          
          {/* Dimensions */}
          <SvgText
            x={mainWidth / 2}
            y={height * 0.75 + 12}
            fontSize="8"
            fill="#B8BCC8"
            textAnchor="middle"
          >
            L-shape
          </SvgText>
          
          {/* Render doors and windows as small circles on the path */}
          {room.elements?.map((element, index) => {
            // Get the correct wall using the new system for L-shape
            const walls = getWallsForShape("l-shape", room.dimensions, room.corner || "top-right");
            const wall = walls[element.wall];
            
            if (!wall) return null;
            
            const position = element.position / 100;
            let elementX = 0, elementY = 0;
            
            // Map based on wall ID - L-shape has 7 walls (0-6)
            if (wall.id === 0) { // Ściana północna lewa
              elementX = position * mainWidth;
              elementY = 0;
            } else if (wall.id === 1) { // Ściana północna prawa  
              elementX = mainWidth + position * (width - mainWidth);
              elementY = 0;
            } else if (wall.id === 2) { // Ściana wschodnia
              elementX = width;
              elementY = position * smallHeight;
            } else if (wall.id === 3) { // Ściana środkowa pozioma
              elementX = mainWidth + position * (width - mainWidth);
              elementY = smallHeight;
            } else if (wall.id === 4) { // Ściana środkowa pionowa
              elementX = mainWidth;
              elementY = smallHeight + position * (height - smallHeight);
            } else if (wall.id === 5) { // Ściana południowa
              elementX = position * mainWidth;
              elementY = height;
            } else if (wall.id === 6) { // Ściana zachodnia
              elementX = 0;
              elementY = position * height;
            }

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

  const DraggableRoom = ({ room }: { room: CanvasRoom }) => {
    const [localPosition, setLocalPosition] = useState({ x: room.x, y: room.y });
    const [isLocalDragging, setIsLocalDragging] = useState(false);

    const handlePanGesture = (event: any) => {
      const { state, translationX, translationY } = event.nativeEvent;
      
      if (state === State.BEGAN) {
        setIsLocalDragging(true);
        setSelectedRoomId(room.id);
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
        
        updateRoomPosition(room.id, finalX, finalY);
        setLocalPosition({ x: finalX, y: finalY });
      }
    };

    // Update local position when room position changes externally
    React.useEffect(() => {
      if (!isLocalDragging) {
        setLocalPosition({ x: room.x, y: room.y });
      }
    }, [room.x, room.y, isLocalDragging]);

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
            zIndex: selectedRoomId === room.id ? 1000 : 1,
            opacity: isLocalDragging ? 0.8 : 1,
            transform: [{ scale: isLocalDragging ? 1.05 : 1 }],
          }}
        >
          {renderRoomShape(room)}
          
          {/* Remove button */}
          <TouchableOpacity
            onPress={() => removeRoomFromCanvas(room.id)}
            style={{
              position: "absolute",
              top: -8,
              right: -8,
              backgroundColor: "#EF4444",
              borderRadius: 10,
              width: 16,
              height: 16,
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10,
            }}
          >
            <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>×</Text>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    );
  };

  const renderGrid = () => {
    const gridLines = [];
    const gridColor = "#2A2D4A";
    
    // Vertical lines
    for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
      gridLines.push(
        <View
          key={`v-${x}`}
          style={{
            position: "absolute",
            left: x,
            top: 0,
            width: 1,
            height: CANVAS_HEIGHT,
            backgroundColor: gridColor,
            opacity: 0.3,
          }}
        />
      );
    }
    
    // Horizontal lines
    for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
      gridLines.push(
        <View
          key={`h-${y}`}
          style={{
            position: "absolute",
            left: 0,
            top: y,
            width: CANVAS_WIDTH,
            height: 1,
            backgroundColor: gridColor,
            opacity: 0.3,
          }}
        />
      );
    }
    
    return gridLines;
  };

  return (
    <ScrollView 
      style={{ flex: 1, padding: 16 }}
      scrollEnabled={!isDragging}
    >
      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            color: "white",
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 16,
          }}
        >
          Planer 2D
        </Text>

        <LinearGradient
          colors={["#1E2139", "#2A2D4A"]}
          style={{
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ color: "white", fontSize: 16 }}>
              Płótno planowania
            </Text>
            <TouchableOpacity
              onPress={exportToPNG}
              disabled={canvasRooms.length === 0 || !captureRef}
              style={{
                backgroundColor: (canvasRooms.length === 0 || !captureRef) ? "#374151" : "#6C63FF",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: "white", fontSize: 12, fontWeight: "500" }}>
                Eksport PNG
              </Text>
            </TouchableOpacity>
          </View>

          <GestureHandlerRootView style={{ flex: 1 }}>
            <View
              ref={canvasRef}
              style={{
                backgroundColor: "#0A0B1E",
                borderRadius: 8,
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                position: "relative",
                borderWidth: 2,
                borderColor: "#6C63FF",
                borderStyle: canvasRooms.length === 0 ? "dashed" : "solid",
                overflow: "hidden",
              }}
            >
            {/* Grid */}
            {canvasRooms.length > 0 && renderGrid()}

            {canvasRooms.length === 0 ? (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#B8BCC8", textAlign: "center" }}>
                  Przeciągnij pomieszczenia na płótno{"\n"}aby utworzyć plan domu
                </Text>
              </View>
            ) : (
              canvasRooms.map((room) => (
                <DraggableRoom key={`canvas-${room.id}`} room={room} />
              ))
            )}

            {/* Scale indicator */}
            {canvasRooms.length > 0 && (
              <View style={{ position: "absolute", bottom: 8, right: 8 }}>
                <Text style={{ color: "#B8BCC8", fontSize: 8 }}>
                  2 kratki = 1m
                </Text>
              </View>
            )}
            </View>
          </GestureHandlerRootView>

          {/* Legend */}
          {canvasRooms.some(room => room.elements && room.elements.length > 0) && (
            <View style={{ marginTop: 12, flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: "white", fontSize: 12, marginRight: 16 }}>Legenda:</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}>
                <View style={{ width: 12, height: 8, backgroundColor: "#FCD34D", marginRight: 4, borderRadius: 2 }} />
                <Text style={{ color: "#B8BCC8", fontSize: 10 }}>Drzwi</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ width: 12, height: 8, backgroundColor: "#60A5FA", marginRight: 4, borderRadius: 2 }} />
                <Text style={{ color: "#B8BCC8", fontSize: 10 }}>Okna</Text>
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Room Controls */}
        <Text
          style={{
            color: "white",
            fontSize: 18,
            fontWeight: "bold",
            marginBottom: 12,
          }}
        >
          Dostępne pomieszczenia
        </Text>

        {project?.rooms.map((room) => {
          const isOnCanvas = canvasRooms.some((cr) => cr.id === room.id);
          const hasElements = room.elements && room.elements.length > 0;
          
          return (
            <TouchableOpacity
              key={room.id}
              onPress={() => !isOnCanvas && addRoomToCanvas(room)}
              disabled={isOnCanvas}
              style={{
                backgroundColor: isOnCanvas ? "#2A2D4A" : "#374151",
                padding: 12,
                borderRadius: 8,
                marginBottom: 8,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                opacity: isOnCanvas ? 0.6 : 1,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  {room.name}
                </Text>
                <Text style={{ color: "#B8BCC8", fontSize: 12 }}>
                  {room.shape === "rectangle" ? "Prostokąt" : "Kształt L"} • {" "}
                  {(room.dimensions.width / 100).toFixed(2)}m × {(room.dimensions.length / 100).toFixed(2)}m
                </Text>
                {hasElements && (
                  <Text style={{ color: "#4DABF7", fontSize: 10 }}>
                    {room.elements!.filter(e => e.type === "door").length} drzwi, {" "}
                    {room.elements!.filter(e => e.type === "window").length} okien
                  </Text>
                )}
              </View>
              <Text style={{ color: isOnCanvas ? "#6B7280" : "#4DABF7" }}>
                {isOnCanvas ? "Na planie" : "Dodaj"}
              </Text>
            </TouchableOpacity>
          );
        })}

        {canvasRooms.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setCanvasRooms([]);
              setSelectedRoomId(null);
            }}
            style={{
              backgroundColor: "#EF4444",
              padding: 12,
              borderRadius: 8,
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <Text style={{ color: "white", fontWeight: "500" }}>
              Wyczyść plan
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
} 