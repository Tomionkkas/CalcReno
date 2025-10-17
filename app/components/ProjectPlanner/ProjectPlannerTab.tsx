import React, { useState, useRef } from "react";
import { View, ScrollView, Text, TouchableOpacity, Dimensions, Alert, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Project, Room } from "../../utils/storage";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { getWallsForShape } from "../../utils/shapeCalculations";
// @ts-ignore - react-native-view-shot types
let captureRef: any;
try {
  captureRef = require("react-native-view-shot").captureRef;
} catch (error) {
  console.log("react-native-view-shot not available");
}
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import PlannerHeader from "./components/PlannerHeader";
import CanvasContainer from "./components/CanvasContainer";
import CanvasGrid from "./components/CanvasGrid";
import CanvasLegend from "./components/CanvasLegend";
import RoomControls from "./components/RoomControls";
import DraggableRoom from "./DraggableRoom/DraggableRoom";
import { CanvasRoom, CANVAS_WIDTH, CANVAS_HEIGHT, GRID_SIZE, METERS_TO_GRID } from "./utils/canvasCalculations";
import { spacing, borderRadius, colors, typography, shadows, animations } from "../../utils/theme";

interface ProjectPlannerTabProps {
  project: Project;
  onAddRoom: () => void;
  onRemoveRoom: (roomId: string) => void;
}

