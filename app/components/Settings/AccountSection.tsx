import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { User, Mail, Lock, Trash2, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChangeEmailModal } from './ChangeEmailModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { ProfileEditModal } from './ProfileEditModal';
import { DeleteAccountModal } from './DeleteAccountModal';
import { colors, gradients, typography, spacing, borderRadius, shadows } from '../../utils/theme';
import { useAccessibility } from '../../hooks/useAccessibility';

// Get screen dimensions for responsive design
const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 380;
const isLargeScreen = screenWidth > 500;

export function AccountSection() {
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  
  const { getAccessibilityProps } = useAccessibility();

  // Responsive styling values
  const responsiveStyles = {
    sectionPadding: isSmallScreen ? spacing.md : isLargeScreen ? spacing.xl : spacing.lg,
    itemPadding: isSmallScreen ? spacing.md : isLargeScreen ? spacing.lg : spacing.md,
    iconSize: isSmallScreen ? 20 : isLargeScreen ? 24 : 22,
    titleFontSize: isSmallScreen ? typography.sizes.lg : isLargeScreen ? typography.sizes.xl : typography.sizes.lg + 2,
    itemFontSize: isSmallScreen ? typography.sizes.base : isLargeScreen ? typography.sizes.lg : typography.sizes.base + 1,
  };

  const settingsItems = [
    {
      id: 'edit-profile',
      title: 'Edytuj profil',
      icon: User,
      iconColor: colors.primary.start,
      onPress: () => setShowEditProfile(true),
      accessibilityLabel: 'Edytuj profil użytkownika',
    },
    {
      id: 'change-email',
      title: 'Zmień email',
      icon: Mail,
      iconColor: colors.primary.start,
      onPress: () => setShowChangeEmail(true),
      accessibilityLabel: 'Zmień adres email',
    },
    {
      id: 'change-password',
      title: 'Zmień hasło',
      icon: Lock,
      iconColor: colors.primary.start,
      onPress: () => setShowChangePassword(true),
      accessibilityLabel: 'Zmień hasło do konta',
    },
    {
      id: 'delete-account',
      title: 'Usuń konto',
      icon: Trash2,
      iconColor: colors.status.error.start,
      onPress: () => setShowDeleteAccount(true),
      accessibilityLabel: 'Usuń konto użytkownika',
      isDestructive: true,
    },
  ];
  
  return (
    <View style={{ marginBottom: responsiveStyles.sectionPadding }}>
      {/* Section Header */}
      <View style={{
        marginBottom: spacing.md,
        paddingHorizontal: spacing.xs,
      }}>
        <Text style={{
          color: colors.text.primary,
          fontSize: responsiveStyles.titleFontSize,
          fontWeight: typography.weights.semibold,
          fontFamily: typography.fonts.primary,
        }}>
          Konto
        </Text>
        <Text style={{
          color: colors.text.tertiary,
          fontSize: typography.sizes.sm,
          fontFamily: typography.fonts.primary,
          marginTop: spacing.xs / 2,
        }}>
          Zarządzaj swoimi danymi i ustawieniami
        </Text>
      </View>
      
      {/* Settings Items */}
      <LinearGradient
        colors={gradients.card.colors}
        start={gradients.card.start}
        end={gradients.card.end}
        style={{
          borderRadius: borderRadius.lg,
          overflow: 'hidden',
          ...shadows.lg,
        }}
      >
        {settingsItems.map((item, index) => (
          <View key={item.id}>
            <TouchableOpacity
              onPress={item.onPress}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: responsiveStyles.itemPadding,
                backgroundColor: 'transparent',
                borderBottomWidth: index < settingsItems.length - 1 ? 1 : 0,
                borderBottomColor: colors.background.card + '40',
              }}
              activeOpacity={0.7}
              {...getAccessibilityProps(item.title, item.accessibilityLabel)}
            >
              {/* Icon Container */}
              <View style={{
                width: isSmallScreen ? 36 : 40,
                height: isSmallScreen ? 36 : 40,
                borderRadius: isSmallScreen ? 18 : 20,
                backgroundColor: item.iconColor + '15',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: spacing.sm,
                borderWidth: 1,
                borderColor: item.iconColor + '25',
                shadowColor: item.iconColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}>
                <item.icon size={responsiveStyles.iconSize} color={item.iconColor} />
              </View>
              
              {/* Content */}
              <View style={{ flex: 1 }}>
                <Text style={{
                  color: item.isDestructive ? colors.status.error.start : colors.text.primary,
                  fontSize: responsiveStyles.itemFontSize,
                  fontWeight: typography.weights.medium,
                  fontFamily: typography.fonts.primary,
                }}>
                  {item.title}
                </Text>
                {item.isDestructive && (
                  <Text style={{
                    color: colors.text.muted,
                    fontSize: typography.sizes.xs,
                    fontFamily: typography.fonts.primary,
                    marginTop: spacing.xs / 2,
                  }}>
                    Akcja nieodwracalna
                  </Text>
                )}
              </View>
              
              {/* Chevron */}
              <View style={{
                backgroundColor: colors.glass.background,
                borderRadius: borderRadius.sm,
                padding: spacing.xs,
                borderWidth: 1,
                borderColor: colors.glass.border,
              }}>
                <ChevronRight 
                  size={16} 
                  color={item.isDestructive ? colors.status.error.start : colors.text.secondary} 
                />
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </LinearGradient>

      {/* Modals */}
      <ProfileEditModal
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
      />
      
      <ChangeEmailModal
        visible={showChangeEmail}
        onClose={() => setShowChangeEmail(false)}
      />
      
      <ChangePasswordModal
        visible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
      
      <DeleteAccountModal
        visible={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
      />
    </View>
  );
} 