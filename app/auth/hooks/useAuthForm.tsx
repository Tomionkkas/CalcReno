import { useState, useCallback } from 'react';

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

interface UseAuthFormProps {
  isLogin: boolean;
  onSubmit: (data: FormData) => Promise<void>;
}

export function useAuthForm({ isLogin, onSubmit }: UseAuthFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email jest wymagany';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Nieprawidłowy format email';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Hasło jest wymagane';
    } else if (!isLogin && formData.password.length < 6) {
      newErrors.password = 'Hasło musi mieć minimum 6 znaków';
    }

    // Name validation for registration
    if (!isLogin) {
      if (!formData.firstName) {
        newErrors.firstName = 'Imię jest wymagane';
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Nazwisko jest wymagane';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isLogin]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, onSubmit]);

  const updateField = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    loading,
    updateField,
    handleSubmit,
    clearErrors,
    setErrors,
  };
}
