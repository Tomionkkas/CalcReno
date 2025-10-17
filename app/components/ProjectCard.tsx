import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Pin, Edit2, Trash2, Calendar, CheckCircle } from "lucide-react-native";
import ProjectExportButton from "./ProjectExportButton";
import { GlassmorphicView, StatusPill } from "./ui";
import { colors, gradients, typography, spacing, borderRadius, shadows, animations, components } from "../utils/theme";
import { useAccessibility } from "../hooks/useAccessibility";
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
  // Professional approach: Start visible (1), animate if enabled
  const cardAnim = useRef(new Animated.Value(1)).current;
  const pinGlowAnim = useRef(new Animated.Value(0)).current;
  const actionButtonAnim = useRef(new Animated.Value(0)).current;
  
  const { getAnimationDuration, shouldDisableAnimations, getAccessibilityProps } = useAccessibility();
  const hasAnimated = useRef(false);

  // Animate card on mount (respect accessibility preferences)
  useEffect(() => {
    if (hasAnimated.current) return; // Only animate once
    hasAnimated.current = true;

    if (shouldDisableAnimations()) {
      // Already visible - do nothing
      return;
    }
    
    // Reset to 0, then animate to 1 for smooth entrance
    cardAnim.setValue(0);
    
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: getAnimationDuration('normal'),
      useNativeDriver: true,
    }).start();
  }, [shouldDisableAnimations, getAnimationDuration]);

  // Instant pin glow - no animation
  useEffect(() => {
    pinGlowAnim.setValue(project.isPinned ? 0.3 : 0);
  }, [project.isPinned]);

  const cardTranslateY = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const cardOpacity = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const pinGlowOpacity = pinGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.5], // More subtle glow
  });

  // Status mapping
  const getStatusConfig = (status: string) => {
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

  const statusConfig = getStatusConfig(project.status);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Animated.View
      style={{
        transform: [{ translateY: cardTranslateY }],
        opacity: cardOpacity,
        marginBottom: spacing.md,
      }}
    >
      <GlassmorphicView
        intensity="medium"
        style={{
          borderRadius: borderRadius.lg,
          overflow: "hidden",
          ...shadows.lg,
        }}
      >
        <LinearGradient
                      colors={gradients.card.colors}
          start={gradients.card.start}
          end={gradients.card.end}
          style={{ padding: spacing.md }}
        >
          {/* Header Section */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              {/* Status Pill */}
              <StatusPill
                status={statusConfig.type}
                label={statusConfig.label}
                style={{ marginRight: spacing.sm }}
              />
              
              {/* Project Title */}
              <Text
                style={{
                  color: colors.text.primary,
                  fontWeight: 'bold',
                  fontSize: typography.sizes.lg,
                  flex: 1,
                  fontFamily: typography.fonts.primary,
                }}
                numberOfLines={1}
              >
                {project.name}
              </Text>
            </View>

            {/* Pin Button with Glow Effect */}
            <View style={{ position: 'relative' }}>
              {project.isPinned && (
                <Animated.View
                  style={{
                    position: 'absolute',
                    top: -2,
                    left: -2,
                    right: -2,
                    bottom: -2,
                    borderRadius: borderRadius.full,
                    backgroundColor: colors.primary.glow,
                    opacity: pinGlowOpacity,
                    shadowColor: colors.primary.glow,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.3, // Reduced shadow opacity
                    shadowRadius: 4, // Smaller shadow radius
                    elevation: 2, // Lower elevation
                  }}
                />
              )}
              <TouchableOpacity
                onPress={() => onPin(project.id, !project.isPinned)}
                style={{
                  ...components.touchTarget,
                  padding: spacing.sm,
                  borderRadius: borderRadius.full,
                }}
                activeOpacity={0.7}
                {...getAccessibilityProps(
                  project.isPinned ? 'Odpiń projekt' : 'Przypnij projekt',
                  project.isPinned ? 'Usuń projekt z przypiętych' : 'Przypnij projekt do góry listy'
                )}
              >
                <Pin
                  size={20}
                  color={project.isPinned ? colors.primary.start : colors.text.muted}
                  fill={project.isPinned ? colors.primary.start : "transparent"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Timeline-style Date Chips */}
          <View style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.xs }}>
              <Calendar size={16} color={colors.text.muted} style={{ marginRight: spacing.xs }} />
              <Text style={{ 
                color: colors.text.muted, 
                fontSize: typography.sizes.sm,
                fontWeight: '500',
                fontFamily: typography.fonts.primary,
              }}>
                Harmonogram
              </Text>
            </View>
            
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {/* Start Date Chip */}
              <View style={{
                backgroundColor: colors.glass.background,
                borderWidth: 1,
                borderColor: colors.glass.border,
                borderRadius: borderRadius.md,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                marginRight: spacing.sm,
                flex: 1,
              }}>
                <Text style={{
                  color: colors.text.tertiary,
                  fontSize: typography.sizes.xs,
                  fontWeight: 500,
                  fontFamily: typography.fonts.primary,
                  marginBottom: 2,
                }}>
                  Rozpoczęcie
                </Text>
                <Text style={{
                  color: colors.text.primary,
                  fontSize: typography.sizes.sm,
                  fontWeight: 600,
                  fontFamily: typography.fonts.primary,
                }}>
                  {formatDate(project.startDate)}
                </Text>
              </View>

              {/* End Date Chip */}
              <View style={{
                backgroundColor: colors.glass.background,
                borderWidth: 1,
                borderColor: colors.glass.border,
                borderRadius: borderRadius.md,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                flex: 1,
              }}>
                <Text style={{
                  color: colors.text.tertiary,
                  fontSize: typography.sizes.xs,
                  fontWeight: 500,
                  fontFamily: typography.fonts.primary,
                  marginBottom: 2,
                }}>
                  Zakończenie
                </Text>
                <Text style={{
                  color: colors.text.primary,
                  fontSize: typography.sizes.sm,
                  fontWeight: 600,
                  fontFamily: typography.fonts.primary,
                }}>
                  {formatDate(project.endDate)}
                </Text>
              </View>
            </View>
          </View>

          {/* Export Button */}
          <ProjectExportButton project={project} />

          {/* Action Buttons */}
          <View style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            paddingTop: spacing.sm,
            borderTopWidth: 1,
            borderTopColor: colors.glass.border,
            marginTop: spacing.sm,
          }}>
            {/* Edit Button - Premium Pill Design */}
            <TouchableOpacity
              onPress={() => onEdit(project.id)}
              style={{
                flexDirection: "row",
                backgroundColor: colors.primary.start + '20',
                borderWidth: 1,
                borderColor: colors.primary.start,
                borderRadius: borderRadius.full,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
                marginRight: spacing.sm,
                ...components.touchTarget,
                ...shadows.sm,
              }}
              activeOpacity={0.7}
              {...getAccessibilityProps('Edytuj projekt', 'Otwórz edycję projektu')}
            >
              <Edit2 size={16} color={colors.primary.start} style={{ marginRight: spacing.xs }} />
              <Text style={{
                color: colors.primary.start,
                fontSize: typography.sizes.sm,
                fontWeight: 500,
                fontFamily: typography.fonts.primary,
              }}>
                Edytuj
              </Text>
            </TouchableOpacity>

            {/* Delete Button - Premium Pill Design */}
            <TouchableOpacity
              onPress={() => onDelete(project.id)}
              style={{
                flexDirection: "row",
                backgroundColor: colors.status.error.start + '20',
                borderWidth: 1,
                borderColor: colors.status.error.start,
                borderRadius: borderRadius.full,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
                ...components.touchTarget,
                ...shadows.sm,
              }}
              activeOpacity={0.7}
              {...getAccessibilityProps('Usuń projekt', 'Usuń projekt z listy')}
            >
              <Trash2 size={16} color={colors.status.error.start} style={{ marginRight: spacing.xs }} />
              <Text style={{
                color: colors.status.error.start,
                fontSize: typography.sizes.sm,
                fontWeight: 500,
                fontFamily: typography.fonts.primary,
              }}>
                Usuń
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </GlassmorphicView>
    </Animated.View>
  );
};

export default ProjectCard;
