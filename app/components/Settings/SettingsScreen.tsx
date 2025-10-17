import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, Alert, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Settings } from 'lucide-react-native';
import { AccountSection } from './AccountSection';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, gradients, typography, spacing, borderRadius, shadows } from '../../utils/theme';
import { useAccessibility } from '../../hooks/useAccessibility';

// Get screen dimensions for responsive design
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenWidth < 380;
const isLargeScreen = screenWidth > 500;

interface SettingsScreenProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsScreen({ visible, onClose }: SettingsScreenProps) {
  const { getAccessibilityProps } = useAccessibility();

  // Responsive styling values
  const responsiveStyles = {
    headerPadding: isSmallScreen ? spacing.sm : isLargeScreen ? spacing.lg : spacing.md,
    modalPadding: isSmallScreen ? spacing.sm : isLargeScreen ? spacing.lg : spacing.md,
    titleFontSize: isSmallScreen ? typography.sizes.xl : isLargeScreen ? typography.sizes.xl + 4 : typography.sizes.xl + 2,
    iconSize: isSmallScreen ? 24 : isLargeScreen ? 32 : 28,
    maxWidth: isLargeScreen ? 600 : screenWidth - (spacing.md * 2),
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={['top', 'left', 'right', 'bottom']}>
        <LinearGradient
          colors={gradients.background.colors}
          start={gradients.background.start}
          end={gradients.background.end}
          style={{ flex: 1 }}
        >
          {/* Header with Glassmorphic Design */}
          <LinearGradient
            colors={gradients.background.colors}
            start={gradients.background.start}
            end={gradients.background.end}
            style={{
              paddingHorizontal: responsiveStyles.headerPadding,
              paddingVertical: spacing.lg,
              paddingTop: Platform.OS === 'ios' ? spacing.sm : spacing.lg,
              borderBottomWidth: 1,
              borderBottomColor: colors.background.card,
              minHeight: 110,
              justifyContent: 'center',
            }}
          >
            {/* Main Header Content */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              {/* Left Section - Title with Icon */}
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center',
                flex: 1,
                marginRight: spacing.sm,
              }}>
                <View style={{
                  backgroundColor: colors.primary.start + '20',
                  borderRadius: borderRadius.md,
                  padding: spacing.xs,
                  marginRight: spacing.sm,
                  borderWidth: 1,
                  borderColor: colors.primary.start + '30',
                }}>
                  <Settings 
                    size={responsiveStyles.iconSize} 
                    color={colors.primary.start} 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    color: colors.text.primary,
                    fontSize: responsiveStyles.titleFontSize,
                    fontWeight: typography.weights.bold,
                    fontFamily: typography.fonts.primary,
                  }}>
                    Ustawienia
                  </Text>
                  <Text style={{
                    color: colors.text.tertiary,
                    fontSize: typography.sizes.sm,
                    fontFamily: typography.fonts.primary,
                    marginTop: spacing.xs / 2,
                  }}>
                    Zarządzaj swoim kontem
                  </Text>
                </View>
              </View>

              {/* Right Section - Close Button */}
              <TouchableOpacity
                onPress={onClose}
                style={{
                  backgroundColor: colors.glass.background,
                  borderWidth: 1,
                  borderColor: colors.glass.border,
                  borderRadius: borderRadius.md,
                  padding: spacing.sm,
                  ...shadows.md,
                }}
                activeOpacity={0.7}
                {...getAccessibilityProps('Zamknij ustawienia', 'Zamknij panel ustawień')}
              >
                <X size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Content */}
          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={{ 
              paddingHorizontal: responsiveStyles.modalPadding,
              paddingBottom: spacing.xl + 8,
              alignItems: 'center',
            }}
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="automatic"
          >
            <View style={{
              width: '100%',
              maxWidth: responsiveStyles.maxWidth,
            }}>
              <AccountSection />
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );
} 