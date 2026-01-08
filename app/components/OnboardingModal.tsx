import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  Dimensions,
  ScrollView,
  Platform,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Sparkles,
  Calculator,
  LayoutGrid,
  Zap,
  ArrowRight,
  X
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';

interface OnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateProject: () => void;
  userName?: string;
}

const { height, width } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function OnboardingModal({ visible, onClose, onCreateProject, userName }: OnboardingModalProps) {
  const insets = useSafeAreaInsets();
  const isSmallScreen = height < 700;

  // Animation values
  const iconScale = useSharedValue(0);
  const iconRotate = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);
  const buttonScale = useSharedValue(1);

  const features = [
    {
      icon: Calculator,
      title: 'Kalkulacja materiałów',
      description: 'Oblicz dokładne koszty remontu',
      color: '#22C55E',
      bgColor: 'rgba(34, 197, 94, 0.15)',
      borderColor: 'rgba(34, 197, 94, 0.3)',
    },
    {
      icon: LayoutGrid,
      title: 'Wizualizacja pomieszczeń',
      description: 'Narysuj plan swoich pomieszczeń',
      color: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.15)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    {
      icon: Zap,
      title: 'Integracja z RenoTimeline',
      description: 'Synchronizuj projekty w chmurze',
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.15)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
    }
  ];

  useEffect(() => {
    if (visible) {
      // Reset and start animations
      iconScale.value = 0;
      iconRotate.value = 0;

      // Icon entrance animation
      iconScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 100 }));
      iconRotate.value = withDelay(200, withSpring(360, { damping: 15, stiffness: 80 }));

      // Pulsing glow effect
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [visible]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotate.value}deg` },
    ],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: interpolate(glowOpacity.value, [0.3, 0.6], [1, 1.2]) }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Animated.View
            entering={FadeInUp.duration(400).springify()}
            style={styles.modalContainer}
          >
            <LinearGradient
              colors={['#1A1D35', '#252849']}
              style={[styles.modalGradient, { padding: isSmallScreen ? 24 : 32 }]}
            >
              {/* Close button */}
              <Pressable style={styles.closeButton} onPress={onClose}>
                <X size={18} color="#6B7280" />
              </Pressable>

              {/* Animated Icon with Glow */}
              <View style={styles.iconWrapper}>
                <Animated.View style={[styles.glowCircle, glowAnimatedStyle]} />
                <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
                  <LinearGradient
                    colors={['#6C63FF', '#8B5CF6', '#A855F7']}
                    style={styles.iconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Sparkles size={isSmallScreen ? 32 : 40} color="#FFFFFF" />
                  </LinearGradient>
                </Animated.View>
              </View>

              {/* Welcome Text */}
              <Animated.View
                entering={FadeInDown.delay(300).duration(400)}
                style={styles.headerContainer}
              >
                <Text style={[styles.welcomeText, { fontSize: isSmallScreen ? 14 : 15 }]}>
                  WITAJ W CALCRENO
                </Text>
                <Text style={[styles.titleText, { fontSize: isSmallScreen ? 26 : 30 }]}>
                  {userName ? `Cześć, ${userName}!` : 'Zaczynamy!'}
                </Text>
                <Text style={styles.subtitleText}>
                  Stwórz swój pierwszy projekt i odkryj wszystkie możliwości aplikacji
                </Text>
              </Animated.View>

              {/* Features */}
              <View style={styles.featuresContainer}>
                {features.map((feature, index) => (
                  <Animated.View
                    key={index}
                    entering={FadeInDown.delay(450 + index * 100).duration(400)}
                    style={[
                      styles.featureCard,
                      {
                        backgroundColor: feature.bgColor,
                        borderColor: feature.borderColor,
                      }
                    ]}
                  >
                    <View style={[styles.featureIconContainer, { backgroundColor: feature.bgColor }]}>
                      <feature.icon size={20} color={feature.color} />
                    </View>
                    <View style={styles.featureTextContainer}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                  </Animated.View>
                ))}
              </View>

              {/* CTA Button */}
              <Animated.View
                entering={FadeInUp.delay(750).duration(400)}
                style={styles.ctaContainer}
              >
                <AnimatedPressable
                  onPress={onCreateProject}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  style={[styles.ctaButton, buttonAnimatedStyle]}
                >
                  <LinearGradient
                    colors={['#6C63FF', '#8B5CF6']}
                    style={styles.ctaGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.ctaText}>Stwórz projekt</Text>
                    <View style={styles.ctaArrow}>
                      <ArrowRight size={18} color="#FFFFFF" />
                    </View>
                  </LinearGradient>
                </AnimatedPressable>

                <Pressable onPress={onClose} style={styles.skipButton}>
                  <Text style={styles.skipText}>Pomiń na razie</Text>
                </Pressable>
              </Animated.View>

              {/* Bottom decoration */}
              <View style={styles.bottomDecoration}>
                <View style={[styles.decorDot, { backgroundColor: '#6C63FF' }]} />
                <View style={[styles.decorDot, { backgroundColor: '#8B5CF6', opacity: 0.6 }]} />
                <View style={[styles.decorDot, { backgroundColor: '#A855F7', opacity: 0.3 }]} />
              </View>
            </LinearGradient>
          </Animated.View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  modalGradient: {
    borderRadius: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  glowCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#6C63FF',
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: 'hidden',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  iconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  welcomeText: {
    color: '#8B5CF6',
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  titleText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitleText: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 28,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  ctaContainer: {
    width: '100%',
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginRight: 8,
  },
  ctaArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  skipText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomDecoration: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  decorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
