import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { DoorOpen, Square } from "lucide-react-native";
import ProfessionalRoomRenderer from "../../ProfessionalRoomRenderer";
import { ElementActionsProps } from "../types";

const ElementActions: React.FC<ElementActionsProps> = ({
  onAddDoor,
  onAddWindow,
  availableWalls,
  activeWall,
  onWallSelect,
  onWallLongPress,
  elements,
  onElementRemove,
  roomShape,
  dimensions,
  corner,
}) => {
  return (
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
      
      <ProfessionalRoomRenderer
        shape={roomShape}
        dimensions={dimensions}
        corner={corner}
        elements={elements}
        availableWalls={availableWalls}
        activeWall={activeWall}
        onWallSelect={onWallSelect}
        onWallLongPress={onWallLongPress}
        onElementRemove={onElementRemove}
      />

      <View style={{ flexDirection: "row", marginTop: 16 }}>
        <TouchableOpacity
          onPress={onAddDoor}
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
          onPress={onAddWindow}
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
  );
};

export default ElementActions;
