import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Animated, 
  Dimensions, 
  TouchableOpacity,
  Modal
} from 'react-native';
import { CheckCircle, AlertCircle, XCircle, X } from 'lucide-react-native';

type ToastType = 'success' | 'error' | 'warning';

interface CustomToastProps {
  visible: boolean;
  type: ToastType;
  title: string;
  message?: string;
  onClose: () => void;
  duration?: number;
}

const CustomToast: React.FC<CustomToastProps> = ({
  visible,
  type,
  title,
  message,
  onClose,
  duration = 3000
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();

      // Auto dismiss
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible, duration, fadeAnim, slideAnim, onClose]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          backgroundColor: '#10B981',
          borderColor: '#059669'
        };
      case 'error':
        return {
          icon: XCircle,
          backgroundColor: '#EF4444',
          borderColor: '#DC2626'
        };
      case 'warning':
        return {
          icon: AlertCircle,
          backgroundColor: '#F59E0B',
          borderColor: '#D97706'
        };
      default:
        return {
          icon: CheckCircle,
          backgroundColor: '#10B981',
          borderColor: '#059669'
        };
    }
  };

  const config = getToastConfig();
  const IconComponent = config.icon;

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <View style={{
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.3)'
      }}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            backgroundColor: '#1F1F1F',
            borderLeftWidth: 4,
            borderLeftColor: config.backgroundColor,
            borderRadius: 12,
            marginHorizontal: 20,
            padding: 16,
            minWidth: Dimensions.get('window').width - 40,
            maxWidth: Dimensions.get('window').width - 40,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 1 }}>
              <IconComponent 
                size={24} 
                color={config.backgroundColor}
                style={{ marginRight: 12, marginTop: 2 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '600',
                  marginBottom: message ? 4 : 0
                }}>
                  {title}
                </Text>
                {message && (
                  <Text style={{
                    color: '#9CA3AF',
                    fontSize: 14,
                    lineHeight: 20
                  }}>
                    {message}
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={{
                padding: 4,
                marginLeft: 8
              }}
            >
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CustomToast; 