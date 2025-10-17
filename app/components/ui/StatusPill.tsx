import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, typography, spacing, borderRadius } from '../../utils/theme';

interface StatusPillProps {
  status: 'planned' | 'inProgress' | 'completed' | 'paused';
  label: string;
  style?: ViewStyle;
  glow?: boolean;
}

export default function StatusPill({ status, label, style, glow = true }: StatusPillProps) {
  // Define status configurations directly to avoid circular dependency
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'planned':
        return {
          gradient: gradients.primary,
          glow: colors.status.info.glow,
        };
      case 'inProgress':
        return {
          gradient: gradients.warning,
          glow: colors.status.warning.glow,
        };
      case 'completed':
        return {
          gradient: gradients.success,
          glow: colors.status.success.glow,
        };
      case 'paused':
        return {
          gradient: gradients.error,
          glow: colors.status.error.glow,
        };
      default:
        return {
          gradient: gradients.primary,
          glow: colors.status.info.glow,
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={statusConfig.gradient.colors}
        start={statusConfig.gradient.start}
        end={statusConfig.gradient.end}
        style={[
          styles.pill,
          glow && {
            shadowColor: statusConfig.glow,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 8,
            elevation: 8,
          },
        ]}
      >
        <Text style={styles.text}>{label}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    minHeight: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: typography.sizes.xs,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
