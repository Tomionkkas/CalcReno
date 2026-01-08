import { CanvasRoom, CANVAS_WIDTH, CANVAS_HEIGHT, GRID_SIZE, METERS_TO_GRID } from "./canvasCalculations";
import { getWallsForShape } from "../../../utils/shapeCalculations";

/**
 * Generates SVG grid lines matching the CanvasGrid component
 */
function generateGridLines(isCleanMode: boolean): string {
  const gridColor = isCleanMode ? "#E5E7EB" : "#2D3748";
  const opacity = isCleanMode ? 0.4 : 0.2;
  let svg = `<g id="grid" opacity="${opacity}">\n`;

  // Vertical lines
  for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
    svg += `  <line x1="${x}" y1="0" x2="${x}" y2="${CANVAS_HEIGHT}" stroke="${gridColor}" stroke-width="1"/>\n`;
  }

  // Horizontal lines
  for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
    svg += `  <line x1="0" y1="${y}" x2="${CANVAS_WIDTH}" y2="${y}" stroke="${gridColor}" stroke-width="1"/>\n`;
  }

  svg += `</g>\n`;
  return svg;
}

/**
 * Generates SVG elements for doors and windows on a room
 */
function generateRoomElements(room: CanvasRoom, roomWidth: number, roomHeight: number, isCleanMode: boolean): string {
  if (!room.elements || room.elements.length === 0) {
    return "";
  }

  let svg = "";
  const walls = getWallsForShape(room.shape, room.dimensions);

  room.elements.forEach((element) => {
    const wall = walls[element.wall];
    if (!wall) return;

    const position = element.position / 100;
    const elementColor = element.type === "door" ? "#FCD34D" : "#60A5FA";
    const elementStroke = element.type === "door" ? "#F59E0B" : "#3B82F6";
    const elementSize = 8;

    let x = 0;
    let y = 0;

    // Map wall ID to position (0=top, 1=right, 2=bottom, 3=left)
    if (wall.id === 0) {
      // Top wall
      x = room.x + position * roomWidth - elementSize / 2;
      y = room.y - elementSize / 2;
    } else if (wall.id === 1) {
      // Right wall
      x = room.x + roomWidth - elementSize / 2;
      y = room.y + position * roomHeight - elementSize / 2;
    } else if (wall.id === 2) {
      // Bottom wall
      x = room.x + position * roomWidth - elementSize / 2;
      y = room.y + roomHeight - elementSize / 2;
    } else if (wall.id === 3) {
      // Left wall
      x = room.x - elementSize / 2;
      y = room.y + position * roomHeight - elementSize / 2;
    }

    svg += `  <rect x="${x}" y="${y}" width="${elementSize}" height="${elementSize}" fill="${elementColor}" stroke="${elementStroke}" stroke-width="1" rx="2"/>\n`;
  });

  return svg;
}

/**
 * Calculates room width (matches getRoomWidth from ProjectPlannerTab)
 */
function getRoomWidth(room: CanvasRoom): number {
  let width: number;
  let height: number;

  if (room.shape === 'l-shape') {
    const mainWidth = Math.max(40, (room.dimensions.width / 100) * METERS_TO_GRID);
    const additionalWidth = Math.max(20, ((room.dimensions.width2 || 0) / 100) * METERS_TO_GRID);
    width = mainWidth + additionalWidth;

    const mainHeight = (room.dimensions.length / 100) * METERS_TO_GRID;
    const extHeight = ((room.dimensions.length2 || 0) / 100) * METERS_TO_GRID;
    height = Math.max(mainHeight, extHeight);
  } else {
    width = Math.max(40, (room.dimensions.width / 100) * METERS_TO_GRID);
    height = Math.max(30, (room.dimensions.length / 100) * METERS_TO_GRID);
  }

  // Swap dimensions for 90° and 270° rotations
  const rotation = room.rotation || 0;
  if (rotation === 90 || rotation === 270) {
    return height; // Swapped!
  }
  return width;
}

