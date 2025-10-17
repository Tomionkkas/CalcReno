import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming 
} from 'react-native-reanimated';
import { LinearGradient } from "expo-linear-gradient";
import { Plus, X, Home } from "lucide-react-native";
import { GlassmorphicView } from "./ui";
import { colors, gradients, typography, spacing, borderRadius, shadows, components } from "../utils/theme";
import { useAccessibility } from "../hooks/useAccessibility";

interface AddRoomModalProps {
  visible: boolean;
  roomName: string;
  onRoomNameChange: (name: string) => void;
  onClose: () => void;
  onCreate: () => void;
}

export default function AddRoomModal({
  visible,
  roomName,
  onRoomNameChange,
  onClose,
  onCreate,
}: AddRoomModalProps) {
  const modalOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.9);
  const contentOpacity = useSharedValue(0);
  
  const { shouldDisableAnimations, getAccessibilityProps } = useAccessibility();

  // Animate modal on visibility change with Reanimated
  useEffect(() => {
    if (visible) {
      const duration = shouldDisableAnimations() ? 0 : 250;
      modalOpacity.value = withTiming(1, { duration });
      contentScale.value = withTiming(1, { duration });
      contentOpacity.value = withTiming(1, { duration: duration + 50 });
    } else {
      const duration = shouldDisableAnimations() ? 0 : 200;
      modalOpacity.value = withTiming(0, { duration });
      contentScale.value = withTiming(0.9, { duration });
      contentOpacity.value = withTiming(0, { duration });
    }
  }, [visible, shouldDisableAnimations]);

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: contentScale.value }],
    opacity: contentOpacity.value,
  }));

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View
            style={[
              {
                flex: 1,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                justifyContent: "center",
                alignItems: "center",
                padding: spacing.lg,
              },
              modalAnimatedStyle
            ]}
          >
            <Animated.View
              style={[
                {
                  width: "100%",
                  maxWidth: 400,
                },
                contentAnimatedStyle
              ]}
            >
              <GlassmorphicView
                intensity="heavy"
                style={{
                  borderRadius: borderRadius.lg,
                  overflow: "hidden",
                  ...shadows.xl,
                }}
              >
                <LinearGradient
                  colors={gradients.card.colors}
                  start={gradients.card.start}
                  end={gradients.card.end}
                  style={{ padding: spacing.lg }}
                >
                  {/* Modal Header */}
                  <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: spacing.lg,
                    paddingBottom: spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.glass.border,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: borderRadius.full,
                        backgroundColor: colors.primary.start + '20',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: spacing.sm,
                      }}>
                        <Home size={20} color={colors.primary.start} />
                      </View>
                      <Text style={{
                        color: colors.text.primary,
                        fontSize: typography.sizes.xl,
                        fontWeight: 700,
                        fontFamily: typography.fonts.primary,
                      }}>
                        Nowe Pomieszczenie
                      </Text>
                    </View>
                    
                    <TouchableOpacity
                      onPress={onClose}
                      style={{
                        padding: spacing.sm,
                        borderRadius: borderRadius.full,
                        backgroundColor: colors.glass.background,
                        ...components.touchTarget,
                      }}
                      activeOpacity={0.7}
                      {...getAccessibilityProps('Zamknij', 'Zamknij okno dodawania pomieszczenia')}
                    >
                      <X size={20} color={colors.text.tertiary} />
                    </TouchableOpacity>
                  </View>

                  {/* Input Section */}
                  <View style={{ marginBottom: spacing.lg }}>
                    <Text style={{ 
                      color: colors.text.primary, 
                      marginBottom: spacing.sm, 
                      fontSize: typography.sizes.base,
                      fontWeight: 600,
                      fontFamily: typography.fonts.primary,
                    }}>
                      Nazwa pomieszczenia *
                    </Text>
                    
                    <GlassmorphicView
                      intensity="light"
                      style={{
                        borderRadius: borderRadius.md,
                        borderWidth: 1,
                        borderColor: colors.glass.border,
                        overflow: "hidden",
                      }}
                    >
                      <TextInput
                        style={{
                          backgroundColor: 'transparent',
                          color: colors.text.primary,
                          padding: spacing.md,
                          fontSize: typography.sizes.base,
                          fontFamily: typography.fonts.primary,
                        }}
                        value={roomName}
                        onChangeText={onRoomNameChange}
                        placeholder="np. Salon, Kuchnia, Sypialnia"
                        placeholderTextColor={colors.text.muted}
                        autoFocus
                        {...getAccessibilityProps('Nazwa pomieszczenia', 'Wprowadź nazwę nowego pomieszczenia')}
                      />
                    </GlassmorphicView>
                  </View>

                  {/* Info Text */}
                  <View style={{
                    backgroundColor: colors.primary.start + '10',
                    borderWidth: 1,
                    borderColor: colors.primary.start + '30',
                    borderRadius: borderRadius.md,
                    padding: spacing.md,
                    marginBottom: spacing.lg,
                    minHeight: 50,
                    justifyContent: 'center',
                  }}>
                    <Text style={{
                      color: colors.text.secondary,
                      fontSize: typography.sizes.sm,
                      fontFamily: typography.fonts.primary,
                      textAlign: "center",
                      lineHeight: 20,
                      includeFontPadding: false,
                      textAlignVertical: 'center',
                    }}>
                      Wymiary i kształt pomieszczenia będziesz mógł ustawić w edytorze
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  <View style={{ flexDirection: "row", gap: spacing.sm }}>
                    <TouchableOpacity
                      onPress={onClose}
                      style={{
                        flex: 1,
                        borderRadius: borderRadius.md,
                        backgroundColor: colors.glass.background,
                        borderWidth: 1,
                        borderColor: colors.glass.border,
                        paddingVertical: spacing.md,
                        paddingHorizontal: spacing.lg,
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 48,
                        ...shadows.sm,
                      }}
                      activeOpacity={0.8}
                      {...getAccessibilityProps('Anuluj', 'Anuluj dodawanie pomieszczenia')}
                    >
                      <Text style={{ 
                        color: colors.text.secondary, 
                        fontWeight: 600,
                        fontSize: typography.sizes.base,
                        fontFamily: typography.fonts.primary,
                      }}>
                        Anuluj
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={onCreate}
                      style={{
                        flex: 1,
                        borderRadius: borderRadius.md,
                        overflow: "hidden",
                        minHeight: 48,
                        ...shadows.md,
                      }}
                      activeOpacity={0.8}
                      {...getAccessibilityProps('Dodaj', 'Dodaj nowe pomieszczenie')}
                    >
                      <LinearGradient
                        colors={gradients.primary.colors}
                        start={gradients.primary.start}
                        end={gradients.primary.end}
                        style={{
                          flex: 1,
                          paddingVertical: spacing.md,
                          paddingHorizontal: spacing.lg,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Plus size={18} color={colors.text.primary} />
                        <Text style={{ 
                          color: colors.text.primary, 
                          fontWeight: 600,
                          fontSize: typography.sizes.base,
                          fontFamily: typography.fonts.primary,
                          marginLeft: spacing.sm,
                        }}>
                          Dodaj
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </GlassmorphicView>
            </Animated.View>
          </Animated.View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
} 