export default function ProjectPlannerTab({ 
  project, 
  onAddRoom, 
  onRemoveRoom 
}: ProjectPlannerTabProps) {
  const [canvasRooms, setCanvasRooms] = useState<CanvasRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCleanMode, setIsCleanMode] = useState(false);
  const canvasRef = useRef<View>(null);
  const emptyStateAnim = useRef(new Animated.Value(0)).current;

  // Animate empty state on mount
  React.useEffect(() => {
    if (canvasRooms.length === 0) {
      Animated.timing(emptyStateAnim, {
        toValue: 1,
        duration: animations.duration.normal,
        useNativeDriver: true,
      }).start();
    } else {
      emptyStateAnim.setValue(0);
    }
  }, [canvasRooms.length]);

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

  const getRoomWidth = (room: Room) => {
    if (room.shape === 'l-shape') {
      // For L-shapes, match the SVG width calculation: main width + additional width
      // This ensures consistency between positioning and rendering
      const mainWidth = Math.max(40, (room.dimensions.width / 100) * METERS_TO_GRID);
      const additionalWidth = Math.max(20, ((room.dimensions.width2 || 0) / 100) * METERS_TO_GRID);
      return mainWidth + additionalWidth;
    }
    return Math.max(40, (room.dimensions.width / 100) * METERS_TO_GRID);
  };
  const getRoomHeight = (room: Room) => Math.max(30, (room.dimensions.length / 100) * METERS_TO_GRID);

  const toggleCleanMode = () => {
    setIsCleanMode(!isCleanMode);
  };

  const exportToPNG = async () => {
    if (!captureRef) {
      Alert.alert("Eksport niedostępny", "Funkcja eksportu PNG nie jest dostępna w tym środowisku");
      return;
    }

    if (!canvasRef.current) {
      Alert.alert("Błąd eksportu", "Nie można znaleźć płótna do eksportu");
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
        Alert.alert("Sukces", `Plan zapisany w: ${fileUri}`);
      }
    } catch (error) {
      Alert.alert("Błąd eksportu", "Nie udało się wyeksportować planu do PNG");
    }
  };

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
  };

  const handleMoveRoom = (roomId: string, position: { x: number; y: number }) => {
    updateRoomPosition(roomId, position.x, position.y);
  };

  const handleRemoveRoom = (roomId: string) => {
    removeRoomFromCanvas(roomId);
  };

  return (
    <ScrollView 
      style={{ flex: 1, padding: spacing.md }}
      scrollEnabled={!isDragging}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ marginBottom: spacing.lg }}>
        {/* Header */}
        <PlannerHeader 
          onExport={exportToPNG}
          hasRooms={canvasRooms.length > 0}
          hasCaptureRef={!!captureRef}
          isCleanMode={isCleanMode}
          onToggleCleanMode={toggleCleanMode}
        />

        {/* Canvas Container */}
        <CanvasContainer isCleanMode={isCleanMode}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <View
              ref={canvasRef}
              style={{
                backgroundColor: isCleanMode ? "#FFFFFF" : "#0A0B1E",
                borderRadius: borderRadius.lg,
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                position: "relative",
                borderWidth: 2,
                borderColor: isCleanMode ? "#000000" : colors.primary.start,
                borderStyle: canvasRooms.length === 0 ? "dashed" : "solid",
                overflow: "hidden",
                ...shadows.md,
                alignSelf: 'center',
              }}
            >
                {/* Project title in clean mode */}
                {isCleanMode && (
                  <View style={{
                    position: "absolute",
                    top: spacing.lg,
                    left: spacing.lg,
                    right: spacing.lg,
                    zIndex: 10,
                    alignItems: 'center',
                  }}>
                    <View style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      paddingHorizontal: spacing.lg,
                      paddingVertical: spacing.md,
                      borderRadius: borderRadius.lg,
                      borderWidth: 1,
                      borderColor: 'rgba(0, 0, 0, 0.1)',
                      shadowColor: "#000000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 4,
                    }}>
                      <Text style={{
                        color: "#000000",
                        fontSize: typography.sizes.xl,
                        fontWeight: '700',
                        fontFamily: typography.fonts.primary,
                        textAlign: 'center',
                        marginBottom: spacing.xs,
                      }}>
                        {project.name}
                      </Text>
                      <Text style={{
                        color: "#6B7280",
                        fontSize: typography.sizes.sm,
                        fontWeight: '500',
                        fontFamily: typography.fonts.primary,
                        textAlign: 'center',
                      }}>
                        Plan 2D • {new Date().toLocaleDateString('pl-PL')}
                      </Text>
                    </View>
                  </View>
                )}

              {/* Grid */}
              {canvasRooms.length > 0 && (
                <CanvasGrid 
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  isCleanMode={isCleanMode}
                />
              )}

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
                    padding: spacing.lg,
                  }}
                >
                  <Animated.View style={{ opacity: emptyStateAnim }}>
                    <Text style={{ 
                      color: isCleanMode ? "#000000" : colors.text.tertiary, 
                      textAlign: "center",
                      fontSize: 16,
                      fontWeight: '600',
                      marginBottom: 4,
                    }}>
                      Przeciągnij pomieszczenia na płótno
                    </Text>
                    <Text style={{ 
                      color: isCleanMode ? "#6B7280" : colors.text.muted, 
                      textAlign: "center",
                      fontSize: 14,
                      fontWeight: '400',
                    }}>
                      aby utworzyć plan
                    </Text>
                  </Animated.View>
                </View>
              ) : (
                <>
                  {/* Canvas background click handler for deselection */}
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
                    onPress={() => setSelectedRoomId(null)}
                  />
                  
                  {/* Rooms rendered above the background click handler */}
                  <View style={{ position: "relative", zIndex: 2 }}>
                    {canvasRooms.map((room) => (
                      <DraggableRoom
                        key={`canvas-${room.id}`}
                        room={room}
                        isSelected={selectedRoomId === room.id}
                        onSelect={handleSelectRoom}
                        onMove={handleMoveRoom}
                        onRemove={handleRemoveRoom}
                        existingRooms={canvasRooms}
                        setIsDragging={setIsDragging}
                        snapToGrid={snapToGrid}
                        getRoomWidth={getRoomWidth}
                        getRoomHeight={getRoomHeight}
                        isCleanMode={isCleanMode}
                      />
                    ))}
                  </View>
                </>
              )}

              {/* Scale indicator */}
              {canvasRooms.length > 0 && (
                <View style={{ position: "absolute", bottom: 8, right: 8, zIndex: 3 }}>
                  <Text style={{ 
                    color: isCleanMode ? "#000000" : colors.text.tertiary, 
                    fontSize: 8,
                    backgroundColor: isCleanMode ? "rgba(255, 255, 255, 0.8)" : "transparent",
                    padding: isCleanMode ? 2 : 0,
                    borderRadius: isCleanMode ? 2 : 0,
                    fontFamily: typography.fonts.primary,
                  }}>
                    2 kratki = 1m
                  </Text>
                </View>
              )}
            </View>
          </GestureHandlerRootView>
        </CanvasContainer>

        {/* Legend */}
        <CanvasLegend 
          hasElements={canvasRooms.some(room => room.elements && room.elements.length > 0)}
          isCleanMode={isCleanMode}
        />

        {/* Room Controls */}
        <RoomControls 
          project={project}
          canvasRooms={canvasRooms}
          onAddRoomToCanvas={addRoomToCanvas}
          onClearCanvas={() => {
            setCanvasRooms([]);
            setSelectedRoomId(null);
          }}
          isCleanMode={isCleanMode}
        />
      </View>
    </ScrollView>
  );
}
