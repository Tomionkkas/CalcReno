import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, X, Mail, Lock, RefreshCw, HelpCircle, User } from 'lucide-react-native';
import { AuthErrorType, getErrorConfig } from '../services/authErrorHandler';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface AuthErrorModalProps {
  visible: boolean;
  onClose: () => void;
  errorType: AuthErrorType | null;
  customMessage?: string;
  onResendEmail?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
  email?: string;
}

export function AuthErrorModal({ 
  visible, 
  onClose, 
  errorType, 
  customMessage,
  onResendEmail,
  onResetPassword,
  onCreateAccount,
  email 
}: AuthErrorModalProps) {
  if (!visible || !errorType) {
    return null;
  }

  const config = getErrorConfig(errorType, email);

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
          {/* Close button */}
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
          >
            <X size={18} color="#B8BCC8" />
          </Pressable>

          {/* Error Icon */}
          <View style={styles.errorIconContainer}>
            <AlertTriangle size={36} color={config.iconColor} />
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {config.title}
          </Text>

          {/* Message */}
          <Text style={styles.message}>
            {config.message}
          </Text>

          {/* Suggestions */}
          <View style={styles.suggestionsContainer}>
            <View style={styles.suggestionsHeader}>
              <HelpCircle size={18} color="#3B82F6" />
              <Text style={styles.suggestionsTitle}>
                Wskazówki:
              </Text>
            </View>
            
            {config.suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionItem}>
                <Text style={styles.suggestionBullet}>•</Text>
                <Text style={styles.suggestionText}>
                  {suggestion}
                </Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {/* Primary Actions */}
            {(config.showResendEmail || config.showResetPassword || config.showCreateAccount) && (
              <View style={styles.actionButtonsRow}>
                {config.showResendEmail && onResendEmail && (
                  <Pressable
                    onPress={() => {
                      onClose();
                      onResendEmail();
                    }}
                    style={styles.actionButton}
                  >
                    <LinearGradient
                      colors={['rgba(59, 130, 246, 0.8)', 'rgba(37, 99, 235, 0.8)']}
                      style={styles.actionButtonGradient}
                    >
                      <Mail size={16} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>
                        Wyślij ponownie
                      </Text>
                    </LinearGradient>
                  </Pressable>
                )}

                {config.showCreateAccount && onCreateAccount && (
                  <Pressable
                    onPress={() => {
                      onClose();
                      onCreateAccount();
                    }}
                    style={styles.actionButton}
                  >
                    <LinearGradient
                      colors={['rgba(108, 99, 255, 0.8)', 'rgba(77, 171, 247, 0.8)']}
                      style={styles.actionButtonGradient}
                    >
                      <User size={16} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>
                        Utwórz konto
                      </Text>
                    </LinearGradient>
                  </Pressable>
                )}

                {config.showResetPassword && onResetPassword && (
                  <Pressable
                    onPress={() => {
                      onClose();
                      onResetPassword();
                    }}
                    style={styles.actionButton}
                  >
                    <LinearGradient
                      colors={['rgba(16, 185, 129, 0.8)', 'rgba(5, 150, 105, 0.8)']}
                      style={styles.actionButtonGradient}
                    >
                      <RefreshCw size={16} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>
                        Resetuj hasło
                      </Text>
                    </LinearGradient>
                  </Pressable>
                )}
              </View>
            )}

            {/* Close Button */}
            <Pressable
              onPress={onClose}
              style={styles.closeActionButton}
            >
              <Text style={styles.closeActionButtonText}>
                Rozumiem
              </Text>
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
    maxWidth: 420,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 24,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    backdropFilter: 'blur(20px)',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(55, 65, 81, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(184, 188, 200, 0.2)',
  },
  errorIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#B8BCC8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  suggestionsContainer: {
    width: '100%',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  suggestionBullet: {
    color: '#9CA3AF',
    fontSize: 14,
    marginRight: 8,
    lineHeight: 20,
  },
  suggestionText: {
    flex: 1,
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  closeActionButton: {
    width: '100%',
    backgroundColor: 'rgba(55, 65, 81, 0.6)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(184, 188, 200, 0.2)',
  },
  closeActionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
