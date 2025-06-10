import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, X, Trash2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface DeleteConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
  loading?: boolean;
}

export function DeleteConfirmationModal({
  visible,
  onClose,
  onConfirm,
  projectName,
  loading = false,
}: DeleteConfirmationModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.8)" barStyle="light-content" />
      
      {/* Backdrop */}
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
        }}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Modal Content */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {}} // Prevent closing when tapping inside modal
          style={{
            width: '100%',
            maxWidth: 400,
          }}
        >
          <LinearGradient
            colors={['#1E2139', '#2A2D4A']}
            style={{
              borderRadius: 20,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
              borderWidth: 1,
              borderColor: '#3A3D5A',
            }}
          >
            {/* Close Button */}
            <TouchableOpacity
              onPress={onClose}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                padding: 8,
                borderRadius: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                zIndex: 1,
              }}
            >
              <X size={20} color="#B8BCC8" />
            </TouchableOpacity>

            {/* Warning Icon */}
            <View style={{
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <View style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                borderWidth: 2,
                borderColor: 'rgba(239, 68, 68, 0.3)',
              }}>
                <AlertTriangle size={32} color="#EF4444" />
              </View>

              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#FFFFFF',
                textAlign: 'center',
                marginBottom: 8,
              }}>
                Usuń projekt
              </Text>

              <Text style={{
                fontSize: 16,
                color: '#B8BCC8',
                textAlign: 'center',
                lineHeight: 24,
              }}>
                Czy na pewno chcesz usunąć projekt?
              </Text>
            </View>

            {/* Project Name */}
            <View style={{
              backgroundColor: 'rgba(108, 99, 255, 0.1)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: 'rgba(108, 99, 255, 0.2)',
            }}>
              <Text style={{
                fontSize: 14,
                color: '#B8BCC8',
                marginBottom: 4,
                fontWeight: '500',
              }}>
                Projekt do usunięcia:
              </Text>
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#FFFFFF',
                lineHeight: 24,
              }}>
                {projectName}
              </Text>
            </View>

            {/* Warning Message */}
            <View style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 32,
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.2)',
            }}>
              <Text style={{
                fontSize: 14,
                color: '#FCA5A5',
                textAlign: 'center',
                lineHeight: 20,
              }}>
                ⚠️ Ta akcja jest nieodwracalna. Wszystkie dane projektu, pomieszczenia i kalkulacje zostaną trwale usunięte.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={{
              flexDirection: 'row',
              gap: 12,
            }}>
              {/* Cancel Button */}
              <TouchableOpacity
                onPress={onClose}
                disabled={loading}
                style={{
                  flex: 1,
                  backgroundColor: '#3A3D5A',
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#4A4D6A',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  Anuluj
                </Text>
              </TouchableOpacity>

              {/* Delete Button */}
              <TouchableOpacity
                onPress={onConfirm}
                disabled={loading}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: loading ? 0.8 : 1,
                  overflow: 'hidden',
                }}
              >
                <LinearGradient
                  colors={loading ? ['#6B7280', '#6B7280'] : ['#EF4444', '#DC2626']}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                />
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <Trash2 size={18} color="#FFFFFF" />
                  <Text style={{
                    color: '#FFFFFF',
                    fontSize: 16,
                    fontWeight: '600',
                  }}>
                    {loading ? 'Usuwanie...' : 'Usuń projekt'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
} 