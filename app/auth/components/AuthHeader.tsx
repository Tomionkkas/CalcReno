import React from 'react';
import { View, Text, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

interface AuthHeaderProps {
  isLogin: boolean;
}

export function AuthHeader({ isLogin }: AuthHeaderProps) {
  return (
    <View style={{ alignItems: 'center', marginTop: height * 0.08, marginBottom: 40 }}>
      {/* Logo Container */}
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
          source={require('../../../assets/images/calculator-house.png')}
          style={{
            width: 80,
            height: 80,
          }}
          resizeMode="contain"
        />
      </View>
      
      {/* Title */}
      <Text style={{ 
        fontSize: 32, 
        fontWeight: 'bold', 
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center'
      }}>
        CalcReno
      </Text>
      
      {/* Tagline */}
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
  );
}
