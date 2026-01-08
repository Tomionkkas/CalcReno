export type RoomShape = "rectangle" | "l-shape";
export type ElementType = "door" | "window";

export interface Element {
  id: string;
  type: ElementType;
  width: number;
  height: number;
  position: number; // Position on wall (0-100%)
  wall: number; // Wall index
}

export interface Dimensions {
  width: number;
  length: number;
  height: number;
  width2?: number;
  length2?: number;
}

export interface DisplayValues {
  width: string;
  length: string;
  height: string;
  width2: string;
  length2: string;
}

export interface RoomEditorProps {
  onSave?: (roomData: {
    shape: RoomShape;
    dimensions: Dimensions;
    elements: Element[];
    name?: string;
    corner?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  }) => void;
  initialData?: {
    shape: RoomShape;
    dimensions: Dimensions;
    elements: Element[];
    name?: string;
    corner?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  };
}

export interface RoomNameInputProps {
  roomName: string;
  onRoomNameChange: (name: string) => void;
}

export interface ShapeSelectorProps {
  roomShape: RoomShape;
  onShapeChange: (shape: RoomShape) => void;
}

export interface DimensionsInputProps {
  dimensions: Dimensions;
  displayValues: DisplayValues;
  roomShape: RoomShape;
  onDimensionChange: (key: string, value: string) => void;
  onDisplayValueChange: (values: DisplayValues) => void;
}

export interface LShapeCornerSelectorProps {
  lShapeCorner: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  onCornerChange: (corner: "top-left" | "top-right" | "bottom-left" | "bottom-right") => void;
  displayValues: DisplayValues;
  onDisplayValueChange: (values: DisplayValues) => void;
  onDimensionChange: (key: string, value: string) => void;
}

export interface ElementActionsProps {
  onAddDoor: () => void;
  onAddWindow: () => void;
  availableWalls: any[];
  activeWall: number | null;
  onWallSelect: (wallIndex: number) => void;
  onWallLongPress?: (wallIndex: number) => void;
  elements: Element[];
  onElementRemove: (id: string) => void;
  roomShape: RoomShape;
  dimensions: Dimensions;
  corner?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export interface ElementsListProps {
  elements: Element[];
  availableWalls: any[];
  onElementRemove: (id: string) => void;
  onElementEdit: (element: Element) => void;
}

export interface SaveButtonProps {
  onSave: () => void;
}
