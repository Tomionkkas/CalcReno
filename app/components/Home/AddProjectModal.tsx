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
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar } from "lucide-react-native";

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

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleDateChange = (type: 'startDate' | 'endDate', text: string) => {
    // Allow YYYY-MM-DD format
    const cleaned = text.replace(/[^0-9-]/g, '');
    if (cleaned.length <= 10) {
      if (type === 'startDate') {
        setNewProjectStartDate(cleaned);
      } else {
        setNewProjectEndDate(cleaned);
      }
    }
  };

  const handleSave = () => {
    if (!newProjectName.trim()) {
      return;
    }

    // Validate dates
    if (newProjectStartDate && newProjectEndDate) {
      const start = new Date(newProjectStartDate);
      const end = new Date(newProjectEndDate);
      if (start >= end) {
        // Error will be handled by parent
        return;
      }
    }

    // Set default dates if not provided
    const startDate = newProjectStartDate || new Date().toISOString().split("T")[0];
    const endDate = newProjectEndDate || (() => {
      const defaultEnd = new Date();
      defaultEnd.setMonth(defaultEnd.getMonth() + 1);
      return defaultEnd.toISOString().split("T")[0];
    })();

    onSave({
      name: newProjectName,
      description: newProjectDescription,
      status: newProjectStatus,
      startDate,
      endDate,
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
                maxHeight: "90%",
                borderRadius: 16,
                padding: 24,
              }}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
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

                {/* Harmonogram Section */}
                <View style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                    <Calendar size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
                    <Text
                      style={{ color: "white", fontSize: 16, fontWeight: "500" }}
                    >
                      Harmonogram
                    </Text>
                  </View>

                  <View style={{ marginBottom: 12 }}>
                    <Text
                      style={{ color: "#9CA3AF", marginBottom: 8, fontSize: 14 }}
                    >
                      Data rozpoczęcia
                    </Text>
                    <View style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#374151",
                      borderRadius: 8,
                      paddingHorizontal: 12,
                    }}>
                      <Calendar size={16} color="#9CA3AF" />
                      <TextInput
                        style={{
                          flex: 1,
                          color: "white",
                          padding: 12,
                          fontSize: 16,
                          marginLeft: 8,
                        }}
                        value={newProjectStartDate}
                        onChangeText={(text) => handleDateChange('startDate', text)}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#9CA3AF"
                        maxLength={10}
                      />
                    </View>
                    {newProjectStartDate && (
                      <Text style={{ color: "#6C63FF", fontSize: 12, marginTop: 4 }}>
                        {formatDate(newProjectStartDate)}
                      </Text>
                    )}
                  </View>

                  <View>
                    <Text
                      style={{ color: "#9CA3AF", marginBottom: 8, fontSize: 14 }}
                    >
                      Data zakończenia
                    </Text>
                    <View style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#374151",
                      borderRadius: 8,
                      paddingHorizontal: 12,
                    }}>
                      <Calendar size={16} color="#9CA3AF" />
                      <TextInput
                        style={{
                          flex: 1,
                          color: "white",
                          padding: 12,
                          fontSize: 16,
                          marginLeft: 8,
                        }}
                        value={newProjectEndDate}
                        onChangeText={(text) => handleDateChange('endDate', text)}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#9CA3AF"
                        maxLength={10}
                      />
                    </View>
                    {newProjectEndDate && (
                      <Text style={{ color: "#6C63FF", fontSize: 12, marginTop: 4 }}>
                        {formatDate(newProjectEndDate)}
                      </Text>
                    )}
                  </View>
                </View>
              </ScrollView>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 16,
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
