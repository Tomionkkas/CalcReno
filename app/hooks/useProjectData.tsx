import { useState, useEffect } from "react";
import { StorageService, Project, Room } from "../utils/storage";
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
      const projectData = await StorageService.getProject(id, isGuest, user?.id);
      setProject(projectData);
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
            const updatedProject = {
              ...project,
              rooms: project.rooms.filter((r) => r.id !== roomId),
            };
            await StorageService.updateProject(updatedProject, isGuest, user?.id);
            setProject(updatedProject);
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
  }, editingRoom: Room | null) => {
    if (!project) return;

    const isEditing =
      editingRoom && project.rooms.some((r) => r.id === editingRoom.id);
    const roomId = editingRoom?.id || Date.now().toString();
    const roomName =
      roomData.name ||
      editingRoom?.name ||
      `Pomieszczenie ${project.rooms.length + 1}`;

    const newRoom: Room = {
      id: roomId,
      name: roomName,
      shape: roomData.shape,
      dimensions: roomData.dimensions,
      elements: roomData.elements,
    };

    let updatedRooms;
    if (isEditing) {
      updatedRooms = project.rooms.map((r) => (r.id === roomId ? newRoom : r));
    } else {
      updatedRooms = [...project.rooms, newRoom];
    }

    const updatedProject = {
      ...project,
      rooms: updatedRooms,
    };

    await StorageService.updateProject(updatedProject, isGuest, user?.id);
    setProject(updatedProject);

    showSuccess("Sukces", "Pomieszczenie zostało zapisane");
  };

  const handleSaveCalculation = async (calculation: any, selectedRoom: Room | null) => {
    if (!project || !selectedRoom) return;

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

    await StorageService.updateProject(updatedProject, isGuest, user?.id);
    setProject(updatedProject);

    showSuccess("Sukces", "Kalkulacja została zapisana");
  };

  return {
    project,
    loading,
    handleDeleteRoom,
    handleSaveRoom,
    handleSaveCalculation,
  };
} 