import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft } from "lucide-react-native";
import { Project } from "../utils/storage";

type TabType = "rooms" | "editor" | "calculator" | "summary" | "planner";

interface ProjectHeaderProps {
  project: Project;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onBackPress: () => void;
}

export default function ProjectHeader({
  project,
  activeTab,
  onTabChange,
  onBackPress,
}: ProjectHeaderProps) {
  return (
    <LinearGradient
      colors={["#0A0B1E", "#151829"]}
      style={{ paddingHorizontal: 16, paddingVertical: 12 }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <TouchableOpacity
          onPress={onBackPress}
          style={{ padding: 8, marginRight: 8 }}
        >
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
            {project.name}
          </Text>
          <Text style={{ color: "#B8BCC8", fontSize: 14 }}>
            Status: {project.status}
          </Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 12 }}
      >
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={() => onTabChange("rooms")}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
              backgroundColor:
                activeTab === "rooms" ? "#6C63FF" : "transparent",
              marginRight: 8,
            }}
          >
            <Text
              style={{
                color: activeTab === "rooms" ? "white" : "#B8BCC8",
                textAlign: "center",
                fontWeight: activeTab === "rooms" ? "600" : "normal",
              }}
            >
              Pomieszczenia
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onTabChange("summary")}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
              backgroundColor:
                activeTab === "summary" ? "#6C63FF" : "transparent",
              marginRight: 8,
            }}
          >
            <Text
              style={{
                color: activeTab === "summary" ? "white" : "#B8BCC8",
                textAlign: "center",
                fontWeight: activeTab === "summary" ? "600" : "normal",
              }}
            >
              Podsumowanie
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onTabChange("planner")}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
              backgroundColor:
                activeTab === "planner" ? "#6C63FF" : "transparent",
              marginRight: 8,
            }}
          >
            <Text
              style={{
                color: activeTab === "planner" ? "white" : "#B8BCC8",
                textAlign: "center",
                fontWeight: activeTab === "planner" ? "600" : "normal",
              }}
            >
              Planer 2D
            </Text>
          </TouchableOpacity>

          {activeTab === "editor" && (
            <TouchableOpacity
              onPress={() => onTabChange("editor")}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: "#6C63FF",
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                Edytor
              </Text>
            </TouchableOpacity>
          )}

          {activeTab === "calculator" && (
            <TouchableOpacity
              onPress={() => onTabChange("calculator")}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: "#6C63FF",
              }}
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontWeight: "600",
                }}
              >
                Kalkulator
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
} 