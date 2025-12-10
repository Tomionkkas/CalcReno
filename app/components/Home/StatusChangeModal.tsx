import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusPill } from "../ui";

type ProjectStatus = "W trakcie" | "Planowany" | "Zakończony" | "Wstrzymany";

interface StatusChangeModalProps {
  visible: boolean;
  currentStatus: ProjectStatus;
  onClose: () => void;
  onStatusChange: (status: ProjectStatus) => void;
}

const statusOptions: ProjectStatus[] = [
  "Planowany",
  "W trakcie",
  "Wstrzymany",
  "Zakończony",
];

const getStatusConfig = (status: ProjectStatus) => {
  switch (status) {
    case "W trakcie":
      return { type: "inProgress" as const, label: "W trakcie" };
    case "Zakończony":
      return { type: "completed" as const, label: "Zakończony" };
    case "Wstrzymany":
      return { type: "paused" as const, label: "Wstrzymany" };
    case "Planowany":
    default:
      return { type: "planned" as const, label: "Planowany" };
  }
};

export default function StatusChangeModal({
  visible,
  currentStatus,
  onClose,
  onStatusChange,
}: StatusChangeModalProps) {
  const handleStatusSelect = (status: ProjectStatus) => {
    if (status !== currentStatus) {
      onStatusChange(status);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <TouchableWithoutFeedback>
            <LinearGradient
              colors={["#1E2139", "#2A2D4A"]}
              style={{
                width: "100%",
                maxWidth: 350,
                borderRadius: 16,
                padding: 24,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 20,
                  fontWeight: "bold",
                  marginBottom: 20,
                  textAlign: "center",
                }}
              >
                Zmień status projektu
              </Text>

              <Text
                style={{
                  color: "#9CA3AF",
                  fontSize: 14,
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                Wybierz nowy status dla projektu
              </Text>

              <View style={{ marginBottom: 24 }}>
                {statusOptions.map((status) => {
                  const statusConfig = getStatusConfig(status);
                  const isSelected = status === currentStatus;
                  
                  return (
                    <TouchableOpacity
                      key={status}
                      onPress={() => handleStatusSelect(status)}
                      style={{
                        marginBottom: 12,
                        opacity: isSelected ? 0.6 : 1,
                      }}
                      activeOpacity={0.7}
                    >
                      <StatusPill
                        status={statusConfig.type}
                        label={statusConfig.label}
                        glow={!isSelected}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                onPress={onClose}
                style={{
                  backgroundColor: "#374151",
                  padding: 12,
                  borderRadius: 8,
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
            </LinearGradient>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

