import { useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'warning';

interface ToastConfig {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export const useToast = () => {
  const [toastConfig, setToastConfig] = useState<ToastConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showToast = useCallback((config: ToastConfig) => {
    setToastConfig(config);
    setIsVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setIsVisible(false);
    // Clear config after animation
    setTimeout(() => {
      setToastConfig(null);
    }, 300);
  }, []);

  const showSuccess = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message });
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message });
  }, [showToast]);

  return {
    toastConfig,
    isVisible,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning
  };
}; 