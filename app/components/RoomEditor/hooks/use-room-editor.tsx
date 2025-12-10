import { useState, useMemo, useEffect } from "react";
import { useToast } from "../../../hooks/useToast";
import { getWallsForShape } from "../../../utils/shapeCalculations";
import { normalizeDecimalSeparator } from "../../../utils/numberInput";
import { RoomEditorProps, RoomShape, Dimensions, DisplayValues } from "../types";

interface UseRoomEditorProps {
  onSave?: RoomEditorProps["onSave"];
  initialData?: RoomEditorProps["initialData"];
}

export const useRoomEditor = ({ onSave, initialData }: UseRoomEditorProps) => {
  const { showError } = useToast();
  
  // Core room state
  const [roomName, setRoomName] = useState(initialData?.name || "");
  const [roomShape, setRoomShape] = useState<RoomShape>(
    initialData?.shape || "rectangle",
  );
  const [dimensions, setDimensions] = useState<Dimensions>(
    initialData?.dimensions || {
      width: 400, // Will be converted to meters in display
      length: 500,
      height: 250,
      // For L-shape
      width2: 200,
      length2: 300,
    },
  );
  
  // Store display values to preserve user input while typing
  const [displayValues, setDisplayValues] = useState<DisplayValues>({
    width: ((initialData?.dimensions?.width || 400) / 100).toString(),
    length: ((initialData?.dimensions?.length || 500) / 100).toString(),
    height: ((initialData?.dimensions?.height || 250) / 100).toString(),
    width2: ((initialData?.dimensions?.width2 || 200) / 100).toString(),
    length2: ((initialData?.dimensions?.length2 || 300) / 100).toString(),
  });
  
  const [lShapeCorner, setLShapeCorner] = useState<
    "top-left" | "top-right" | "bottom-left" | "bottom-right"
  >(initialData?.corner || "top-right");
  
  // UI state
  const [activeWall, setActiveWall] = useState<number | null>(null);

  // Reset state when initialData changes (switching between rooms)
  useEffect(() => {
    if (initialData) {
      setRoomName(initialData.name || "");
      setRoomShape(initialData.shape || "rectangle");
      const newDimensions = initialData.dimensions || {
        width: 400,
        length: 500,
        height: 250,
        width2: 200,
        length2: 300,
      };
      setDimensions(newDimensions);
      setDisplayValues({
        width: (newDimensions.width / 100).toString(),
        length: (newDimensions.length / 100).toString(),
        height: (newDimensions.height / 100).toString(),
        width2: ((newDimensions.width2 || 200) / 100).toString(),
        length2: ((newDimensions.length2 || 300) / 100).toString(),
      });
      setLShapeCorner(initialData.corner || "top-right");
    }
  }, [initialData]);

  // Calculate available walls based on room shape
  const availableWalls = useMemo(() => {
    try {
      return getWallsForShape(roomShape, dimensions, lShapeCorner);
    } catch (error) {
      console.error("Error calculating walls:", error);
      return [];
    }
  }, [roomShape, dimensions, lShapeCorner]);

  const handleDimensionChange = (key: string, value: string) => {
    // Normalize decimal separator (comma to period)
    const normalizedValue = normalizeDecimalSeparator(value);
    
    // Update display value immediately to preserve user input
    setDisplayValues((prev: DisplayValues) => ({ ...prev, [key]: normalizedValue }));
    
    // Only update dimensions if we have a valid number
    const numValue = parseFloat(normalizedValue);
    if (!isNaN(numValue) && numValue >= 0) {
      // Convert meters to cm for internal storage
      setDimensions((prev: Dimensions) => ({ ...prev, [key]: numValue * 100 }));
    }
  };

  const handleSave = () => {
    // Validate dimensions
    if (
      dimensions.width <= 0 ||
      dimensions.length <= 0 ||
      dimensions.height <= 0
    ) {
      showError("Błąd", "Wszystkie wymiary muszą być większe od zera");
      return;
    }

    if (
      roomShape === "l-shape" &&
      (dimensions.width2 <= 0 || dimensions.length2 <= 0)
    ) {
      showError("Błąd", "Wymiary drugiej części muszą być większe od zera");
      return;
    }
  };

  return {
    roomName,
    setRoomName,
    roomShape,
    setRoomShape,
    dimensions,
    setDimensions,
    displayValues,
    setDisplayValues,
    lShapeCorner,
    setLShapeCorner,
    availableWalls,
    activeWall,
    setActiveWall,
    handleDimensionChange,
    handleSave,
  };
};
