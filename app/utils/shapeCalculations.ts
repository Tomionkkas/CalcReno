export interface WallInfo {
  id: number;
  name: string;
  length: number; // in centimeters
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  direction: 'horizontal' | 'vertical';
}

export interface RoomDimensions {
  width: number;
  length: number;
  height: number;
  width2?: number;
  length2?: number;
}

type LShapeCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

/**
 * Calculate walls for a rectangular room
 */
export function getRectangleWalls(dimensions: RoomDimensions): WallInfo[] {
  const { width, length } = dimensions;
  
  return [
    {
      id: 0,
      name: "Ściana 1",
      length: width,
      startPoint: { x: 0, y: 0 },
      endPoint: { x: width, y: 0 },
      direction: 'horizontal'
    },
    {
      id: 1,
      name: "Ściana 2",
      length: length,
      startPoint: { x: width, y: 0 },
      endPoint: { x: width, y: length },
      direction: 'vertical'
    },
    {
      id: 2,
      name: "Ściana 3",
      length: width,
      startPoint: { x: width, y: length },
      endPoint: { x: 0, y: length },
      direction: 'horizontal'
    },
    {
      id: 3,
      name: "Ściana 4",
      length: length,
      startPoint: { x: 0, y: length },
      endPoint: { x: 0, y: 0 },
      direction: 'vertical'
    }
  ];
}

/**
 * Calculate walls for an L-shaped room
 */
export function getLShapeWalls(
  dimensions: RoomDimensions,
  corner: LShapeCorner
): WallInfo[] {
  const { width, length, width2 = 0, length2 = 0 } = dimensions;
  
  switch (corner) {
    case "top-right":
      return [
        {
          id: 0,
          name: "Ściana 1",
          length: width + width2,
          startPoint: { x: 0, y: 0 },
          endPoint: { x: width + width2, y: 0 },
          direction: 'horizontal'
        },
        {
          id: 1,
          name: "Ściana 2",
          length: length2,
          startPoint: { x: width + width2, y: 0 },
          endPoint: { x: width + width2, y: length2 },
          direction: 'vertical'
        },
        {
          id: 2,
          name: "Ściana 3",
          length: width2,
          startPoint: { x: width + width2, y: length2 },
          endPoint: { x: width, y: length2 },
          direction: 'horizontal'
        },
        {
          id: 3,
          name: "Ściana 4",
          length: Math.abs(length - length2),
          startPoint: { x: width, y: length2 },
          endPoint: { x: width, y: length },
          direction: 'vertical'
        },
        {
          id: 4,
          name: "Ściana 5",
          length: width,
          startPoint: { x: width, y: length },
          endPoint: { x: 0, y: length },
          direction: 'horizontal'
        },
        {
          id: 5,
          name: "Ściana 6",
          length: length,
          startPoint: { x: 0, y: length },
          endPoint: { x: 0, y: 0 },
          direction: 'vertical'
        }
      ];
      
    case "top-left":
      return [
        {
          id: 0,
          name: "Ściana 1",
          length: width2 + width,
          startPoint: { x: 0, y: 0 },
          endPoint: { x: width2 + width, y: 0 },
          direction: 'horizontal'
        },
        {
          id: 1,
          name: "Ściana 2",
          length: length,
          startPoint: { x: width2 + width, y: 0 },
          endPoint: { x: width2 + width, y: length },
          direction: 'vertical'
        },
        {
          id: 2,
          name: "Ściana 3",
          length: width,
          startPoint: { x: width2 + width, y: length },
          endPoint: { x: width2, y: length },
          direction: 'horizontal'
        },
        {
          id: 3,
          name: "Ściana 4",
          length: Math.abs(length - length2),
          startPoint: { x: width2, y: length },
          endPoint: { x: width2, y: length2 },
          direction: 'vertical'
        },
        {
          id: 4,
          name: "Ściana 5",
          length: width2,
          startPoint: { x: width2, y: length2 },
          endPoint: { x: 0, y: length2 },
          direction: 'horizontal'
        },
        {
          id: 5,
          name: "Ściana 6",
          length: length2,
          startPoint: { x: 0, y: length2 },
          endPoint: { x: 0, y: 0 },
          direction: 'vertical'
        }
      ];
      
    case "bottom-right": {
      // Calculate Y offset if extension is taller
      const yOffset = length2 > length ? length2 - length : 0;

      return [
        {
          id: 0,
          name: "Ściana 1",
          length: width,
          startPoint: { x: 0, y: yOffset },
          endPoint: { x: width, y: yOffset },
          direction: 'horizontal'
        },
        {
          id: 1,
          name: "Ściana 2",
          length: Math.abs(length - length2),
          startPoint: { x: width, y: yOffset },
          endPoint: { x: width, y: Math.max(yOffset + length - length2, 0) },
          direction: 'vertical'
        },
        {
          id: 2,
          name: "Ściana 3",
          length: width2,
          startPoint: { x: width, y: Math.max(yOffset + length - length2, 0) },
          endPoint: { x: width + width2, y: Math.max(yOffset + length - length2, 0) },
          direction: 'horizontal'
        },
        {
          id: 3,
          name: "Ściana 4",
          length: length2,
          startPoint: { x: width + width2, y: Math.max(yOffset + length - length2, 0) },
          endPoint: { x: width + width2, y: yOffset + length },
          direction: 'vertical'
        },
        {
          id: 4,
          name: "Ściana 5",
          length: width + width2,
          startPoint: { x: width + width2, y: yOffset + length },
          endPoint: { x: 0, y: yOffset + length },
          direction: 'horizontal'
        },
        {
          id: 5,
          name: "Ściana 6",
          length: yOffset + length,
          startPoint: { x: 0, y: yOffset + length },
          endPoint: { x: 0, y: 0 },
          direction: 'vertical'
        }
      ];
    }
      
    case "bottom-left": {
      const yOffset = length2 > length ? length2 - length : 0;

      return [
        {
          id: 0,
          name: "Ściana 1",
          length: width,
          startPoint: { x: width2, y: yOffset },
          endPoint: { x: width2 + width, y: yOffset },
          direction: 'horizontal'
        },
        {
          id: 1,
          name: "Ściana 2",
          length: yOffset + length,
          startPoint: { x: width2 + width, y: yOffset },
          endPoint: { x: width2 + width, y: yOffset + length },
          direction: 'vertical'
        },
        {
          id: 2,
          name: "Ściana 3",
          length: width2 + width,
          startPoint: { x: width2 + width, y: yOffset + length },
          endPoint: { x: 0, y: yOffset + length },
          direction: 'horizontal'
        },
        {
          id: 3,
          name: "Ściana 4",
          length: length2,
          startPoint: { x: 0, y: yOffset + length },
          endPoint: { x: 0, y: Math.max(yOffset + length - length2, 0) },
          direction: 'vertical'
        },
        {
          id: 4,
          name: "Ściana 5",
          length: width2,
          startPoint: { x: 0, y: Math.max(yOffset + length - length2, 0) },
          endPoint: { x: width2, y: Math.max(yOffset + length - length2, 0) },
          direction: 'horizontal'
        },
        {
          id: 5,
          name: "Ściana 6",
          length: Math.abs(length - length2),
          startPoint: { x: width2, y: Math.max(yOffset + length - length2, 0) },
          endPoint: { x: width2, y: yOffset },
          direction: 'vertical'
        }
      ];
    }
  }
}

