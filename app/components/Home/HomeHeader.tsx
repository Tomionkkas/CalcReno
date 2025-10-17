import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Image, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LogOut, Bell } from "lucide-react-native";
import { NotificationCenter } from "../NotificationCenter";
import { GlassmorphicView } from "../ui";
import { colors, gradients, typography, spacing, borderRadius, shadows } from "../../utils/theme";
import { useAccessibility } from "../../hooks/useAccessibility";

interface HomeHeaderProps {
  user: any;
  isGuest: boolean;
  userProfile: any;
  onSettingsPress: () => void;
  onLogoutPress: () => void;
}

export default function HomeHeader({ 
  user, 
  isGuest, 
  userProfile, 
  onSettingsPress, 
  onLogoutPress 
}: HomeHeaderProps) {
  const logoGlowAnim = useRef(new Animated.Value(0)).current;
  const notificationPulseAnim = useRef(new Animated.Value(1)).current;
  const { getAccessibilityProps, shouldDisableAnimations, getAnimationDuration } = useAccessibility();

  // Animate logo glow on mount (respect accessibility preferences)
  useEffect(() => {
    if (shouldDisableAnimations()) {
      logoGlowAnim.setValue(0.3); // Static glow for reduced motion
      return;
    }
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoGlowAnim, {
          toValue: 1,
          duration: getAnimationDuration('slow'),
          useNativeDriver: false,
        }),
        Animated.timing(logoGlowAnim, {
          toValue: 0,
          duration: getAnimationDuration('slow'),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [shouldDisableAnimations, getAnimationDuration]);



  const logoGlowOpacity = logoGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <GlassmorphicView intensity="heavy" style={{ paddingTop: 8, paddingBottom: 12 }}>
      <LinearGradient
        colors={gradients.background.colors}
        start={gradients.background.start}
        end={gradients.background.end}
        style={{ 
          paddingHorizontal: spacing.md,
          minHeight: 110, // Slightly taller for better spacing
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
                 {/* Header right section - notifications and logout */}
         {(user || isGuest) && (
           <View style={{
             position: "absolute",
             top: 8,
             right: spacing.sm,
             zIndex: 10,
             alignItems: "flex-end",
             maxWidth: 180, // Slightly smaller to prevent overlap
           }}>
                         {!isGuest && user?.email && (
               <Text style={{
                 color: colors.text.tertiary,
                 fontSize: typography.sizes.xs,
                 marginBottom: spacing.xs,
                 opacity: 0.8,
                 fontFamily: typography.fonts.primary,
                 fontWeight: typography.weights.medium,
                 textAlign: 'right',
                 maxWidth: 150, // Limit text width
               }}>
                 {userProfile?.firstName && userProfile?.lastName 
                   ? `${userProfile.firstName} ${userProfile.lastName}`
                   : user.email}
               </Text>
             )}
            {isGuest && (
              <Text style={{
                color: colors.text.tertiary,
                fontSize: typography.sizes.xs,
                marginBottom: spacing.xs,
                opacity: 0.8,
                fontFamily: typography.fonts.primary,
                fontWeight: typography.weights.medium,
                textAlign: 'right',
              }}>
                Tryb offline
              </Text>
            )}
                         <View style={{ flexDirection: "row", alignItems: "center" }}>
               {/* Notification Center */}
               <NotificationCenter />
              
              {/* Logout Button */}
                             <TouchableOpacity
                 onPress={onLogoutPress}
                 style={{
                   backgroundColor: colors.glass.background,
                   borderWidth: 1,
                   borderColor: colors.glass.border,
                   borderRadius: borderRadius.md,
                   paddingVertical: spacing.xs,
                   paddingHorizontal: spacing.xs, // Reduced horizontal padding
                   flexDirection: "row",
                   alignItems: "center",
                   minHeight: 40, // Slightly smaller
                   minWidth: 40, // Slightly smaller
                   marginLeft: spacing.xs, // Reduced margin
                   ...shadows.md,
                 }}
                activeOpacity={0.7}
                {...getAccessibilityProps(
                  isGuest ? 'Wyjdź z aplikacji' : 'Wyloguj się',
                  isGuest ? 'Zamknij aplikację' : 'Wyloguj się z konta'
                )}
              >
                <LogOut size={16} color={colors.text.secondary} style={{ marginRight: spacing.xs }} />
                <Text style={{
                  color: colors.text.secondary,
                  fontSize: typography.sizes.sm,
                  fontWeight: typography.weights.medium,
                  fontFamily: typography.fonts.primary,
                }}>
                  {isGuest ? "Wyjdź" : "Wyloguj"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
                 {/* Logo - Bigger and positioned to the left */}
         <View style={{ 
           position: "relative", 
           alignItems: "flex-start", // Align to the left
           paddingLeft: spacing.lg, // Reduced left padding
           flex: 1,
           justifyContent: "center",
           marginRight: 200, // Add right margin to prevent overlap
         }}>
           {/* Main Logo with Glow Effect */}
           <Animated.View
             style={{
               shadowColor: colors.primary.glow,
               shadowOffset: { width: 0, height: 0 },
               shadowOpacity: logoGlowOpacity,
               shadowRadius: 20,
               elevation: 10,
             }}
           >
             <Image
               source={require("../../../assets/images/calcreno-logo.png")}
               style={{
                 width: 450, // Bigger size
                 height: 120, // Proportional height
               }}
               resizeMode="contain"
             />
           </Animated.View>
         </View>
      </LinearGradient>
    </GlassmorphicView>
  );
}
