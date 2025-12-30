import React, { useState, useCallback, useEffect } from 'react';
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
  AnimatedBackground,
  AnimatedLogo,
  FloatingActionIndicator,
  OneHandLayout,
  SkeletonForm,
} from './components';

import {
  BenefitsSection,
  FooterSection,
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

import { useAccessibility } from '../hooks/useAccessibility';
import { usePerformance } from './hooks/usePerformance';
import { MemoryManager } from './utils/memoryManager';

import {
  mapSupabaseError,
  showSuccessAlert,
  showErrorAlert,
} from './services';

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [floatingIndicator, setFloatingIndicator] = useState({
    visible: false,
    type: 'info' as 'success' | 'error' | 'info' | 'loading',
    message: '',
  });

  // Accessibility hook
  const { isScreenReaderEnabled, prefersReducedMotion, getAccessibilityProps } = useAccessibility();
  
  // Performance hook
  const { 
    deviceCapabilities, 
    performanceSettings, 
    getAnimationDuration, 
    getRenderSettings,
    isPerformanceGood 
  } = usePerformance();
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Use custom hooks for form and modal management
  const {
    formData,
    errors,
    loading,
    updateField,
    handleSubmit,
    clearErrors,
    setErrors,
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
        
        // For simple credential errors, show subtle feedback only
        if (errorType === 'invalid_credentials') {
          // Set form errors for subtle input highlighting
          setErrors({
            email: 'Nieprawidłowy email lub hasło',
            password: 'Nieprawidłowy email lub hasło',
          });
          
          return;
        }
        
        // For other errors, show modal with helpful actions
        showErrorModal(errorType, errorMessage);
        
        // Show floating error indicator
        setFloatingIndicator({
          visible: true,
          type: 'error',
          message: errorMessage,
        });
        
        return;
      } else {
        // Success - show success modal for signup
        if (!isLogin) {
          showSuccessModal();
        }
        
        // Show floating success indicator
        setFloatingIndicator({
          visible: true,
          type: 'success',
          message: isLogin ? 'Zalogowano pomyślnie!' : 'Konto utworzone pomyślnie!',
        });
      }
    } catch (error: any) {
      // Handle unexpected errors
      const errorMessage = error?.message || 'Wystąpił nieoczekiwany błąd';
      showErrorModal('general', errorMessage);
      
      // Show floating error indicator
      setFloatingIndicator({
        visible: true,
        type: 'error',
        message: errorMessage,
      });
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

  // Handle forgot password
  const handleForgotPassword = useCallback(() => {
    if (!formData.email) {
      showErrorModal('invalid_email', 'Wprowadź adres email aby zresetować hasło');
      return;
    }
    showErrorModal('invalid_credentials', 'Kliknij "Resetuj hasło" aby otrzymać link do resetowania');
  }, [formData.email, showErrorModal]);

  // Handle success modal close
  const handleSuccessModalClose = useCallback(() => {
    hideSuccessModal();
    setShowSignupSuccess(false);
  }, [hideSuccessModal, setShowSignupSuccess]);

  // Initialize app with loading state
  useEffect(() => {
    const initializeApp = async () => {
      // Quick initialization without delay
      setIsLoading(false);
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      MemoryManager.cleanup();
    };
  }, []);

  // Show skeleton loader only during initial app load, not during auth
  if (isLoading) {
    return (
      <AnimatedBackground deviceCapabilities={deviceCapabilities}>
        <ExpoStatusBar style="light" />
        <SkeletonForm showLogo={true} showInputs={true} showButton={true} />
      </AnimatedBackground>
    );
  }

  return (
    <>
      <AnimatedBackground deviceCapabilities={deviceCapabilities}>
        <ExpoStatusBar style="light" />
        
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            contentContainerStyle={{ 
              flexGrow: 1,
              paddingBottom: Platform.OS === 'android' ? 40 : 0,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            scrollEnabled={true}
            bounces={Platform.OS === 'ios'}
            overScrollMode={Platform.OS === 'android' ? 'never' : 'auto'}
          >
            <View style={{ 
              flex: 1, 
              paddingHorizontal: 24,
              minHeight: Platform.OS === 'android' ? '100%' : undefined,
              justifyContent: 'space-between',
            }}>
              {/* Header Section - Top */}
              <View style={{ flex: 0.3, justifyContent: 'center' }}>
                <AnimatedLogo isLogin={isLogin} deviceCapabilities={deviceCapabilities} />
              </View>

              {/* Form Section - Middle (One-hand accessible) */}
              <View style={{ flex: 0.5, justifyContent: 'center' }}>
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
                onGuestMode={handleGuestMode}
                onForgotPassword={handleForgotPassword}
                errors={errors}
              />
              </View>

              {/* Footer Section - Bottom */}
              <View style={{ flex: 0.2, justifyContent: 'flex-end' }}>
                <FooterSection />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Floating Action Indicator */}
        <FloatingActionIndicator
          type={floatingIndicator.type}
          message={floatingIndicator.message}
          isVisible={floatingIndicator.visible}
          onComplete={() => setFloatingIndicator(prev => ({ ...prev, visible: false }))}
        />
      </AnimatedBackground>

      {/* Modals - Rendered outside AnimatedBackground for proper Android display */}
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
    </>
  );
} 