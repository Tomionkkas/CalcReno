import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, CheckCircle } from 'lucide-react-native';

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SuccessModal({ visible, onClose }: SuccessModalProps) {
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
            onPress={onClose}
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
            onPress={onClose}
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
  );
}
