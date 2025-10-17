import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft } from "lucide-react-native";
import { Project } from "../utils/storage";
import { GlassmorphicView, StatusPill } from "./ui";
import { colors, gradients, typography, spacing, borderRadius, shadows, animations, components } from "../utils/theme";
import { useAccessibility } from "../hooks/useAccessibility";

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
  // Always visible - no entrance animations
  const headerAnim = useRef(new Animated.Value(1)).current;
  const tabAnim = useRef(new Animated.Value(1)).current;
  const backButtonAnim = useRef(new Animated.Value(1)).current;
  
  const { getAccessibilityProps } = useAccessibility();

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

  const headerTranslateY = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const headerOpacity = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const backButtonScale = backButtonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const backButtonOpacity = backButtonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const tabTranslateY = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 0],
  });

  const tabOpacity = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const tabs = [
    { key: "rooms" as TabType, label: "Pomieszczenia" },
    { key: "summary" as TabType, label: "Podsumowanie" },
    { key: "planner" as TabType, label: "Planer 2D" },
  ];

  // Add dynamic tabs for editor and calculator
  if (activeTab === "editor") {
    tabs.push({ key: "editor" as TabType, label: "Edytor" });
  }
  if (activeTab === "calculator") {
    tabs.push({ key: "calculator" as TabType, label: "Kalkulator" });
  }

  return (
    <GlassmorphicView
      intensity="medium"
      style={{
        borderBottomWidth: 1,
        borderBottomColor: colors.glass.border,
        ...shadows.lg,
      }}
    >
      <LinearGradient
                    colors={gradients.background.colors}
        start={gradients.background.start}
        end={gradients.background.end}
        style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.md }}
      >
        {/* Header Section */}
        <Animated.View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: spacing.md,
            transform: [{ translateY: headerTranslateY }],
            opacity: headerOpacity,
          }}
        >
          {/* Back Button with Glow Effect */}
          <Animated.View
            style={{
              transform: [{ scale: backButtonScale }],
              opacity: backButtonOpacity,
              marginRight: spacing.md,
            }}
          >
            <TouchableOpacity
              onPress={onBackPress}
              style={{
                ...components.touchTarget,
                padding: spacing.sm,
                borderRadius: borderRadius.full,
                backgroundColor: colors.glass.background,
                borderWidth: 1,
                borderColor: colors.glass.border,
                ...shadows.sm,
              }}
              activeOpacity={0.7}
              {...getAccessibilityProps('Powrót', 'Wróć do listy projektów')}
            >
              <ArrowLeft size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </Animated.View>

          {/* Project Info */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.sizes.xl,
                fontWeight: typography.weights.bold,
                fontFamily: typography.fonts.primary,
                marginBottom: spacing.xs,
              }}
              numberOfLines={1}
            >
              {project.name}
            </Text>
            
            {/* Status with Premium Pill */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <StatusPill
                status={statusConfig.type}
                label={statusConfig.label}
                style={{ marginRight: spacing.sm }}
              />
            </View>
          </View>
        </Animated.View>

        {/* Tab Navigation */}
        <Animated.View
          style={{
            transform: [{ translateY: tabTranslateY }],
            opacity: tabOpacity,
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: spacing.md }}
          >
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              {tabs.map((tab, index) => {
                const isActive = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    onPress={() => onTabChange(tab.key)}
                    style={{
                      paddingVertical: spacing.sm,
                      paddingHorizontal: spacing.md,
                      borderRadius: borderRadius.full,
                      backgroundColor: isActive 
                        ? colors.primary.start + '20' 
                        : 'transparent',
                      borderWidth: 1,
                      borderColor: isActive 
                        ? colors.primary.start 
                        : colors.glass.border,
                      minWidth: 100,
                      alignItems: 'center',
                      ...components.touchTarget,
                      ...shadows.sm,
                    }}
                    activeOpacity={0.7}
                    {...getAccessibilityProps(
                      `Przełącz na ${tab.label}`,
                      `Otwórz zakładkę ${tab.label}`
                    )}
                  >
                    <Text
                      style={{
                        color: isActive 
                          ? colors.primary.start 
                          : colors.text.tertiary,
                        fontSize: typography.sizes.sm,
                        fontWeight: isActive 
                          ? typography.weights.semibold 
                          : typography.weights.medium,
                        fontFamily: typography.fonts.primary,
                        textAlign: 'center',
                      }}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </Animated.View>
      </LinearGradient>
    </GlassmorphicView>
  );
} 