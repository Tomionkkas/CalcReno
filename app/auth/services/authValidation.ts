export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface AuthData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export function validateEmail(email: string): string | null {
  if (!email) {
    return 'Email jest wymagany';
  }
  
  if (!email.includes('@')) {
    return 'Nieprawidłowy format email';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Nieprawidłowy format email';
  }
  
  return null;
}

export function validatePassword(password: string, isRegistration: boolean = false): string | null {
  if (!password) {
    return 'Hasło jest wymagane';
  }
  
  if (isRegistration && password.length < 6) {
    return 'Hasło musi mieć minimum 6 znaków';
  }
  
  return null;
}

export function validateName(name: string, fieldName: string): string | null {
  if (!name) {
    return `${fieldName} jest wymagane`;
  }
  
  if (name.length < 2) {
    return `${fieldName} musi mieć minimum 2 znaki`;
  }
  
  return null;
}

export function validateAuthForm(data: AuthData, isLogin: boolean): ValidationResult {
  const errors: Record<string, string> = {};
  
  // Email validation
  const emailError = validateEmail(data.email);
  if (emailError) {
    errors.email = emailError;
  }
  
  // Password validation
  const passwordError = validatePassword(data.password, !isLogin);
  if (passwordError) {
    errors.password = passwordError;
  }
  
  // Name validation for registration
  if (!isLogin) {
    if (data.firstName) {
      const firstNameError = validateName(data.firstName, 'Imię');
      if (firstNameError) {
        errors.firstName = firstNameError;
      }
    }
    
    if (data.lastName) {
      const lastNameError = validateName(data.lastName, 'Nazwisko');
      if (lastNameError) {
        errors.lastName = lastNameError;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
