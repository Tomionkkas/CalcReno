import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Square, CornerDownRight } from "lucide-react-native";
import { ShapeSelectorProps } from "../types";

const ShapeSelector: React.FC<ShapeSelectorProps> = ({
  roomShape,
  onShapeChange,
}) => {
  return (
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
          onPress={() => onShapeChange("rectangle")}
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
          onPress={() => onShapeChange("l-shape")}
        >
          <CornerDownRight size={20} color="white" />
          <Text style={{ color: "white", marginLeft: 8 }}>
            Kształt L
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ShapeSelector;
