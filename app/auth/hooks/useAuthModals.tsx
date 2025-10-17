import { useState, useCallback } from 'react';
import { AuthErrorType } from '../services/authErrorHandler';

interface ModalState {
  visible: boolean;
  type: AuthErrorType | null;
  message?: string;
}

export function useAuthModals() {
  const [guestModalVisible, setGuestModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalState, setErrorModalState] = useState<ModalState>({
    visible: false,
    type: null,
    message: undefined,
  });

  const showGuestModal = useCallback(() => {
    setGuestModalVisible(true);
  }, []);

  const hideGuestModal = useCallback(() => {
    setGuestModalVisible(false);
  }, []);

  const showSuccessModal = useCallback(() => {
    setSuccessModalVisible(true);
  }, []);

  const hideSuccessModal = useCallback(() => {
    setSuccessModalVisible(false);
  }, []);

  const showErrorModal = useCallback((type: AuthErrorType, message?: string) => {
    setErrorModalState({
      visible: true,
      type,
      message,
    });
  }, []);

  const hideErrorModal = useCallback(() => {
    setErrorModalState({
      visible: false,
      type: null,
      message: undefined,
    });
  }, []);

  return {
    // Guest Modal
    guestModalVisible,
    showGuestModal,
    hideGuestModal,
    
    // Success Modal
    successModalVisible,
    showSuccessModal,
    hideSuccessModal,
    
    // Error Modal
    errorModalState,
    showErrorModal,
    hideErrorModal,
  };
}
