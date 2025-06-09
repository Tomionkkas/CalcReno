import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Pin, Edit2, Trash2 } from "lucide-react-native";

interface ProjectCardProps {
  id?: string;
  name?: string;
  status?: "W trakcie" | "Zakończone" | "Wstrzymane" | "Planowane";
  startDate?: string;
  endDate?: string;
  isPinned?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPin?: (id: string, isPinned: boolean) => void;
}

const ProjectCard = ({
  id = "1",
  name = "Remont łazienki",
  status = "W trakcie",
  startDate = "01.05.2023",
  endDate = "15.06.2023",
  isPinned = false,
  onEdit = () => {},
  onDelete = () => {},
  onPin = () => {},
}: ProjectCardProps) => {
  // Status colors mapping
  const statusColors = {
    "W trakcie": "#F59E0B", // amber
    Zakończone: "#10B981", // green
    Wstrzymane: "#EF4444", // red
    Planowane: "#4DABF7", // blue
  };

  const statusColor = statusColors[status] || "#6B7280";

  return (
    <LinearGradient
      colors={["#1E2139", "#2A2D4A"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 16,
        width: "100%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
      }}
    >
      <View style={{ padding: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <View
              style={{
                backgroundColor: statusColor,
                height: 12,
                width: 12,
                borderRadius: 6,
                marginRight: 8,
              }}
            />
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: 18,
                flex: 1,
              }}
            >
              {name}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onPin(id, !isPinned)}
            style={{
              padding: 8,
              minWidth: 44,
              minHeight: 44,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Pin
              size={18}
              color={isPinned ? "#6C63FF" : "#6B7280"}
              fill={isPinned ? "#6C63FF" : "transparent"}
            />
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: "#B8BCC8", fontSize: 14, marginBottom: 4 }}>
            Status:{" "}
            <Text style={{ fontWeight: "500", color: statusColor }}>
              {status}
            </Text>
          </Text>
          <Text style={{ color: "#B8BCC8", fontSize: 14, marginBottom: 2 }}>
            Data rozpoczęcia: {startDate}
          </Text>
          <Text style={{ color: "#B8BCC8", fontSize: 14 }}>
            Data zakończenia: {endDate}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: "#2A2D4A",
          }}
        >
          <TouchableOpacity
            onPress={() => onEdit(id)}
            style={{
              padding: 8,
              marginRight: 8,
              minWidth: 44,
              minHeight: 44,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Edit2 size={18} color="#4DABF7" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete(id)}
            style={{
              padding: 8,
              minWidth: 44,
              minHeight: 44,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Trash2 size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

export default ProjectCard;