/**
 * Calculates room height (matches getRoomHeight from ProjectPlannerTab)
 */
function getRoomHeight(room: CanvasRoom): number {
  let width: number;
  let height: number;

  if (room.shape === 'l-shape') {
    const mainWidth = Math.max(40, (room.dimensions.width / 100) * METERS_TO_GRID);
    const additionalWidth = Math.max(20, ((room.dimensions.width2 || 0) / 100) * METERS_TO_GRID);
    width = mainWidth + additionalWidth;

    const mainHeight = (room.dimensions.length / 100) * METERS_TO_GRID;
    const extHeight = ((room.dimensions.length2 || 0) / 100) * METERS_TO_GRID;
    height = Math.max(mainHeight, extHeight);
  } else {
    width = Math.max(40, (room.dimensions.width / 100) * METERS_TO_GRID);
    height = Math.max(30, (room.dimensions.length / 100) * METERS_TO_GRID);
  }

  // Swap dimensions for 90° and 270° rotations
  const rotation = room.rotation || 0;
  if (rotation === 90 || rotation === 270) {
    return width; // Swapped!
  }
  return height;
}

/**
 * Generates SVG for a rectangular room
 */
function generateRectangleRoom(room: CanvasRoom, isCleanMode: boolean): string {
  // Calculate unrotated dimensions for rendering
  const unrotatedWidth = Math.max(40, (room.dimensions.width / 100) * METERS_TO_GRID);
  const unrotatedHeight = Math.max(30, (room.dimensions.length / 100) * METERS_TO_GRID);

  const fillColor = isCleanMode ? "rgba(59, 130, 246, 0.08)" : "rgba(108, 99, 255, 0.4)";
  const strokeColor = isCleanMode ? "#6B7280" : "#6C63FF";
  const textColor = isCleanMode ? "#000000" : "#FFFFFF";
  const dimensionColor = isCleanMode ? "#6B7280" : "#B8BCC8";

  const rotation = room.rotation || 0;
  const centerX = room.x + getRoomWidth(room) / 2;
  const centerY = room.y + getRoomHeight(room) / 2;

  let svg = `<g id="room-${room.id}" transform="rotate(${rotation}, ${centerX}, ${centerY})">\n`;

  // Room rectangle (using unrotated dimensions)
  svg += `  <rect x="${room.x}" y="${room.y}" width="${unrotatedWidth}" height="${unrotatedHeight}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2" rx="6"/>\n`;

  // Room name (with counter-rotation to keep text upright)
  const textCenterX = room.x + unrotatedWidth / 2;
  const textCenterY = room.y + unrotatedHeight / 2 - 5;
  svg += `  <text x="${textCenterX}" y="${textCenterY}" text-anchor="middle" font-size="10" font-weight="600" fill="${textColor}" font-family="system-ui" transform="rotate(${-rotation}, ${textCenterX}, ${textCenterY})">${escapeXml(room.name)}</text>\n`;

  // Room dimensions (with counter-rotation)
  const dimensionText = `${(room.dimensions.width / 100).toFixed(1)}m × ${(room.dimensions.length / 100).toFixed(1)}m`;
  svg += `  <text x="${textCenterX}" y="${textCenterY + 12}" text-anchor="middle" font-size="8" font-weight="500" fill="${dimensionColor}" font-family="system-ui" transform="rotate(${-rotation}, ${textCenterX}, ${textCenterY + 12})">${dimensionText}</text>\n`;

  svg += `</g>\n`;

  // Add doors and windows
  svg += generateRoomElements(room, unrotatedWidth, unrotatedHeight, isCleanMode);

  return svg;
}

/**
 * Generates SVG for an L-shaped room
 */
