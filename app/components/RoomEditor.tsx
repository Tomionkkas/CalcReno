import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import {
  Trash2,
  Plus,
  DoorOpen,
  Square,
  CornerDownRight,
} from "lucide-react-native";
import { Modal } from "react-native";

type RoomShape = "rectangle" | "l-shape";
type ElementType = "door" | "window";

interface Element {
  id: string;
  type: ElementType;
  width: number;
  height: number;
  position: number; // Position on wall (0-100%)
  wall: number; // Wall index
}

interface RoomEditorProps {
  onSave?: (roomData: {
    shape: RoomShape;
    dimensions: any;
    elements: Element[];
    name?: string;
  }) => void;
  initialData?: {
    shape: RoomShape;
    dimensions: any;
    elements: Element[];
    name?: string;
  };
}

const RoomEditor: React.FC<RoomEditorProps> = ({ onSave, initialData }) => {
  const [roomName, setRoomName] = useState(initialData?.name || "");
  const [roomShape, setRoomShape] = useState<RoomShape>(
    initialData?.shape || "rectangle",
  );
  const [dimensions, setDimensions] = useState(
    initialData?.dimensions || {
      width: 400, // Will be converted to meters in display
      length: 500,
      height: 250,
      // For L-shape
      width2: 200,
      length2: 300,
    },
  );
  const [lShapeCorner, setLShapeCorner] = useState<
    "top-left" | "top-right" | "bottom-left" | "bottom-right"
  >("top-right");
  const [elements, setElements] = useState<Element[]>(
    initialData?.elements || [],
  );
  const [activeWall, setActiveWall] = useState<number | null>(null);
  const [showElementModal, setShowElementModal] = useState(false);
  const [elementType, setElementType] = useState<ElementType>("door");
  const [elementWidth, setElementWidth] = useState("");
  const [elementHeight, setElementHeight] = useState("");
  const [selectedWall, setSelectedWall] = useState<number>(0);

  // Animation values for draggable elements
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);

  const handleDimensionChange = (key: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    // Convert meters to cm for internal storage
    setDimensions((prev) => ({ ...prev, [key]: numValue * 100 }));
  };

  const addElement = (type: ElementType) => {
    setElementType(type);
    setElementWidth(type === "door" ? "0.9" : "1.0");
    setElementHeight(type === "door" ? "2.0" : "1.2");
    setSelectedWall(0);
    setShowElementModal(true);
  };

  const handleSaveElement = () => {
    const width = parseFloat(elementWidth);
    const height = parseFloat(elementHeight);

    if (!width || !height || width <= 0 || height <= 0) {
      Alert.alert("Błąd", "Wprowadź prawidłowe wymiary");
      return;
    }

    const newElement: Element = {
      id: Date.now().toString(),
      type: elementType,
      width: width * 100, // Convert to cm for storage
      height: height * 100,
      position: 50, // Default position in the middle of the wall
      wall: selectedWall,
    };

    setElements([...elements, newElement]);
    setShowElementModal(false);
    setElementWidth("");
    setElementHeight("");
  };

  const removeElement = (id: string) => {
    setElements(elements.filter((element) => element.id !== id));
  };

  const handleSave = () => {
    // Validate dimensions
    if (
      dimensions.width <= 0 ||
      dimensions.length <= 0 ||
      dimensions.height <= 0
    ) {
      Alert.alert("Błąd", "Wszystkie wymiary muszą być większe od zera");
      return;
    }

    if (
      roomShape === "l-shape" &&
      (dimensions.width2 <= 0 || dimensions.length2 <= 0)
    ) {
      Alert.alert("Błąd", "Wymiary drugiej części muszą być większe od zera");
      return;
    }

    if (onSave) {
      onSave({
        shape: roomShape,
        dimensions,
        elements,
        name: roomName,
      });
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = dragX.value;
      ctx.startY = dragY.value;
    },
    onActive: (event, ctx) => {
      dragX.value = ctx.startX + event.translationX;
      dragY.value = ctx.startY + event.translationY;
    },
    onEnd: () => {
      // You could update the element position in state here
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: dragX.value }, { translateY: dragY.value }],
    };
  });

  const renderElement = (element: Element) => {
    // This is a simplified element rendering
    // In a real app, you would position this based on the wall and position
    const isWindow = element.type === "window";

    return (
      <PanGestureHandler key={element.id} onGestureEvent={gestureHandler}>
        <Animated.View
          style={[
            animatedStyle,
            {
              position: "absolute",
              width: element.width / 5,
              height: element.height / 5,
              backgroundColor: isWindow
                ? "rgba(135, 206, 250, 0.7)"
                : "rgba(165, 42, 42, 0.7)",
              borderWidth: 1,
              borderColor: isWindow ? "#4DABF7" : "#6C63FF",
            },
          ]}
        >
          <TouchableOpacity
            style={{
              position: "absolute",
              top: -16,
              right: -16,
              backgroundColor: "#EF4444",
              borderRadius: 12,
              padding: 4,
            }}
            onPress={() => removeElement(element.id)}
          >
            <Trash2 size={12} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    );
  };

  const renderRoomVisualization = () => {
    // This is a simplified visualization
    if (roomShape === "rectangle") {
      return (
        <View style={{ marginTop: 16, position: "relative" }}>
          <View
            style={{
              borderWidth: 2,
              borderColor: "#8B5CF6",
              backgroundColor: "rgba(31, 41, 55, 0.3)",
              width: dimensions.width / 2,
              height: dimensions.length / 2,
            }}
          >
            {elements.map((element) => renderElement(element))}
          </View>
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          >
            {/* Wall selection overlays */}
            <TouchableOpacity
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 8,
                backgroundColor:
                  activeWall === 0 ? "rgba(139, 92, 246, 0.5)" : "transparent",
              }}
              onPress={() => setActiveWall(0)}
            />
            <TouchableOpacity
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                width: 8,
                backgroundColor:
                  activeWall === 1 ? "rgba(139, 92, 246, 0.5)" : "transparent",
              }}
              onPress={() => setActiveWall(1)}
            />
            <TouchableOpacity
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 8,
                backgroundColor:
                  activeWall === 2 ? "rgba(139, 92, 246, 0.5)" : "transparent",
              }}
              onPress={() => setActiveWall(2)}
            />
            <TouchableOpacity
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: 8,
                backgroundColor:
                  activeWall === 3 ? "rgba(139, 92, 246, 0.5)" : "transparent",
              }}
              onPress={() => setActiveWall(3)}
            />
          </View>
        </View>
      );
    } else {
      // L-shape room visualization with corner selection
      const renderLShape = () => {
        const mainWidth = dimensions.width / 2;
        const mainHeight = dimensions.length / 2;
        const secondWidth = dimensions.width2 / 2;
        const secondHeight = dimensions.length2 / 2;

        switch (lShapeCorner) {
          case "top-right":
            return (
              <View>
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      borderWidth: 2,
                      borderColor: "#8B5CF6",
                      backgroundColor: "rgba(31, 41, 55, 0.3)",
                      width: mainWidth,
                      height: secondHeight,
                    }}
                  />
                  <View
                    style={{
                      borderWidth: 2,
                      borderColor: "#8B5CF6",
                      backgroundColor: "rgba(31, 41, 55, 0.3)",
                      borderLeftWidth: 0,
                      width: secondWidth,
                      height: secondHeight,
                    }}
                  />
                </View>
                <View
                  style={{
                    borderWidth: 2,
                    borderColor: "#8B5CF6",
                    backgroundColor: "rgba(31, 41, 55, 0.3)",
                    borderTopWidth: 0,
                    width: mainWidth,
                    height: mainHeight - secondHeight,
                  }}
                />
              </View>
            );
          case "top-left":
            return (
              <View>
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      borderWidth: 2,
                      borderColor: "#8B5CF6",
                      backgroundColor: "rgba(31, 41, 55, 0.3)",
                      width: secondWidth,
                      height: secondHeight,
                    }}
                  />
                  <View
                    style={{
                      borderWidth: 2,
                      borderColor: "#8B5CF6",
                      backgroundColor: "rgba(31, 41, 55, 0.3)",
                      borderLeftWidth: 0,
                      width: mainWidth,
                      height: secondHeight,
                    }}
                  />
                </View>
                <View
                  style={{
                    borderWidth: 2,
                    borderColor: "#8B5CF6",
                    backgroundColor: "rgba(31, 41, 55, 0.3)",
                    borderTopWidth: 0,
                    width: mainWidth,
                    height: mainHeight - secondHeight,
                    marginLeft: secondWidth,
                  }}
                />
              </View>
            );
          case "bottom-right":
            return (
              <View>
                <View
                  style={{
                    borderWidth: 2,
                    borderColor: "#8B5CF6",
                    backgroundColor: "rgba(31, 41, 55, 0.3)",
                    width: mainWidth,
                    height: mainHeight - secondHeight,
                  }}
                />
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      borderWidth: 2,
                      borderColor: "#8B5CF6",
                      backgroundColor: "rgba(31, 41, 55, 0.3)",
                      borderTopWidth: 0,
                      width: mainWidth,
                      height: secondHeight,
                    }}
                  />
                  <View
                    style={{
                      borderWidth: 2,
                      borderColor: "#8B5CF6",
                      backgroundColor: "rgba(31, 41, 55, 0.3)",
                      borderLeftWidth: 0,
                      borderTopWidth: 0,
                      width: secondWidth,
                      height: secondHeight,
                    }}
                  />
                </View>
              </View>
            );
          case "bottom-left":
            return (
              <View>
                <View
                  style={{
                    borderWidth: 2,
                    borderColor: "#8B5CF6",
                    backgroundColor: "rgba(31, 41, 55, 0.3)",
                    width: mainWidth,
                    height: mainHeight - secondHeight,
                    marginLeft: secondWidth,
                  }}
                />
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      borderWidth: 2,
                      borderColor: "#8B5CF6",
                      backgroundColor: "rgba(31, 41, 55, 0.3)",
                      borderTopWidth: 0,
                      width: secondWidth,
                      height: secondHeight,
                    }}
                  />
                  <View
                    style={{
                      borderWidth: 2,
                      borderColor: "#8B5CF6",
                      backgroundColor: "rgba(31, 41, 55, 0.3)",
                      borderLeftWidth: 0,
                      borderTopWidth: 0,
                      width: mainWidth,
                      height: secondHeight,
                    }}
                  />
                </View>
              </View>
            );
          default:
            return null;
        }
      };

      return (
        <View style={{ marginTop: 16, position: "relative" }}>
          {renderLShape()}
        </View>
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#0A0B1E" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <LinearGradient
            colors={["#0A0B1E", "#151829"]}
            style={{ flex: 1, padding: 16, borderRadius: 8 }}
          >
            <ScrollView
              style={{ flex: 1 }}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: "white",
                  marginBottom: 16,
                }}
              >
                Edytor Pomieszczeń
              </Text>

              {/* Room Name Input */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 18, color: "white", marginBottom: 8 }}>
                  Nazwa pomieszczenia
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#374151",
                    color: "white",
                    padding: 12,
                    borderRadius: 8,
                    fontSize: 16,
                  }}
                  value={roomName}
                  onChangeText={setRoomName}
                  placeholder="np. Salon, Kuchnia, Sypialnia"
                  placeholderTextColor="#6B7280"
                />
              </View>

              {/* Room Shape Selection */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 18, color: "white", marginBottom: 8 }}>
                  Kształt pomieszczenia
                </Text>
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginRight: 16,
                      padding: 12,
                      borderRadius: 8,
                      backgroundColor:
                        roomShape === "rectangle" ? "#8B5CF6" : "#374151",
                    }}
                    onPress={() => setRoomShape("rectangle")}
                  >
                    <Square size={20} color="white" />
                    <Text style={{ color: "white", marginLeft: 8 }}>
                      Prostokąt
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 12,
                      borderRadius: 8,
                      backgroundColor:
                        roomShape === "l-shape" ? "#8B5CF6" : "#374151",
                    }}
                    onPress={() => setRoomShape("l-shape")}
                  >
                    <CornerDownRight size={20} color="white" />
                    <Text style={{ color: "white", marginLeft: 8 }}>
                      Kształt L
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Room Dimensions */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 18, color: "white", marginBottom: 8 }}>
                  Wymiary (m)
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  <View
                    style={{ width: "48%", paddingRight: 8, marginBottom: 16 }}
                  >
                    <Text style={{ color: "white", marginBottom: 4 }}>
                      Długość
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: "#374151",
                        color: "white",
                        padding: 8,
                        borderRadius: 8,
                      }}
                      keyboardType="numeric"
                      value={(dimensions.length / 100).toString()}
                      onChangeText={(value) =>
                        handleDimensionChange("length", value)
                      }
                      placeholder="np. 5.0"
                      placeholderTextColor="#6B7280"
                    />
                  </View>
                  <View
                    style={{ width: "48%", paddingLeft: 8, marginBottom: 16 }}
                  >
                    <Text style={{ color: "white", marginBottom: 4 }}>
                      Szerokość
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: "#374151",
                        color: "white",
                        padding: 8,
                        borderRadius: 8,
                      }}
                      keyboardType="numeric"
                      value={(dimensions.width / 100).toString()}
                      onChangeText={(value) =>
                        handleDimensionChange("width", value)
                      }
                      placeholder="np. 4.0"
                      placeholderTextColor="#6B7280"
                    />
                  </View>
                  <View style={{ width: "48%", paddingRight: 8 }}>
                    <Text style={{ color: "white", marginBottom: 4 }}>
                      Wysokość
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: "#374151",
                        color: "white",
                        padding: 8,
                        borderRadius: 8,
                      }}
                      keyboardType="numeric"
                      value={(dimensions.height / 100).toString()}
                      onChangeText={(value) =>
                        handleDimensionChange("height", value)
                      }
                      placeholder="np. 2.5"
                      placeholderTextColor="#6B7280"
                    />
                  </View>
                </View>

                {roomShape === "l-shape" && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={{ color: "white", marginBottom: 8 }}>
                      Pozycja drugiej części
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        marginBottom: 16,
                      }}
                    >
                      {[
                        { key: "top-left", label: "Góra lewo" },
                        { key: "top-right", label: "Góra prawo" },
                        { key: "bottom-left", label: "Dół lewo" },
                        { key: "bottom-right", label: "Dół prawo" },
                      ].map((corner) => (
                        <TouchableOpacity
                          key={corner.key}
                          onPress={() => setLShapeCorner(corner.key as any)}
                          style={{
                            backgroundColor:
                              lShapeCorner === corner.key
                                ? "#8B5CF6"
                                : "#374151",
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 8,
                            marginRight: 8,
                            marginBottom: 8,
                          }}
                        >
                          <Text style={{ color: "white", fontSize: 12 }}>
                            {corner.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={{ color: "white", marginBottom: 8 }}>
                      Wymiary drugiej części (m)
                    </Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                      <View
                        style={{
                          width: "48%",
                          paddingRight: 8,
                          marginBottom: 16,
                        }}
                      >
                        <Text style={{ color: "white", marginBottom: 4 }}>
                          Długość
                        </Text>
                        <TextInput
                          style={{
                            backgroundColor: "#374151",
                            color: "white",
                            padding: 8,
                            borderRadius: 8,
                          }}
                          keyboardType="numeric"
                          value={(dimensions.length2 / 100).toString()}
                          onChangeText={(value) =>
                            handleDimensionChange("length2", value)
                          }
                          placeholder="np. 3.0"
                          placeholderTextColor="#6B7280"
                        />
                      </View>
                      <View
                        style={{
                          width: "48%",
                          paddingLeft: 8,
                          marginBottom: 16,
                        }}
                      >
                        <Text style={{ color: "white", marginBottom: 4 }}>
                          Szerokość
                        </Text>
                        <TextInput
                          style={{
                            backgroundColor: "#374151",
                            color: "white",
                            padding: 8,
                            borderRadius: 8,
                          }}
                          keyboardType="numeric"
                          value={(dimensions.width2 / 100).toString()}
                          onChangeText={(value) =>
                            handleDimensionChange("width2", value)
                          }
                          placeholder="np. 2.0"
                          placeholderTextColor="#6B7280"
                        />
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* Room Visualization */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 18, color: "white", marginBottom: 8 }}>
                  Wizualizacja
                </Text>
                <Text
                  style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 8 }}
                >
                  Wybierz ścianę, aby dodać drzwi lub okno. Przeciągnij
                  elementy, aby zmienić ich pozycję.
                </Text>
                {renderRoomVisualization()}

                <View style={{ flexDirection: "row", marginTop: 16 }}>
                  <TouchableOpacity
                    onPress={() => addElement("door")}
                    style={{
                      marginRight: 16,
                      borderRadius: 8,
                      overflow: "hidden",
                    }}
                  >
                    <LinearGradient
                      colors={["#3B82F6", "#1D4ED8"]}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 12,
                      }}
                    >
                      <DoorOpen size={20} color="white" />
                      <Text style={{ color: "white", marginLeft: 8 }}>
                        Dodaj drzwi
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => addElement("window")}
                    style={{ borderRadius: 8, overflow: "hidden" }}
                  >
                    <LinearGradient
                      colors={["#3B82F6", "#1D4ED8"]}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 12,
                      }}
                    >
                      <Square size={20} color="white" />
                      <Text style={{ color: "white", marginLeft: 8 }}>
                        Dodaj okno
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Elements List */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 18, color: "white", marginBottom: 8 }}>
                  Elementy
                </Text>
                {elements.length === 0 ? (
                  <Text style={{ color: "#9CA3AF" }}>
                    Brak elementów. Dodaj drzwi lub okna.
                  </Text>
                ) : (
                  elements.map((element) => (
                    <View
                      key={element.id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: "#374151",
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        {element.type === "door" ? (
                          <DoorOpen size={20} color="#6C63FF" />
                        ) : (
                          <Square size={20} color="#4DABF7" />
                        )}
                        <Text style={{ color: "white", marginLeft: 8 }}>
                          {element.type === "door" ? "Drzwi" : "Okno"} (
                          {(element.width / 100).toFixed(2)}x
                          {(element.height / 100).toFixed(2)} m) - Ściana{" "}
                          {element.wall + 1}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => removeElement(element.id)}
                      >
                        <Trash2 size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSave}
                style={{ borderRadius: 8, overflow: "hidden" }}
              >
                <LinearGradient
                  colors={["#6C63FF", "#4DABF7"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    padding: 16,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ color: "white", fontWeight: "bold", fontSize: 18 }}
                  >
                    Zapisz pomieszczenie
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </LinearGradient>
        </View>
      </TouchableWithoutFeedback>

      {/* Element Modal */}
      <Modal
        visible={showElementModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowElementModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <LinearGradient
            colors={["#1E2139", "#2A2D4A"]}
            style={{
              width: "100%",
              maxWidth: 400,
              borderRadius: 16,
              padding: 24,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              Dodaj {elementType === "door" ? "Drzwi" : "Okno"}
            </Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: "white", marginBottom: 8, fontSize: 16 }}>
                Wybierz ścianę
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {["Ściana 1", "Ściana 2", "Ściana 3", "Ściana 4"].map(
                  (wall, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedWall(index)}
                      style={{
                        backgroundColor:
                          selectedWall === index ? "#6C63FF" : "#374151",
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 8,
                        marginRight: 8,
                        marginBottom: 8,
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 14 }}>
                        {wall}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>
            </View>

            <View style={{ flexDirection: "row", marginBottom: 16 }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={{ color: "white", marginBottom: 8, fontSize: 16 }}>
                  Szerokość (m)
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#374151",
                    color: "white",
                    padding: 12,
                    borderRadius: 8,
                    fontSize: 16,
                  }}
                  value={elementWidth}
                  onChangeText={setElementWidth}
                  placeholder={elementType === "door" ? "0.9" : "1.0"}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={{ color: "white", marginBottom: 8, fontSize: 16 }}>
                  Wysokość (m)
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#374151",
                    color: "white",
                    padding: 12,
                    borderRadius: 8,
                    fontSize: 16,
                  }}
                  value={elementHeight}
                  onChangeText={setElementHeight}
                  placeholder={elementType === "door" ? "2.0" : "1.2"}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 24,
              }}
            >
              <TouchableOpacity
                onPress={() => setShowElementModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: "#374151",
                  padding: 12,
                  borderRadius: 8,
                  marginRight: 8,
                }}
              >
                <Text
                  style={{ color: "white", textAlign: "center", fontSize: 16 }}
                >
                  Anuluj
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveElement}
                style={{
                  flex: 1,
                  borderRadius: 8,
                  overflow: "hidden",
                  marginLeft: 8,
                }}
              >
                <LinearGradient
                  colors={["#6C63FF", "#4DABF7"]}
                  style={{
                    padding: 12,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ color: "white", fontSize: 16, fontWeight: "500" }}
                  >
                    Dodaj
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default RoomEditor;
