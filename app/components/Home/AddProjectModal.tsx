import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface AddProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (projectData: {
    name: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
  }) => void;
}

export default function AddProjectModal({ visible, onClose, onSave }: AddProjectModalProps) {
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectStatus, setNewProjectStatus] = useState("Planowany");
  const [newProjectStartDate, setNewProjectStartDate] = useState("");
  const [newProjectEndDate, setNewProjectEndDate] = useState("");

  const handleSave = () => {
    if (!newProjectName.trim()) {
      // You might want to show an error here
      return;
    }

    onSave({
      name: newProjectName,
      description: newProjectDescription,
      status: newProjectStatus,
      startDate: newProjectStartDate,
      endDate: newProjectEndDate,
    });

    // Reset form
    setNewProjectName("");
    setNewProjectDescription("");
    setNewProjectStatus("Planowany");
    setNewProjectStartDate("");
    setNewProjectEndDate("");
  };

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
                Nowy Projekt
              </Text>

              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{ color: "white", marginBottom: 8, fontSize: 16 }}
                >
                  Nazwa projektu *
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#374151",
                    color: "white",
                    padding: 12,
                    borderRadius: 8,
                    fontSize: 16,
                  }}
                  value={newProjectName}
                  onChangeText={setNewProjectName}
                  placeholder="Wprowadź nazwę projektu"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{ color: "white", marginBottom: 8, fontSize: 16 }}
                >
                  Opis
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#374151",
                    color: "white",
                    padding: 12,
                    borderRadius: 8,
                    fontSize: 16,
                    minHeight: 80,
                  }}
                  value={newProjectDescription}
                  onChangeText={setNewProjectDescription}
                  placeholder="Opis projektu (opcjonalnie)"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{ color: "white", marginBottom: 8, fontSize: 16 }}
                >
                  Status
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {["Planowany", "W trakcie", "Wstrzymany", "Zakończony"].map(
                    (status) => (
                      <TouchableOpacity
                        key={status}
                        onPress={() => setNewProjectStatus(status)}
                        style={{
                          backgroundColor:
                            newProjectStatus === status
                              ? "#6C63FF"
                              : "#374151",
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 8,
                          marginRight: 8,
                          marginBottom: 8,
                        }}
                      >
                        <Text style={{ color: "white", fontSize: 14 }}>
                          {status}
                        </Text>
                      </TouchableOpacity>
                    ),
                  )}
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 24,
                }}
              >
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    flex: 1,
                    backgroundColor: "#374151",
                    padding: 12,
                    borderRadius: 8,
                    marginRight: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      textAlign: "center",
                      fontSize: 16,
                    }}
                  >
                    Anuluj
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  style={{
                    flex: 1,
                    borderRadius: 8,
                    overflow: "hidden",
                    marginLeft: 8,
                  }}
                >
                  <LinearGradient
                    colors={["#6C63FF", "#4DABF7"]}
                    style={{
                      padding: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontSize: 16,
                        fontWeight: "500",
                      }}
                    >
                      Zapisz
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
