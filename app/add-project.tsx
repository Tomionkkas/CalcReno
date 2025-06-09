import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Save, Calendar } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StorageService, Project } from "./utils/storage";

type ProjectStatus = "W trakcie" | "Planowany" | "Zakończony" | "Wstrzymany";

export default function AddProjectScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Planowany" as ProjectStatus,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });
  const [saving, setSaving] = useState(false);

  const statusOptions: ProjectStatus[] = [
    "Planowany",
    "W trakcie",
    "Wstrzymany",
    "Zakończony",
  ];

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Błąd", "Nazwa projektu jest wymagana");
      return;
    }

    if (!formData.endDate) {
      Alert.alert("Błąd", "Data zakończenia jest wymagana");
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      Alert.alert(
        "Błąd",
        "Data zakończenia musi być późniejsza niż data rozpoczęcia",
      );
      return;
    }

    try {
      setSaving(true);

      const newProject: Project = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isPinned: false,
        description: formData.description.trim(),
        rooms: [],
      };

      await StorageService.addProject(newProject);

      Alert.alert("Sukces", "Projekt został utworzony", [
        {
          text: "OK",
          onPress: () => router.replace("/"),
        },
      ]);
    } catch (error) {
      console.error("Error saving project:", error);
      Alert.alert("Błąd", "Nie udało się zapisać projektu");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL");
  };

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    // Allow partial input and validate format
    const cleanValue = value.replace(/[^0-9-]/g, "");

    // Allow empty string or partial/complete YYYY-MM-DD format
    if (
      cleanValue === "" ||
      /^\d{0,4}(-\d{0,2}(-\d{0,2})?)?$/.test(cleanValue)
    ) {
      setFormData((prev) => ({ ...prev, [field]: cleanValue }));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0A0B1E" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header */}
        <LinearGradient
          colors={["#0A0B1E", "#151829"]}
          style={{ paddingHorizontal: 16, paddingVertical: 12 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ padding: 8, marginRight: 8 }}
            >
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
              Nowy Projekt
            </Text>
          </View>
        </LinearGradient>

        <ScrollView
          style={{ flex: 1, padding: 16 }}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 50 }}
        >
          {/* Project Name */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "500",
                marginBottom: 8,
              }}
            >
              Nazwa projektu *
            </Text>
            <TextInput
              style={{
                backgroundColor: "#1E2139",
                color: "white",
                padding: 16,
                borderRadius: 12,
                fontSize: 16,
                borderWidth: 1,
                borderColor: formData.name ? "#6C63FF" : "#2A2D4A",
              }}
              placeholder="np. Remont łazienki"
              placeholderTextColor="#6B7280"
              value={formData.name}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, name: text }))
              }
              maxLength={50}
            />
          </View>

          {/* Description */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "500",
                marginBottom: 8,
              }}
            >
              Opis (opcjonalnie)
            </Text>
            <TextInput
              style={{
                backgroundColor: "#1E2139",
                color: "white",
                padding: 16,
                borderRadius: 12,
                fontSize: 16,
                borderWidth: 1,
                borderColor: "#2A2D4A",
                minHeight: 100,
                textAlignVertical: "top",
              }}
              placeholder="Opisz szczegóły projektu..."
              placeholderTextColor="#6B7280"
              value={formData.description}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, description: text }))
              }
              multiline
              maxLength={200}
            />
          </View>

          {/* Status */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "500",
                marginBottom: 8,
              }}
            >
              Status
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setFormData((prev) => ({ ...prev, status }))}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor:
                      formData.status === status ? "#6C63FF" : "#1E2139",
                    marginRight: 8,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor:
                      formData.status === status ? "#6C63FF" : "#2A2D4A",
                  }}
                >
                  <Text
                    style={{
                      color: formData.status === status ? "white" : "#B8BCC8",
                      fontSize: 14,
                      fontWeight: formData.status === status ? "500" : "normal",
                    }}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Dates */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "500",
                marginBottom: 16,
              }}
            >
              Terminy
            </Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: "#B8BCC8", fontSize: 14, marginBottom: 8 }}>
                Data rozpoczęcia *
              </Text>
              <View
                style={{
                  backgroundColor: "#1E2139",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#2A2D4A",
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <Calendar size={20} color="#6B7280" />
                <TextInput
                  style={{
                    color: "white",
                    fontSize: 16,
                    marginLeft: 12,
                    flex: 1,
                  }}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#6B7280"
                  value={formData.startDate}
                  onChangeText={(text) => handleDateChange("startDate", text)}
                  maxLength={10}
                />
              </View>
              {formData.startDate && (
                <Text style={{ color: "#4DABF7", fontSize: 12, marginTop: 4 }}>
                  {formatDate(formData.startDate)}
                </Text>
              )}
            </View>

            <View>
              <Text style={{ color: "#B8BCC8", fontSize: 14, marginBottom: 8 }}>
                Data zakończenia *
              </Text>
              <View
                style={{
                  backgroundColor: "#1E2139",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: formData.endDate ? "#6C63FF" : "#2A2D4A",
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <Calendar size={20} color="#6B7280" />
                <TextInput
                  style={{
                    color: "white",
                    fontSize: 16,
                    marginLeft: 12,
                    flex: 1,
                  }}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#6B7280"
                  value={formData.endDate}
                  onChangeText={(text) => handleDateChange("endDate", text)}
                  maxLength={10}
                />
              </View>
              {formData.endDate && (
                <Text style={{ color: "#4DABF7", fontSize: 12, marginTop: 4 }}>
                  {formatDate(formData.endDate)}
                </Text>
              )}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving || !formData.name.trim() || !formData.endDate}
            style={{
              borderRadius: 12,
              overflow: "hidden",
              opacity:
                saving || !formData.name.trim() || !formData.endDate ? 0.6 : 1,
              marginBottom: 32,
            }}
          >
            <LinearGradient
              colors={["#6C63FF", "#4DABF7"]}
              style={{
                paddingVertical: 16,
                paddingHorizontal: 24,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Save size={20} color="white" />
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  fontWeight: "600",
                  marginLeft: 8,
                }}
              >
                {saving ? "Zapisywanie..." : "Utwórz projekt"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
