import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SaveButtonProps } from "../types";

const SaveButton: React.FC<SaveButtonProps> = ({ onSave }) => {
  return (
    <TouchableOpacity
      onPress={onSave}
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
  );
};

export default SaveButton;
