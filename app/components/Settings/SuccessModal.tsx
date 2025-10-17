import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle } from 'lucide-react-native';

interface SuccessModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  buttonText?: string;
}

export function SuccessModal({ 
  visible, 
  title, 
  message, 
  onClose, 
  buttonText = 'OK' 
}: SuccessModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{
          width: '85%',
          maxWidth: 320,
          backgroundColor: '#1E2139',
          borderRadius: 16,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
        }}>
          {/* Content */}
          <View style={{ padding: 24, alignItems: 'center' }}>
            {/* Success Icon */}
            <View style={{
              backgroundColor: '#10B981',
              borderRadius: 50,
              padding: 16,
              marginBottom: 16,
            }}>
              <CheckCircle size={32} color="#FFFFFF" />
            </View>

            {/* Title */}
            <Text style={{
              color: '#FFFFFF',
              fontSize: 20,
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: 8,
            }}>
              {title}
            </Text>

            {/* Message */}
            <Text style={{
              color: '#B8BCC8',
              fontSize: 16,
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: 24,
            }}>
              {message}
            </Text>

            {/* Button */}
            <TouchableOpacity
              onPress={onClose}
              style={{
                borderRadius: 8,
                overflow: 'hidden',
                minWidth: 120,
              }}
            >
              <LinearGradient
                colors={["#6C63FF", "#4DABF7"]}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: '500',
                }}>
                  {buttonText}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
} 