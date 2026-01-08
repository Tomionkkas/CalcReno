import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WifiOff, HardDrive, X } from 'lucide-react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface GuestModeModalProps {
  visible: boolean;
  onClose: () => void;
  onContinueOffline: () => void;
}

export function GuestModeModal({ 
  visible, 
  onClose, 
  onContinueOffline 
}: GuestModeModalProps) {
  if (!visible) return null;

  return (
    <View style={styles.modalRoot}>
      <StatusBar backgroundColor="rgba(0, 0, 0, 0.8)" barStyle="light-content" />
      
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View 
          entering={FadeIn.duration(200)}
          style={styles.backdropAnimated}
        />
      </Pressable>

      {/* Modal Content */}
      <Animated.View 
        entering={SlideInDown.duration(300).springify()}
        style={styles.modalWrapper}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <WifiOff size={24} color="#FF9800" />
            </View>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
            >
              <X size={18} color="#B8BCC8" />
            </Pressable>
          </View>

          <Text style={styles.title}>
            Tryb offline
          </Text>

          <Text style={styles.description}>
            Możesz korzystać z aplikacji bez konta.{'\n'}
            Oto co warto wiedzieć:
          </Text>

          {/* Features List */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <HardDrive size={18} color="#22C55E" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>
                  Przechowywanie lokalne
                </Text>
                <Text style={styles.featureDescription}>
                  Twoje projekty będą zapisane tylko na tym urządzeniu
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <WifiOff size={18} color="#EF4444" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>
                  Brak synchronizacji
                </Text>
                <Text style={styles.featureDescription}>
                  Nie będzie możliwa integracja z RenoTimeline ani backup w chmurze
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                Zawsze możesz utworzyć konto później i migrować swoje projekty
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              onPress={onClose}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>
                Anuluj
              </Text>
            </Pressable>

            <Pressable
              onPress={onContinueOffline}
              style={styles.continueButton}
            >
              <LinearGradient
                colors={['rgba(108, 99, 255, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(168, 85, 247, 0.8)']}
                style={styles.continueButtonGradient}
              >
                <Text style={styles.continueButtonText} numberOfLines={1}>
                  Kontynuuj offline
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    elevation: 99999,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  backdropAnimated: {
    flex: 1,
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    ...Platform.select({
      android: {
        paddingTop: StatusBar.currentHeight || 0,
      },
    }),
  },
  modalContainer: {
    backgroundColor: 'rgba(30, 33, 57, 0.95)',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 24,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
    backdropFilter: 'blur(20px)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  iconContainer: {
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
  },
  closeButton: {
    backgroundColor: 'rgba(55, 65, 81, 0.6)',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(184, 188, 200, 0.2)',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    color: '#B8BCC8',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 28,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: 'rgba(42, 45, 74, 0.6)',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.1)',
  },
  featureIconContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderRadius: 12,
    padding: 8,
    marginRight: 14,
    marginTop: 2,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    color: '#22C55E',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  featureDescription: {
    color: '#B8BCC8',
    fontSize: 14,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: 'rgba(55, 65, 81, 0.4)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#6C63FF',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
  },
  infoText: {
    color: '#B8BCC8',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: 'rgba(55, 65, 81, 0.6)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(184, 188, 200, 0.2)',
    minWidth: 90,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  continueButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
