import React from "react";
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AlertTriangle, X } from "lucide-react-native";
import { colors, gradients, typography, spacing, borderRadius, shadows } from "../../utils/theme";

interface FeedbackDeleteModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function FeedbackDeleteModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
}: FeedbackDeleteModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          justifyContent: "center",
          alignItems: "center",
          padding: spacing.xl,
        }}
      >
        <LinearGradient
          colors={gradients.card.colors}
          start={gradients.card.start}
          end={gradients.card.end}
          style={{
            width: "100%",
            maxWidth: 400,
            borderRadius: borderRadius.xl,
            padding: spacing.xl,
            ...shadows.xl,
          }}
        >
          {/* Close Button */}
          <TouchableOpacity
            onPress={onCancel}
            disabled={loading}
            style={{
              position: "absolute",
              top: spacing.md,
              right: spacing.md,
              padding: spacing.xs,
              borderRadius: borderRadius.full,
              zIndex: 10,
            }}
            activeOpacity={0.7}
          >
            <X size={24} color={colors.text.secondary} />
          </TouchableOpacity>

          {/* Warning Icon */}
          <View
            style={{
              alignItems: "center",
              marginBottom: spacing.lg,
              marginTop: spacing.md,
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: `${colors.status.error.start}20`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle size={32} color={colors.status.error.start} />
            </View>
          </View>

          {/* Title */}
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.sizes.xl,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: spacing.sm,
              fontFamily: typography.fonts.primary,
            }}
          >
            {title}
          </Text>

          {/* Message */}
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.sizes.base,
              textAlign: "center",
              marginBottom: spacing.xl,
              lineHeight: typography.sizes.base * 1.5,
              fontFamily: typography.fonts.primary,
            }}
          >
            {message}
          </Text>

          {/* Warning Text */}
          <View
            style={{
              backgroundColor: `${colors.status.error.start}15`,
              borderLeftWidth: 3,
              borderLeftColor: colors.status.error.start,
              borderRadius: borderRadius.md,
              padding: spacing.md,
              marginBottom: spacing.xl,
            }}
          >
            <Text
              style={{
                color: colors.status.error.start,
                fontSize: typography.sizes.sm,
                fontFamily: typography.fonts.primary,
              }}
            >
              Ta akcja jest nieodwracalna. Wszystkie dane, pomieszczenia i kalkulacje zostaną trwale usunięte.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            {/* Cancel Button */}
            <TouchableOpacity
              onPress={onCancel}
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
                opacity: loading ? 0.5 : 1,
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

            {/* Delete Button */}
            <TouchableOpacity
              onPress={onConfirm}
              disabled={loading}
              style={{
                flex: 1,
                borderRadius: borderRadius.full,
                overflow: "hidden",
                opacity: loading ? 0.7 : 1,
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.status.error.start, colors.status.error.end]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingVertical: spacing.md,
                  alignItems: "center",
                  minHeight: 48,
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: spacing.xs,
                }}
              >
                {loading ? (
                  <ActivityIndicator color={colors.text.primary} />
                ) : (
                  <>
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontSize: typography.sizes.base,
                        fontWeight: "600",
                        fontFamily: typography.fonts.primary,
                      }}
                    >
                      Usuń feedback
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}
