import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Image,
  Modal,
  TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useAuth } from '../hooks/useAuth';
import { AuthErrorModal } from '../components/AuthErrorModal';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Shield, 
  Smartphone, 
  Calendar,
  Bell,
  Calculator,
  Home,
  WifiOff,
  HardDrive,
  X,
  CheckCircle
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    type: 'invalid_credentials' | 'user_exists' | 'invalid_email' | 'weak_password' | 'general' | null;
    message?: string;
  }>({
    visible: false,
    type: null,
  });
  const { signIn, signUp, setGuestMode, resetPassword, resendConfirmation, showSignupSuccess, setShowSignupSuccess } = useAuth();

  const showError = (type: 'invalid_credentials' | 'user_exists' | 'invalid_email' | 'weak_password' | 'general', message?: string) => {
    setErrorModal({
      visible: true,
      type,
      message,
    });
  };

  const handleResendEmail = async () => {
    const { error: resendError } = await resendConfirmation(email);
    if (resendError) {
      showError('general', 'Nie udało się wysłać emaila potwierdzającego');
    } else {
      Alert.alert('Sukces', 'Email potwierdzający został wysłany ponownie');
    }
  };

  const handleResetPassword = async () => {
    const { error: resetError } = await resetPassword(email);
    if (resetError) {
      showError('general', 'Nie udało się wysłać emaila do resetowania hasła');
    } else {
      Alert.alert('Sukces', 'Link do resetowania hasła został wysłany na email');
    }
  };

  const handleAuth = async () => {
    // Validation
    if (!email || !password) {
      showError('general', 'Wprowadź email i hasło');
      return;
    }

    if (!isLogin && (!firstName || !lastName)) {
      showError('general', 'Wprowadź imię i nazwisko');
      return;
    }

    if (!email.includes('@')) {
      showError('invalid_email');
      return;
    }

    if (!isLogin && password.length < 6) {
      showError('weak_password');
      return;
    }

    setLoading(true);

    try {
      const result = isLogin
        ? await signIn(email, password)
        : await signUp(email, password, firstName, lastName);
      
      console.log('Auth result:', result);
      const { error } = result;

      if (error) {
        if (error.message === 'Invalid login credentials') {
          showError('invalid_credentials');
        } else if (error.message === 'User already registered' || error.message.includes('User already registered')) {
          showError('user_exists');
        } else {
          console.log('Auth error:', error);
          showError('general', error?.message || 'Wystąpił błąd podczas autoryzacji');
        }
      } else if (!isLogin) {
        // Success is now handled in the signUp function
        console.log('Signup completed successfully');
      }
    } catch (error) {
      showError('general', 'Wystąpił nieoczekiwany błąd');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    setShowGuestModal(true);
  };

  const benefits = [
    {
      icon: Shield,
      title: 'Bezpieczne przechowywanie',
      description: 'Twoje projekty są szyfrowane i bezpieczne'
    },
    {
      icon: Smartphone,
      title: 'Synchronizacja urządzeń',
      description: 'Dostęp do projektów z każdego urządzenia'
    },
    {
      icon: Calendar,
      title: 'Integracja z RenoTimeline',
      description: 'Planowanie projektów i harmonogramów'
    },
    {
      icon: Bell,
      title: 'Inteligentne powiadomienia',
      description: 'Otrzymuj przypomnienia i aktualizacje'
    }
  ];

  return (
    <LinearGradient
      colors={['#0A0B1E', '#151829', '#1E2139']}
      style={{ flex: 1 }}
    >
      <ExpoStatusBar style="light" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1, paddingHorizontal: 24 }}>
            {/* Header Section */}
            <View style={{ alignItems: 'center', marginTop: height * 0.08, marginBottom: 40 }}>
              <View style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                backgroundColor: 'rgba(108, 99, 255, 0.1)',
                borderWidth: 2,
                borderColor: 'rgba(108, 99, 255, 0.3)',
                shadowColor: '#6C63FF',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
                overflow: 'hidden',
              }}>
                <Image
                  source={require('../../assets/images/calculator-house.png')}
                  style={{
                    width: 80,
                    height: 80,
                  }}
                  resizeMode="contain"
                />
              </View>
              
              <Text style={{ 
                fontSize: 32, 
                fontWeight: 'bold', 
                color: '#FFFFFF',
                marginBottom: 8,
                textAlign: 'center'
              }}>
                CalcReno
              </Text>
              
              <Text style={{ 
                fontSize: 16, 
                color: '#B8BCC8',
                textAlign: 'center',
                lineHeight: 24
              }}>
                {isLogin 
                  ? 'Witaj ponownie! Zaloguj się aby kontynuować' 
                  : 'Utwórz konto i rozpocznij pierwszy projekt'
                }
              </Text>
            </View>

            {/* Form Section */}
            <View style={{ marginBottom: 32 }}>
              {/* Name Fields - Only show for registration */}
              {!isLogin && (
                <>
                  {/* First Name Input */}
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ 
                      color: '#B8BCC8', 
                      fontSize: 14, 
                      fontWeight: '500',
                      marginBottom: 8 
                    }}>
                      Imię
                    </Text>
                    <View style={{
                      backgroundColor: '#1E2139',
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: '#2A2D4A',
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      height: 56,
                    }}>
                      <User size={20} color="#6B7280" style={{ marginRight: 12 }} />
                      <TextInput
                        style={{
                          flex: 1,
                          color: '#FFFFFF',
                          fontSize: 16,
                          height: '100%',
                        }}
                        placeholder="Twoje imię"
                        placeholderTextColor="#6B7280"
                        value={firstName}
                        onChangeText={setFirstName}
                        autoCapitalize="words"
                        autoComplete="given-name"
                      />
                    </View>
                  </View>

                  {/* Last Name Input */}
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ 
                      color: '#B8BCC8', 
                      fontSize: 14, 
                      fontWeight: '500',
                      marginBottom: 8 
                    }}>
                      Nazwisko
                    </Text>
                    <View style={{
                      backgroundColor: '#1E2139',
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: '#2A2D4A',
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      height: 56,
                    }}>
                      <User size={20} color="#6B7280" style={{ marginRight: 12 }} />
                      <TextInput
                        style={{
                          flex: 1,
                          color: '#FFFFFF',
                          fontSize: 16,
                          height: '100%',
                        }}
                        placeholder="Twoje nazwisko"
                        placeholderTextColor="#6B7280"
                        value={lastName}
                        onChangeText={setLastName}
                        autoCapitalize="words"
                        autoComplete="family-name"
                      />
                    </View>
                  </View>
                </>
              )}

              {/* Email Input */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ 
                  color: '#B8BCC8', 
                  fontSize: 14, 
                  fontWeight: '500',
                  marginBottom: 8 
                }}>
                  Adres email
                </Text>
                <View style={{
                  backgroundColor: '#1E2139',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#2A2D4A',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  height: 56,
                }}>
                  <Mail size={20} color="#6B7280" style={{ marginRight: 12 }} />
                  <TextInput
                    style={{
                      flex: 1,
                      color: '#FFFFFF',
                      fontSize: 16,
                      height: '100%',
                    }}
                    placeholder="twoj@email.com"
                    placeholderTextColor="#6B7280"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ 
                  color: '#B8BCC8', 
                  fontSize: 14, 
                  fontWeight: '500',
                  marginBottom: 8 
                }}>
                  Hasło
                </Text>
                <View style={{
                  backgroundColor: '#1E2139',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#2A2D4A',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  height: 56,
                }}>
                  <Lock size={20} color="#6B7280" style={{ marginRight: 12 }} />
                  <TextInput
                    style={{
                      flex: 1,
                      color: '#FFFFFF',
                      fontSize: 16,
                      height: '100%',
                    }}
                    placeholder="Wprowadź hasło"
                    placeholderTextColor="#6B7280"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ padding: 4 }}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#6B7280" />
                    ) : (
                      <Eye size={20} color="#6B7280" />
                    )}
                  </Pressable>
                </View>
                {!isLogin && (
                  <Text style={{ 
                    color: '#6B7280', 
                    fontSize: 12, 
                    marginTop: 4 
                  }}>
                    Minimum 6 znaków
                  </Text>
                )}
              </View>

              {/* Main Action Button */}
              <Pressable
                onPress={handleAuth}
                disabled={loading}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.8 : 1,
                    marginBottom: 16,
                  }
                ]}
              >
                <LinearGradient
                  colors={loading ? ['#6B7280', '#6B7280'] : ['#6C63FF', '#4DABF7']}
                  style={{
                    height: 56,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#6C63FF',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: loading ? 0 : 0.3,
                    shadowRadius: 8,
                    elevation: loading ? 0 : 4,
                  }}
                >
                  <Text style={{ 
                    color: '#FFFFFF', 
                    fontSize: 16, 
                    fontWeight: '600' 
                  }}>
                    {loading
                      ? 'Przetwarzanie...'
                      : isLogin
                      ? 'Zaloguj się'
                      : 'Utwórz konto'}
                  </Text>
                </LinearGradient>
              </Pressable>

              {/* Switch Mode */}
              <Pressable
                onPress={() => setIsLogin(!isLogin)}
                style={{ alignItems: 'center', paddingVertical: 16 }}
              >
                <Text style={{ color: '#4DABF7', fontSize: 14, fontWeight: '500' }}>
                  {isLogin
                    ? 'Nie masz konta? Utwórz nowe'
                    : 'Masz już konto? Zaloguj się'}
                </Text>
              </Pressable>
            </View>

            {/* Divider */}
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              marginVertical: 24 
            }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#2A2D4A' }} />
              <Text style={{ 
                color: '#6B7280', 
                fontSize: 12, 
                marginHorizontal: 16,
                fontWeight: '500'
              }}>
                LUB
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#2A2D4A' }} />
            </View>

            {/* Guest Mode Button */}
            <Pressable
              onPress={handleGuestMode}
              style={({ pressed }) => [
                {
                  backgroundColor: 'transparent',
                  borderWidth: 2,
                  borderColor: '#2A2D4A',
                  borderRadius: 12,
                  height: 56,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 32,
                  opacity: pressed ? 0.7 : 1,
                }
              ]}
            >
              <Text style={{ 
                color: '#B8BCC8', 
                fontSize: 16, 
                fontWeight: '500' 
              }}>
                Kontynuuj bez konta
              </Text>
            </Pressable>

            {/* Benefits Section */}
            <View style={{ marginBottom: 32 }}>
              <Text style={{ 
                color: '#FFFFFF', 
                fontSize: 18, 
                fontWeight: '600',
                marginBottom: 20,
                textAlign: 'center'
              }}>
                Dlaczego warto założyć konto?
              </Text>
              
              <View style={{ gap: 16 }}>
                {benefits.map((benefit, index) => {
                  const IconComponent = benefit.icon;
                  return (
                    <View key={index} style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#1E2139',
                      padding: 16,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: '#2A2D4A',
                    }}>
                      <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: '#6C63FF20',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}>
                        <IconComponent size={20} color="#6C63FF" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ 
                          color: '#FFFFFF', 
                          fontSize: 14, 
                          fontWeight: '500',
                          marginBottom: 2
                        }}>
                          {benefit.title}
                        </Text>
                        <Text style={{ 
                          color: '#B8BCC8', 
                          fontSize: 12,
                          lineHeight: 16
                        }}>
                          {benefit.description}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Footer */}
            <View style={{ 
              alignItems: 'center', 
              paddingBottom: 32,
              marginTop: 'auto'
            }}>
              <Text style={{ 
                color: '#6B7280', 
                fontSize: 12,
                textAlign: 'center',
                lineHeight: 16
              }}>
                Tworząc konto akceptujesz nasze warunki{'\n'}
                użytkowania i politykę prywatności
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Guest Mode Modal */}
      <Modal
        visible={showGuestModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowGuestModal(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: 20
        }}>
          <View style={{
            backgroundColor: '#1E2139',
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
            elevation: 16,
          }}>
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20
            }}>
              <View style={{
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                borderRadius: 50,
                padding: 12,
              }}>
                <WifiOff size={28} color="#FF9800" />
              </View>
              <Pressable
                onPress={() => setShowGuestModal(false)}
                style={{
                  backgroundColor: '#374151',
                  borderRadius: 20,
                  padding: 8,
                }}
              >
                <X size={20} color="#B8BCC8" />
              </Pressable>
            </View>

            <Text style={{
              color: 'white',
              fontSize: 22,
              fontWeight: 'bold',
              marginBottom: 8,
              textAlign: 'center'
            }}>
              Tryb offline
            </Text>

            <Text style={{
              color: '#B8BCC8',
              fontSize: 15,
              lineHeight: 22,
              marginBottom: 24,
              textAlign: 'center'
            }}>
              Możesz korzystać z aplikacji bez konta.{'\n'}
              Oto co warto wiedzieć:
            </Text>

            {/* Features List */}
            <View style={{ marginBottom: 24 }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginBottom: 16,
                backgroundColor: '#2A2D4A',
                padding: 16,
                borderRadius: 12,
              }}>
                <View style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: 20,
                  padding: 8,
                  marginRight: 12,
                  marginTop: 2,
                }}>
                  <HardDrive size={16} color="#22C55E" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    color: '#22C55E',
                    fontSize: 14,
                    fontWeight: '600',
                    marginBottom: 4
                  }}>
                    Przechowywanie lokalne
                  </Text>
                  <Text style={{
                    color: '#B8BCC8',
                    fontSize: 13,
                    lineHeight: 18
                  }}>
                    Twoje projekty będą zapisane tylko na tym urządzeniu
                  </Text>
                </View>
              </View>

              <View style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginBottom: 16,
                backgroundColor: '#2A2D4A',
                padding: 16,
                borderRadius: 12,
              }}>
                <View style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: 20,
                  padding: 8,
                  marginRight: 12,
                  marginTop: 2,
                }}>
                  <WifiOff size={16} color="#EF4444" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    color: '#EF4444',
                    fontSize: 14,
                    fontWeight: '600',
                    marginBottom: 4
                  }}>
                    Brak synchronizacji
                  </Text>
                  <Text style={{
                    color: '#B8BCC8',
                    fontSize: 13,
                    lineHeight: 18
                  }}>
                    Nie będzie możliwa integracja z RenoTimeline ani backup w chmurze
                  </Text>
                </View>
              </View>

              <View style={{
                backgroundColor: '#374151',
                padding: 12,
                borderRadius: 8,
                borderLeftWidth: 3,
                borderLeftColor: '#6C63FF',
              }}>
                <Text style={{
                  color: '#B8BCC8',
                  fontSize: 12,
                  fontStyle: 'italic',
                  textAlign: 'center'
                }}>
                  💡 Zawsze możesz utworzyć konto później i migrować swoje projekty
                </Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={{
              flexDirection: 'row',
              gap: 12
            }}>
              <Pressable
                onPress={() => setShowGuestModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: '#374151',
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  alignItems: 'center'
                }}
              >
                <Text style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '600'
                }}>
                  Anuluj
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowGuestModal(false);
                  setGuestMode(true);
                }}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  overflow: 'hidden'
                }}
              >
                <LinearGradient
                  colors={['#FF9800', '#F57C00']}
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: '600'
                  }}>
                    Kontynuuj offline
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSignupSuccess}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSignupSuccess(false)}
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
              maxWidth: 400,
              borderRadius: 20,
              padding: 32,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(76, 175, 80, 0.3)',
              shadowColor: '#4CAF50',
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
              onPress={() => setShowSignupSuccess(false)}
            >
              <X size={20} color="#B8BCC8" />
            </TouchableOpacity>

            {/* Success Icon */}
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(76, 175, 80, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              borderWidth: 2,
              borderColor: 'rgba(76, 175, 80, 0.4)',
            }}>
              <CheckCircle size={40} color="#4CAF50" />
            </View>

            {/* Title */}
            <Text style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: '#FFFFFF',
              textAlign: 'center',
              marginBottom: 16,
            }}>
              Sukces! 🎉
            </Text>

            {/* Message */}
            <Text style={{
              fontSize: 16,
              color: '#B8BCC8',
              textAlign: 'center',
              lineHeight: 24,
              marginBottom: 32,
            }}>
              Twoje konto zostało utworzone!{'\n'}
              Sprawdź swoją skrzynkę email aby{'\n'}
              potwierdzić konto i dokończyć rejestrację.
            </Text>

            {/* Action Button */}
            <TouchableOpacity
              onPress={() => setShowSignupSuccess(false)}
              style={{
                width: '100%',
                borderRadius: 16,
                overflow: 'hidden',
              }}
            >
              <LinearGradient
                colors={['#4CAF50', '#45A049']}
                style={{
                  paddingVertical: 16,
                  paddingHorizontal: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 18,
                  fontWeight: '600',
                }}>
                  Świetnie!
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Additional Info */}
            <View style={{
              marginTop: 20,
              backgroundColor: 'rgba(108, 99, 255, 0.1)',
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: 'rgba(108, 99, 255, 0.2)',
            }}>
              <Text style={{
                fontSize: 14,
                color: '#9CA3AF',
                textAlign: 'center',
                lineHeight: 20,
              }}>
                💡 Jeśli nie widzisz emaila, sprawdź folder spam{'\n'}
                lub kliknij "Zaloguj się" aby spróbować ponownie
              </Text>
            </View>
          </LinearGradient>
        </View>
      </Modal>

      {/* Error Modal */}
      <AuthErrorModal
        visible={errorModal.visible}
        onClose={() => setErrorModal({ visible: false, type: null })}
        errorType={errorModal.type}
        customMessage={errorModal.message}
        onResendEmail={handleResendEmail}
        onResetPassword={handleResetPassword}
      />
    </LinearGradient>
  );
} 