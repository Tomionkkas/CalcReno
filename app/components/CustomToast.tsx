import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  Dimensions, 
  TouchableOpacity,
  Modal
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming
} from 'react-native-reanimated';
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
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-100);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      // Animate in smoothly without bounce
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(1, { duration: 300 });

      // Auto dismiss
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      // Animate out faster with scale effect
      opacity.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(-50, { duration: 150 });
      scale.value = withTiming(0.95, { duration: 150 });
    }
  }, [visible, duration, onClose]);

  const handleBackgroundPress = () => {
    // Immediate dismiss animation
    opacity.value = withTiming(0, { duration: 150 });
    translateY.value = withTiming(-50, { duration: 150 });
    scale.value = withTiming(0.95, { duration: 150 });
    
    // Call onClose after animation starts
    setTimeout(onClose, 50);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
  }));

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
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleBackgroundPress}
        style={{
          flex: 1,
          justifyContent: 'flex-start',
          alignItems: 'center',
          paddingTop: 60,
          backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }}
      >
        <Animated.View
          style={[
            {
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
            },
            animatedStyle
          ]}
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
      </TouchableOpacity>
    </Modal>
  );
};

export default CustomToast; 