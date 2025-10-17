import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, X, Mail, Lock, RefreshCw, HelpCircle, User } from 'lucide-react-native';

interface AuthErrorModalProps {
  visible: boolean;
  onClose: () => void;
  errorType: 'invalid_credentials' | 'account_not_found' | 'user_exists' | 'invalid_email' | 'weak_password' | 'general' | null;
  customMessage?: string;
  onResendEmail?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
  email?: string;
}

const { height } = Dimensions.get('window');

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
  const getErrorConfig = () => {
    switch (errorType) {
      case 'invalid_credentials':
        return {
          title: 'Nieprawidłowe dane logowania',
          message: 'Email lub hasło jest niepoprawne.\nSprawdź wprowadzone dane i spróbuj ponownie.',
          icon: Lock,
          iconColor: '#EF4444',
          suggestions: [
            'Sprawdź czy email został wpisany poprawnie',
            'Upewnij się, że Caps Lock jest wyłączony',
            'Spróbuj zresetować hasło jeśli go nie pamiętasz'
          ],
          showResetPassword: true
        };

      case 'account_not_found':
        return {
          title: 'Konto nie istnieje',
          message: `Nie znaleziono konta z adresem ${email || 'podanym adresem email'}.\nMożesz utworzyć nowe konto lub sprawdzić adres email.`,
          icon: Mail,
          iconColor: '#F59E0B',
          suggestions: [
            'Sprawdź czy email został wpisany poprawnie',
            'Upewnij się, że nie ma literówek w adresie',
            'Spróbuj użyć innego adresu email',
            'Utwórz nowe konto jeśli nie masz jeszcze konta'
          ],
          showCreateAccount: true
        };
      case 'user_exists':
        return {
          title: 'Konto już istnieje',
          message: 'To konto zostało już utworzone.\nMożesz się zalogować lub zresetować hasło.',
          icon: Mail,
          iconColor: '#F59E0B',
          suggestions: [
            'Spróbuj się zalogować używając tego emaila',
            'Sprawdź folder spam w poszukiwaniu emaila potwierdzającego',
            'Zresetuj hasło jeśli go nie pamiętasz'
          ],
          showResendEmail: true,
          showResetPassword: true
        };
      case 'invalid_email':
        return {
          title: 'Nieprawidłowy email',
          message: 'Wprowadzony adres email ma niepoprawny format.\nSprawdź i popraw adres email.',
          icon: Mail,
          iconColor: '#EF4444',
          suggestions: [
            'Sprawdź czy email zawiera znak @',
            'Upewnij się, że nie ma literówek',
            'Przykład prawidłowego emaila: nazwa@domena.pl'
          ]
        };
      case 'weak_password':
        return {
          title: 'Hasło za słabe',
          message: 'Hasło musi spełniać wymagania bezpieczeństwa.\nUtwórz silniejsze hasło.',
          icon: Lock,
          iconColor: '#EF4444',
          suggestions: [
            'Hasło musi mieć co najmniej 6 znaków',
            'Użyj kombinacji liter, cyfr i symboli',
            'Unikaj prostych haseł jak "123456"'
          ]
        };
      default:
        return {
          title: 'Wystąpił błąd',
          message: customMessage || 'Coś poszło nie tak. Spróbuj ponownie.',
          icon: AlertTriangle,
          iconColor: '#EF4444',
          suggestions: [
            'Sprawdź połączenie z internetem',
            'Spróbuj ponownie za chwilę',
            'Skontaktuj się z pomocą techniczną jeśli problem się powtarza'
          ]
        };
    }
  };

  if (!visible || !errorType) {
    return null;
  }

  const config = getErrorConfig();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingHorizontal: 24,
      }}>
        <LinearGradient
          colors={['#1E2139', '#2A2D4A']}
          style={{
            width: '100%',
            maxWidth: 420,
            borderRadius: 20,
            padding: 32,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'rgba(239, 68, 68, 0.3)',
            shadowColor: '#EF4444',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          {/* Close button */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              padding: 8,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
            onPress={onClose}
          >
            <X size={20} color="#B8BCC8" />
          </TouchableOpacity>

          {/* Error Icon */}
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            borderWidth: 2,
            borderColor: 'rgba(239, 68, 68, 0.4)',
          }}>
            <config.icon size={40} color={config.iconColor} />
          </View>

          {/* Title */}
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#FFFFFF',
            textAlign: 'center',
            marginBottom: 16,
          }}>
            {config.title}
          </Text>

          {/* Message */}
          <Text style={{
            fontSize: 16,
            color: '#B8BCC8',
            textAlign: 'center',
            lineHeight: 24,
            marginBottom: 24,
          }}>
            {config.message}
          </Text>

          {/* Suggestions */}
          <View style={{
            width: '100%',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: 'rgba(59, 130, 246, 0.2)',
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            }}>
              <HelpCircle size={20} color="#3B82F6" style={{ marginRight: 8 }} />
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#3B82F6',
              }}>
                Wskazówki:
              </Text>
            </View>
            
            {config.suggestions.map((suggestion, index) => (
              <View key={index} style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginBottom: index < config.suggestions.length - 1 ? 8 : 0,
              }}>
                <Text style={{
                  color: '#9CA3AF',
                  fontSize: 14,
                  marginRight: 8,
                  lineHeight: 20,
                }}>
                  •
                </Text>
                <Text style={{
                  flex: 1,
                  color: '#9CA3AF',
                  fontSize: 14,
                  lineHeight: 20,
                }}>
                  {suggestion}
                </Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={{ width: '100%' }}>
            {/* Primary Actions */}
            {(config.showResendEmail || config.showResetPassword || config.showCreateAccount) && (
              <View style={{
                flexDirection: 'row',
                gap: 12,
                marginBottom: 16,
              }}>
                {config.showResendEmail && onResendEmail && (
                  <TouchableOpacity
                    onPress={() => {
                      onClose();
                      onResendEmail();
                    }}
                    style={{
                      flex: 1,
                      borderRadius: 12,
                      overflow: 'hidden',
                    }}
                  >
                    <LinearGradient
                      colors={['#3B82F6', '#2563EB']}
                      style={{
                        paddingVertical: 14,
                        paddingHorizontal: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                      }}
                    >
                      <Mail size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={{
                        color: '#FFFFFF',
                        fontSize: 14,
                        fontWeight: '600',
                      }}>
                        Wyślij ponownie
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                {config.showCreateAccount && onCreateAccount && (
                  <TouchableOpacity
                    onPress={() => {
                      onClose();
                      onCreateAccount();
                    }}
                    style={{
                      flex: 1,
                      borderRadius: 12,
                      overflow: 'hidden',
                    }}
                  >
                    <LinearGradient
                      colors={['#6C63FF', '#4DABF7']}
                      style={{
                        paddingVertical: 14,
                        paddingHorizontal: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                      }}
                    >
                      <User size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={{
                        color: '#FFFFFF',
                        fontSize: 14,
                        fontWeight: '600',
                      }}>
                        Utwórz konto
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                {config.showResetPassword && onResetPassword && (
                  <TouchableOpacity
                    onPress={() => {
                      onClose();
                      onResetPassword();
                    }}
                    style={{
                      flex: 1,
                      borderRadius: 12,
                      overflow: 'hidden',
                    }}
                  >
                    <LinearGradient
                      colors={['#10B981', '#059669']}
                      style={{
                        paddingVertical: 14,
                        paddingHorizontal: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                      }}
                    >
                      <RefreshCw size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={{
                        color: '#FFFFFF',
                        fontSize: 14,
                        fontWeight: '600',
                      }}>
                        Resetuj hasło
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Close Button */}
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: '100%',
                backgroundColor: '#374151',
                borderRadius: 12,
                paddingVertical: 16,
                paddingHorizontal: 24,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#4B5563',
              }}
            >
              <Text style={{
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: '600',
              }}>
                Rozumiem
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
} 