function generateLShapeRoom(room: CanvasRoom, isCleanMode: boolean): string {
  const { width: roomWidth, length: roomLength, width2: roomWidth2 = 0, length2: roomLength2 = 0 } = room.dimensions;

  const mainWidth = Math.max(40, (roomWidth / 100) * METERS_TO_GRID);
  const mainLength = (roomLength / 100) * METERS_TO_GRID;
  const width2 = Math.max(20, (roomWidth2 / 100) * METERS_TO_GRID);
  const length2 = (roomLength2 / 100) * METERS_TO_GRID;

  const totalWidth = mainWidth + width2;
  const totalHeight = Math.max(mainLength, length2);

  // Calculate Y offset for bottom corners when extension is taller
  let yOffset = 0;
  const corner = room.corner || "top-right";
  if ((corner === "bottom-right" || corner === "bottom-left") && length2 > mainLength) {
    yOffset = length2 - mainLength;
  }

  // Generate SVG path based on corner orientation
  let pathData = "";

  switch (corner) {
    case "top-right":
      pathData = `M ${room.x} ${room.y} L ${room.x + mainWidth} ${room.y} L ${room.x + mainWidth + width2} ${room.y} L ${room.x + mainWidth + width2} ${room.y + length2} L ${room.x + mainWidth} ${room.y + length2} L ${room.x + mainWidth} ${room.y + totalHeight} L ${room.x} ${room.y + totalHeight} Z`;
      break;
    case "top-left":
      pathData = `M ${room.x} ${room.y} L ${room.x + width2} ${room.y} L ${room.x + width2 + mainWidth} ${room.y} L ${room.x + width2 + mainWidth} ${room.y + totalHeight} L ${room.x + width2} ${room.y + totalHeight} L ${room.x + width2} ${room.y + length2} L ${room.x} ${room.y + length2} Z`;
      break;
    case "bottom-right":
      if (length2 > mainLength) {
        pathData = `M ${room.x} ${room.y + yOffset} L ${room.x + mainWidth} ${room.y + yOffset} L ${room.x + mainWidth} ${room.y} L ${room.x + mainWidth + width2} ${room.y} L ${room.x + mainWidth + width2} ${room.y + length2} L ${room.x + mainWidth} ${room.y + length2} L ${room.x} ${room.y + length2} Z`;
      } else {
        pathData = `M ${room.x} ${room.y} L ${room.x + mainWidth} ${room.y} L ${room.x + mainWidth} ${room.y + totalHeight - length2} L ${room.x + mainWidth + width2} ${room.y + totalHeight - length2} L ${room.x + mainWidth + width2} ${room.y + totalHeight} L ${room.x} ${room.y + totalHeight} Z`;
      }
      break;
    case "bottom-left":
      if (length2 > mainLength) {
        pathData = `M ${room.x} ${room.y} L ${room.x + width2} ${room.y} L ${room.x + width2} ${room.y + length2} L ${room.x + width2 + mainWidth} ${room.y + length2} L ${room.x + width2 + mainWidth} ${room.y + yOffset} L ${room.x + width2} ${room.y + yOffset} L ${room.x} ${room.y + length2} Z`;
      } else {
        pathData = `M ${room.x + width2} ${room.y} L ${room.x + width2 + mainWidth} ${room.y} L ${room.x + width2 + mainWidth} ${room.y + totalHeight} L ${room.x} ${room.y + totalHeight} L ${room.x} ${room.y + totalHeight - length2} L ${room.x + width2} ${room.y + totalHeight - length2} Z`;
      }
      break;
  }

  const fillColor = isCleanMode ? "rgba(59, 130, 246, 0.08)" : "rgba(108, 99, 255, 0.4)";
  const strokeColor = isCleanMode ? "#6B7280" : "#6C63FF";
  const textColor = isCleanMode ? "#000000" : "#FFFFFF";
  const dimensionColor = isCleanMode ? "#6B7280" : "#B8BCC8";

  const rotation = room.rotation || 0;
  const centerX = room.x + getRoomWidth(room) / 2;
  const centerY = room.y + getRoomHeight(room) / 2;

  let svg = `<g id="room-${room.id}" transform="rotate(${rotation}, ${centerX}, ${centerY})">\n`;

  // L-shape path
  svg += `  <path d="${pathData}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>\n`;

  // Room name (positioned at approximate center with counter-rotation)
  const textCenterX = room.x + totalWidth / 2;
  const textCenterY = room.y + totalHeight / 2 - 5;
  svg += `  <text x="${textCenterX}" y="${textCenterY}" text-anchor="middle" font-size="10" font-weight="600" fill="${textColor}" font-family="system-ui" transform="rotate(${-rotation}, ${textCenterX}, ${textCenterY})">${escapeXml(room.name)}</text>\n`;

  // Room dimensions (with counter-rotation)
  const dimensionText = `${(roomWidth / 100).toFixed(1)}m × ${(roomLength / 100).toFixed(1)}m`;
  svg += `  <text x="${textCenterX}" y="${textCenterY + 12}" text-anchor="middle" font-size="8" font-weight="500" fill="${dimensionColor}" font-family="system-ui" transform="rotate(${-rotation}, ${textCenterX}, ${textCenterY + 12})">${dimensionText}</text>\n`;

  svg += `</g>\n`;

  // Add doors and windows
  svg += generateRoomElements(room, totalWidth, totalHeight, isCleanMode);

  return svg;
}

