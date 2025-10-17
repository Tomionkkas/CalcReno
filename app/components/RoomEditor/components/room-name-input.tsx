import React from "react";
import { View, Text, TextInput } from "react-native";
import { RoomNameInputProps } from "../types";

const RoomNameInput: React.FC<RoomNameInputProps> = ({
  roomName,
  onRoomNameChange,
}) => {
  return (
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
        onChangeText={onRoomNameChange}
        placeholder="np. Salon, Kuchnia, Sypialnia"
        placeholderTextColor="#6B7280"
      />
    </View>
  );
};

export default RoomNameInput;
