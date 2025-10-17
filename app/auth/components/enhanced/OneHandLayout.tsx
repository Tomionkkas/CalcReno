import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface OneHandLayoutProps {
  children: React.ReactNode;
  position?: 'left' | 'right' | 'center';
  style?: any;
}

export function OneHandLayout({ 
  children, 
  position = 'center',
  style 
}: OneHandLayoutProps) {
  const insets = useSafeAreaInsets();

  // Calculate optimal positioning for one-hand use
  const getOneHandPosition = () => {
    const isLargeScreen = width > 400; // iPhone Plus/Pro Max size
    const isLandscape = width > height;
    
    if (isLandscape) {
      return {
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        paddingHorizontal: 40,
      };
    }

    switch (position) {
      case 'left':
        return {
          justifyContent: 'flex-start' as const,
          alignItems: 'flex-start' as const,
          paddingLeft: 20,
          paddingRight: isLargeScreen ? width * 0.3 : 20,
        };
      case 'right':
        return {
          justifyContent: 'flex-start' as const,
          alignItems: 'flex-end' as const,
          paddingLeft: isLargeScreen ? width * 0.3 : 20,
          paddingRight: 20,
        };
      default: // center
        return {
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
          paddingHorizontal: 20,
        };
    }
  };

  // Get optimal touch target sizes
  const getTouchTargetSize = () => {
    const isLargeScreen = width > 400;
    return {
      minHeight: isLargeScreen ? 56 : 48, // Larger touch targets on bigger screens
      minWidth: isLargeScreen ? 56 : 48,
    };
  };

  const layoutStyle = getOneHandPosition();
  const touchTargetSize = getTouchTargetSize();

  return (
    <View 
      style={[
        styles.container,
        layoutStyle,
        touchTargetSize,
        style,
        {
          paddingTop: insets.top + (Platform.OS === 'ios' ? 20 : 10),
          paddingBottom: insets.bottom + 20,
        }
      ]}
    >
      {children}
    </View>
  );
}

// Helper component for one-hand optimized buttons
interface OneHandButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
  disabled?: boolean;
}

export function OneHandButton({ 
  children, 
  onPress, 
  style,
  disabled = false 
}: OneHandButtonProps) {
  const isLargeScreen = width > 400;
  
  return (
    <View
      style={[
        styles.oneHandButton,
        {
          minHeight: isLargeScreen ? 56 : 48,
          minWidth: isLargeScreen ? 56 : 48,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      accessible={true}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityHint="Double tap to activate"
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  oneHandButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
  },
});
