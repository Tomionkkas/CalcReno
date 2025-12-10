import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import CustomToast from "../components/CustomToast";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../hooks/useToast";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Room, generateUUID } from "../utils/storage";
import RoomEditor from "../components/RoomEditor/index";
import MaterialCalculator from "../components/MaterialCalculator";
import { getWallsForShape } from "../utils/shapeCalculations";
import ProjectHeader from "../components/ProjectHeader";
import ProjectRoomsTab from "../components/ProjectRoomsTab";
import ProjectSummaryTab from "../components/ProjectSummaryTab";
import ProjectPlannerTab from "../components/ProjectPlanner/ProjectPlannerTab";
import AddRoomModal from "../components/AddRoomModal";
import { useProjectData } from "../hooks/useProjectData";
import { LinearGradient } from "expo-linear-gradient";
import { colors, gradients, typography, spacing, borderRadius, shadows } from "../utils/theme";
import { useAccessibility } from "../hooks/useAccessibility";

type TabType = "rooms" | "editor" | "calculator" | "summary" | "planner";

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { toastConfig, isVisible, showError, showSuccess, hideToast } = useToast();
  
  // Always visible - no entrance animations
  const pageAnim = useRef(new Animated.Value(1)).current;
  const contentAnim = useRef(new Animated.Value(1)).current;
  
  // Force re-render state (needed for both Android and iOS to ensure room list updates)
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Track previous room IDs to prevent unnecessary force updates
  const prevRoomIdsRef = useRef<string>('');
  
  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({
      visible: true,
      title,
      message,
      onConfirm,
    });
  };

  const hideConfirm = () => {
    setConfirmDialog(prev => ({ ...prev, visible: false }));
  };

  const { project, loading, handleDeleteRoom, handleSaveRoom, handleSaveCalculation } = useProjectData(id, showError, showSuccess, showConfirm);
  
  const [activeTab, setActiveTab] = useState<TabType>("rooms");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    visible: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Force re-render when room IDs actually change (both Android and iOS)
  useEffect(() => {
    if (project) {
      const currentRoomIds = project.rooms.map(r => r.id).sort().join(',');
      if (currentRoomIds !== prevRoomIdsRef.current) {
        console.log("ProjectDetailScreen: Rooms changed, triggering force update", {
          platform: Platform.OS,
          roomsCount: project.rooms.length,
          roomIds: project.rooms.map(r => r.id),
          previousIds: prevRoomIdsRef.current,
          currentIds: currentRoomIds
        });
        prevRoomIdsRef.current = currentRoomIds;
        setTimeout(() => {
          setForceUpdate(prev => prev + 1);
        }, Platform.OS === 'ios' ? 150 : 100); // iOS needs slightly more time
      }
    }
  }, [project?.rooms]);

  // Force re-render when activeTab changes to rooms (both Android and iOS)
  useEffect(() => {
    if (activeTab === "rooms") {
      console.log("ProjectDetailScreen: Switching to rooms tab, triggering force update");
      setTimeout(() => {
        setForceUpdate(prev => prev + 1);
      }, 50);
    }
  }, [activeTab]);

  const pageTranslateY = pageAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  const pageOpacity = pageAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const contentTranslateY = contentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const contentOpacity = contentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const handleAddRoom = () => {
    setShowAddRoomModal(true);
  };

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) {
      showError("Błąd", "Nazwa pomieszczenia jest wymagana");
      return;
    }
    // Create a temporary room object to pass the name to the editor
    const tempRoom = {
      id: generateUUID(),
      name: newRoomName.trim(),
      shape: "rectangle" as const,
      dimensions: {
        width: 400,
        length: 500,
        height: 250,
        width2: 200,
        length2: 300,
      },
      elements: [],
    };
    setEditingRoom(tempRoom);
    setActiveTab("editor");
    setShowAddRoomModal(false);
    setNewRoomName("");
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setActiveTab("editor");
  };

  const handleEditRoomById = (roomId: string) => {
    const room = project?.rooms.find(r => r.id === roomId);
    if (room) {
      handleEditRoom(room);
    }
  };

  const handleCalculateMaterials = (room: Room) => {
    setSelectedRoom(room);
    setActiveTab("calculator");
  };

  const handleCalculateMaterialsById = (roomId: string) => {
    const room = project?.rooms.find(r => r.id === roomId);
    if (room) {
      handleCalculateMaterials(room);
    }
  };

  const handleRoomSave = async (roomData: {
    shape: "rectangle" | "l-shape";
    dimensions: any;
    elements: any[];
    name?: string;
    corner?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  }) => {
    await handleSaveRoom(roomData, editingRoom);
    setEditingRoom(null);
    setActiveTab("rooms");
  };

  const handleCalculationSave = async (calculation: any) => {
    await handleSaveCalculation(calculation, selectedRoom);
  };

  const prepareRoomDetailsForCalculator = (room: Room) => {
    // Validate room data
    if (!room || !room.dimensions) {
      console.error("Invalid room data for calculator:", room);
      throw new Error("Invalid room data");
    }

    const baseDetails = {
      shape: room.shape,
      length: room.dimensions.length / 100,
      width: room.dimensions.width / 100,
      height: room.dimensions.height / 100,
      length2: room.dimensions.length2 ? room.dimensions.length2 / 100 : undefined,
      width2: room.dimensions.width2 ? room.dimensions.width2 / 100 : undefined,
      corner: room.corner,
      doors: room.elements
        .filter((e) => e.type === "door")
        .map((e) => ({ width: e.width / 100, height: e.height / 100 })),
      windows: room.elements
        .filter((e) => e.type === "window")
        .map((e) => ({ width: e.width / 100, height: e.height / 100 })),
    };

    // Calculate walls based on room shape
    if (room.shape === "l-shape") {
      const walls = getWallsForShape(room.shape, room.dimensions, room.corner || "bottom-left");
      console.log(`L-shape room walls (${walls.length} walls):`, walls.map(w => `${w.name}: ${w.length}cm`));
      return {
        ...baseDetails,
        walls: walls.map((wall) => ({ length: wall.length / 100 })),
      };
    } else {
      // Rectangle room - 4 walls
      const rectangleWalls = [
        { length: room.dimensions.length / 100 }, // Top wall
        { length: room.dimensions.width / 100 },  // Right wall  
        { length: room.dimensions.length / 100 }, // Bottom wall
        { length: room.dimensions.width / 100 },  // Left wall
      ];
      console.log("Rectangle room walls:", rectangleWalls);
      return {
        ...baseDetails,
        walls: rectangleWalls,
      };
    }
  };

  const handleBackPress = () => {
    if (activeTab === "editor" || activeTab === "calculator") {
      setActiveTab("rooms");
      setEditingRoom(null);
      setSelectedRoom(null);
    } else {
      router.back();
    }
  };

  const renderContent = () => {
    if (!project) return null;
    
    switch (activeTab) {
      case "rooms":
        return (
          <ProjectRoomsTab
            key={`rooms-tab-${forceUpdate}`}
            project={project}
            onAddRoom={handleAddRoom}
            onEditRoom={handleEditRoomById}
            onDeleteRoom={handleDeleteRoom}
            onRoomPress={handleCalculateMaterialsById}
            onCalculateRoom={handleCalculateMaterialsById}
          />
        );
      case "editor":
        return (
          <RoomEditor
            onSave={handleRoomSave}
            initialData={
              editingRoom
                ? {
                    shape: editingRoom.shape,
                    dimensions: editingRoom.dimensions,
                    elements: editingRoom.elements,
                    name: editingRoom.name,
                    corner: editingRoom.corner,
                  }
                : undefined
            }
          />
        );
      case "calculator":
        return selectedRoom ? (
          <MaterialCalculator
            roomDetails={prepareRoomDetailsForCalculator(selectedRoom)}
            onSave={handleCalculationSave}
          />
        ) : null;
      case "summary":
        return <ProjectSummaryTab project={project} />;
      case "planner":
        return <ProjectPlannerTab 
          project={project} 
          onAddRoom={handleAddRoom}
          onRemoveRoom={handleDeleteRoom}
        />;
      default:
        return (
          <ProjectRoomsTab
            key={`rooms-tab-default-${forceUpdate}`}
            project={project}
            onAddRoom={handleAddRoom}
            onEditRoom={handleEditRoomById}
            onDeleteRoom={handleDeleteRoom}
            onRoomPress={handleCalculateMaterialsById}
            onCalculateRoom={handleCalculateMaterialsById}
          />
        );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
        <Animated.View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            transform: [{ translateY: pageTranslateY }],
            opacity: pageOpacity,
          }}
        >
          <LinearGradient
            colors={gradients.background.colors}
            start={gradients.background.start}
            end={gradients.background.end}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: spacing.md,
              ...shadows.lg,
            }}
          >
            <ActivityIndicator size="large" color={colors.primary.start} />
          </LinearGradient>
          <Text style={{ 
            color: colors.text.primary, 
            marginTop: spacing.md,
            fontSize: typography.sizes.base,
            fontWeight: '500',
            fontFamily: typography.fonts.primary,
          }}>
            Ładowanie projektu...
          </Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  if (!project) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
        <Animated.View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: spacing.lg,
            transform: [{ translateY: pageTranslateY }],
            opacity: pageOpacity,
          }}
        >
          <Text style={{ 
            color: colors.text.primary, 
            fontSize: typography.sizes.lg, 
            textAlign: "center",
            fontFamily: typography.fonts.primary,
            marginBottom: spacing.lg,
          }}>
            Nie znaleziono projektu
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              backgroundColor: colors.primary.start,
              borderRadius: borderRadius.md,
              ...shadows.md,
            }}
            activeOpacity={0.8}
          >
            <Text style={{ 
              color: colors.text.primary,
              fontWeight: '600',
              fontSize: typography.sizes.base,
              fontFamily: typography.fonts.primary,
            }}>
              Powrót
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <Animated.View
        style={{
          flex: 1,
          transform: [{ translateY: pageTranslateY }],
          opacity: pageOpacity,
        }}
      >
        <ProjectHeader
          project={project}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onBackPress={handleBackPress}
        />

        <Animated.View
          style={{
            flex: 1,
            transform: [{ translateY: contentTranslateY }],
            opacity: contentOpacity,
          }}
        >
          {renderContent()}
        </Animated.View>
      </Animated.View>

      <AddRoomModal
        visible={showAddRoomModal}
        roomName={newRoomName}
        onRoomNameChange={setNewRoomName}
        onClose={() => setShowAddRoomModal(false)}
        onCreate={handleCreateRoom}
      />

      {/* Custom Toast */}
      {toastConfig && (
        <CustomToast
          visible={isVisible}
          type={toastConfig.type}
          title={toastConfig.title}
          message={toastConfig.message}
          onClose={hideToast}
          duration={toastConfig.duration}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        visible={confirmDialog.visible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => {
          confirmDialog.onConfirm();
          hideConfirm();
        }}
        onCancel={hideConfirm}
        confirmText="Usuń"
        confirmColor="#EF4444"
      />
    </SafeAreaView>
  );
}