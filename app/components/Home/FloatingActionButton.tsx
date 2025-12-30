import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence 
} from 'react-native-reanimated';
import { LinearGradient } from "expo-linear-gradient";
import { Plus, FolderPlus, Settings, MessageSquare } from "lucide-react-native";
import { colors, gradients, typography, spacing, borderRadius, shadows, animations, components } from "../../utils/theme";
import { useAccessibility } from "../../hooks/useAccessibility";

interface FloatingActionButtonProps {
  onPress: () => void;
  onSettingsPress?: () => void;
  onFeedbackPress?: () => void;
  insets: any;
}

export default function FloatingActionButton({ onPress, onSettingsPress, onFeedbackPress, insets }: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Reanimated v3 - works reliably in SDK 54
  const fabScale = useSharedValue(1);
  const fabRotate = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const menuItem1Opacity = useSharedValue(0);
  const menuItem2Opacity = useSharedValue(0);
  const menuItem3Opacity = useSharedValue(0);
  const menuItem1TranslateY = useSharedValue(60);
  const menuItem2TranslateY = useSharedValue(60);
  const menuItem3TranslateY = useSharedValue(60);
  
  const { getAnimationDuration, shouldDisableAnimations, getAccessibilityProps } = useAccessibility();

  // Animate glow effect on mount
  useEffect(() => {
    if (shouldDisableAnimations()) {
      glowOpacity.value = 0.5;
      return;
    }
    
    // Pulsing glow with Reanimated
    glowOpacity.value = withSequence(
      withTiming(1, { duration: 2000 }),
      withTiming(0.3, { duration: 2000 })
    );
    
    // Loop forever
    const interval = setInterval(() => {
      glowOpacity.value = withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0.3, { duration: 2000 })
      );
    }, 4000);
    
    return () => clearInterval(interval);
  }, [shouldDisableAnimations]);

  const handlePress = () => {
    const duration = shouldDisableAnimations() ? 0 : 200;
    
    if (isExpanded) {
      // Collapse menu
      fabScale.value = withTiming(1, { duration });
      fabRotate.value = withTiming(0, { duration });
      menuItem1Opacity.value = withTiming(0, { duration });
      menuItem2Opacity.value = withTiming(0, { duration });
      menuItem3Opacity.value = withTiming(0, { duration });
      menuItem1TranslateY.value = withTiming(60, { duration });
      menuItem2TranslateY.value = withTiming(60, { duration });
      menuItem3TranslateY.value = withTiming(60, { duration });

      setTimeout(() => setIsExpanded(false), duration);
    } else {
      // Expand menu
      setIsExpanded(true);
      fabScale.value = withTiming(1.1, { duration });
      fabRotate.value = withTiming(1, { duration });
      menuItem1Opacity.value = withTiming(1, { duration });
      menuItem2Opacity.value = withTiming(1, { duration });
      menuItem3Opacity.value = withTiming(1, { duration });
      menuItem1TranslateY.value = withTiming(0, { duration });
      menuItem2TranslateY.value = withTiming(0, { duration });
      menuItem3TranslateY.value = withTiming(0, { duration });
    }
  };

  // Animated styles using Reanimated
  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: fabScale.value },
      { rotate: `${fabRotate.value * 45}deg` }
    ],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value * 0.8 + 0.3,
  }));

  const menuItem1AnimatedStyle = useAnimatedStyle(() => ({
    opacity: menuItem1Opacity.value,
    transform: [{ translateY: menuItem1TranslateY.value }],
  }));

  const menuItem2AnimatedStyle = useAnimatedStyle(() => ({
    opacity: menuItem2Opacity.value,
    transform: [{ translateY: menuItem2TranslateY.value }],
  }));

  const menuItem3AnimatedStyle = useAnimatedStyle(() => ({
    opacity: menuItem3Opacity.value,
    transform: [{ translateY: menuItem3TranslateY.value }],
  }));

  const handleMenuItemPress = (action: string) => {
    const duration = shouldDisableAnimations() ? 0 : 200;
    
    // Collapse menu first
    fabScale.value = withTiming(1, { duration });
    fabRotate.value = withTiming(0, { duration });
    menuItem1Opacity.value = withTiming(0, { duration });
    menuItem2Opacity.value = withTiming(0, { duration });
    menuItem3Opacity.value = withTiming(0, { duration });
    menuItem1TranslateY.value = withTiming(60, { duration });
    menuItem2TranslateY.value = withTiming(60, { duration });
    menuItem3TranslateY.value = withTiming(60, { duration });

    setTimeout(() => {
      setIsExpanded(false);
      // Execute the action
      if (action === 'add-project') {
        onPress();
      } else if (action === 'settings' && onSettingsPress) {
        onSettingsPress();
      } else if (action === 'feedback' && onFeedbackPress) {
        onFeedbackPress();
      }
    }, duration);
  };


  return (
         <View style={{ position: "absolute", bottom: insets.bottom + 24, right: 24, zIndex: 9999 }}>
       {/* Radial Menu Items - Always rendered for smooth animation */}
                  {/* Menu Item 3 - Feedback */}
                      <Animated.View
                        pointerEvents={isExpanded ? 'auto' : 'none'}
                        style={[
                          {
                            position: "absolute",
                            bottom: 224,
                            right: 0,
                            zIndex: 1003,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                          },
                          menuItem3AnimatedStyle
                        ]}
                      >
                         <View style={{
                           backgroundColor: colors.glass.background,
                           paddingHorizontal: 14,
                           paddingVertical: 6,
                           borderRadius: 16,
                           marginRight: 12,
                           borderWidth: 1,
                           borderColor: colors.glass.border,
                           minWidth: 100,
                           ...shadows.md,
              }}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: colors.text.primary,
                    fontSize: typography.sizes.sm,
                    fontWeight: '600',
                    fontFamily: typography.fonts.primary,
                  }}>
                  Feedback
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleMenuItemPress('feedback')}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors.glass.background,
                  borderWidth: 1,
                  borderColor: colors.glass.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...shadows.lg,
                }}
                activeOpacity={0.7}
                {...getAccessibilityProps('Feedback', 'Otwórz stronę feedbacku')}
              >
                <MessageSquare size={24} color={colors.text.secondary} />
              </TouchableOpacity>
          </Animated.View>

           {/* Menu Item 1 - Add Project */}
           <Animated.View
             pointerEvents={isExpanded ? 'auto' : 'none'}
             style={[
               {
                 position: "absolute",
                 bottom: 152,
                 right: 0,
                 zIndex: 1002,
                 flexDirection: 'row',
                 alignItems: 'center',
                 justifyContent: 'flex-end',
               },
               menuItem1AnimatedStyle
             ]}
           >
                            <View style={{
                              backgroundColor: colors.glass.background,
                              paddingHorizontal: 14,
                              paddingVertical: 6,
                              borderRadius: 16,
                              marginRight: 12,
                              borderWidth: 1,
                              borderColor: colors.glass.border,
                              minWidth: 120,
                              ...shadows.md,
                            }}>
                              <Text
                                numberOfLines={1}
                                style={{
                                  color: colors.text.primary,
                                  fontSize: typography.sizes.sm,
                                  fontWeight: '600',
                                  fontFamily: typography.fonts.primary,
                                }}>
                                Nowy projekt
                              </Text>
                            </View>
              <TouchableOpacity
                onPress={() => handleMenuItemPress('add-project')}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors.glass.background,
                  borderWidth: 1,
                  borderColor: colors.glass.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...shadows.lg,
                }}
                activeOpacity={0.7}
                {...getAccessibilityProps('Nowy projekt', 'Dodaj nowy projekt remontowy')}
              >
                <FolderPlus size={24} color={colors.text.secondary} />
              </TouchableOpacity>
          </Animated.View>

           {/* Menu Item 2 - Settings */}
           <Animated.View
             pointerEvents={isExpanded ? 'auto' : 'none'}
             style={[
               {
                 position: "absolute",
                 bottom: 80,
                 right: 0,
                 zIndex: 1002,
                 flexDirection: 'row',
                 alignItems: 'center',
                 justifyContent: 'flex-end',
               },
               menuItem2AnimatedStyle
             ]}
           >
              <View style={{
                backgroundColor: colors.glass.background,
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 16,
                marginRight: 12,
                borderWidth: 1,
                borderColor: colors.glass.border,
                minWidth: 100,
                ...shadows.md,
              }}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: colors.text.primary,
                    fontSize: typography.sizes.sm,
                    fontWeight: '600',
                    fontFamily: typography.fonts.primary,
                  }}>
                  Ustawienia
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleMenuItemPress('settings')}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors.glass.background,
                  borderWidth: 1,
                  borderColor: colors.glass.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...shadows.lg,
                }}
                activeOpacity={0.7}
                {...getAccessibilityProps('Ustawienia', 'Otwórz ustawienia aplikacji')}
              >
                <Settings size={24} color={colors.text.secondary} />
              </TouchableOpacity>
          </Animated.View>

      {/* Main FAB with Glow Effect */}
      <View style={{ position: 'relative', zIndex: 1000 }}>
        {/* Glow Effect */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: -8,
              left: -8,
              right: -8,
              bottom: -8,
              borderRadius: borderRadius.full,
              backgroundColor: colors.primary.glow,
              shadowColor: colors.primary.glow,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 16,
              elevation: 5,
            },
            glowAnimatedStyle
          ]}
        />
        
        {/* Main FAB */}
        <Animated.View style={fabAnimatedStyle}>
          <TouchableOpacity
            onPress={handlePress}
            style={{
              ...components.touchTarget,
              borderRadius: borderRadius.full,
              overflow: "hidden",
              ...shadows.xl,
            }}
            activeOpacity={0.8}
            {...getAccessibilityProps(
              isExpanded ? 'Zamknij menu' : 'Menu akcji', 
              isExpanded ? 'Zamknij menu opcji' : 'Otwórz menu z opcjami'
            )}
          >
            <LinearGradient
              colors={gradients.fab.colors}
              start={gradients.fab.start}
              end={gradients.fab.end}
              style={{
                width: 64,
                height: 64,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={28} color={colors.text.primary} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
