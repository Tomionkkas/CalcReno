import React from 'react';
import { View, Text } from 'react-native';

interface AuthDividerProps {
  text?: string;
}

export function AuthDivider({ text = 'LUB' }: AuthDividerProps) {
  return (
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
        {text}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: '#2A2D4A' }} />
    </View>
  );
}
