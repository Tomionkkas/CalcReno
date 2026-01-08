import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { DoorOpen, Square, Trash2, Edit3 } from "lucide-react-native";
import { ElementsListProps } from "../types";

const ElementsList: React.FC<ElementsListProps> = ({
  elements,
  availableWalls,
  onElementRemove,
  onElementEdit,
}) => {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 18, color: "white", marginBottom: 4 }}>
        Elementy w pomieszczeniu:
      </Text>
      {elements.length > 0 && (
        <Text style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 8 }}>
          Kliknij element, aby go edytować
        </Text>
      )}
      {elements.length === 0 ? (
        <Text style={{ color: "#9CA3AF" }}>
          Brak elementów. Dodaj drzwi lub okna.
        </Text>
      ) : (
        elements.map((element) => (
          <TouchableOpacity
            key={element.id}
            onPress={() => onElementEdit(element)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#374151",
              padding: 12,
              borderRadius: 8,
              marginBottom: 8,
            }}
            activeOpacity={0.7}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              {element.type === "door" ? (
                <DoorOpen size={20} color="#6C63FF" />
              ) : (
                <Square size={20} color="#4DABF7" />
              )}
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={{ color: "white" }}>
                  {element.type === "door" ? "Drzwi" : "Okno"} -{(element.width / 100).toFixed(1)}×{(element.height / 100).toFixed(1)}m
                </Text>
                <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
                  {availableWalls[element.wall]?.name || `Ściana ${element.wall + 1}`} - {element.position.toFixed(0)}%
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              <Edit3 size={16} color="#6B7280" />
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onElementRemove(element.id);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash2 size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

export default ElementsList;
