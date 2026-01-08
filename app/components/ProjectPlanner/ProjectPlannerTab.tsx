import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, ScrollView, Text, TouchableOpacity, Dimensions, Alert, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Project, Room } from "../../utils/storage";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { getWallsForShape } from "../../utils/shapeCalculations";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from 'expo-media-library';
import PlannerHeader from "./components/PlannerHeader";
import CanvasContainer from "./components/CanvasContainer";
import CanvasGrid from "./components/CanvasGrid";
import CanvasLegend from "./components/CanvasLegend";
import RoomControls from "./components/RoomControls";
import DraggableRoom from "./DraggableRoom/DraggableRoom";
import ExportPreviewModal from "./components/ExportPreviewModal";
import { CanvasRoom, CANVAS_WIDTH, CANVAS_HEIGHT, GRID_SIZE, METERS_TO_GRID } from "./utils/canvasCalculations";
import { spacing, borderRadius, colors, typography, shadows, animations } from "../../utils/theme";
import { exportCanvasToPNG, getCanvasFileName } from "./utils/exportUtils";
import { useToast } from "../../hooks/useToast";

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
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [exportedImageUri, setExportedImageUri] = useState<string | null>(null);
  const emptyStateAnim = React.useRef(new Animated.Value(0)).current;
  const canvasRef = useRef<View>(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    console.log('🔵 ProjectPlannerTab MOUNTED');
    return () => {
        console.log('🔴 ProjectPlannerTab UNMOUNTED');
    };
  }, []);

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
    let width: number;
    let height: number;

    if (room.shape === 'l-shape') {
      // For L-shapes, match the SVG width calculation: main width + additional width
      // This ensures consistency between positioning and rendering
      const mainWidth = (room.dimensions.width / 100) * METERS_TO_GRID;
      const additionalWidth = ((room.dimensions.width2 || 0) / 100) * METERS_TO_GRID;
      width = mainWidth + additionalWidth;

      const mainHeight = (room.dimensions.length / 100) * METERS_TO_GRID;
      const extHeight = ((room.dimensions.length2 || 0) / 100) * METERS_TO_GRID;
      height = Math.max(mainHeight, extHeight);
    } else {
      width = (room.dimensions.width / 100) * METERS_TO_GRID;
      height = (room.dimensions.length / 100) * METERS_TO_GRID;
    }

    // Swap dimensions for 90° and 270° rotations
    const rotation = room.rotation || 0;
    if (rotation === 90 || rotation === 270) {
      return height; // Swapped!
    }
    return width;
  };

  const getRoomHeight = (room: Room) => {
    let width: number;
    let height: number;

    if (room.shape === 'l-shape') {
      const mainWidth = (room.dimensions.width / 100) * METERS_TO_GRID;
      const additionalWidth = ((room.dimensions.width2 || 0) / 100) * METERS_TO_GRID;
      width = mainWidth + additionalWidth;

      const mainHeight = (room.dimensions.length / 100) * METERS_TO_GRID;
      const extHeight = ((room.dimensions.length2 || 0) / 100) * METERS_TO_GRID;
      height = Math.max(mainHeight, extHeight);  // Return the LARGER dimension
    } else {
      width = (room.dimensions.width / 100) * METERS_TO_GRID;
      height = (room.dimensions.length / 100) * METERS_TO_GRID;
    }

    // Swap dimensions for 90° and 270° rotations
    const rotation = room.rotation || 0;
    if (rotation === 90 || rotation === 270) {
      return width; // Swapped!
    }
    return height;
  };

  const toggleCleanMode = () => {
    setIsCleanMode(!isCleanMode);
  };

  const exportToPNG = async () => {
    console.log('🔵 Export button pressed - generating PNG');

    if (canvasRooms.length === 0) {
      Alert.alert("Błąd eksportu", "Brak pomieszczeń do wyeksportowania");
      return;
    }

    try {
      const uri = await exportCanvasToPNG(canvasRef, project, showError);

      if (uri) {
        console.log('✅ PNG captured:', uri);
        setExportedImageUri(uri);
        setShowExportPreview(true);
      }
    } catch (error) {
      console.error("❌ Export error:", error);
      const errorMessage = error instanceof Error ? error.message : "Nieznany błąd";
      showError("Błąd eksportu", `Nie udało się wyeksportować planu do PNG: ${errorMessage}`);
    }
  };

  const handleDownload = async () => {
    if (!exportedImageUri) return;

    try {
      // Request permissions
      const permission = await MediaLibrary.requestPermissionsAsync();

      if (!permission.granted) {
        showError("Błąd", "Wymagane są uprawnienia do biblioteki zdjęć");
        return;
      }

      // Save to photo gallery
      await MediaLibrary.saveToLibraryAsync(exportedImageUri);

      showSuccess("Sukces", "Plan zapisany w bibliotece zdjęć");
      setShowExportPreview(false);
    } catch (error) {
      console.error("Download error:", error);
      showError("Błąd", "Nie udało się zapisać pliku");
    }
  };

  const handleShare = async () => {
    if (!exportedImageUri) return;

    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(exportedImageUri, {
          UTI: '.png',
          mimeType: 'image/png',
        });
        setShowExportPreview(false);
      } else {
        showError("Błąd", "Udostępnianie nie jest dostępne na tym urządzeniu");
      }
    } catch (error) {
      showError("Błąd", "Nie udało się udostępnić pliku");
    }
  };

  const handleClosePreview = () => {
    setShowExportPreview(false);
    setExportedImageUri(null);
  };

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    // Reset dragging when selecting a different room
    if (selectedRoomId !== roomId) {
      setIsDragging(false);
    }
  };

  const handleMoveRoom = (roomId: string, position: { x: number; y: number }) => {
    updateRoomPosition(roomId, position.x, position.y);
  };

  const handleRemoveRoom = (roomId: string) => {
    removeRoomFromCanvas(roomId);
    // Reset dragging state when room is removed to restore scrolling
    setIsDragging(false);
  };

  const handleRotateRoom = (roomId: string) => {
    setCanvasRooms(prev =>
      prev.map(room => {
        if (room.id === roomId) {
          const currentRotation = room.rotation || 0;
          const newRotation = (currentRotation + 90) % 360 as 0 | 90 | 180 | 270;
          return { ...room, rotation: newRotation };
        }
        return room;
      })
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView 
        style={{ flex: 1, padding: spacing.md }}
        scrollEnabled={!isDragging}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
        {/* Header */}
        <PlannerHeader
          onExport={exportToPNG}
          hasRooms={canvasRooms.length > 0}
          isCleanMode={isCleanMode}
          onToggleCleanMode={toggleCleanMode}
        />
          {/* Canvas */}
          <View style={{ alignItems: 'center', marginVertical: spacing.lg }}>
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
                        onRotate={handleRotateRoom}
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
        </View>

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
      </ScrollView>

      {/* Export Preview Modal */}
      <ExportPreviewModal
        visible={showExportPreview}
        imageUri={exportedImageUri}
        projectName={project.name}
        onClose={handleClosePreview}
        onDownload={handleDownload}
        onShare={handleShare}
      />
    </GestureHandlerRootView>
  );
}
