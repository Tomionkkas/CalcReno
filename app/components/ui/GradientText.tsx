import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { colors, gradients, typography } from '../../utils/theme';

interface GradientTextProps extends TextProps {
  children: React.ReactNode;
  gradient?: 'primary' | 'success' | 'warning' | 'error';
  size?: keyof typeof typography.sizes;
  weight?: keyof typeof typography.weights;
  glow?: boolean;
}

export default function GradientText({
  children,
  gradient = 'primary',
  size = 'base',
  weight = 'normal',
  glow = false,
  style,
  ...props
}: GradientTextProps) {
  const gradientConfig = gradients[gradient];
  const textStyle = {
    fontSize: typography.sizes[size],
    fontWeight: typography.weights[weight],
    ...(glow && {
      textShadowColor: colors.primary.glow,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
    }),
  };

  return (
    <MaskedView
      maskElement={
        <Text style={[styles.text, textStyle, style]} {...props}>
          {children}
        </Text>
      }
    >
      <LinearGradient
        colors={gradientConfig.colors}
        start={gradientConfig.start}
        end={gradientConfig.end}
        style={styles.gradient}
      />
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  text: {
    color: colors.text.primary,
    fontFamily: typography.fonts.primary,
  },
  gradient: {
    flex: 1,
  },
});
