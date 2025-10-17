import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { DoorOpen, Square, Trash2 } from "lucide-react-native";
import { ElementsListProps } from "../types";

const ElementsList: React.FC<ElementsListProps> = ({
  elements,
  availableWalls,
  onElementRemove,
}) => {
  return (
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
              <View>
                <Text style={{ color: "white", marginLeft: 8 }}>
                  {element.type === "door" ? "Drzwi" : "Okno"} (
                  {(element.width / 100).toFixed(2)}x
                  {(element.height / 100).toFixed(2)} m)
                </Text>
                <Text style={{ color: "#9CA3AF", marginLeft: 8, fontSize: 12 }}>
                  {availableWalls[element.wall]?.name || `Ściana ${element.wall + 1}`} - 
                  pozycja {element.position}%
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => onElementRemove(element.id)}
            >
              <Trash2 size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
};

export default ElementsList;
