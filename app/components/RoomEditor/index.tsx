import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useRoomEditor } from "./hooks/use-room-editor";
import { useElementManagement } from "./hooks/use-element-management";
import RoomNameInput from "./components/room-name-input";
import ShapeSelector from "./components/shape-selector";
import DimensionsInput from "./components/dimensions-input";
import LShapeCornerSelector from "./components/l-shape-corner-selector";
import ElementActions from "./components/element-actions";
import ElementsList from "./components/elements-list";
import SaveButton from "./components/save-button";
import { RoomEditorProps } from "./types";
import EnhancedDoorWindowModal from "../EnhancedDoorWindowModal";
import CustomToast from "../CustomToast";
import { useToast } from "../../hooks/useToast";
import { 
  colors, 
  gradients, 
  typography, 
  spacing, 
  borderRadius, 
  shadows,
  glassmorphism 
} from "../../utils/theme";

const RoomEditor: React.FC<RoomEditorProps> = ({ onSave, initialData }) => {
  const { toastConfig, isVisible, showError, hideToast } = useToast();
  
  const {
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
    handleSave: handleSaveBase,
  } = useRoomEditor({ onSave, initialData });

  const {
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
  } = useElementManagement({ availableWalls, initialElements: initialData?.elements });

  // Override handleSave to include elements
  const handleSave = useCallback(() => {
    // Validate dimensions first
    handleSaveBase();
    
    // If validation passes, save with elements
    if (onSave) {
      onSave({
        shape: roomShape,
        dimensions,
        elements,
        name: roomName,
        corner: roomShape === "l-shape" ? lShapeCorner : undefined,
      });
    }
  }, [handleSaveBase, onSave, roomShape, dimensions, elements, roomName, lShapeCorner]);

  const headerContainerStyle = useMemo(() => ({
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: "center" as const,
  }), []);

  const headerStyle = useMemo(() => ({
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold as any,
    color: colors.text.primary,
    textAlign: "center" as const,
    textShadowColor: colors.accent.purple,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginBottom: spacing.sm,
  }), []);

  const headerUnderlineStyle = useMemo(() => ({
    width: 120,
    height: 3,
    borderRadius: borderRadius.full,
  }), []);

  const scrollViewStyle = useMemo(() => ({
    flex: 1,
    backgroundColor: "transparent",
  }), []);

  const contentContainerStyle = useMemo(() => ({
    paddingBottom: 140,
    padding: spacing.lg,
  }), []);

  const mainContainerStyle = useMemo(() => ({
    flex: 1,
    backgroundColor: colors.background.primary,
  }), []);

  const gradientContainerStyle = useMemo(() => ({
    flex: 1,
  }), []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={mainContainerStyle}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <LinearGradient
            colors={gradients.background.colors}
            start={gradients.background.start}
            end={gradients.background.end}
            style={gradientContainerStyle}
          >
            <ScrollView
              style={scrollViewStyle}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={contentContainerStyle}
              nestedScrollEnabled={true}
              scrollEnabled={true}
              bounces={true}
              alwaysBounceVertical={true}
            >
              <View style={headerContainerStyle}>
                <Text style={headerStyle}>
                  Edytor Pomieszczeń
                </Text>
                <LinearGradient
                  colors={gradients.primary.colors}
                  start={gradients.primary.start}
                  end={gradients.primary.end}
                  style={headerUnderlineStyle}
                />
              </View>

              <View style={{
                marginBottom: spacing.lg,
                ...glassmorphism.medium,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
              }}>
                <Text style={{ 
                  fontSize: typography.sizes.xl, 
                  color: colors.text.primary, 
                  marginBottom: spacing.lg,
                  fontWeight: typography.weights.bold as any,
                  textAlign: "center" as const,
                }}>
                  Informacje o pomieszczeniu
                </Text>

                <RoomNameInput
                  roomName={roomName}
                  onRoomNameChange={setRoomName}
                />

                <ShapeSelector
                  roomShape={roomShape}
                  onShapeChange={setRoomShape}
                />

                <DimensionsInput
                  dimensions={dimensions}
                  displayValues={displayValues}
                  roomShape={roomShape}
                  onDimensionChange={handleDimensionChange}
                  onDisplayValueChange={setDisplayValues}
                />
              </View>

              {roomShape === "l-shape" && (
                <LShapeCornerSelector
                  lShapeCorner={lShapeCorner}
                  onCornerChange={setLShapeCorner}
                  displayValues={displayValues}
                  onDisplayValueChange={setDisplayValues}
                  onDimensionChange={handleDimensionChange}
                />
              )}

              <ElementActions
                onAddDoor={() => addElement("door")}
                onAddWindow={() => addElement("window")}
                availableWalls={availableWalls}
                activeWall={activeWall}
                onWallSelect={setActiveWall}
                elements={elements}
                onElementRemove={removeElement}
                roomShape={roomShape}
                dimensions={dimensions}
                corner={lShapeCorner}
              />

              <ElementsList
                elements={elements}
                availableWalls={availableWalls}
                onElementRemove={removeElement}
              />

              <SaveButton onSave={handleSave} />
            </ScrollView>
          </LinearGradient>
        </KeyboardAvoidingView>

        {/* Enhanced Element Modal */}
        <EnhancedDoorWindowModal
          visible={showElementModal && !isModalInitializing}
          elementType={elementType}
          availableWalls={availableWalls}
          onSave={handleSaveElement}
          onClose={handleCloseModal}
          onError={showError}
          key={`modal-${elementType}-${showElementModal}`}
        />

        {/* Custom Toast */}
        {toastConfig && (
          <CustomToast
            visible={isVisible}
            type={toastConfig.type}
            title={toastConfig.title}
            message={toastConfig.message}
            onClose={hideToast}
            duration={toastConfig.duration}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
};

export default RoomEditor;
