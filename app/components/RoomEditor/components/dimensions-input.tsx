import React from "react";
import { View, Text, TextInput } from "react-native";
import { DimensionsInputProps } from "../types";

const DimensionsInput: React.FC<DimensionsInputProps> = ({
  dimensions,
  displayValues,
  roomShape,
  onDimensionChange,
  onDisplayValueChange,
}) => {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 18, color: "white", marginBottom: 4 }}>
        Wymiary głównego pomieszczenia (m)
      </Text>
      <Text style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 12 }}>
        To jest główna prostokątna część pomieszczenia
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
            keyboardType="decimal-pad"
            value={displayValues.length}
            onChangeText={(value) => onDimensionChange("length", value)}
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
            keyboardType="decimal-pad"
            value={displayValues.width}
            onChangeText={(value) => onDimensionChange("width", value)}
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
            keyboardType="decimal-pad"
            value={displayValues.height}
            onChangeText={(value) => onDimensionChange("height", value)}
            placeholder="np. 2.5"
            placeholderTextColor="#6B7280"
          />
        </View>
      </View>
    </View>
  );
};

export default DimensionsInput;
