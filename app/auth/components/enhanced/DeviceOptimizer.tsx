import React from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface DeviceOptimizerProps {
  children: React.ReactNode;
  style?: any;
}

export function DeviceOptimizer({ children, style }: DeviceOptimizerProps) {
  // Device-specific optimizations
  const getDeviceOptimizations = () => {
    const isLargeScreen = width > 400; // iPhone Plus/Pro Max
    const isSmallScreen = width < 375; // iPhone SE
    const isLandscape = width > height;
    
    return {
      // Touch target sizes
      minTouchTarget: isLargeScreen ? 56 : isSmallScreen ? 44 : 48,
      
      // Font sizes
      baseFontSize: isLargeScreen ? 16 : isSmallScreen ? 14 : 15,
      largeFontSize: isLargeScreen ? 18 : isSmallScreen ? 16 : 17,
      
      // Spacing
      baseSpacing: isLargeScreen ? 16 : isSmallScreen ? 12 : 14,
      largeSpacing: isLargeScreen ? 24 : isSmallScreen ? 18 : 20,
      
      // Border radius
      borderRadius: isLargeScreen ? 12 : isSmallScreen ? 8 : 10,
      
      // Platform-specific styles
      platformStyle: Platform.OS === 'ios' ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      } : {
        elevation: 4,
      },
    };
  };

  const optimizations = getDeviceOptimizations();

  return (
    <View 
      style={[
        styles.container,
        {
          minHeight: optimizations.minTouchTarget,
          paddingHorizontal: optimizations.baseSpacing,
          borderRadius: optimizations.borderRadius,
        },
        optimizations.platformStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
}

// Platform-specific input optimization
interface OptimizedInputProps {
  children: React.ReactNode;
  style?: any;
}

export function OptimizedInput({ children, style }: OptimizedInputProps) {
  const isLargeScreen = width > 400;
  
  return (
    <View
      style={[
        styles.inputContainer,
        {
          minHeight: isLargeScreen ? 56 : 48,
          paddingHorizontal: isLargeScreen ? 20 : 16,
          borderRadius: isLargeScreen ? 25 : 20,
        },
        Platform.OS === 'ios' ? {
          shadowColor: '#6C63FF',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        } : {
          elevation: 8,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// Platform-specific button optimization
interface OptimizedButtonProps {
  children: React.ReactNode;
  style?: any;
  disabled?: boolean;
}

export function OptimizedButton({ children, style, disabled = false }: OptimizedButtonProps) {
  const isLargeScreen = width > 400;
  
  return (
    <View
      style={[
        styles.buttonContainer,
        {
          minHeight: isLargeScreen ? 56 : 48,
          paddingHorizontal: isLargeScreen ? 32 : 24,
          borderRadius: isLargeScreen ? 25 : 20,
          opacity: disabled ? 0.5 : 1,
        },
        Platform.OS === 'ios' ? {
          shadowColor: '#6C63FF',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
        } : {
          elevation: 8,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(30, 33, 57, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
  },
  inputContainer: {
    backgroundColor: 'rgba(30, 33, 57, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
    justifyContent: 'center',
  },
  buttonContainer: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

