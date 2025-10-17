import React from 'react';
import { View } from 'react-native';
import { AuthDivider } from '../components/AuthDivider';
import { AuthButton } from '../components/AuthButton';

interface GuestModeSectionProps {
  onGuestMode: () => void;
}

export function GuestModeSection({ onGuestMode }: GuestModeSectionProps) {
  return (
    <View>
      <AuthDivider text="LUB" />
      
      <AuthButton
        title="Kontynuuj bez konta"
        onPress={onGuestMode}
        variant="ghost"
      />
    </View>
  );
}
