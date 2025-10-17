export type AuthErrorType = 
  | 'invalid_credentials' 
  | 'account_not_found' 
  | 'user_exists' 
  | 'invalid_email' 
  | 'weak_password' 
  | 'general';

export interface AuthErrorConfig {
  title: string;
  message: string;
  iconColor: string;
  suggestions: string[];
  showResetPassword?: boolean;
  showCreateAccount?: boolean;
  showResendEmail?: boolean;
}

export function mapSupabaseError(errorMessage: string, isLogin: boolean): AuthErrorType {
  const message = errorMessage.toLowerCase();
  
  if (isLogin) {
    // Login errors
    if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
      return 'invalid_credentials';
    }
    if (message.includes('email not confirmed') || message.includes('email_not_confirmed')) {
      return 'user_exists';
    }
    if (message.includes('user not found') || message.includes('user_not_found')) {
      return 'account_not_found';
    }
  } else {
    // Registration errors
    if (message.includes('user already registered') || message.includes('user_already_exists')) {
      return 'user_exists';
    }
    if (message.includes('password should be at least') || message.includes('weak_password')) {
      return 'weak_password';
    }
    if (message.includes('invalid_email') || message.includes('invalid email')) {
      return 'invalid_email';
    }
  }
  
  return 'general';
}

export function getErrorConfig(errorType: AuthErrorType, email?: string): AuthErrorConfig {
  switch (errorType) {
    case 'invalid_credentials':
      return {
        title: 'Nieprawidłowe dane logowania',
        message: 'Email lub hasło jest niepoprawne.\nSprawdź wprowadzone dane i spróbuj ponownie.',
        iconColor: '#EF4444',
        suggestions: [
          'Sprawdź czy email został wpisany poprawnie',
          'Upewnij się, że Caps Lock jest wyłączony',
          'Spróbuj zresetować hasło jeśli go nie pamiętasz'
        ],
        showResetPassword: true
      };

    case 'account_not_found':
      return {
        title: 'Konto nie istnieje',
        message: `Nie znaleziono konta z adresem ${email || 'podanym adresem email'}.\nMożesz utworzyć nowe konto lub sprawdzić adres email.`,
        iconColor: '#F59E0B',
        suggestions: [
          'Sprawdź czy email został wpisany poprawnie',
          'Upewnij się, że nie ma literówek w adresie',
          'Spróbuj użyć innego adresu email',
          'Utwórz nowe konto jeśli nie masz jeszcze konta'
        ],
        showCreateAccount: true
      };

    case 'user_exists':
      return {
        title: 'Konto już istnieje',
        message: 'To konto zostało już utworzone.\nMożesz się zalogować lub zresetować hasło.',
        iconColor: '#F59E0B',
        suggestions: [
          'Spróbuj się zalogować używając tego emaila',
          'Sprawdź folder spam w poszukiwaniu emaila potwierdzającego',
          'Zresetuj hasło jeśli go nie pamiętasz'
        ],
        showResendEmail: true,
        showResetPassword: true
      };

    case 'invalid_email':
      return {
        title: 'Nieprawidłowy email',
        message: 'Wprowadzony adres email ma nieprawidłowy format.\nSprawdź i spróbuj ponownie.',
        iconColor: '#EF4444',
        suggestions: [
          'Sprawdź czy email zawiera znak @',
          'Upewnij się, że domena jest poprawna',
          'Usuń niepotrzebne spacje'
        ]
      };

    case 'weak_password':
      return {
        title: 'Za słabe hasło',
        message: 'Hasło musi mieć minimum 6 znaków.\nWybierz silniejsze hasło.',
        iconColor: '#EF4444',
        suggestions: [
          'Użyj minimum 6 znaków',
          'Dodaj cyfry i znaki specjalne',
          'Unikaj łatwych do odgadnięcia haseł'
        ]
      };

    case 'general':
    default:
      return {
        title: 'Wystąpił błąd',
        message: 'Wystąpił nieoczekiwany błąd.\nSpróbuj ponownie lub skontaktuj się z pomocą techniczną.',
        iconColor: '#EF4444',
        suggestions: [
          'Sprawdź połączenie z internetem',
          'Spróbuj ponownie za chwilę',
          'Skontaktuj się z pomocą techniczną'
        ]
      };
  }
}
