import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface AddRoomModalProps {
  visible: boolean;
  roomName: string;
  onRoomNameChange: (name: string) => void;
  onClose: () => void;
  onCreate: () => void;
}

export default function AddRoomModal({
  visible,
  roomName,
  onRoomNameChange,
  onClose,
  onCreate,
}: AddRoomModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
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
                  value={roomName}
                  onChangeText={onRoomNameChange}
                  placeholder="np. Salon, Kuchnia, Sypialnia"
                  placeholderTextColor="#9CA3AF"
                  autoFocus
                />
              </View>

              <Text
                style={{
                  color: "#B8BCC8",
                  fontSize: 14,
                  marginBottom: 20,
                  textAlign: "center",
                }}
              >
                Wymiary i kształt pomieszczenia będziesz mógł ustawić w edytorze
              </Text>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    flex: 1,
                    backgroundColor: "#374151",
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "500" }}>
                    Anuluj
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onCreate}
                  style={{
                    flex: 1,
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
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
                      Dodaj
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
} 