import React, { useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import CustomToast from "../components/CustomToast";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../hooks/useToast";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Room } from "../utils/storage";
import RoomEditor from "../components/RoomEditor";
import MaterialCalculator from "../components/MaterialCalculator";
import ProjectHeader from "../components/ProjectHeader";
import ProjectRoomsTab from "../components/ProjectRoomsTab";
import ProjectSummaryTab from "../components/ProjectSummaryTab";
import ProjectPlannerTab from "../components/ProjectPlannerTab";
import AddRoomModal from "../components/AddRoomModal";
import { useProjectData } from "../hooks/useProjectData";

type TabType = "rooms" | "editor" | "calculator" | "summary" | "planner";

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { toastConfig, isVisible, showError, showSuccess, hideToast } = useToast();
  
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
      id: Date.now().toString(),
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

  const handleCalculateMaterials = (room: Room) => {
    setSelectedRoom(room);
    setActiveTab("calculator");
  };

  const handleRoomSave = async (roomData: {
    shape: "rectangle" | "l-shape";
    dimensions: any;
    elements: any[];
    name?: string;
  }) => {
    await handleSaveRoom(roomData, editingRoom);
    setEditingRoom(null);
    setActiveTab("rooms");
  };

  const handleCalculationSave = async (calculation: any) => {
    await handleSaveCalculation(calculation, selectedRoom);
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
            project={project}
            onAddRoom={handleAddRoom}
            onEditRoom={handleEditRoom}
            onDeleteRoom={handleDeleteRoom}
            onCalculateMaterials={handleCalculateMaterials}
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
                  }
                : undefined
            }
          />
        );
      case "calculator":
        return selectedRoom ? (
          <MaterialCalculator
            roomDetails={{
              length: selectedRoom.dimensions.length / 100,
              width: selectedRoom.dimensions.width / 100,
              height: selectedRoom.dimensions.height / 100,
              walls: [
                { length: selectedRoom.dimensions.length / 100 },
                { length: selectedRoom.dimensions.width / 100 },
                { length: selectedRoom.dimensions.length / 100 },
                { length: selectedRoom.dimensions.width / 100 },
              ],
              doors: selectedRoom.elements
                .filter((e) => e.type === "door")
                .map((e) => ({ width: e.width / 100, height: e.height / 100 })),
              windows: selectedRoom.elements
                .filter((e) => e.type === "window")
                .map((e) => ({ width: e.width / 100, height: e.height / 100 })),
            }}
            onSave={handleCalculationSave}
          />
        ) : null;
      case "summary":
        return <ProjectSummaryTab project={project} showError={showError} showSuccess={showSuccess} />;
      case "planner":
        return <ProjectPlannerTab project={project} showError={showError} showSuccess={showSuccess} />;
      default:
            return (
          <ProjectRoomsTab
            project={project}
            onAddRoom={handleAddRoom}
            onEditRoom={handleEditRoom}
            onDeleteRoom={handleDeleteRoom}
            onCalculateMaterials={handleCalculateMaterials}
          />
        );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0B1E" }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={{ color: "white", marginTop: 16 }}>
            Ładowanie projektu...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!project) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0B1E" }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <Text style={{ color: "white", fontSize: 18, textAlign: "center" }}>
            Nie znaleziono projektu
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              marginTop: 16,
              padding: 12,
              backgroundColor: "#6C63FF",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white" }}>Powrót</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0B1E" }}>
      <ProjectHeader
        project={project}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onBackPress={handleBackPress}
      />

      {renderContent()}

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