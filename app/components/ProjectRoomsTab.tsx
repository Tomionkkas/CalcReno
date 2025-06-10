import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Plus,
  Calculator,
  Edit3,
  Trash2,
  Home,
} from "lucide-react-native";
import { Project, Room } from "../utils/storage";

interface ProjectRoomsTabProps {
  project: Project;
  onAddRoom: () => void;
  onEditRoom: (room: Room) => void;
  onDeleteRoom: (roomId: string) => void;
  onCalculateMaterials: (room: Room) => void;
}

export default function ProjectRoomsTab({
  project,
  onAddRoom,
  onEditRoom,
  onDeleteRoom,
  onCalculateMaterials,
}: ProjectRoomsTabProps) {
  return (
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
            onPress={onAddRoom}
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
                    onPress={() => onEditRoom(room)}
                    style={{ padding: 8, marginRight: 8 }}
                  >
                    <Edit3 size={18} color="#4DABF7" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onDeleteRoom(room.id)}
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
                onPress={() => onCalculateMaterials(room)}
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
        onPress={onAddRoom}
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
} 