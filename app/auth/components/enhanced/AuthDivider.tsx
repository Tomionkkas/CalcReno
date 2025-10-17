import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface AuthDividerProps {
  text?: string;
  style?: any;
}

export function AuthDivider({ text = 'LUB', style }: AuthDividerProps) {
  const glowAnim = useSharedValue(0);

  React.useEffect(() => {
    glowAnim.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  const glowAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      glowAnim.value,
      [0, 1],
      [0.3, 0.7],
      Extrapolate.CLAMP
    );

    return {
      opacity,
    };
  });

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['transparent', 'rgba(108, 99, 255, 0.3)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.line}
      />
      
      {text && (
        <Animated.View style={[styles.textContainer, glowAnimatedStyle]}>
          <Text style={styles.text}>{text}</Text>
        </Animated.View>
      )}
      
      <LinearGradient
        colors={['transparent', 'rgba(108, 99, 255, 0.3)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.line}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
  },
  textContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(30, 33, 57, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
  },
  text: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

