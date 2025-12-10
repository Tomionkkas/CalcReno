import React, { useState, useEffect, memo, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { DoorOpen, Square, X, CheckCircle, AlertCircle } from "lucide-react-native";
import { WallInfo, validateElementOnWall } from "../utils/shapeCalculations";
import { normalizeDecimalSeparator } from "../utils/numberInput";
import { 
  colors, 
  gradients, 
  typography, 
  spacing, 
  borderRadius, 
  shadows, 
  glassmorphism,
  animations 
} from "../utils/theme";

type ElementType = "door" | "window";

interface Element {
  id: string;
  type: ElementType;
  width: number;
  height: number;
  position: number;
  wall: number;
}

interface EnhancedDoorWindowModalProps {
  visible: boolean;
  elementType: ElementType;
  availableWalls: WallInfo[];
  onSave: (element: Omit<Element, "id">) => void;
  onClose: () => void;
  onError: (title: string, message: string) => void;
}

interface PositionMethod {
  type: "percentage" | "distance-from-left" | "distance-from-right" | "center-offset";
  label: string;
  description: string;
  icon: React.ReactNode;
}

const POSITION_METHODS: PositionMethod[] = [
  {
    type: "percentage",
    label: "Procent ściany",
    description: "Pozycja jako procent długości ściany",
    icon: <Text style={{ fontSize: 16, color: "white" }}>%</Text>
  },
  {
    type: "distance-from-left",
    label: "Odległość od lewej",
    description: "Dystans od lewego końca ściany",
    icon: <Text style={{ fontSize: 16, color: "white" }}>←</Text>
  },
  {
    type: "distance-from-right", 
    label: "Odległość od prawej",
    description: "Dystans od prawego końca ściany",
    icon: <Text style={{ fontSize: 16, color: "white" }}>→</Text>
  },
  {
    type: "center-offset",
    label: "Przesunięcie od środka",
    description: "Przesunięcie od środka ściany",
    icon: <Text style={{ fontSize: 16, color: "white" }}>↔</Text>
  }
];

// Enhanced validation display with animations
const ValidationDisplay = memo(({ wall, elementWidth, calculatedPosition }: {
  wall: WallInfo;
  elementWidth: number;
  calculatedPosition: number;
}) => {
  const validation = validateElementOnWall(wall, elementWidth, calculatedPosition);
  
  const containerStyle = useMemo(() => ({
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: validation.valid ? colors.status.success.start + "20" : colors.status.error.start + "20",
    borderWidth: 1,
    borderColor: validation.valid ? colors.status.success.start + "40" : colors.status.error.start + "40",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    ...shadows.sm,
  }), [validation.valid]);

  const iconStyle = useMemo(() => ({
    marginRight: spacing.sm,
  }), []);

  const textStyle = useMemo(() => ({
    color: validation.valid ? colors.status.success.start : colors.status.error.start,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as any,
    flex: 1,
  }), [validation.valid]);

  return (
    <View style={containerStyle}>
      {validation.valid ? (
        <CheckCircle size={20} color={colors.status.success.start} style={iconStyle} />
      ) : (
        <AlertCircle size={20} color={colors.status.error.start} style={iconStyle} />
      )}
      <Text style={textStyle}>
        {validation.valid ? "Element mieści się na ścianie" : validation.message}
      </Text>
    </View>
  );
});

export default function EnhancedDoorWindowModal({
  visible,
  elementType,
  availableWalls,
  onSave,
  onClose,
  onError,
}: EnhancedDoorWindowModalProps) {
  const [elementWidth, setElementWidth] = useState("");
  const [elementHeight, setElementHeight] = useState("");
  const [selectedWall, setSelectedWall] = useState(0);
  const [positionMethod, setPositionMethod] = useState<PositionMethod["type"]>("percentage");
  const [positionValue, setPositionValue] = useState("");
  const [calculatedPosition, setCalculatedPosition] = useState(50);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Reset form when modal opens/closes or element type changes
  useEffect(() => {
    if (visible) {
      setElementWidth(elementType === "door" ? "0.9" : "1.0");
      setElementHeight(elementType === "door" ? "2.0" : "1.2");
      setSelectedWall(0);
      setPositionMethod("percentage");
      setPositionValue("50");
      setCalculatedPosition(50);
      setFocusedInput(null);
    }
  }, [visible, elementType]);

  // Calculate position percentage based on method and value with debouncing
  useEffect(() => {
    if (!positionValue) return;
    
    const timeoutId = setTimeout(() => {
      const wall = availableWalls[selectedWall];
      if (!wall) return;

      const wallLength = wall.length / 100; // Convert cm to meters
      const value = parseFloat(positionValue);

      if (isNaN(value)) return;

      let percentage = 50; // Default to center

      switch (positionMethod) {
        case "percentage":
          percentage = Math.max(0, Math.min(100, value));
          break;
        case "distance-from-left":
          percentage = (value / wallLength) * 100;
          break;
        case "distance-from-right":
          percentage = 100 - (value / wallLength) * 100;
          break;
        case "center-offset":
          const centerOffset = (value / wallLength) * 100;
          percentage = 50 + centerOffset;
          break;
      }

      setCalculatedPosition(Math.max(0, Math.min(100, percentage)));
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [positionMethod, positionValue, selectedWall]);

  const validateAndSave = useCallback(() => {
    try {
      const width = parseFloat(elementWidth);
      const height = parseFloat(elementHeight);

      if (!width || !height || width <= 0 || height <= 0) {
        onError("Błąd", "Wprowadź prawidłowe wymiary");
        return;
      }

      if (!availableWalls[selectedWall]) {
        onError("Błąd", "Wybrana ściana nie istnieje");
        return;
      }

      const validation = validateElementOnWall(
        availableWalls[selectedWall],
        width * 100,
        calculatedPosition
      );
      
      if (!validation.valid) {
        onError("Błąd pozycjonowania", validation.message || "Element nie mieści się na ścianie");
        return;
      }

      const element = {
        type: elementType,
        width: width * 100,
        height: height * 100,
        position: calculatedPosition,
        wall: selectedWall,
      };

      onSave(element);

    } catch (error) {
      console.error("Error validating element:", error);
      onError("Błąd", "Nie można sprawdzić poprawności elementu");
    }
  }, [elementWidth, elementHeight, selectedWall, calculatedPosition, elementType, onSave, onError]);

  const getPositionMethodInput = useCallback(() => {
    const wall = availableWalls[selectedWall];
    if (!wall) return null;

    const wallLengthM = wall.length / 100;
    const isFocused = focusedInput === "position";

      const inputContainerStyle = useMemo(() => ({
    marginBottom: spacing.sm,
  }), []);

      const inputStyle = useMemo(() => ({
    backgroundColor: isFocused ? colors.background.card + "CC" : colors.background.tertiary,
    color: colors.text.primary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.base,
    borderWidth: isFocused ? 2 : 1,
    borderColor: isFocused ? colors.accent.purple : colors.glass.border,
    ...shadows.sm,
  }), [isFocused]);

    switch (positionMethod) {
      case "percentage":
        return (
          <View style={inputContainerStyle}>
            <Text style={labelStyle}>Wartość (0-100%)</Text>
            <TextInput
              style={inputStyle}
              value={positionValue}
              onChangeText={(value) => setPositionValue(normalizeDecimalSeparator(value))}
              onFocus={() => setFocusedInput("position")}
              onBlur={() => setFocusedInput(null)}
              placeholder="50"
              placeholderTextColor={colors.text.muted}
              keyboardType="numeric"
            />
          </View>
        );
      case "distance-from-left":
      case "distance-from-right":
        return (
          <View style={inputContainerStyle}>
            <Text style={labelStyle}>Odległość (metry, max: {wallLengthM.toFixed(2)}m)</Text>
            <TextInput
              style={inputStyle}
              value={positionValue}
              onChangeText={(value) => setPositionValue(normalizeDecimalSeparator(value))}
              onFocus={() => setFocusedInput("position")}
              onBlur={() => setFocusedInput(null)}
              placeholder="1.0"
              placeholderTextColor={colors.text.muted}
              keyboardType="numeric"
            />
          </View>
        );
      case "center-offset":
        return (
          <View style={inputContainerStyle}>
            <Text style={labelStyle}>Przesunięcie od środka (metry, ±{(wallLengthM/2).toFixed(2)}m)</Text>
            <TextInput
              style={inputStyle}
              value={positionValue}
              onChangeText={(value) => setPositionValue(normalizeDecimalSeparator(value))}
              onFocus={() => setFocusedInput("position")}
              onBlur={() => setFocusedInput(null)}
              placeholder="0.0"
              placeholderTextColor={colors.text.muted}
              keyboardType="numeric"
            />
          </View>
        );
      default:
        return null;
    }
  }, [positionMethod, positionValue, selectedWall, focusedInput]);

  const modalOverlayStyle = useMemo(() => ({
    flex: 1,
    backgroundColor: colors.glass.overlay,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: spacing.lg,
  }), []);

  const modalContainerStyle = useMemo(() => ({
    width: "100%",
    maxWidth: 450,
    maxHeight: "65%",
    borderRadius: borderRadius.xl,
    overflow: "hidden" as const,
    ...glassmorphism.heavy,
  }), []);

  const headerStyle = useMemo(() => ({
    padding: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  }), []);

  const headerTitleStyle = useMemo(() => ({
    color: colors.text.primary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as any,
    textAlign: "center" as const,
  }), []);

  const closeButtonStyle = useMemo(() => ({
    position: "absolute" as const,
    top: spacing.md,
    right: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary + "80",
    zIndex: 1000,
    minWidth: 40,
    minHeight: 40,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  }), []);

  const contentStyle = useMemo(() => ({
    padding: spacing.md,
    paddingBottom: spacing.sm,
  }), []);

  const sectionStyle = useMemo(() => ({
    marginBottom: spacing.sm,
  }), []);

  const sectionTitleStyle = useMemo(() => ({
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
    marginBottom: spacing.sm,
  }), []);

  const wallButtonStyle = useMemo(() => ({
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
    minWidth: 100,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: colors.glass.border,
    ...shadows.sm,
  }), []);

  const selectedWallButtonStyle = useMemo(() => ({
    ...wallButtonStyle,
    backgroundColor: colors.accent.purple,
    borderColor: colors.accent.purple,
    ...shadows.md,
  }), [wallButtonStyle]);

  const wallNameStyle = useMemo(() => ({
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as any,
  }), []);

  const wallLengthStyle = useMemo(() => ({
    color: colors.text.tertiary,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
  }), []);

  const methodButtonStyle = useMemo(() => ({
    backgroundColor: colors.background.tertiary,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glass.border,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    ...shadows.sm,
  }), []);

  const selectedMethodButtonStyle = useMemo(() => ({
    ...methodButtonStyle,
    backgroundColor: colors.accent.purple + "20",
    borderColor: colors.accent.purple,
    ...shadows.md,
  }), [methodButtonStyle]);

  const methodIconStyle = useMemo(() => ({
    width: 28,
    height: 28,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent.purple + "20",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: spacing.sm,
  }), []);

  const methodTextContainerStyle = useMemo(() => ({
    flex: 1,
  }), []);

  const methodLabelStyle = useMemo(() => ({
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium as any,
  }), []);

  const methodDescriptionStyle = useMemo(() => ({
    color: colors.text.tertiary,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  }), []);

  const dimensionsContainerStyle = useMemo(() => ({
    flexDirection: "row" as const,
    marginBottom: spacing.md,
  }), []);

  const dimensionInputContainerStyle = useMemo(() => ({
    flex: 1,
    marginRight: spacing.sm,
  }), []);

  const dimensionInputStyle = useMemo(() => ({
    backgroundColor: colors.background.tertiary,
    color: colors.text.primary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    fontSize: typography.sizes.base,
    borderWidth: 1,
    borderColor: colors.glass.border,
    ...shadows.sm,
  }), []);

  const actionButtonsContainerStyle = useMemo(() => ({
    flexDirection: "row" as const,
    padding: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
    backgroundColor: colors.background.card + "CC",
  }), []);

  const cancelButtonStyle = useMemo(() => ({
    flex: 1,
    backgroundColor: colors.background.tertiary,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glass.border,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    height: 44,
    ...shadows.sm,
  }), []);

  const addButtonStyle = useMemo(() => ({
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: "hidden" as const,
    marginLeft: spacing.sm,
    height: 44,
    ...shadows.md,
  }), []);

  const addButtonGradientStyle = useMemo(() => ({
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: spacing.sm,
  }), []);

  const buttonTextStyle = useMemo(() => ({
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold as any,
  }), []);

  const labelStyle = useMemo(() => ({
    color: colors.text.secondary,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.xs,
    fontWeight: typography.weights.medium as any,
  }), []);

  const feedbackStyle = useMemo(() => ({
    color: colors.status.info.start,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
    fontWeight: typography.weights.medium as any,
  }), []);

  if (!visible || !availableWalls || availableWalls.length === 0) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      supportedOrientations={['portrait', 'landscape']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={modalOverlayStyle}>
          <View style={modalContainerStyle}>
            {/* Header */}
            <View style={headerStyle}>
              <TouchableOpacity 
                onPress={onClose} 
                style={closeButtonStyle}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color={colors.text.primary} />
              </TouchableOpacity>
              <Text style={headerTitleStyle}>
                Dodaj {elementType === "door" ? "Drzwi" : "Okno"}
              </Text>
            </View>

            {/* Content */}
            <ScrollView 
              style={contentStyle}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: spacing.md }}
            >
              {/* Wall Selection */}
              <View style={sectionStyle}>
                <Text style={sectionTitleStyle}>Wybierz ścianę</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row" }}>
                    {availableWalls.map((wall, index) => (
                      <TouchableOpacity
                        key={wall.id}
                        onPress={() => setSelectedWall(index)}
                        style={selectedWall === index ? selectedWallButtonStyle : wallButtonStyle}
                        activeOpacity={0.8}
                      >
                        <Text style={wallNameStyle}>{wall.name}</Text>
                        <Text style={wallLengthStyle}>
                          {(wall.length / 100).toFixed(2)}m
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Position Method Selection */}
              <View style={sectionStyle}>
                <Text style={sectionTitleStyle}>Metoda pozycjonowania</Text>
                {POSITION_METHODS.map((method) => (
                  <TouchableOpacity
                    key={method.type}
                    onPress={() => setPositionMethod(method.type)}
                    style={positionMethod === method.type ? selectedMethodButtonStyle : methodButtonStyle}
                    activeOpacity={0.8}
                  >
                    <View style={methodIconStyle}>
                      {method.icon}
                    </View>
                    <View style={methodTextContainerStyle}>
                      <Text style={methodLabelStyle}>{method.label}</Text>
                      <Text style={methodDescriptionStyle}>{method.description}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Position Value Input */}
              <View style={sectionStyle}>
                {getPositionMethodInput()}
                {positionValue && (
                  <Text style={feedbackStyle}>
                    Pozycja na ścianie: {calculatedPosition.toFixed(1)}%
                  </Text>
                )}
              </View>

              {/* Dimensions */}
              <View style={sectionStyle}>
                <Text style={sectionTitleStyle}>Wymiary elementu</Text>
                <View style={dimensionsContainerStyle}>
                  <View style={dimensionInputContainerStyle}>
                    <Text style={labelStyle}>Szerokość (m)</Text>
                    <TextInput
                      style={dimensionInputStyle}
                      value={elementWidth}
                      onChangeText={(value) => setElementWidth(normalizeDecimalSeparator(value))}
                      onFocus={() => setFocusedInput("width")}
                      onBlur={() => setFocusedInput(null)}
                      placeholder={elementType === "door" ? "0.9" : "1.0"}
                      placeholderTextColor={colors.text.muted}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[dimensionInputContainerStyle, { marginRight: 0, marginLeft: spacing.sm }]}>
                    <Text style={labelStyle}>Wysokość (m)</Text>
                    <TextInput
                      style={dimensionInputStyle}
                      value={elementHeight}
                      onChangeText={(value) => setElementHeight(normalizeDecimalSeparator(value))}
                      onFocus={() => setFocusedInput("height")}
                      onBlur={() => setFocusedInput(null)}
                      placeholder={elementType === "door" ? "2.0" : "1.2"}
                      placeholderTextColor={colors.text.muted}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {/* Validation Display */}
              {availableWalls[selectedWall] && elementWidth && positionValue && (
                <ValidationDisplay 
                  wall={availableWalls[selectedWall]}
                  elementWidth={parseFloat(elementWidth) * 100}
                  calculatedPosition={calculatedPosition}
                />
              )}

            </ScrollView>

            {/* Action Buttons - Fixed at bottom */}
            <View style={actionButtonsContainerStyle}>
              <TouchableOpacity
                onPress={onClose}
                style={cancelButtonStyle}
                activeOpacity={0.8}
              >
                <Text style={buttonTextStyle}>Anuluj</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={validateAndSave}
                style={addButtonStyle}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={gradients.primary.colors}
                  start={gradients.primary.start}
                  end={gradients.primary.end}
                  style={addButtonGradientStyle}
                >
                  <Text style={buttonTextStyle}>Dodaj</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
} 