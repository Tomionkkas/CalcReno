import { useState, useCallback, useEffect } from 'react';
import {
  rateLimiter,
  loginFormSchema,
  signupFormSchema,
  validateWithSchema,
  sanitizeEmail,
} from '../../utils/security';

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
  general?: string;
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
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  // Check rate limit status on mount and when email changes
  useEffect(() => {
    const checkRateLimit = async () => {
      if (formData.email) {
        const action = isLogin ? 'auth:login' : 'auth:signup';
        const remaining = await rateLimiter.getRemainingAttempts(
          action,
          sanitizeEmail(formData.email)
        );
        setRemainingAttempts(remaining);
      }
    };
    checkRateLimit();
  }, [formData.email, isLogin]);

  const validateForm = useCallback((): boolean => {
    // Use Zod schemas for validation
    const schema = isLogin ? loginFormSchema : signupFormSchema;
    const dataToValidate = isLogin
      ? { email: formData.email, password: formData.password }
      : formData;

    const result = validateWithSchema(schema, dataToValidate);

    if (!result.success) {
      setErrors(result.errors as FormErrors);
      return false;
    }

    setErrors({});
    return true;
  }, [formData, isLogin]);

  const handleSubmit = useCallback(async () => {
    // Check rate limit before validation
    const action = isLogin ? 'auth:login' : 'auth:signup';
    const identifier = sanitizeEmail(formData.email);

    const rateLimitResult = await rateLimiter.checkAndRecord(action, identifier);

    if (!rateLimitResult.allowed) {
      setErrors({
        general: rateLimitResult.message || 'Zbyt wiele prób. Spróbuj później.',
      });
      setRemainingAttempts(0);
      return;
    }

    setRemainingAttempts(rateLimitResult.remainingAttempts);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      // On successful auth, clear rate limit
      await rateLimiter.recordSuccess(action, identifier);
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, onSubmit, isLogin]);

  const updateField = useCallback((field: keyof FormData, value: string) => {
    // Sanitize email input
    const sanitizedValue = field === 'email' ? value.toLowerCase().trim() : value;

    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    // Clear general error when user makes changes
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
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
    remainingAttempts,
  };
}
