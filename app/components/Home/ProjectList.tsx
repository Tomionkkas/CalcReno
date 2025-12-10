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
  onStatusChange?: (projectId: string) => void;
  insets: any;
}

// OPTIMIZATION: Memo the entire component to prevent unnecessary re-renders
export default React.memo(function ProjectList({
  projects,
  loading,
  refreshing,
  onRefresh,
  onEditProject,
  onDeleteProject,
  onPinProject,
  onAddProject,
  onStatusChange,
  insets,
}: ProjectListProps) {
  const { shouldDisableAnimations, getAnimationDuration } = useAccessibility();

  // OPTIMIZATION: Memoize callback functions to prevent re-creating them on every render
  const renderItem = React.useCallback(({ item }: { item: Project }) => (
    <TouchableOpacity
      onPress={() => onEditProject(item.id)}
      activeOpacity={0.9}
    >
      <ProjectCard
        project={item}
        onEdit={() => onEditProject(item.id)}
        onDelete={() => onDeleteProject(item.id)}
        onPin={() => onPinProject(item.id)}
        onStatusChange={onStatusChange ? () => onStatusChange(item.id) : undefined}
      />
    </TouchableOpacity>
  ), [onEditProject, onDeleteProject, onPinProject, onStatusChange]);

  // OPTIMIZATION: Use keyExtractor function to ensure stable keys
  const keyExtractor = React.useCallback((item: Project) => item.id, []);

  // OPTIMIZATION: Memoize ListEmptyComponent to prevent re-creating it
  const ListEmptyComponent = React.useMemo(() => (
    <EmptyState onAddProject={onAddProject} />
  ), [onAddProject]);

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
    <View style={{ flex: 1 }}>
      <FlatList
        data={projects}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
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
        ListEmptyComponent={ListEmptyComponent}
        showsVerticalScrollIndicator={false}
        // OPTIMIZATION: FlatList performance props for smooth scrolling
        removeClippedSubviews={true} // Unmount off-screen items to reduce memory
        maxToRenderPerBatch={10} // Render 10 items per batch for better perceived performance
        updateCellsBatchingPeriod={50} // Update interval for batching
        initialNumToRender={10} // Render first 10 items immediately
        windowSize={10} // Keep 10 viewports worth of items in memory
        getItemLayout={(data, index) => ({
          length: 200, // Approximate item height - adjust based on your actual card height
          offset: 200 * index,
          index,
        })}
      />
    </View>
  );
});
