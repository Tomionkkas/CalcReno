import React from 'react';
import { View, Text } from 'react-native';
import { Shield, Smartphone, Calendar, Bell } from 'lucide-react-native';
import { GlassmorphicCard } from '../components/enhanced/GlassmorphicCard';

const benefits = [
  {
    icon: Shield,
    title: 'Bezpieczne przechowywanie',
    description: 'Twoje projekty są szyfrowane i bezpieczne'
  },
  {
    icon: Smartphone,
    title: 'Synchronizacja urządzeń',
    description: 'Dostęp do projektów z każdego urządzenia'
  },
  {
    icon: Calendar,
    title: 'Integracja z RenoTimeline',
    description: 'Planowanie projektów i harmonogramów'
  },
  {
    icon: Bell,
    title: 'Inteligentne powiadomienia',
    description: 'Otrzymuj przypomnienia i aktualizacje'
  }
];

export function BenefitsSection() {
  return (
    <View style={{ marginBottom: 32 }}>
      <Text style={{ 
        color: '#FFFFFF', 
        fontSize: 18, 
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center'
      }}>
        Dlaczego warto założyć konto?
      </Text>
      
      <View style={{ gap: 16 }}>
        {benefits.map((benefit, index) => {
          const IconComponent = benefit.icon;
          return (
            <GlassmorphicCard
              key={index}
              style={{ marginBottom: 0 }}
              padding={16}
              borderRadius={12}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#6C63FF20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <IconComponent size={20} color="#6C63FF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    color: '#FFFFFF', 
                    fontSize: 14, 
                    fontWeight: '500',
                    marginBottom: 2
                  }}>
                    {benefit.title}
                  </Text>
                  <Text style={{ 
                    color: '#B8BCC8', 
                    fontSize: 12,
                    lineHeight: 16
                  }}>
                    {benefit.description}
                  </Text>
                </View>
              </View>
            </GlassmorphicCard>
          );
        })}
      </View>
    </View>
  );
}
