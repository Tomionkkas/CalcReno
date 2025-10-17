import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Calculator, Home, Zap, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface OnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateProject: () => void;
  userName?: string;
}

const { height, width } = Dimensions.get('window');

export function OnboardingModal({ visible, onClose, onCreateProject, userName }: OnboardingModalProps) {
  const insets = useSafeAreaInsets();
  
  // Calculate available space considering safe areas
  const availableHeight = height - insets.top - insets.bottom;
  const isSmallScreen = height < 700; // For iPhone SE, etc.
  const features = [
    {
      icon: Calculator,
      title: 'Kalkulacja materiałów',
      description: 'Oblicz dokładne koszty remontu dla każdego pomieszczenia'
    },
    {
      icon: Home,
      title: 'Wizualizacja pomieszczeń',
      description: 'Narysuj plan swoich pomieszczeń i dodaj elementy'
    },
    {
      icon: Zap,
      title: 'Integracja z RenoTimeline',
      description: 'Synchronizuj projekty z systemem zarządzania'
    }
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingHorizontal: Math.max(16, insets.left, insets.right),
        }}>
          <ScrollView 
            contentContainerStyle={{
              flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
              paddingVertical: isSmallScreen ? 16 : 32,
            }}
            showsVerticalScrollIndicator={false}
          >
        <LinearGradient
          colors={['#1E2139', '#2A2D4A']}
          style={{
            width: '100%',
                maxWidth: Math.min(420, width - 32),
                maxHeight: availableHeight - (isSmallScreen ? 32 : 64),
            borderRadius: 24,
                padding: isSmallScreen ? 24 : 32,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'rgba(108, 99, 255, 0.3)',
            shadowColor: '#6C63FF',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.4,
            shadowRadius: 20,
            elevation: 12,
          }}
        >
          {/* Close button */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              padding: 8,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
            onPress={onClose}
          >
            <X size={20} color="#B8BCC8" />
          </TouchableOpacity>

          {/* Welcome Header */}
          <View style={{
            alignItems: 'center',
            marginBottom: isSmallScreen ? 20 : 32,
            marginTop: 16,
          }}>
            <View style={{
              width: isSmallScreen ? 80 : 100,
              height: isSmallScreen ? 80 : 100,
              borderRadius: isSmallScreen ? 40 : 50,
              backgroundColor: 'rgba(108, 99, 255, 0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: isSmallScreen ? 16 : 20,
              borderWidth: 2,
              borderColor: 'rgba(108, 99, 255, 0.4)',
            }}>
              <Plus size={isSmallScreen ? 36 : 48} color="#6C63FF" />
            </View>
            
            <Text style={{
              fontSize: isSmallScreen ? 24 : 28,
              fontWeight: 'bold',
              color: '#FFFFFF',
              textAlign: 'center',
              marginBottom: 8,
            }}>
              Witaj{userName ? ` ${userName}` : ''}! 👋
            </Text>
            
            <Text style={{
              fontSize: 16,
              color: '#B8BCC8',
              textAlign: 'center',
              lineHeight: 24,
            }}>
              Rozpocznij swoją przygodę z CalcReno{'\n'}
              i stwórz swój pierwszy projekt remontowy
            </Text>
          </View>

          {/* Features List */}
          <View style={{ width: '100%', marginBottom: isSmallScreen ? 20 : 32 }}>
            {features.map((feature, index) => (
              <View key={index} style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(108, 99, 255, 0.1)',
                borderRadius: 16,
                  padding: isSmallScreen ? 16 : 20,
                  marginBottom: isSmallScreen ? 12 : 16,
                borderWidth: 1,
                borderColor: 'rgba(108, 99, 255, 0.2)',
              }}>
                <View style={{
                  width: isSmallScreen ? 40 : 48,
                  height: isSmallScreen ? 40 : 48,
                  borderRadius: isSmallScreen ? 20 : 24,
                  backgroundColor: 'rgba(108, 99, 255, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: isSmallScreen ? 12 : 16,
                }}>
                  <feature.icon size={24} color="#6C63FF" />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#FFFFFF',
                    marginBottom: 4,
                  }}>
                    {feature.title}
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: '#B8BCC8',
                    lineHeight: 20,
                  }}>
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Call to Action */}
          <TouchableOpacity
            onPress={onCreateProject}
            style={{
              width: '100%',
              borderRadius: 16,
              overflow: 'hidden',
              marginBottom: 16,
            }}
          >
            <LinearGradient
              colors={['#6C63FF', '#4DABF7']}
              style={{
                paddingVertical: 18,
                paddingHorizontal: 32,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
              }}
            >
              <Plus size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={{
                color: '#FFFFFF',
                fontSize: 18,
                fontWeight: '600',
              }}>
                Stwórz pierwszy projekt
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Skip Option */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 24,
            }}
          >
            <Text style={{
              color: '#9CA3AF',
              fontSize: 14,
              textAlign: 'center',
            }}>
              Pomiń na razie
            </Text>
          </TouchableOpacity>
        </LinearGradient>
          </ScrollView>
      </View>
      </KeyboardAvoidingView>
    </Modal>
  );
} 