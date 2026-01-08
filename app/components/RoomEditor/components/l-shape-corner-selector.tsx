import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { LShapeCornerSelectorProps } from "../types";

const LShapeCornerSelector: React.FC<LShapeCornerSelectorProps> = ({
  lShapeCorner,
  onCornerChange,
  displayValues,
  onDisplayValueChange,
  onDimensionChange,
}) => {
  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ marginTop: 16 }}>
        <Text style={{ color: "white", marginBottom: 4, fontSize: 16 }}>
          Gdzie jest rozszerzenie?
        </Text>
        <Text style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 12 }}>
          Wybierz, w którym rogu znajduje się rozszerzenie typu L
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
              onPress={() => onCornerChange(corner.key as any)}
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

        <Text style={{ color: "white", marginBottom: 4, fontSize: 16 }}>
          Wymiary rozszerzenia (L-część)
        </Text>
        <Text style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 12 }}>
          To jest dodatkowa część tworząca kształt litery L
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
              keyboardType="decimal-pad"
              value={displayValues.length2}
              onChangeText={(value) => onDimensionChange("length2", value)}
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
              keyboardType="decimal-pad"
              value={displayValues.width2}
              onChangeText={(value) => onDimensionChange("width2", value)}
              placeholder="np. 2.0"
              placeholderTextColor="#6B7280"
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default LShapeCornerSelector;
