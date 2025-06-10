import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle } from 'lucide-react-native';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Potwierdź",
  cancelText = "Anuluj",
  confirmColor = "#EF4444"
}) => {
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 20
      }}>
        <View style={{
          backgroundColor: '#1F1F1F',
          borderRadius: 16,
          padding: 24,
          width: '100%',
          maxWidth: 400,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 8,
          },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 16,
        }}>
          {/* Icon and Title */}
          <View style={{
            alignItems: 'center',
            marginBottom: 16
          }}>
            <View style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: 50,
              padding: 12,
              marginBottom: 12
            }}>
              <AlertTriangle size={32} color={confirmColor} />
            </View>
            <Text style={{
              color: 'white',
              fontSize: 20,
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              {title}
            </Text>
          </View>

          {/* Message */}
          <Text style={{
            color: '#B8BCC8',
            fontSize: 16,
            textAlign: 'center',
            lineHeight: 24,
            marginBottom: 24
          }}>
            {message}
          </Text>

          {/* Buttons */}
          <View style={{
            flexDirection: 'row',
            gap: 12
          }}>
            <TouchableOpacity
              onPress={onCancel}
              style={{
                flex: 1,
                backgroundColor: '#374151',
                paddingVertical: 14,
                paddingHorizontal: 20,
                borderRadius: 10,
                alignItems: 'center'
              }}
            >
              <Text style={{
                color: 'white',
                fontSize: 16,
                fontWeight: '600'
              }}>
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              style={{
                flex: 1,
                borderRadius: 10,
                overflow: 'hidden'
              }}
            >
              <LinearGradient
                colors={[confirmColor, confirmColor]}
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
                  {confirmText}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmDialog; 