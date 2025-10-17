import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function ConfirmationModal({ 
  visible, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Potwierdź',
  cancelText = 'Anuluj',
  isDestructive = false
}: ConfirmationModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
      statusBarTranslucent={true}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{
          width: '90%',
          maxWidth: 360,
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
            {/* Warning Icon */}
            <View style={{
              backgroundColor: isDestructive ? '#EF4444' : '#F59E0B',
              borderRadius: 50,
              padding: 16,
              marginBottom: 16,
            }}>
              <AlertTriangle size={32} color="#FFFFFF" />
            </View>

            {/* Title */}
            <Text style={{
              color: '#FFFFFF',
              fontSize: 20,
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: 12,
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

            {/* Buttons */}
            <View style={{ 
              flexDirection: 'row', 
              gap: 12,
              width: '100%',
            }}>
              {/* Cancel Button */}
              <TouchableOpacity
                onPress={onCancel}
                style={{
                  flex: 1,
                  backgroundColor: '#374151',
                  paddingVertical: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: '500',
                }}>
                  {cancelText}
                </Text>
              </TouchableOpacity>

              {/* Confirm Button */}
              <TouchableOpacity
                onPress={onConfirm}
                style={{
                  flex: 1,
                  backgroundColor: isDestructive ? '#EF4444' : '#6C63FF',
                  paddingVertical: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: '500',
                }}>
                  {confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
} 