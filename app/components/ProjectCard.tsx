import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Pin, Edit2, Trash2 } from "lucide-react-native";
import ProjectExportButton from "./ProjectExportButton";
import type { Project } from "../utils/storage";

interface ProjectCardProps {
  project: Project;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPin?: (id: string, isPinned: boolean) => void;
}

const ProjectCard = ({
  project,
  onEdit = () => {},
  onDelete = () => {},
  onPin = () => {},
}: ProjectCardProps) => {
  // Status colors mapping
  const statusColors = {
    "W trakcie": "#F59E0B", // amber
    Zakończony: "#10B981", // green
    Wstrzymany: "#EF4444", // red
    Planowany: "#4DABF7", // blue
  };

  const statusColor = statusColors[project.status as keyof typeof statusColors] || "#6B7280";

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
              {project.name}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onPin(project.id, !project.isPinned)}
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
              color={project.isPinned ? "#6C63FF" : "#6B7280"}
              fill={project.isPinned ? "#6C63FF" : "transparent"}
            />
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: "#B8BCC8", fontSize: 14, marginBottom: 4 }}>
            Status:{" "}
            <Text style={{ fontWeight: "500", color: statusColor }}>
              {project.status}
            </Text>
          </Text>
          <Text style={{ color: "#B8BCC8", fontSize: 14, marginBottom: 2 }}>
            Data rozpoczęcia: {project.startDate}
          </Text>
          <Text style={{ color: "#B8BCC8", fontSize: 14 }}>
            Data zakończenia: {project.endDate}
          </Text>
        </View>

        {/* Export button */}
        <ProjectExportButton project={project} />

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
            onPress={() => onEdit(project.id)}
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
            onPress={() => onDelete(project.id)}
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
