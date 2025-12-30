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
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { X } from "lucide-react-native";
import { colors, gradients, typography, spacing, borderRadius } from "../../utils/theme";

interface CreateFeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string) => Promise<void>;
}

const TITLE_MIN = 3;
const TITLE_MAX = 200;
const DESCRIPTION_MIN = 10;
const DESCRIPTION_MAX = 2000;

export default function CreateFeedbackModal({ visible, onClose, onSubmit }: CreateFeedbackModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (title.trim().length < TITLE_MIN || title.trim().length > TITLE_MAX) {
      return;
    }
    if (description.trim().length < DESCRIPTION_MIN || description.trim().length > DESCRIPTION_MAX) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(title.trim(), description.trim());
      // Reset form
      setTitle("");
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTitle("");
      setDescription("");
      onClose();
    }
  };

  const isTitleValid = title.trim().length >= TITLE_MIN && title.trim().length <= TITLE_MAX;
  const isDescriptionValid = description.trim().length >= DESCRIPTION_MIN && description.trim().length <= DESCRIPTION_MAX;
  const isFormValid = isTitleValid && isDescriptionValid;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
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
              colors={gradients.card.colors}
              start={gradients.card.start}
              end={gradients.card.end}
              style={{
                width: "100%",
                maxWidth: 400,
                maxHeight: "90%",
                borderRadius: borderRadius.xl,
                padding: spacing.xl,
              }}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.lg }}>
                  <Text
                    style={{
                      color: colors.text.primary,
                      fontSize: typography.sizes.xl,
                      fontWeight: "bold",
                      fontFamily: typography.fonts.primary,
                    }}
                  >
                    Nowy Feedback
                  </Text>
                  <TouchableOpacity
                    onPress={handleClose}
                    disabled={loading}
                    style={{
                      padding: spacing.xs,
                      borderRadius: borderRadius.full,
                    }}
                    activeOpacity={0.7}
                  >
                    <X size={24} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>

                {/* Title Input */}
                <View style={{ marginBottom: spacing.md }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs }}>
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontSize: typography.sizes.base,
                        fontWeight: "600",
                        fontFamily: typography.fonts.primary,
                      }}
                    >
                      Tytuł *
                    </Text>
                    <Text
                      style={{
                        color: title.length > TITLE_MAX ? colors.status.error.start : colors.text.tertiary,
                        fontSize: typography.sizes.sm,
                        fontFamily: typography.fonts.primary,
                      }}
                    >
                      {title.length}/{TITLE_MAX}
                    </Text>
                  </View>
                  <TextInput
                    style={{
                      backgroundColor: colors.glass.background,
                      color: colors.text.primary,
                      padding: spacing.md,
                      borderRadius: borderRadius.md,
                      fontSize: typography.sizes.base,
                      fontFamily: typography.fonts.primary,
                      borderWidth: 1,
                      borderColor: title.length > 0 && !isTitleValid ? colors.status.error.start : colors.glass.border,
                    }}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Krótki, opisowy tytuł"
                    placeholderTextColor={colors.text.tertiary}
                    maxLength={TITLE_MAX}
                    editable={!loading}
                  />
                  {title.length > 0 && title.length < TITLE_MIN && (
                    <Text
                      style={{
                        color: colors.status.error.start,
                        fontSize: typography.sizes.xs,
                        marginTop: spacing.xs,
                        fontFamily: typography.fonts.primary,
                      }}
                    >
                      Minimalna długość: {TITLE_MIN} znaków
                    </Text>
                  )}
                </View>

                {/* Description Input */}
                <View style={{ marginBottom: spacing.xl }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xs }}>
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontSize: typography.sizes.base,
                        fontWeight: "600",
                        fontFamily: typography.fonts.primary,
                      }}
                    >
                      Opis *
                    </Text>
                    <Text
                      style={{
                        color: description.length > DESCRIPTION_MAX ? colors.status.error.start : colors.text.tertiary,
                        fontSize: typography.sizes.sm,
                        fontFamily: typography.fonts.primary,
                      }}
                    >
                      {description.length}/{DESCRIPTION_MAX}
                    </Text>
                  </View>
                  <TextInput
                    style={{
                      backgroundColor: colors.glass.background,
                      color: colors.text.primary,
                      padding: spacing.md,
                      borderRadius: borderRadius.md,
                      fontSize: typography.sizes.base,
                      fontFamily: typography.fonts.primary,
                      minHeight: 150,
                      borderWidth: 1,
                      borderColor: description.length > 0 && !isDescriptionValid ? colors.status.error.start : colors.glass.border,
                    }}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Opisz szczegółowo swoją opinię, sugestię lub problem..."
                    placeholderTextColor={colors.text.tertiary}
                    multiline
                    textAlignVertical="top"
                    maxLength={DESCRIPTION_MAX}
                    editable={!loading}
                  />
                  {description.length > 0 && description.length < DESCRIPTION_MIN && (
                    <Text
                      style={{
                        color: colors.status.error.start,
                        fontSize: typography.sizes.xs,
                        marginTop: spacing.xs,
                        fontFamily: typography.fonts.primary,
                      }}
                    >
                      Minimalna długość: {DESCRIPTION_MIN} znaków
                    </Text>
                  )}
                </View>

                {/* Action Buttons */}
                <View style={{ flexDirection: "row", gap: spacing.md }}>
                  {/* Cancel Button */}
                  <TouchableOpacity
                    onPress={handleClose}
                    disabled={loading}
                    style={{
                      flex: 1,
                      backgroundColor: colors.glass.background,
                      paddingVertical: spacing.md,
                      borderRadius: borderRadius.full,
                      borderWidth: 1,
                      borderColor: colors.glass.border,
                      alignItems: "center",
                      minHeight: 48,
                      justifyContent: "center",
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        color: colors.text.secondary,
                        fontSize: typography.sizes.base,
                        fontWeight: "600",
                        fontFamily: typography.fonts.primary,
                      }}
                    >
                      Anuluj
                    </Text>
                  </TouchableOpacity>

                  {/* Submit Button */}
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={!isFormValid || loading}
                    style={{
                      flex: 1,
                      borderRadius: borderRadius.full,
                      overflow: "hidden",
                      opacity: !isFormValid || loading ? 0.5 : 1,
                    }}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={gradients.primary.colors}
                      start={gradients.primary.start}
                      end={gradients.primary.end}
                      style={{
                        paddingVertical: spacing.md,
                        alignItems: "center",
                        minHeight: 48,
                        justifyContent: "center",
                      }}
                    >
                      {loading ? (
                        <ActivityIndicator color={colors.text.primary} />
                      ) : (
                        <Text
                          style={{
                            color: colors.text.primary,
                            fontSize: typography.sizes.base,
                            fontWeight: "600",
                            fontFamily: typography.fonts.primary,
                          }}
                        >
                          Wyślij
                        </Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </LinearGradient>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}
