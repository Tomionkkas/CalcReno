import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Plus,
  Calculator,
  Edit3,
  Trash2,
  Home,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StorageService, Project, Room } from "../utils/storage";
import RoomEditor from "../components/RoomEditor";
import MaterialCalculator from "../components/MaterialCalculator";

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "rooms" | "editor" | "calculator" | "summary" | "planner"
  >("rooms");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const projectData = await StorageService.getProject(id);
      setProject(projectData);
    } catch (error) {
      console.error("Error loading project:", error);
      Alert.alert("Błąd", "Nie udało się załadować projektu");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = () => {
    setShowAddRoomModal(true);
  };

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) {
      Alert.alert("Błąd", "Nazwa pomieszczenia jest wymagana");
      return;
    }
    // Create a temporary room object to pass the name to the editor
    const tempRoom = {
      id: Date.now().toString(),
      name: newRoomName.trim(),
      shape: "rectangle" as const,
      dimensions: {
        width: 400,
        length: 500,
        height: 250,
        width2: 200,
        length2: 300,
      },
      elements: [],
    };
    setEditingRoom(tempRoom);
    setActiveTab("editor");
    setShowAddRoomModal(false);
    setNewRoomName("");
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setActiveTab("editor");
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!project) return;

    Alert.alert(
      "Usuń pomieszczenie",
      "Czy na pewno chcesz usunąć to pomieszczenie?",
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Usuń",
          style: "destructive",
          onPress: async () => {
            const updatedProject = {
              ...project,
              rooms: project.rooms.filter((r) => r.id !== roomId),
            };
            await StorageService.updateProject(updatedProject);
            setProject(updatedProject);
          },
        },
      ],
    );
  };

  const handleSaveRoom = async (roomData: {
    shape: "rectangle" | "l-shape";
    dimensions: any;
    elements: any[];
    name?: string;
  }) => {
    if (!project) return;

    const isEditing =
      editingRoom && project.rooms.some((r) => r.id === editingRoom.id);
    const roomId = editingRoom?.id || Date.now().toString();
    const roomName =
      roomData.name ||
      editingRoom?.name ||
      `Pomieszczenie ${project.rooms.length + 1}`;

    const newRoom: Room = {
      id: roomId,
      name: roomName,
      shape: roomData.shape,
      dimensions: roomData.dimensions,
      elements: roomData.elements,
    };

    let updatedRooms;
    if (isEditing) {
      updatedRooms = project.rooms.map((r) => (r.id === roomId ? newRoom : r));
    } else {
      updatedRooms = [...project.rooms, newRoom];
    }

    const updatedProject = {
      ...project,
      rooms: updatedRooms,
    };

    await StorageService.updateProject(updatedProject);
    setProject(updatedProject);
    setEditingRoom(null);
    setActiveTab("rooms");

    Alert.alert("Sukces", "Pomieszczenie zostało zapisane");
  };

  const handleCalculateMaterials = (room: Room) => {
    setSelectedRoom(room);
    setActiveTab("calculator");
  };

  const handleSaveCalculation = async (calculation: any) => {
    if (!project || !selectedRoom) return;

    const updatedRooms = project.rooms.map((r) =>
      r.id === selectedRoom.id ? { ...r, materials: calculation } : r,
    );

    const totalCost = updatedRooms.reduce(
      (sum, room) => sum + (room.materials?.totalCost || 0),
      0,
    );

    const updatedProject = {
      ...project,
      rooms: updatedRooms,
      totalCost,
    };

    await StorageService.updateProject(updatedProject);
    setProject(updatedProject);

    Alert.alert("Sukces", "Kalkulacja została zapisana");
  };

  const renderSummaryTab = () => {
    const totalCost =
      project?.rooms.reduce(
        (sum, room) => sum + (room.materials?.totalCost || 0),
        0,
      ) || 0;

    const roomsWithMaterials =
      project?.rooms.filter((room) => room.materials) || [];

    return (
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              color: "white",
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 16,
            }}
          >
            Podsumowanie Kosztów
          </Text>

          <LinearGradient
            colors={["#1E2139", "#2A2D4A"]}
            style={{ borderRadius: 12, padding: 20, marginBottom: 20 }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 8,
              }}
            >
              Całkowity koszt projektu
            </Text>
            <Text
              style={{ color: "#4DABF7", fontSize: 32, fontWeight: "bold" }}
            >
              {totalCost.toFixed(2)} zł
            </Text>
            <Text style={{ color: "#B8BCC8", fontSize: 14, marginTop: 4 }}>
              {roomsWithMaterials.length} z {project?.rooms.length || 0}{" "}
              pomieszczeń wycenionych
            </Text>
          </LinearGradient>

          {roomsWithMaterials.map((room) => (
            <LinearGradient
              key={room.id}
              colors={["#1E2139", "#2A2D4A"]}
              style={{ borderRadius: 12, marginBottom: 12, padding: 16 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    fontWeight: "bold",
                    flex: 1,
                  }}
                >
                  {room.name}
                </Text>
                <Text
                  style={{ color: "#10B981", fontSize: 16, fontWeight: "bold" }}
                >
                  {room.materials?.totalCost.toFixed(2)} zł
                </Text>
              </View>
              <Text style={{ color: "#B8BCC8", fontSize: 12, marginTop: 4 }}>
                {(room.dimensions.width / 100).toFixed(2)}m ×{" "}
                {(room.dimensions.length / 100).toFixed(2)}m
              </Text>
            </LinearGradient>
          ))}

          <TouchableOpacity
            onPress={() => setShowAdvancedDetails(true)}
            style={{ borderRadius: 8, overflow: "hidden", marginTop: 16 }}
          >
            <LinearGradient
              colors={["#6C63FF", "#4DABF7"]}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "500" }}>
                Szczegóły materiałów
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ flexDirection: "row", marginTop: 16 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#374151",
                padding: 12,
                borderRadius: 8,
                marginRight: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white" }}>Eksport PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#374151",
                padding: 12,
                borderRadius: 8,
                marginLeft: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white" }}>Eksport CSV</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

  const [canvasRooms, setCanvasRooms] = useState<
    Array<Room & { x: number; y: number }>
  >([]);

  const addRoomToCanvas = (room: Room) => {
    const canvasRoom = {
      ...room,
      x: Math.random() * 200 + 50, // Random position
      y: Math.random() * 200 + 50,
    };
    setCanvasRooms([...canvasRooms, canvasRoom]);
  };

  const removeRoomFromCanvas = (roomId: string) => {
    setCanvasRooms(canvasRooms.filter((r) => r.id !== roomId));
  };

  const renderPlannerTab = () => {
    return (
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              color: "white",
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 16,
            }}
          >
            Planer 2D
          </Text>

          <LinearGradient
            colors={["#1E2139", "#2A2D4A"]}
            style={{
              borderRadius: 12,
              padding: 20,
              marginBottom: 20,
              minHeight: 400,
            }}
          >
            <Text style={{ color: "white", fontSize: 16, marginBottom: 16 }}>
              Płótno planowania
            </Text>
            <View
              style={{
                backgroundColor: "#0A0B1E",
                borderRadius: 8,
                minHeight: 300,
                position: "relative",
                borderWidth: 2,
                borderColor: "#6C63FF",
                borderStyle: canvasRooms.length === 0 ? "dashed" : "solid",
              }}
            >
              {canvasRooms.length === 0 ? (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#B8BCC8", textAlign: "center" }}>
                    Kliknij na pomieszczenie poniżej,{"\n"}aby dodać je do planu
                  </Text>
                </View>
              ) : (
                canvasRooms.map((room) => (
                  <View
                    key={`canvas-${room.id}`}
                    style={{
                      position: "absolute",
                      left: room.x,
                      top: room.y,
                      width: Math.max(60, room.dimensions.width / 8),
                      height: Math.max(40, room.dimensions.length / 8),
                      backgroundColor: "rgba(108, 99, 255, 0.3)",
                      borderWidth: 2,
                      borderColor: "#6C63FF",
                      borderRadius: 4,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 10,
                        textAlign: "center",
                      }}
                    >
                      {room.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeRoomFromCanvas(room.id)}
                      style={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        backgroundColor: "#EF4444",
                        borderRadius: 10,
                        width: 20,
                        height: 20,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 12,
                          fontWeight: "bold",
                        }}
                      >
                        ×
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </LinearGradient>

          <Text
            style={{
              color: "white",
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 12,
            }}
          >
            Dostępne pomieszczenia
          </Text>

          {project?.rooms.map((room) => {
            const isOnCanvas = canvasRooms.some((cr) => cr.id === room.id);
            return (
              <TouchableOpacity
                key={room.id}
                onPress={() => !isOnCanvas && addRoomToCanvas(room)}
                disabled={isOnCanvas}
                style={{
                  backgroundColor: isOnCanvas ? "#2A2D4A" : "#374151",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 8,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  opacity: isOnCanvas ? 0.6 : 1,
                }}
              >
                <View>
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    {room.name}
                  </Text>
                  <Text style={{ color: "#B8BCC8", fontSize: 12 }}>
                    {(room.dimensions.width / 100).toFixed(2)}m ×{" "}
                    {(room.dimensions.length / 100).toFixed(2)}m
                  </Text>
                </View>
                <Text style={{ color: isOnCanvas ? "#6B7280" : "#4DABF7" }}>
                  {isOnCanvas ? "Na planie" : "Dodaj do planu"}
                </Text>
              </TouchableOpacity>
            );
          })}

          {canvasRooms.length > 0 && (
            <TouchableOpacity
              onPress={() => setCanvasRooms([])}
              style={{
                backgroundColor: "#EF4444",
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
                marginTop: 8,
                marginBottom: 16,
              }}
            >
              <Text style={{ color: "white", fontWeight: "500" }}>
                Wyczyść plan
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={{
              backgroundColor: "#6C63FF",
              padding: 12,
              borderRadius: 8,
              alignItems: "center",
              marginTop: 16,
            }}
          >
            <Text style={{ color: "white", fontWeight: "500" }}>
              Eksport PNG
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0B1E" }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={{ color: "white", marginTop: 16 }}>
            Ładowanie projektu...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!project) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0B1E" }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <Text style={{ color: "white", fontSize: 18, textAlign: "center" }}>
            Nie znaleziono projektu
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              marginTop: 16,
              padding: 12,
              backgroundColor: "#6C63FF",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white" }}>Powrót</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderRoomsTab = () => (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            color: "white",
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 8,
          }}
        >
          Pomieszczenia ({project.rooms.length})
        </Text>
        {project.totalCost && (
          <Text style={{ color: "#4DABF7", fontSize: 16 }}>
            Całkowity koszt: {project.totalCost.toFixed(2)} zł
          </Text>
        )}
      </View>

      {project.rooms.length === 0 ? (
        <View
          style={{
            backgroundColor: "#1E2139",
            borderRadius: 12,
            padding: 24,
            alignItems: "center",
          }}
        >
          <Home size={48} color="#6B7280" />
          <Text
            style={{
              color: "white",
              fontSize: 18,
              fontWeight: "bold",
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            Brak pomieszczeń
          </Text>
          <Text
            style={{ color: "#B8BCC8", textAlign: "center", marginBottom: 16 }}
          >
            Dodaj pierwsze pomieszczenie, aby rozpocząć planowanie remontu
          </Text>
          <TouchableOpacity
            onPress={handleAddRoom}
            style={{ borderRadius: 8, overflow: "hidden" }}
          >
            <LinearGradient
              colors={["#6C63FF", "#4DABF7"]}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Plus size={20} color="white" />
              <Text
                style={{ color: "white", marginLeft: 8, fontWeight: "500" }}
              >
                Dodaj pomieszczenie
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        project.rooms.map((room) => (
          <LinearGradient
            key={room.id}
            colors={["#1E2139", "#2A2D4A"]}
            style={{ borderRadius: 12, marginBottom: 16, overflow: "hidden" }}
          >
            <View style={{ padding: 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 18,
                    fontWeight: "bold",
                    flex: 1,
                  }}
                >
                  {room.name}
                </Text>
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    onPress={() => handleEditRoom(room)}
                    style={{ padding: 8, marginRight: 8 }}
                  >
                    <Edit3 size={18} color="#4DABF7" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteRoom(room.id)}
                    style={{ padding: 8 }}
                  >
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: "#B8BCC8", fontSize: 14 }}>
                  Wymiary: {(room.dimensions.width / 100).toFixed(2)}m ×{" "}
                  {(room.dimensions.length / 100).toFixed(2)}m ×{" "}
                  {(room.dimensions.height / 100).toFixed(2)}m
                </Text>
                <Text style={{ color: "#B8BCC8", fontSize: 14 }}>
                  Kształt:{" "}
                  {room.shape === "rectangle" ? "Prostokąt" : "Kształt L"}
                </Text>
                <Text style={{ color: "#B8BCC8", fontSize: 14 }}>
                  Elementy: {room.elements.length} (drzwi/okna)
                </Text>
                {room.materials && (
                  <Text
                    style={{
                      color: "#10B981",
                      fontSize: 14,
                      fontWeight: "500",
                    }}
                  >
                    Koszt materiałów: {room.materials.totalCost.toFixed(2)} zł
                  </Text>
                )}
              </View>

              <TouchableOpacity
                onPress={() => handleCalculateMaterials(room)}
                style={{ borderRadius: 8, overflow: "hidden" }}
              >
                <LinearGradient
                  colors={["#6C63FF", "#4DABF7"]}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Calculator size={18} color="white" />
                  <Text
                    style={{ color: "white", marginLeft: 8, fontWeight: "500" }}
                  >
                    {room.materials
                      ? "Aktualizuj kalkulację"
                      : "Oblicz materiały"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        ))
      )}

      <TouchableOpacity
        onPress={handleAddRoom}
        style={{
          borderRadius: 12,
          borderWidth: 2,
          borderColor: "#6C63FF",
          borderStyle: "dashed",
          padding: 20,
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        <Plus size={24} color="#6C63FF" />
        <Text
          style={{
            color: "#6C63FF",
            marginTop: 8,
            fontSize: 16,
            fontWeight: "500",
          }}
        >
          Dodaj pomieszczenie
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "rooms":
        return renderRoomsTab();
      case "editor":
        return (
          <RoomEditor
            onSave={handleSaveRoom}
            initialData={
              editingRoom
                ? {
                    shape: editingRoom.shape,
                    dimensions: editingRoom.dimensions,
                    elements: editingRoom.elements,
                  }
                : undefined
            }
          />
        );
      case "calculator":
        return selectedRoom ? (
          <MaterialCalculator
            roomDetails={{
              length: selectedRoom.dimensions.length / 100, // Convert cm to m
              width: selectedRoom.dimensions.width / 100,
              height: selectedRoom.dimensions.height / 100,
              walls: [
                { length: selectedRoom.dimensions.length / 100 },
                { length: selectedRoom.dimensions.width / 100 },
                { length: selectedRoom.dimensions.length / 100 },
                { length: selectedRoom.dimensions.width / 100 },
              ],
              doors: selectedRoom.elements
                .filter((e) => e.type === "door")
                .map((e) => ({ width: e.width / 100, height: e.height / 100 })),
              windows: selectedRoom.elements
                .filter((e) => e.type === "window")
                .map((e) => ({ width: e.width / 100, height: e.height / 100 })),
            }}
            onSave={handleSaveCalculation}
          />
        ) : null;
      case "summary":
        return renderSummaryTab();
      case "planner":
        return renderPlannerTab();
      default:
        return renderRoomsTab();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0B1E" }}>
      {/* Header */}
      <LinearGradient
        colors={["#0A0B1E", "#151829"]}
        style={{ paddingHorizontal: 16, paddingVertical: 12 }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              if (activeTab === "editor" || activeTab === "calculator") {
                setActiveTab("rooms");
                setEditingRoom(null);
                setSelectedRoom(null);
              } else {
                router.back();
              }
            }}
            style={{ padding: 8, marginRight: 8 }}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
              {project.name}
            </Text>
            <Text style={{ color: "#B8BCC8", fontSize: 14 }}>
              Status: {project.status}
            </Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 12 }}
        >
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() => setActiveTab("rooms")}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor:
                  activeTab === "rooms" ? "#6C63FF" : "transparent",
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  color: activeTab === "rooms" ? "white" : "#B8BCC8",
                  textAlign: "center",
                  fontWeight: activeTab === "rooms" ? "600" : "normal",
                }}
              >
                Pomieszczenia
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("summary")}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor:
                  activeTab === "summary" ? "#6C63FF" : "transparent",
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  color: activeTab === "summary" ? "white" : "#B8BCC8",
                  textAlign: "center",
                  fontWeight: activeTab === "summary" ? "600" : "normal",
                }}
              >
                Podsumowanie
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("planner")}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor:
                  activeTab === "planner" ? "#6C63FF" : "transparent",
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  color: activeTab === "planner" ? "white" : "#B8BCC8",
                  textAlign: "center",
                  fontWeight: activeTab === "planner" ? "600" : "normal",
                }}
              >
                Planer 2D
              </Text>
            </TouchableOpacity>

            {activeTab === "editor" && (
              <TouchableOpacity
                onPress={() => setActiveTab("editor")}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: "#6C63FF",
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  Edytor
                </Text>
              </TouchableOpacity>
            )}

            {activeTab === "calculator" && (
              <TouchableOpacity
                onPress={() => setActiveTab("calculator")}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: "#6C63FF",
                }}
              >
                <Text
                  style={{
                    color: "white",
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  Kalkulator
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Content */}
      {renderContent()}

      {/* Add Room Modal */}
      <Modal
        visible={showAddRoomModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddRoomModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                  Nowe Pomieszczenie
                </Text>

                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{ color: "white", marginBottom: 8, fontSize: 16 }}
                  >
                    Nazwa pomieszczenia *
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: "#374151",
                      color: "white",
                      padding: 12,
                      borderRadius: 8,
                      fontSize: 16,
                    }}
                    value={newRoomName}
                    onChangeText={setNewRoomName}
                    placeholder="np. Salon, Kuchnia, Sypialnia"
                    placeholderTextColor="#9CA3AF"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 24,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowAddRoomModal(false);
                      setNewRoomName("");
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: "#374151",
                      padding: 12,
                      borderRadius: 8,
                      marginRight: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        textAlign: "center",
                        fontSize: 16,
                      }}
                    >
                      Anuluj
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      Keyboard.dismiss();
                      handleCreateRoom();
                    }}
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
                        style={{
                          color: "white",
                          fontSize: 16,
                          fontWeight: "500",
                        }}
                      >
                        Dalej
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Advanced Details Modal */}
      <Modal
        visible={showAdvancedDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAdvancedDetails(false)}
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
              maxHeight: "80%",
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
              Szczegóły Materiałów
            </Text>

            <ScrollView style={{ flex: 1 }}>
              {/* Total Materials Summary */}
              {(() => {
                const allMaterials = {};
                const materialNames = {
                  floorPanels: "Panele podłogowe",
                  underlayment: "Podkład pod panele",
                  paint: "Farba",
                  drywall: "Płyty GK ścienne",
                  cwProfiles: "Profile CW",
                  uwProfiles: "Profile UW",
                  mineralWool: "Wełna mineralna",
                  tnScrews: "Wkręty TN do GK",
                  wallPlaster: "Gips szpachlowy ścienny",
                  finishingPlaster: "Gładź szpachlowa",
                  osb: "Płyta OSB",
                  osbScrews: "Wkręty OSB",
                  baseboards: "Listwy przypodłogowe",
                  baseboardEnds: "Narożniki/zakończenia listew",
                  cdProfiles: "Profile CD 60",
                  udProfiles: "Profile UD 27",
                  hangers: "Wieszaki ES",
                  gypsum: "Płyty GK sufitowe",
                  plaster: "Gips szpachlowy sufitowy",
                  sockets: "Gniazdka",
                  switches: "Włączniki",
                  cable15: "Przewód YDY 3x1.5",
                  cable25: "Przewód YDY 3x2.5",
                  junctionBox: "Puszki podtynkowe",
                };
                const materialUnits = {
                  floorPanels: "m²",
                  underlayment: "m²",
                  paint: "l",
                  drywall: "szt",
                  cwProfiles: "szt",
                  uwProfiles: "szt",
                  mineralWool: "paczek",
                  tnScrews: "opak",
                  wallPlaster: "worków",
                  finishingPlaster: "worków",
                  osb: "szt",
                  osbScrews: "opak",
                  baseboards: "szt",
                  baseboardEnds: "szt",
                  cdProfiles: "szt",
                  udProfiles: "szt",
                  hangers: "szt",
                  gypsum: "szt",
                  plaster: "worków",
                  sockets: "szt",
                  switches: "szt",
                  cable15: "m",
                  cable25: "m",
                  junctionBox: "szt",
                };

                // Aggregate all materials from all rooms
                project?.rooms
                  .filter((room) => room.materials)
                  .forEach((room) => {
                    if (room.materials) {
                      Object.entries(room.materials.materials).forEach(
                        ([material, quantity]) => {
                          allMaterials[material] =
                            (allMaterials[material] || 0) + quantity;
                        },
                      );
                    }
                  });

                return Object.keys(allMaterials).length > 0 ? (
                  <View style={{ marginBottom: 24 }}>
                    <Text
                      style={{
                        color: "white",
                        fontSize: 18,
                        fontWeight: "bold",
                        marginBottom: 12,
                      }}
                    >
                      Łączne zapotrzebowanie na materiały
                    </Text>
                    {Object.entries(allMaterials).map(
                      ([material, quantity]) => (
                        <View
                          key={material}
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            backgroundColor: "#374151",
                            borderRadius: 6,
                            marginBottom: 4,
                          }}
                        >
                          <Text style={{ color: "#B8BCC8", flex: 1 }}>
                            {materialNames[material] || material}
                          </Text>
                          <Text style={{ color: "white", fontWeight: "500" }}>
                            {quantity} {materialUnits[material] || "szt"}
                          </Text>
                        </View>
                      ),
                    )}
                  </View>
                ) : null;
              })()}

              {/* Per Room Details */}
              <Text
                style={{
                  color: "white",
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 12,
                }}
              >
                Szczegóły według pomieszczeń
              </Text>
              {project?.rooms
                .filter((room) => room.materials)
                .map((room) => {
                  const materialNames = {
                    floorPanels: "Panele podłogowe",
                    underlayment: "Podkład pod panele",
                    paint: "Farba",
                    drywall: "Płyty GK ścienne",
                    cwProfiles: "Profile CW",
                    uwProfiles: "Profile UW",
                    mineralWool: "Wełna mineralna",
                    tnScrews: "Wkręty TN do GK",
                    wallPlaster: "Gips szpachlowy ścienny",
                    finishingPlaster: "Gładź szpachlowa",
                    osb: "Płyta OSB",
                    osbScrews: "Wkręty OSB",
                    baseboards: "Listwy przypodłogowe",
                    baseboardEnds: "Narożniki/zakończenia listew",
                    cdProfiles: "Profile CD 60",
                    udProfiles: "Profile UD 27",
                    hangers: "Wieszaki ES",
                    gypsum: "Płyty GK sufitowe",
                    plaster: "Gips szpachlowy sufitowy",
                    sockets: "Gniazdka",
                    switches: "Włączniki",
                    cable15: "Przewód YDY 3x1.5",
                    cable25: "Przewód YDY 3x2.5",
                    junctionBox: "Puszki podtynkowe",
                  };
                  const materialUnits = {
                    floorPanels: "m²",
                    underlayment: "m²",
                    paint: "l",
                    drywall: "szt",
                    cwProfiles: "szt",
                    uwProfiles: "szt",
                    mineralWool: "paczek",
                    tnScrews: "opak",
                    wallPlaster: "worków",
                    finishingPlaster: "worków",
                    osb: "szt",
                    osbScrews: "opak",
                    baseboards: "szt",
                    baseboardEnds: "szt",
                    cdProfiles: "szt",
                    udProfiles: "szt",
                    hangers: "szt",
                    gypsum: "szt",
                    plaster: "worków",
                    sockets: "szt",
                    switches: "szt",
                    cable15: "m",
                    cable25: "m",
                    junctionBox: "szt",
                  };

                  return (
                    <View key={room.id} style={{ marginBottom: 20 }}>
                      <Text
                        style={{
                          color: "white",
                          fontSize: 16,
                          fontWeight: "bold",
                          marginBottom: 8,
                        }}
                      >
                        {room.name}
                      </Text>
                      <Text
                        style={{
                          color: "#10B981",
                          fontSize: 14,
                          marginBottom: 12,
                        }}
                      >
                        Koszt: {room.materials?.totalCost.toFixed(2)} zł
                      </Text>

                      {room.materials &&
                        Object.entries(room.materials.materials).map(
                          ([material, quantity]) => (
                            <View
                              key={material}
                              style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                paddingVertical: 4,
                                paddingHorizontal: 8,
                                borderBottomWidth: 1,
                                borderBottomColor: "#374151",
                              }}
                            >
                              <Text
                                style={{
                                  color: "#B8BCC8",
                                  flex: 1,
                                  fontSize: 12,
                                }}
                              >
                                {materialNames[material] || material}
                              </Text>
                              <Text style={{ color: "white", fontSize: 12 }}>
                                {quantity} {materialUnits[material] || "szt"}
                              </Text>
                            </View>
                          ),
                        )}
                    </View>
                  );
                })}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowAdvancedDetails(false)}
              style={{
                backgroundColor: "#6C63FF",
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
                marginTop: 16,
              }}
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: "500" }}>
                Zamknij
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
