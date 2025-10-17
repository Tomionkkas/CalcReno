import { useState, useEffect } from "react";
import { Platform } from "react-native";
import { StorageService, Project, Room, generateUUID } from "../utils/storage";
import { useAuth } from "./useAuth";

export function useProjectData(id: string | undefined, showError: (title: string, message?: string) => void, showSuccess: (title: string, message?: string) => void, showConfirm?: (title: string, message: string, onConfirm: () => void) => void) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isGuest } = useAuth();

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    if (!id) return;

    try {
      setLoading(true);
      console.log("loadProject: Loading project", { id, isGuest, userId: user?.id, platform: Platform.OS });
      const projectData = await StorageService.getProject(id, isGuest, user?.id);
      console.log("loadProject: Project loaded", { 
        projectId: projectData?.id, 
        roomsCount: projectData?.rooms?.length || 0,
        roomIds: projectData?.rooms?.map(r => r.id) || [],
        platform: Platform.OS
      });
      
      // Android-specific: Use setTimeout to ensure proper state update
      if (Platform.OS === 'android') {
        setTimeout(() => {
          setProject(projectData);
        }, 50);
      } else {
        setProject(projectData);
      }
    } catch (error) {
      console.error("Error loading project:", error);
      showError("Błąd", "Nie udało się załadować projektu");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!project) return;

    const deleteRoom = async () => {
      try {
        const updatedProject = {
          ...project,
          rooms: project.rooms.filter((r) => r.id !== roomId),
        };
        await StorageService.updateProject(updatedProject, isGuest, user?.id);
        
        // Android-specific: Use setTimeout to ensure proper state update
        if (Platform.OS === 'android') {
          setTimeout(() => {
            setProject(updatedProject);
          }, 50);
        } else {
          setProject(updatedProject);
        }
      } catch (error) {
        console.error("Error deleting room:", error);
        showError("Błąd", "Nie udało się usunąć pomieszczenia");
      }
    };

    if (showConfirm) {
      showConfirm(
        "Usuń pomieszczenie",
        "Czy na pewno chcesz usunąć to pomieszczenie?",
        deleteRoom
      );
    } else {
      // Fallback - should not happen if showConfirm is properly provided
      deleteRoom();
    }
  };

  const handleSaveRoom = async (roomData: {
    shape: "rectangle" | "l-shape";
    dimensions: any;
    elements: any[];
    name?: string;
    corner?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  }, editingRoom: Room | null) => {
    if (!project) return;

    console.log("handleSaveRoom: Starting room save", {
      editingRoomId: editingRoom?.id,
      projectRoomsCount: project.rooms.length,
      roomDataName: roomData.name,
      roomDataElementsCount: roomData.elements.length,
      platform: Platform.OS
    });

    const isEditing =
      editingRoom && project.rooms.some((r) => r.id === editingRoom.id);
    const roomId = editingRoom?.id || generateUUID();
    const roomName =
      roomData.name ||
      editingRoom?.name ||
      `Pomieszczenie ${project.rooms.length + 1}`;

    console.log("handleSaveRoom: Room info", {
      isEditing,
      roomId,
      roomName,
      existingRoomIds: project.rooms.map(r => r.id),
      platform: Platform.OS
    });

    const newRoom: Room = {
      id: roomId,
      name: roomName,
      shape: roomData.shape,
      dimensions: roomData.dimensions,
      elements: roomData.elements,
      corner: roomData.corner,
    };

    let updatedRooms;
    if (isEditing) {
      updatedRooms = project.rooms.map((r) => (r.id === roomId ? newRoom : r));
      console.log("handleSaveRoom: Editing existing room", { roomId, platform: Platform.OS });
    } else {
      updatedRooms = [...project.rooms, newRoom];
      console.log("handleSaveRoom: Adding new room", { roomId, newRoomsCount: updatedRooms.length, platform: Platform.OS });
    }

    const updatedProject = {
      ...project,
      rooms: updatedRooms,
    };

    console.log("handleSaveRoom: About to save project", {
      originalRoomsCount: project.rooms.length,
      updatedRoomsCount: updatedRooms.length,
      roomIds: updatedRooms.map(r => r.id),
      platform: Platform.OS
    });

    try {
      await StorageService.updateProject(updatedProject, isGuest, user?.id);
      
      // Android-specific: Use setTimeout to ensure proper state update
      if (Platform.OS === 'android') {
        setTimeout(() => {
          setProject(updatedProject);
          console.log("handleSaveRoom: Android - Project state updated with delay");
        }, 100);
      } else {
        setProject(updatedProject);
        console.log("handleSaveRoom: iOS - Project state updated immediately");
      }

      console.log("handleSaveRoom: Room saved successfully");
      showSuccess("Sukces", "Pomieszczenie zostało zapisane");
    } catch (error) {
      console.error("Error saving room:", error);
      showError("Błąd", "Nie udało się zapisać pomieszczenia");
    }
  };

  const handleSaveCalculation = async (calculation: any, selectedRoom: Room | null) => {
    if (!project || !selectedRoom) return;

    const previousTotalCost = project.totalCost || 0;

    const updatedRooms = project.rooms.map((r) =>
      r.id === selectedRoom.id ? { ...r, materials: calculation } : r,
    );

    const totalCost = updatedRooms.reduce(
      (sum, room) => sum + (room.materials?.totalCost || 0),
      0,
    );

    const updatedProject = {
      ...project,
      rooms: updatedRooms,
      totalCost,
    };

    try {
      await StorageService.updateProject(updatedProject, isGuest, user?.id);
      
      // Android-specific: Use setTimeout to ensure proper state update
      if (Platform.OS === 'android') {
        setTimeout(() => {
          setProject(updatedProject);
        }, 50);
      } else {
        setProject(updatedProject);
      }

      // Cross-app notifications removed - only RenoTimeline→CalcReno notifications are kept
      // CalcReno→RenoTimeline notifications disabled per user request

      showSuccess("Sukces", "Kalkulacja została zapisana");
    } catch (error) {
      console.error("Error saving calculation:", error);
      showError("Błąd", "Nie udało się zapisać kalkulacji");
    }
  };

  return {
    project,
    loading,
    handleDeleteRoom,
    handleSaveRoom,
    handleSaveCalculation,
  };
} 