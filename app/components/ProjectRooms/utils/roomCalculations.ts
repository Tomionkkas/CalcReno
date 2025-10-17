import { Room } from "../../../utils/storage";

export interface RoomDisplayData {
  id: string;
  name: string;
  dimensions: {
    width: number;
    length: number;
  };
  shape: 'rectangle' | 'l-shape';
  orientation?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  materials?: {
    totalCost: number;
    materials: { [key: string]: number };
  };
  status: 'completed' | 'in-progress' | 'planned';
  progress: number;
}

export const calculateRoomProgress = (room: Room): number => {
  if (!room.materials) return 0;
  
  const materialCount = Object.keys(room.materials.materials || {}).length;
  if (materialCount === 0) return 0;
  
  // Simple progress calculation based on materials presence
  return Math.min(100, Math.round((materialCount / 10) * 100));
};

export const getRoomStatus = (room: Room): 'completed' | 'in-progress' | 'planned' => {
  if (!room.materials) return 'planned';
  
  const progress = calculateRoomProgress(room);
  if (progress === 100) return 'completed';
  if (progress > 0) return 'in-progress';
  return 'planned';
};

export const getTopMaterials = (room: Room, count: number = 3): Array<{ name: string; quantity: number; unit: string }> => {
  if (!room.materials?.materials) return [];
  
  const materials = room.materials.materials;
  const materialNames = (room.materials as any)?.materialNames || {};
  const materialUnits = (room.materials as any)?.materialUnits || {};
  
  return Object.entries(materials)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, count)
    .map(([key, quantity]) => ({
      name: materialNames[key] || key,
      quantity: quantity as number,
      unit: materialUnits[key] || 'szt',
    }));
};

export const formatRoomDimensions = (room: Room): string => {
  const width = (room.dimensions.width / 100).toFixed(1);
  const length = (room.dimensions.length / 100).toFixed(1);
  return `${width}m × ${length}m`;
};

export const calculateRoomArea = (room: Room): number => {
  return (room.dimensions.width * room.dimensions.length) / 10000; // Convert to m²
};

export const getRoomDisplayData = (room: Room): RoomDisplayData => {
  return {
    id: room.id,
    name: room.name,
    dimensions: room.dimensions,
    shape: room.shape || 'rectangle',
    orientation: room.orientation,
    materials: room.materials,
    status: getRoomStatus(room),
    progress: calculateRoomProgress(room),
  };
};

export const sortRoomsByStatus = (rooms: Room[]): Room[] => {
  const statusPriority = { 'completed': 3, 'in-progress': 2, 'planned': 1 };
  
  return [...rooms].sort((a, b) => {
    const statusA = getRoomStatus(a);
    const statusB = getRoomStatus(b);
    return statusPriority[statusB] - statusPriority[statusA];
  });
};

export const filterRoomsByStatus = (rooms: Room[], status: 'completed' | 'in-progress' | 'planned' | 'all'): Room[] => {
  if (status === 'all') return rooms;
  return rooms.filter(room => getRoomStatus(room) === status);
};

export const getProjectProgress = (rooms: Room[]): number => {
  if (rooms.length === 0) return 0;
  
  const totalProgress = rooms.reduce((sum, room) => sum + calculateRoomProgress(room), 0);
  return Math.round(totalProgress / rooms.length);
};

export const getProjectStatus = (rooms: Room[]): 'completed' | 'in-progress' | 'planned' => {
  const progress = getProjectProgress(rooms);
  if (progress === 100) return 'completed';
  if (progress > 0) return 'in-progress';
  return 'planned';
};
