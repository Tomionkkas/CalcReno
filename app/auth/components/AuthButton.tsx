import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HapticFeedback } from './enhanced/HapticFeedback';

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function AuthButton({ 
  title, 
  onPress, 
  loading = false, 
  disabled = false,
  variant = 'primary' 
}: AuthButtonProps) {
  const isDisabled = disabled || loading;

  const getButtonStyle = () => {
    const baseStyle = {
      height: 56,
      borderRadius: 12,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginBottom: 16,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          shadowColor: isDisabled ? undefined : '#6C63FF',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDisabled ? 0 : 0.3,
          shadowRadius: 8,
          elevation: isDisabled ? 0 : 4,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: '#2A2D4A',
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
        };
      default:
        return baseStyle;
    }
  };

  const getGradientColors = () => {
    if (isDisabled) {
      return ['#6B7280', '#6B7280'];
    }

    switch (variant) {
      case 'primary':
        return ['#6C63FF', '#4DABF7'];
      case 'secondary':
        return ['#2A2D4A', '#2A2D4A'];
      case 'ghost':
        return ['transparent', 'transparent'];
      default:
        return ['#6C63FF', '#4DABF7'];
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
        return '#B8BCC8';
      case 'ghost':
        return '#B8BCC8';
      default:
        return '#FFFFFF';
    }
  };

  const getTextStyle = () => ({
    color: getTextColor(),
    fontSize: 16,
    fontWeight: '600' as const,
  });

  const handlePress = () => {
    if (!isDisabled) {
      HapticFeedback.buttonPress();
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        getButtonStyle(),
        {
          opacity: pressed ? 0.8 : 1,
        }
      ]}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={getGradientColors()}
          style={{
            height: 56,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: isDisabled ? undefined : '#6C63FF',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDisabled ? 0 : 0.3,
            shadowRadius: 8,
            elevation: isDisabled ? 0 : 4,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={getTextStyle()}>{title}</Text>
          )}
        </LinearGradient>
      ) : (
        <>
          {loading ? (
            <ActivityIndicator color={getTextColor()} size="small" />
          ) : (
            <Text style={getTextStyle()}>{title}</Text>
          )}
        </>
      )}
    </Pressable>
  );
}
