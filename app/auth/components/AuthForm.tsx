import React from 'react';
import { View } from 'react-native';
import { AuthButton } from './enhanced/AuthButton';
import { AuthInput } from './enhanced/AuthInput';
import { AuthDivider } from './enhanced/AuthDivider';
import { AuthToggle } from './AuthToggle';
import { GlassmorphicCard } from './enhanced/GlassmorphicCard';

interface AuthFormProps {
  isLogin: boolean;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  loading: boolean;
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onFirstNameChange: (text: string) => void;
  onLastNameChange: (text: string) => void;
  onToggleMode: () => void;
  onSubmit: () => void;
  onGuestMode?: () => void;
  onForgotPassword?: () => void;
  errors?: {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  };
}

export function AuthForm({
  isLogin,
  email,
  password,
  firstName,
  lastName,
  loading,
  onEmailChange,
  onPasswordChange,
  onFirstNameChange,
  onLastNameChange,
  onToggleMode,
  onSubmit,
  onGuestMode,
  onForgotPassword,
  errors = {}
}: AuthFormProps) {
  return (
    <GlassmorphicCard
      style={{ marginBottom: 32 }}
      padding={24}
      borderRadius={20}
      intensity={15}
    >
      {/* Name Fields - Only show for registration */}
      {!isLogin && (
        <>
          <AuthInput
            placeholder="Imię"
            type="name"
            value={firstName}
            onChangeText={onFirstNameChange}
            error={errors.firstName}
            autoCapitalize="words"
          />
          <AuthInput
            placeholder="Nazwisko"
            type="name"
            value={lastName}
            onChangeText={onLastNameChange}
            error={errors.lastName}
            autoCapitalize="words"
          />
        </>
      )}

      {/* Email Input */}
      <AuthInput
        placeholder="Adres email"
        type="email"
        value={email}
        onChangeText={onEmailChange}
        error={errors.email}
        keyboardType="email-address"
      />

      {/* Password Input */}
      <AuthInput
        placeholder="Hasło"
        type="password"
        value={password}
        onChangeText={onPasswordChange}
        error={errors.password}
      />

      {/* Main Action Button */}
      <AuthButton
        title={loading
          ? 'Przetwarzanie...'
          : isLogin
          ? 'Zaloguj się'
          : 'Utwórz konto'}
        onPress={onSubmit}
        isLoading={loading}
        size="large"
      />

      {/* Secondary Actions */}
      {isLogin && (
        <View style={{ marginTop: 8 }}>
          <AuthButton
            title="Zapomniałem hasła"
            onPress={onForgotPassword || (() => {/* TODO: Implement forgot password */})}
            variant="ghost"
            size="small"
          />
        </View>
      )}

      {/* Switch Mode */}
      <View style={{ marginTop: 16 }}>
        <AuthToggle isLogin={isLogin} onToggle={onToggleMode} />
      </View>

      {/* Continue without account */}
      <View style={{ marginTop: 8 }}>
        <AuthButton
          title="Kontynuuj bez konta"
          onPress={onGuestMode || (() => {/* TODO: Implement guest mode */})}
          variant="ghost"
          size="small"
        />
      </View>
    </GlassmorphicCard>
  );
}
