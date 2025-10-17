import React, { useEffect, useRef } from "react";
import { View, TextInput, TouchableOpacity, Animated } from "react-native";
import { Search, Filter, SortDesc } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GlassmorphicView } from "../ui";
import { colors, gradients, typography, spacing, borderRadius, shadows, animations, components } from "../../utils/theme";
import { useAccessibility } from "../../hooks/useAccessibility";

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  filterVisible: boolean;
  sortVisible: boolean;
  onFilterPress: () => void;
  onSortPress: () => void;
}

export default function SearchFilterBar({
  searchQuery,
  onSearchChange,
  filterVisible,
  sortVisible,
  onFilterPress,
  onSortPress,
}: SearchFilterBarProps) {
  // Professional approach: Start visible (1), animate if enabled
  const searchBarAnim = useRef(new Animated.Value(1)).current;
  const filterGlowAnim = useRef(new Animated.Value(0)).current;
  const sortGlowAnim = useRef(new Animated.Value(0)).current;
  
  const { getAnimationDuration, shouldDisableAnimations, getAccessibilityProps } = useAccessibility();
  const hasAnimated = useRef(false);

  // Animate search bar on mount (respect accessibility preferences)
  useEffect(() => {
    if (hasAnimated.current) return; // Only animate once
    hasAnimated.current = true;

    if (shouldDisableAnimations()) {
      // Already visible - do nothing
      return;
    }
    
    // Reset to 0, then animate to 1 for smooth entrance
    searchBarAnim.setValue(0);
    
    Animated.timing(searchBarAnim, {
      toValue: 1,
      duration: getAnimationDuration('normal'),
      useNativeDriver: true,
    }).start();
  }, [shouldDisableAnimations, getAnimationDuration]);

  // Animate filter button glow when active (respect accessibility preferences)
  useEffect(() => {
    if (shouldDisableAnimations()) {
      filterGlowAnim.setValue(filterVisible ? 0.5 : 0);
      return;
    }
    
    Animated.timing(filterGlowAnim, {
      toValue: filterVisible ? 1 : 0,
      duration: getAnimationDuration('fast'),
      useNativeDriver: false,
    }).start();
  }, [filterVisible, shouldDisableAnimations, getAnimationDuration]);

  // Animate sort button glow when active (respect accessibility preferences)
  useEffect(() => {
    if (shouldDisableAnimations()) {
      sortGlowAnim.setValue(sortVisible ? 0.5 : 0);
      return;
    }
    
    Animated.timing(sortGlowAnim, {
      toValue: sortVisible ? 1 : 0,
      duration: getAnimationDuration('fast'),
      useNativeDriver: false,
    }).start();
  }, [sortVisible, shouldDisableAnimations, getAnimationDuration]);

  const searchBarTranslateY = searchBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const searchBarOpacity = searchBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const filterGlowOpacity = filterGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  const sortGlowOpacity = sortGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  return (
    <View
      style={{
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: 'transparent',
        marginTop: -12,
      }}
    >
      <Animated.View
        style={{
          transform: [{ translateY: searchBarTranslateY }],
          opacity: searchBarOpacity,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Floating Search Bar */}
          <GlassmorphicView
            intensity="medium"
            style={{
              flex: 1,
              borderRadius: borderRadius.full,
              marginRight: spacing.sm,
              ...shadows.lg,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                minHeight: 48,
              }}
            >
              <Search 
                size={20} 
                color={colors.text.muted} 
                style={{ marginRight: spacing.sm }}
              />
              <TextInput
                style={{ 
                  flex: 1, 
                  color: colors.text.primary, 
                  fontSize: typography.sizes.base,
                  fontFamily: typography.fonts.primary,
                  fontWeight: typography.weights.normal,
                }}
                placeholder="Szukaj projektu..."
                placeholderTextColor={colors.text.muted}
                value={searchQuery}
                onChangeText={onSearchChange}
              />
            </View>
          </GlassmorphicView>

          {/* Filter Button - Circular Glowing */}
          <View style={{ position: 'relative' }}>
            <Animated.View
              style={{
                position: 'absolute',
                top: -4,
                left: -4,
                right: -4,
                bottom: -4,
                borderRadius: borderRadius.full,
                backgroundColor: colors.primary.glow,
                opacity: filterGlowOpacity,
                shadowColor: colors.primary.glow,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 12,
                elevation: 8,
              }}
            />
            <TouchableOpacity
              onPress={onFilterPress}
              style={{
                ...components.touchTarget,
                borderRadius: borderRadius.full,
                backgroundColor: filterVisible 
                  ? colors.primary.start 
                  : colors.glass.background,
                borderWidth: 1,
                borderColor: filterVisible 
                  ? colors.primary.end 
                  : colors.glass.border,
                ...shadows.md,
              }}
              activeOpacity={0.7}
              {...getAccessibilityProps('Filtruj projekty', 'Otwórz opcje filtrowania')}
            >
              <Filter 
                size={20} 
                color={filterVisible ? colors.text.primary : colors.text.secondary} 
              />
            </TouchableOpacity>
          </View>

          {/* Sort Button - Circular Glowing */}
          <View style={{ position: 'relative', marginLeft: spacing.sm }}>
            <Animated.View
              style={{
                position: 'absolute',
                top: -4,
                left: -4,
                right: -4,
                bottom: -4,
                borderRadius: borderRadius.full,
                backgroundColor: colors.accent.purple,
                opacity: sortGlowOpacity,
                shadowColor: colors.accent.purple,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 12,
                elevation: 8,
              }}
            />
            <TouchableOpacity
              onPress={onSortPress}
              style={{
                ...components.touchTarget,
                borderRadius: borderRadius.full,
                backgroundColor: sortVisible 
                  ? colors.accent.purple 
                  : colors.glass.background,
                borderWidth: 1,
                borderColor: sortVisible 
                  ? colors.accent.purple 
                  : colors.glass.border,
                ...shadows.md,
              }}
              activeOpacity={0.7}
              {...getAccessibilityProps('Sortuj projekty', 'Otwórz opcje sortowania')}
            >
              <SortDesc 
                size={20} 
                color={sortVisible ? colors.text.primary : colors.text.secondary} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
