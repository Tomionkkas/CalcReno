import React, { useState, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react-native';
import { HapticFeedback } from './HapticFeedback';

const { width } = Dimensions.get('window');

interface AuthInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  type: 'email' | 'password' | 'name';
  error?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}

export function AuthInput({
  placeholder,
  value,
  onChangeText,
  type,
  error,
  autoCapitalize = 'none',
  autoCorrect = false,
  keyboardType = 'default',
}: AuthInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Animation values
  const focusAnim = useSharedValue(0);
  const errorAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1);

  // Get icon based on input type
  const getIcon = () => {
    switch (type) {
      case 'email':
        return Mail;
      case 'password':
        return Lock;
      case 'name':
        return User;
      default:
        return Mail;
    }
  };

  const IconComponent = getIcon();

  // Enhanced focus/blur animations
  const handleFocus = () => {
    setIsFocused(true);
    focusAnim.value = withSpring(1, { 
      damping: 12, 
      stiffness: 180,
      mass: 0.8,
    });
    scaleAnim.value = withSpring(1.03, { 
      damping: 10, 
      stiffness: 200,
      mass: 0.6,
    });
    HapticFeedback.lightImpact();
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusAnim.value = withSpring(0, { 
      damping: 15, 
      stiffness: 150,
      mass: 1,
    });
    scaleAnim.value = withSpring(1, { 
      damping: 12, 
      stiffness: 180,
      mass: 0.8,
    });
  };

  // Handle password toggle
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    HapticFeedback.lightImpact();
  };

  // Enhanced error state animation
  React.useEffect(() => {
    if (error) {
      errorAnim.value = withSequence(
        withSpring(1, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 15, stiffness: 150 })
      );
      HapticFeedback.error();
    } else {
      errorAnim.value = withSpring(0, { 
        damping: 12, 
        stiffness: 180,
        mass: 0.8,
      });
    }
  }, [error]);

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolate(
      focusAnim.value,
      [0, 1],
      ['rgba(108, 99, 255, 0.3)', 'rgba(108, 99, 255, 0.8)'],
      Extrapolate.CLAMP
    );

    const shadowOpacity = interpolate(
      focusAnim.value,
      [0, 1],
      [0.1, 0.3],
      Extrapolate.CLAMP
    );

    const shadowRadius = interpolate(
      focusAnim.value,
      [0, 1],
      [8, 16],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale: scaleAnim.value }],
      borderColor,
      shadowOpacity,
      shadowRadius,
    };
  });

  const errorAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: errorAnim.value,
      transform: [
        {
          translateX: interpolate(
            errorAnim.value,
            [0, 1],
            [-10, 0],
            Extrapolate.CLAMP
          ),
        },
      ],
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    const iconColor = interpolate(
      focusAnim.value,
      [0, 1],
      ['rgba(255, 255, 255, 0.6)', 'rgba(108, 99, 255, 1)'],
      Extrapolate.CLAMP
    );

    return {
      color: iconColor,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.inputContainer, containerAnimatedStyle]}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Animated.View style={iconAnimatedStyle}>
            <IconComponent size={20} color="currentColor" />
          </Animated.View>
        </View>

        {/* Input Field */}
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={type === 'password' && !showPassword}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          keyboardType={keyboardType}
          returnKeyType="next"
          accessible={true}
          accessibilityLabel={`${placeholder} input field`}
          accessibilityHint={`Enter your ${placeholder.toLowerCase()}`}
          accessibilityRole="text"
          accessibilityState={{ 
            disabled: false,
            invalid: !!error,
          }}
          textContentType={type === 'email' ? 'emailAddress' : type === 'password' ? 'password' : 'name'}
          autoComplete={type === 'email' ? 'email' : type === 'password' ? 'password' : 'name'}
        />

        {/* Password Toggle */}
        {type === 'password' && (
          <Pressable
            style={styles.toggleButton}
            onPress={togglePasswordVisibility}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessible={true}
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            accessibilityHint="Double tap to toggle password visibility"
            accessibilityRole="button"
            accessibilityState={{ disabled: false }}
          >
            {showPassword ? (
              <EyeOff size={20} color="rgba(255, 255, 255, 0.6)" />
            ) : (
              <Eye size={20} color="rgba(255, 255, 255, 0.6)" />
            )}
          </Pressable>
        )}
      </Animated.View>

      {/* Error Message */}
      {error && (
        <Animated.View style={[styles.errorContainer, errorAnimatedStyle]}>
          <Text 
            style={styles.errorText}
            accessible={true}
            accessibilityLabel={`Error: ${error}`}
            accessibilityRole="alert"
          >
            {error}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 33, 57, 0.8)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#6C63FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginRight: 12,
    width: 24,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 0,
  },
  toggleButton: {
    padding: 4,
    marginLeft: 8,
  },
  errorContainer: {
    marginTop: 8,
    marginLeft: 20,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '500',
  },
});
