import React from 'react';
import { View, Text } from 'react-native';

export function FooterSection() {
  return (
    <View style={{ 
      alignItems: 'center', 
      paddingBottom: 32,
      marginTop: 'auto'
    }}>
      <Text style={{ 
        color: '#6B7280', 
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16
      }}>
        Tworząc konto akceptujesz nasze warunki{'\n'}
        użytkowania i politykę prywatności
      </Text>
    </View>
  );
}
