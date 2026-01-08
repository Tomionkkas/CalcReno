import React, { useState, useEffect } from "react";
import { Platform } from "react-native";
import { useFocusEffect } from 'expo-router';
import { StorageService, Project, Room, generateUUID } from "../utils/storage";
import { useAuth } from "./useAuth";
import {
  rateLimiter,
  createRoomSchema,
  validateWithSchema,
  sanitizeForStorage,
  parseNumber,
} from "../utils/security";

export function useProjectData(id: string | undefined, showError: (title: string, message?: string) => void, showSuccess: (title: string, message?: string) => void, showConfirm?: (title: string, message: string, onConfirm: () => void) => void) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isGuest } = useAuth();

  // Reload project data when screen gains focus (navigation back, app resume)
  // This also handles initial load when component mounts
  useFocusEffect(
    React.useCallback(() => {
      if (id) {
        loadProject();
      }
    }, [id])
  );

  // OPTIMIZATION: Removed setTimeout delays - they add unnecessary latency (50-150ms per load)
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

      // OPTIMIZATION: Set state immediately - React handles batching automatically
      setProject(projectData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading project:", error);
      showError("Błąd", "Nie udało się załadować projektu");
      setLoading(false);
    }
  };

  // OPTIMIZATION: Removed setTimeout - React batches state updates automatically
  const handleDeleteRoom = async (roomId: string) => {
    if (!project) return;

    const deleteRoom = async () => {
      try {
        const updatedProject = {
          ...project,
          rooms: project.rooms.filter((r) => r.id !== roomId),
        };
        await StorageService.updateProject(updatedProject, isGuest, user?.id);

        // OPTIMIZATION: Immediate state update - no artificial delay needed
        setProject(updatedProject);
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

    // Rate limit room creation/updates
    const rateLimitResult = await rateLimiter.checkAndRecord('api:room_create', user?.id);
    if (!rateLimitResult.allowed) {
      showError("Błąd", rateLimitResult.message || "Zbyt wiele prób. Spróbuj później.");
      return;
    }

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

    // Sanitize room name
    const sanitizedRoomName = sanitizeForStorage(roomName);

    // Validate and sanitize dimensions
    // Note: dimensions are stored in centimeters (e.g., 500 = 5 meters)
    // Constraints: min 10cm (0.1m), max 10000cm (100m) for width/length
    // Height: min 100cm (1m), max 1000cm (10m)
    const sanitizedDimensions = {
      width: parseNumber(roomData.dimensions?.width, 400, 10, 10000),
      length: parseNumber(roomData.dimensions?.length, 400, 10, 10000),
      height: parseNumber(roomData.dimensions?.height, 250, 100, 1000),
      ...(roomData.shape === 'l-shape' && {
        width2: parseNumber(roomData.dimensions?.width2, 200, 10, 10000),
        length2: parseNumber(roomData.dimensions?.length2, 200, 10, 10000),
      }),
    };

    // Validate and sanitize elements
    // Note: element dimensions are stored in centimeters (e.g., 90 = 0.9 meters)
    // Constraints: min 10cm (0.1m), max 1000cm (10m) for width, max 500cm (5m) for height
    const sanitizedElements = (roomData.elements || [])
      .slice(0, 50) // Limit to 50 elements max
      .map(el => ({
        id: el.id || generateUUID(),
        type: el.type === 'door' || el.type === 'window' ? el.type : 'door',
        width: parseNumber(el.width, 100, 10, 1000),
        height: parseNumber(el.height, 200, 10, 500),
        position: parseNumber(el.position, 0, 0, 100),
        wall: parseNumber(el.wall, 1, 1, 6),
      }));

    console.log("handleSaveRoom: Room info", {
      isEditing,
      roomId,
      roomName: sanitizedRoomName,
      existingRoomIds: project.rooms.map(r => r.id),
      platform: Platform.OS
    });

    const newRoom: Room = {
      id: roomId,
      name: sanitizedRoomName,
      shape: roomData.shape,
      dimensions: sanitizedDimensions,
      elements: sanitizedElements,
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

      // OPTIMIZATION: Immediate state update - no artificial delay needed
      setProject(updatedProject);
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

      // OPTIMIZATION: Immediate state update - no artificial delay needed
      setProject(updatedProject);

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