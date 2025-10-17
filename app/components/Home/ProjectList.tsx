import React, { useRef } from "react";
import { View, FlatList, ActivityIndicator, Text, TouchableOpacity, RefreshControl, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Project } from "../../utils/storage";
import ProjectCard from "../ProjectCard";
import EmptyState from "./EmptyState";
import { colors, gradients, typography, spacing, shadows } from "../../utils/theme";
import { useAccessibility } from "../../hooks/useAccessibility";

interface ProjectListProps {
  projects: Project[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onEditProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onPinProject: (projectId: string) => void;
  onAddProject: () => void;
  insets: any;
}

export default function ProjectList({
  projects,
  loading,
  refreshing,
  onRefresh,
  onEditProject,
  onDeleteProject,
  onPinProject,
  onAddProject,
  insets,
}: ProjectListProps) {
  // Professional approach: Start visible (1), animate if enabled
  const listAnim = useRef(new Animated.Value(1)).current;
  const { shouldDisableAnimations, getAnimationDuration } = useAccessibility();
  const hasAnimated = useRef(false);

  React.useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    if (shouldDisableAnimations()) {
      // Already visible - do nothing
      return;
    }

    // Reset to 0, then animate to 1
    listAnim.setValue(0);
    Animated.timing(listAnim, {
      toValue: 1,
      duration: getAnimationDuration('normal'),
      useNativeDriver: true,
    }).start();
  }, [shouldDisableAnimations, getAnimationDuration]);

  if (loading) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <LinearGradient
          colors={gradients.background.colors}
          start={gradients.background.start}
          end={gradients.background.end}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: spacing.md,
            ...shadows.lg,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary.start} />
        </LinearGradient>
        <Text style={{ 
          color: colors.text.primary, 
          marginTop: spacing.md,
          fontSize: typography.sizes.base,
          fontWeight: '500',
          fontFamily: typography.fonts.primary,
        }}>
          Ładowanie projektów...
        </Text>
      </View>
    );
  }

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: listAnim,
        transform: [
          {
            translateY: listAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
      }}
    >
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: insets.bottom + 80,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.start]}
            tintColor={colors.primary.start}
            progressBackgroundColor={colors.glass.background}
          />
        }
        ListEmptyComponent={<EmptyState onAddProject={onAddProject} />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View
            style={{
              opacity: listAnim,
              transform: [
                {
                  translateY: listAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            }}
          >
            <TouchableOpacity
              onPress={() => onEditProject(item.id)}
              activeOpacity={0.9}
              style={{
                marginBottom: index === projects.length - 1 ? 0 : spacing.sm,
              }}
            >
              <ProjectCard
                project={item}
                onEdit={() => onEditProject(item.id)}
                onDelete={() => onDeleteProject(item.id)}
                onPin={() => onPinProject(item.id)}
              />
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </Animated.View>
  );
}
