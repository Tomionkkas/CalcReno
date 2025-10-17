import React from 'react';
import { AuthButton } from './enhanced/AuthButton';

interface AuthToggleProps {
  isLogin: boolean;
  onToggle: () => void;
}

export function AuthToggle({ isLogin, onToggle }: AuthToggleProps) {
  return (
    <AuthButton
      title={isLogin
        ? 'Nie masz konta? Utwórz nowe'
        : 'Masz już konto? Zaloguj się'}
      onPress={onToggle}
      variant="ghost"
      size="medium"
    />
  );
}