/**
 * Escapes XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Main function to generate complete SVG from canvas data
 */
export const generateSVG = (
  canvasRooms: CanvasRoom[],
  projectName: string,
  isCleanMode: boolean
): string => {
  const backgroundColor = isCleanMode ? "#FFFFFF" : "#0A0B1E";
  const currentDate = new Date().toLocaleDateString('pl-PL');
  
  let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  svg += `<svg width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}" xmlns="http://www.w3.org/2000/svg">\n`;
  
  // Background
  svg += `<rect width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" fill="${backgroundColor}"/>\n`;
  
  // Project title header (if in clean mode)
  if (isCleanMode) {
    svg += `<g id="header">\n`;
    svg += `  <rect x="20" y="20" width="${CANVAS_WIDTH - 40}" height="60" fill="rgba(255, 255, 255, 0.95)" stroke="rgba(0, 0, 0, 0.1)" stroke-width="1" rx="8"/>\n`;
    svg += `  <text x="${CANVAS_WIDTH / 2}" y="45" text-anchor="middle" font-size="18" font-weight="700" fill="#000000" font-family="system-ui">${escapeXml(projectName)}</text>\n`;
    svg += `  <text x="${CANVAS_WIDTH / 2}" y="65" text-anchor="middle" font-size="12" font-weight="500" fill="#6B7280" font-family="system-ui">Plan 2D • ${currentDate}</text>\n`;
    svg += `</g>\n`;
  }
  
  // Grid lines
  svg += generateGridLines(isCleanMode);
  
  // Rooms
  svg += `<g id="rooms">\n`;
  canvasRooms.forEach(room => {
    if (room.shape === "rectangle") {
      svg += generateRectangleRoom(room, isCleanMode);
    } else {
      svg += generateLShapeRoom(room, isCleanMode);
    }
  });
  svg += `</g>\n`;
  
  // Scale indicator
  const scaleColor = isCleanMode ? "#000000" : "#B8BCC8";
  const scaleBackground = isCleanMode ? "rgba(255, 255, 255, 0.8)" : "transparent";
  svg += `<g id="scale">\n`;
  if (isCleanMode) {
    svg += `  <rect x="${CANVAS_WIDTH - 100}" y="${CANVAS_HEIGHT - 25}" width="90" height="18" fill="${scaleBackground}" rx="2"/>\n`;
  }
  svg += `  <text x="${CANVAS_WIDTH - 55}" y="${CANVAS_HEIGHT - 12}" text-anchor="middle" font-size="8" font-weight="500" fill="${scaleColor}" font-family="system-ui">2 kratki = 1m</text>\n`;
  svg += `</g>\n`;
  
  svg += `</svg>`;
  
  return svg;
};

