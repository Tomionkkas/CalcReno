import { Alert } from 'react-native';

export function showSuccessAlert(title: string, message: string) {
  Alert.alert(title, message);
}

export function showErrorAlert(title: string, message: string) {
  Alert.alert(title, message);
}

export function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function isStrongPassword(password: string): boolean {
  // At least 6 characters, can be enhanced with more complex rules
  return password.length >= 6;
}

export function formatErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'Wystąpił nieoczekiwany błąd';
}
