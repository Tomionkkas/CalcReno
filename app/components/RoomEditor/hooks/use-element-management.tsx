import { useState, useEffect } from "react";
import { Platform } from "react-native";
import { generateUUID } from "../../../utils/storage";
import { useToast } from "../../../hooks/useToast";
import { Element, ElementType } from "../types";

interface UseElementManagementProps {
  availableWalls: any[];
  initialElements?: any[];
}

export const useElementManagement = ({ availableWalls, initialElements }: UseElementManagementProps) => {
  const { showError } = useToast();
  
  // Element state
  const [elements, setElements] = useState<Element[]>(initialElements || []);
  
  // Modal state
  const [showElementModal, setShowElementModal] = useState(false);
  const [isModalInitializing, setIsModalInitializing] = useState(false);
  const [elementType, setElementType] = useState<ElementType>("door");

  // Android-specific state to force re-renders
  const [androidForceUpdate, setAndroidForceUpdate] = useState(0);

  // Helper function to reset all modal-related state
  const resetModalState = () => {
    setShowElementModal(false);
    setIsModalInitializing(false);
    setElementType("door");
  };

  const addElement = (type: ElementType) => {
    try {
      // Prevent multiple modal opens
      if (isModalInitializing || showElementModal) {
        return;
      }

      setIsModalInitializing(true);
      
      // Check if we have valid walls
      if (!availableWalls || availableWalls.length === 0) {
        showError("Błąd", "Nie można dodać elementu - brak dostępnych ścian");
        setIsModalInitializing(false);
        return;
      }

      // Reset and set new modal state
      setElementType(type);
      
      // Small delay to ensure state is set before showing modal
      setTimeout(() => {
        setShowElementModal(true);
        setIsModalInitializing(false);
      }, 100);
      
    } catch (error) {
      console.error("Error opening element modal:", error);
      showError("Błąd", "Nie można otworzyć okna dodawania elementu");
      setIsModalInitializing(false);
    }
  };

  const handleSaveElement = (elementData: Omit<Element, "id">) => {
    try {
      const newElement: Element = {
        id: generateUUID(),
        ...elementData,
      };

      const updatedElements = [...elements, newElement];
      setElements(updatedElements);
      
      // Android-specific: Force re-render after state update
      if (Platform.OS === 'android') {
        setTimeout(() => {
          setAndroidForceUpdate(prev => prev + 1);
        }, 50);
      }
      
      resetModalState();
      
    } catch (error) {
      console.error("Error saving element:", error);
      showError("Błąd", "Nie można zapisać elementu");
    }
  };

  const handleCloseModal = () => {
    resetModalState();
  };

  const removeElement = (id: string) => {
    try {
      const updatedElements = elements.filter((element) => element.id !== id);
      setElements(updatedElements);
      
      // Android-specific: Force re-render after state update
      if (Platform.OS === 'android') {
        setTimeout(() => {
          setAndroidForceUpdate(prev => prev + 1);
        }, 50);
      }
      
    } catch (error) {
      console.error("Error removing element:", error);
      showError("Błąd", "Nie można usunąć elementu");
    }
  };

  // Reset elements when initialElements changes (switching rooms)
  useEffect(() => {
    console.log("useElementManagement: initialElements changed", { 
      initialElements, 
      platform: Platform.OS 
    });
    if (initialElements) {
      setElements(initialElements);
      
      // Android-specific: Force re-render after setting initial elements
      if (Platform.OS === 'android') {
        setTimeout(() => {
          setAndroidForceUpdate(prev => prev + 1);
        }, 100);
      }
    }
  }, [initialElements]);

  // Only reset elements when availableWalls changes if we have no initial elements
  // This prevents clearing existing elements when walls are recalculated
  useEffect(() => {
    console.log("useElementManagement: availableWalls changed", { 
      availableWallsLength: availableWalls.length, 
      initialElementsLength: initialElements?.length || 0,
      currentElementsLength: elements.length,
      platform: Platform.OS
    });
    
    // Android-specific: More conservative approach to prevent clearing elements
    if (Platform.OS === 'android') {
      // Only reset if we have no initial elements, no current elements, and availableWalls is empty
      if (availableWalls.length === 0 && 
          (!initialElements || initialElements.length === 0) && 
          elements.length === 0) {
        console.log("useElementManagement: Android - Clearing elements due to empty walls and no elements");
        setElements([]);
      }
    } else {
      // iOS: Original logic
      if (availableWalls.length === 0 && (!initialElements || initialElements.length === 0)) {
        console.log("useElementManagement: iOS - Clearing elements due to empty walls and no initial elements");
        setElements([]);
      }
    }
  }, [availableWalls, initialElements, elements.length]);

  return {
    elements,
    setElements,
    showElementModal,
    setShowElementModal,
    isModalInitializing,
    setIsModalInitializing,
    elementType,
    setElementType,
    addElement,
    handleSaveElement,
    handleCloseModal,
    removeElement,
    // Android-specific: Include force update in return to trigger re-renders
    androidForceUpdate,
  };
};
