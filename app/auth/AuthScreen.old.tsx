import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useAuth } from '../hooks/useAuth';

// Import all new components, hooks, and services
import {
  AuthHeader,
  AuthForm,
} from './components';

import {
  BenefitsSection,
  FooterSection,
  GuestModeSection,
} from './features';

import {
  GuestModeModal,
  SuccessModal,
  AuthErrorModal,
} from './modals';

import {
  useAuthForm,
  useAuthModals,
} from './hooks';

import {
  mapSupabaseError,
  showSuccessAlert,
  showErrorAlert,
} from './services';

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  
  // Use custom hooks for form and modal management
  const {
    formData,
    errors,
    loading,
    updateField,
    handleSubmit,
    clearErrors,
  } = useAuthForm({
    isLogin,
    onSubmit: handleAuthSubmit,
  });

  const {
    guestModalVisible,
    showGuestModal,
    hideGuestModal,
    successModalVisible,
    showSuccessModal,
    hideSuccessModal,
    errorModalState,
    showErrorModal,
    hideErrorModal,
  } = useAuthModals();

  // Auth context
  const { 
    signIn, 
    signUp, 
    setGuestMode, 
    resetPassword, 
    resendConfirmation, 
    showSignupSuccess, 
    setShowSignupSuccess 
  } = useAuth();

  // Handle form submission
  async function handleAuthSubmit(data: any) {
    try {
      const result = isLogin
        ? await signIn(data.email, data.password)
        : await signUp(data.email, data.password, data.firstName, data.lastName);
      
      if (!result.success || result.error) {
        const errorMessage = result.error || 'Wystąpił błąd autoryzacji';
        const errorType = mapSupabaseError(errorMessage, isLogin);
        showErrorModal(errorType, errorMessage);
      } else {
        // Success - show success modal for signup
        if (!isLogin) {
          showSuccessModal();
        }
      }
    } catch (error: any) {
      showErrorModal('general', error?.message || 'Wystąpił nieoczekiwany błąd');
    }
  }

  // Handle mode toggle
  const handleToggleMode = useCallback(() => {
    setIsLogin(!isLogin);
    clearErrors();
  }, [isLogin, clearErrors]);

  // Handle guest mode
  const handleGuestMode = useCallback(() => {
    showGuestModal();
  }, [showGuestModal]);

  const handleContinueOffline = useCallback(() => {
    hideGuestModal();
    setGuestMode(true);
  }, [hideGuestModal, setGuestMode]);

  // Handle error modal actions
  const handleResendEmail = useCallback(async () => {
    const { error: resendError } = await resendConfirmation(formData.email);
    if (resendError) {
      showErrorAlert('Błąd', 'Nie udało się wysłać emaila potwierdzającego');
    } else {
      showSuccessAlert('Sukces', 'Email potwierdzający został wysłany ponownie');
    }
  }, [formData.email, resendConfirmation]);

  const handleResetPassword = useCallback(async () => {
    const { error: resetError } = await resetPassword(formData.email);
    if (resetError) {
      showErrorAlert('Błąd', 'Nie udało się wysłać emaila do resetowania hasła');
    } else {
      showSuccessAlert('Sukces', 'Link do resetowania hasła został wysłany na email');
    }
  }, [formData.email, resetPassword]);

  const handleCreateAccount = useCallback(() => {
    setIsLogin(false);
  }, []);

  // Handle success modal close
  const handleSuccessModalClose = useCallback(() => {
    hideSuccessModal();
    setShowSignupSuccess(false);
  }, [hideSuccessModal, setShowSignupSuccess]);

  return (
    <LinearGradient
      colors={['#0A0B1E', '#151829', '#1E2139']}
      style={{ flex: 1 }}
    >
      <ExpoStatusBar style="light" />
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1, paddingHorizontal: 24 }}>
            {/* Header Section */}
            <AuthHeader isLogin={isLogin} />

            {/* Form Section */}
            <AuthForm
              isLogin={isLogin}
              email={formData.email}
              password={formData.password}
              firstName={formData.firstName}
              lastName={formData.lastName}
              loading={loading}
              onEmailChange={(text) => updateField('email', text)}
              onPasswordChange={(text) => updateField('password', text)}
              onFirstNameChange={(text) => updateField('firstName', text)}
              onLastNameChange={(text) => updateField('lastName', text)}
              onToggleMode={handleToggleMode}
              onSubmit={handleSubmit}
              errors={errors}
            />

            {/* Guest Mode Section */}
            <GuestModeSection onGuestMode={handleGuestMode} />

            {/* Benefits Section */}
            <BenefitsSection />

            {/* Footer Section */}
            <FooterSection />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals */}
      <GuestModeModal
        visible={guestModalVisible}
        onClose={hideGuestModal}
        onContinueOffline={handleContinueOffline}
      />

      <SuccessModal
        visible={successModalVisible}
        onClose={handleSuccessModalClose}
      />

      <AuthErrorModal
        visible={errorModalState.visible}
        onClose={hideErrorModal}
        errorType={errorModalState.type}
        customMessage={errorModalState.message}
        onResendEmail={handleResendEmail}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
        email={formData.email}
      />
    </LinearGradient>
  );
} 