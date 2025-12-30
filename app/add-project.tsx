import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import CustomToast from "./components/CustomToast";
import { useToast } from "./hooks/useToast";
import { useRouter } from "expo-router";
import { ArrowLeft, Save, Calendar, X, CheckCircle, AlertCircle } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StorageService, Project, generateUUID } from "./utils/storage";
import { colors, gradients, typography, spacing, borderRadius, shadows, glassmorphism } from "./utils/theme";
import {
  rateLimiter,
  createProjectSchema,
  validateWithSchema,
  sanitizeForStorage,
} from "./utils/security";

type ProjectStatus = "W trakcie" | "Planowany" | "Zakończony" | "Wstrzymany";

export default function AddProjectScreen() {
  const router = useRouter();
  const { toastConfig, isVisible, showError, showSuccess, hideToast } = useToast();
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

  // Memoized styles for performance
  const containerStyle = useMemo(() => ({
    flex: 1,
    backgroundColor: colors.background.primary,
  }), []);

  const headerGradientStyle = useMemo(() => ({
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  }), []);

  const headerContainerStyle = useMemo(() => ({
    flexDirection: "row" as const,
    alignItems: "center" as const,
  }), []);

  const backButtonStyle = useMemo(() => ({
    padding: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.tertiary,
    ...shadows.sm,
  }), []);

  const headerTitleStyle = useMemo(() => ({
    color: colors.text.primary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fonts.primary,
  }), []);

  const scrollViewStyle = useMemo(() => ({
    flex: 1,
    padding: spacing.md,
  }), []);

  const scrollContentStyle = useMemo(() => ({
    paddingBottom: spacing.xxl,
  }), []);

  const sectionStyle = useMemo(() => ({
    marginBottom: spacing.lg,
  }), []);

  const labelStyle = useMemo(() => ({
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.sm,
    fontFamily: typography.fonts.primary,
  }), []);

  const inputContainerStyle = useMemo(() => ({
    ...glassmorphism.medium,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
  }), []);

  const textInputStyle = useMemo(() => ({
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontFamily: typography.fonts.primary,
    flex: 1,
  }), []);

  const placeholderTextColor = colors.text.muted;

  const statusContainerStyle = useMemo(() => ({
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: spacing.sm,
  }), []);

  const getStatusButtonStyle = useCallback((isSelected: boolean) => ({
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: isSelected ? colors.primary.start : colors.background.tertiary,
    borderWidth: 1,
    borderColor: isSelected ? colors.primary.start : colors.glass.border,
    ...shadows.sm,
  }), []);

  const getStatusTextStyle = useCallback((isSelected: boolean) => ({
    color: isSelected ? colors.text.primary : colors.text.tertiary,
    fontSize: typography.sizes.sm,
    fontWeight: isSelected ? typography.weights.medium : typography.weights.normal,
    fontFamily: typography.fonts.primary,
  }), []);

  const dateInputContainerStyle = useMemo(() => ({
    ...glassmorphism.medium,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  }), []);

  const dateLabelStyle = useMemo(() => ({
    color: colors.text.tertiary,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.sm,
    fontFamily: typography.fonts.primary,
  }), []);

  const dateFormatStyle = useMemo(() => ({
    color: colors.status.info.start,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
    fontFamily: typography.fonts.primary,
  }), []);

  const saveButtonStyle = useMemo(() => ({
    borderRadius: borderRadius.md,
    overflow: "hidden" as const,
    marginBottom: spacing.xl,
    ...shadows.md,
  }), []);

  const saveButtonGradientStyle = useMemo(() => ({
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    minHeight: spacing.touchTarget,
  }), []);

  const saveButtonTextStyle = useMemo(() => ({
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.sm,
    fontFamily: typography.fonts.primary,
  }), []);

  const handleSave = useCallback(async () => {
    // Check rate limit first
    const rateLimitResult = await rateLimiter.checkAndRecord('api:project_create');

    if (!rateLimitResult.allowed) {
      showError("Błąd", rateLimitResult.message || "Zbyt wiele prób. Spróbuj później.");
      return;
    }

    // Validate using Zod schema
    const validationResult = validateWithSchema(createProjectSchema, {
      name: formData.name,
      description: formData.description,
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate,
    });

    if (!validationResult.success) {
      // Show first validation error
      const firstError = Object.values(validationResult.errors)[0];
      showError("Błąd walidacji", firstError || "Sprawdź wprowadzone dane");
      return;
    }

    try {
      setSaving(true);

      // Use UUID instead of timestamp for project ID
      const newProject: Project = {
        id: generateUUID(),
        name: sanitizeForStorage(formData.name.trim()),
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isPinned: false,
        description: sanitizeForStorage(formData.description.trim()),
        rooms: [],
      };

      await StorageService.addProject(newProject);

      // Clear rate limit on success
      await rateLimiter.recordSuccess('api:project_create');

      showSuccess("Sukces", "Projekt został utworzony");
      setTimeout(() => {
        router.replace("/");
      }, 1500);
    } catch (error) {
      console.error("Error saving project:", error);
      showError("Błąd", "Nie udało się zapisać projektu");
    } finally {
      setSaving(false);
    }
  }, [formData, showError, showSuccess, router]);

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL");
  }, []);

  const handleDateChange = useCallback((field: "startDate" | "endDate", value: string) => {
    // Allow partial input and validate format
    const cleanValue = value.replace(/[^0-9-]/g, "");

    // Allow empty string or partial/complete YYYY-MM-DD format
    if (
      cleanValue === "" ||
      /^\d{0,4}(-\d{0,2}(-\d{0,2})?)?$/.test(cleanValue)
    ) {
      setFormData((prev) => ({ ...prev, [field]: cleanValue }));
    }
  }, []);

  const isFormValid = useMemo(() => {
    return formData.name.trim() && formData.endDate && 
           new Date(formData.startDate) < new Date(formData.endDate);
  }, [formData]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0B1E' }}>
    <SafeAreaView style={containerStyle}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header */}
        <LinearGradient
          colors={gradients.background.colors}
          start={gradients.background.start}
          end={gradients.background.end}
          style={headerGradientStyle}
        >
          <View style={headerContainerStyle}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={backButtonStyle}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={headerTitleStyle}>
              Nowy Projekt
            </Text>
          </View>
        </LinearGradient>

        <ScrollView
          style={scrollViewStyle}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={scrollContentStyle}
          showsVerticalScrollIndicator={false}
        >
          {/* Project Name */}
          <View style={sectionStyle}>
            <Text style={labelStyle}>
              Nazwa projektu *
            </Text>
            <View style={inputContainerStyle}>
              <TextInput
                style={textInputStyle}
                placeholder="Wprowadź nazwę projektu"
                placeholderTextColor={placeholderTextColor}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, name: text }))
                }
                maxLength={50}
              />
            </View>
          </View>

          {/* Description */}
          <View style={sectionStyle}>
            <Text style={labelStyle}>
              Opis
            </Text>
            <View style={[inputContainerStyle, { minHeight: 100 }]}>
              <TextInput
                style={[textInputStyle, { textAlignVertical: "top" as const }]}
                placeholder="Opis projektu (opcjonalnie)"
                placeholderTextColor={placeholderTextColor}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, description: text }))
                }
                multiline
                maxLength={200}
              />
            </View>
          </View>

          {/* Status */}
          <View style={sectionStyle}>
            <Text style={labelStyle}>
              Status
            </Text>
            <View style={statusContainerStyle}>
              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setFormData((prev) => ({ ...prev, status }))}
                  style={getStatusButtonStyle(formData.status === status)}
                  activeOpacity={0.7}
                >
                  <Text style={getStatusTextStyle(formData.status === status)}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Dates */}
          <View style={sectionStyle}>
            <Text style={labelStyle}>
              Terminy
            </Text>

            <View style={{ marginBottom: spacing.md }}>
              <Text style={dateLabelStyle}>
                Data rozpoczęcia *
              </Text>
              <View style={dateInputContainerStyle}>
                <Calendar size={20} color={colors.text.muted} />
                <TextInput
                  style={[textInputStyle, { marginLeft: spacing.sm }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={placeholderTextColor}
                  value={formData.startDate}
                  onChangeText={(text) => handleDateChange("startDate", text)}
                  maxLength={10}
                />
              </View>
              {formData.startDate && (
                <Text style={dateFormatStyle}>
                  {formatDate(formData.startDate)}
                </Text>
              )}
            </View>

            <View>
              <Text style={dateLabelStyle}>
                Data zakończenia *
              </Text>
              <View style={dateInputContainerStyle}>
                <Calendar size={20} color={colors.text.muted} />
                <TextInput
                  style={[textInputStyle, { marginLeft: spacing.sm }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={placeholderTextColor}
                  value={formData.endDate}
                  onChangeText={(text) => handleDateChange("endDate", text)}
                  maxLength={10}
                />
              </View>
              {formData.endDate && (
                <Text style={dateFormatStyle}>
                  {formatDate(formData.endDate)}
                </Text>
              )}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving || !isFormValid}
            style={[
              saveButtonStyle,
              { opacity: saving || !isFormValid ? 0.6 : 1 }
            ]}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={gradients.primary.colors}
              start={gradients.primary.start}
              end={gradients.primary.end}
              style={saveButtonGradientStyle}
            >
              <Save size={20} color={colors.text.primary} />
              <Text style={saveButtonTextStyle}>
                {saving ? "Zapisywanie..." : "Zapisz"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Toast */}
      {toastConfig && (
        <CustomToast
          visible={isVisible}
          type={toastConfig.type}
          title={toastConfig.title}
          message={toastConfig.message}
          onClose={hideToast}
          duration={toastConfig.duration}
        />
      )}
    </SafeAreaView>
    </View>
  );
}
