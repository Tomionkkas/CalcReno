import { Room } from "../../../utils/storage";
import { Dimensions } from "react-native";

export interface CanvasPosition {
  x: number;
  y: number;
}

export interface CanvasDimensions {
  width: number;
  height: number;
}

export interface CanvasRoom extends Room {
  x: number;
  y: number;
  isSelected?: boolean;
}

export interface RoomCanvasData {
  id: string;
  name: string;
  position: CanvasPosition;
  dimensions: CanvasDimensions;
  shape: 'rectangle' | 'l-shape';
  orientation?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const GRID_SIZE = 10;
export const CANVAS_PADDING = 40;
export const ROOM_MIN_SIZE = 60;
export const CANVAS_WIDTH = Math.min(Dimensions.get("window").width - 80, 600); // Ensure it fits on screen
export const CANVAS_HEIGHT = 500; // Slightly reduced height
export const METERS_TO_GRID = 20; // 2 grid squares = 1 meter, so 20px = 1 meter

export const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

export const calculateRoomCanvasData = (room: Room): RoomCanvasData => {
  const width = Math.max(room.dimensions.width, ROOM_MIN_SIZE);
  const height = Math.max(room.dimensions.length, ROOM_MIN_SIZE);
  
  return {
    id: room.id,
    name: room.name,
    position: { x: 0, y: 0 },
    dimensions: { width, height },
    shape: room.shape || 'rectangle',
    // Map the corner property to orientation for L-shape rooms
    orientation: room.shape === 'l-shape' ? room.corner : undefined,
  };
};

export const isPositionValid = (
  position: CanvasPosition,
  dimensions: CanvasDimensions,
  existingRooms: RoomCanvasData[],
  currentRoomId?: string
): boolean => {
  const roomBounds = {
    left: position.x,
    right: position.x + dimensions.width,
    top: position.y,
    bottom: position.y + dimensions.height,
  };

  // Check if room is within canvas bounds
  if (roomBounds.left < 0 || roomBounds.top < 0) {
    return false;
  }

  // Check collision with other rooms
  for (const existingRoom of existingRooms) {
    if (existingRoom.id === currentRoomId) continue;

    const existingBounds = {
      left: existingRoom.position.x,
      right: existingRoom.position.x + existingRoom.dimensions.width,
      top: existingRoom.position.y,
      bottom: existingRoom.position.y + existingRoom.dimensions.height,
    };

    if (
      roomBounds.left < existingBounds.right &&
      roomBounds.right > existingBounds.left &&
      roomBounds.top < existingBounds.bottom &&
      roomBounds.bottom > existingBounds.top
    ) {
      return false;
    }
  }

  return true;
};

export const findValidPosition = (
  dimensions: CanvasDimensions,
  existingRooms: RoomCanvasData[],
  currentRoomId?: string
): CanvasPosition => {
  let x = 0;
  let y = 0;
  let attempts = 0;
  const maxAttempts = 1500; // Adjusted for new canvas size

  while (attempts < maxAttempts) {
    const position = { x, y };
    
    if (isPositionValid(position, dimensions, existingRooms, currentRoomId)) {
      return position;
    }

    x += GRID_SIZE;
    if (x > CANVAS_WIDTH - dimensions.width) {
      x = 0;
      y += GRID_SIZE;
    }
    
    if (y > CANVAS_HEIGHT - dimensions.height) {
      y = 0; // Reset to top if we reach bottom
    }
    
    attempts++;
  }

  // If no valid position found, return a position that might overlap
  return { x: 0, y: 0 };
};

export const calculateCanvasBounds = (rooms: RoomCanvasData[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} => {
  if (rooms.length === 0) {
    return { minX: 0, minY: 0, maxX: CANVAS_WIDTH, maxY: CANVAS_HEIGHT };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  rooms.forEach(room => {
    minX = Math.min(minX, room.position.x);
    minY = Math.min(minY, room.position.y);
    maxX = Math.max(maxX, room.position.x + room.dimensions.width);
    maxY = Math.max(maxY, room.position.y + room.dimensions.height);
  });

  return { minX, minY, maxX, maxY };
};

export const getRoomCenter = (room: RoomCanvasData): CanvasPosition => {
  return {
    x: room.position.x + room.dimensions.width / 2,
    y: room.position.y + room.dimensions.height / 2,
  };
};

export const calculateDistance = (pos1: CanvasPosition, pos2: CanvasPosition): number => {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const getClosestRoom = (
  position: CanvasPosition,
  rooms: RoomCanvasData[],
  excludeRoomId?: string
): RoomCanvasData | null => {
  let closestRoom: RoomCanvasData | null = null;
  let minDistance = Infinity;

  rooms.forEach(room => {
    if (room.id === excludeRoomId) return;
    
    const roomCenter = getRoomCenter(room);
    const distance = calculateDistance(position, roomCenter);
    
    if (distance < minDistance) {
      minDistance = distance;
      closestRoom = room;
    }
  });

  return closestRoom;
};