/**
 * Get walls based on room shape
 */
export function getWallsForShape(
  shape: "rectangle" | "l-shape",
  dimensions: RoomDimensions,
  corner?: LShapeCorner
): WallInfo[] {
  if (shape === "rectangle") {
    return getRectangleWalls(dimensions);
  } else {
    return getLShapeWalls(dimensions, corner || "bottom-left");
  }
}

/**
 * Calculate element position on wall in real coordinates
 */
export function calculateElementPosition(
  wall: WallInfo,
  positionPercent: number,
  elementWidth: number
): { x: number; y: number; rotation: number } {
  const position = positionPercent / 100;
  
  if (wall.direction === 'horizontal') {
    const x = wall.startPoint.x + (wall.endPoint.x - wall.startPoint.x) * position;
    const y = wall.startPoint.y;
    return { x: x - elementWidth / 2, y, rotation: 0 };
  } else {
    const x = wall.startPoint.x;
    const y = wall.startPoint.y + (wall.endPoint.y - wall.startPoint.y) * position;
    return { x, y: y - elementWidth / 2, rotation: 90 };
  }
}

/**
 * Validate if element fits on wall
 */
export function validateElementOnWall(
  wall: WallInfo,
  elementWidth: number,
  positionPercent: number
): { valid: boolean; message?: string } {
  const elementWidthCm = elementWidth;
  const wallLengthCm = wall.length;
  
  if (elementWidthCm > wallLengthCm) {
    return {
      valid: false,
      message: `Element (${(elementWidthCm/100).toFixed(2)}m) jest szerszy niż ściana (${(wallLengthCm/100).toFixed(2)}m)`
    };
  }
  
  // Check if element fits at the specified position
  const position = positionPercent / 100;
  const elementStart = position * wallLengthCm - elementWidthCm / 2;
  const elementEnd = position * wallLengthCm + elementWidthCm / 2;
  
  if (elementStart < 0 || elementEnd > wallLengthCm) {
    return {
      valid: false,
      message: `Element nie mieści się w tej pozycji na ścianie`
    };
  }
  
  return { valid: true };
} 