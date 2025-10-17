# CalcReno Settings Screen Implementation Plan

## Overview
This document outlines the implementation of a comprehensive settings screen for CalcReno, allowing users to manage their account, preferences, and app behavior.

## Current Architecture Analysis

### Existing User Management
- **Authentication**: Supabase-based auth with email/password
- **User Profiles**: `user_profiles` table stores `first_name`, `last_name`, `push_token`
- **Auth Context**: `useAuth` hook provides user management functions
- **Current Features**: Login, logout, password reset, profile fetching

### UI Patterns
- **Theme**: Dark mode with gradients (`#0A0B1E`, `#151829`, `#1E2139`)
- **Navigation**: Expo Router with Stack navigation
- **Modals**: Consistent modal-based UI for secondary features
- **Icons**: Lucide React Native icons throughout

## Settings Screen Requirements

### 1. Account Management
- [ ] **Change Email**
  - Update email address with verification
  - Handle email conflicts
  - Re-authentication required
  
- [ ] **Change Password**
  - Current password verification
  - New password validation (min 6 chars)
  - Success confirmation
  
- [ ] **Update Profile**
  - Edit first name and last name
  - Real-time validation
  - Sync with Supabase
  
- [ ] **Delete Account**
  - Confirmation dialog with warnings
  - Data export option before deletion
  - Complete account removal

### 2. App Preferences
- [ ] **Push Notifications**
  - Toggle notifications on/off
  - Notification categories (projects, reminders, updates)
  - Quiet hours settings

- [ ] **Interface Preferences**
  - Language selection (Polish/English)
  - Haptic feedback toggle
  - Animation preferences

## Implementation Plan

### Phase 1: Core Settings Infrastructure

#### 1.1 Settings Context & State Management
Create settings management system similar to auth context:

```typescript
// app/hooks/useSettings.tsx
interface SettingsContextType {
  // User preferences
  notificationsEnabled: boolean;
  language: 'pl' | 'en';
  hapticFeedback: boolean;
  measurementUnit: 'metric' | 'imperial';
  // Actions
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  exportUserData: () => Promise<void>;
}
```

#### 1.2 Database Schema Extensions
Extend user_profiles table or create new settings table:

```sql
-- Add to user_profiles table
ALTER TABLE user_profiles ADD COLUMN settings JSONB DEFAULT '{}';
```

#### 1.3 Settings Screen Component
```typescript
// app/components/SettingsScreen.tsx
export function SettingsScreen({ visible, onClose }: SettingsScreenProps) {
  // Match existing modal patterns in app
  // Use LinearGradient background
  // Implement section-based layout
}
```

### Phase 2: Account Management Features

#### 2.1 Email Change Component
```typescript
// app/components/Settings/ChangeEmailModal.tsx
export function ChangeEmailModal() {
  // Current email verification
  // New email input with validation
  // Supabase email update with verification
  // Handle email confirmation flow
}
```

#### 2.2 Password Change Component
```typescript
// app/components/Settings/ChangePasswordModal.tsx
export function ChangePasswordModal() {
  // Current password input
  // New password with strength indicator
  // Confirm password validation
  // Supabase password update
}
```

#### 2.3 Profile Update Component
```typescript
// app/components/Settings/ProfileEditModal.tsx
export function ProfileEditModal() {
  // First name and last name fields
  // Real-time validation
  // Update user_profiles table
  // Sync with auth context
}
```

### Phase 3: App Preferences

#### 3.1 Notification Settings
```typescript
// app/components/Settings/NotificationSettings.tsx
export function NotificationSettings() {
  // Toggle switches for notification types
  // Quiet hours time picker
  // Integration with PushNotificationService
  // Update notification permissions
}
```

#### 3.2 Interface Preferences
```typescript
// app/components/Settings/InterfaceSettings.tsx
export function InterfaceSettings() {
  // Language selector
  // Haptic feedback toggle
  // Animation preferences
  // Unit system selection
}
```

### Phase 4: App Information & Support

#### 4.1 About Section
```typescript
// app/components/Settings/AboutSection.tsx
export function AboutSection() {
  // App version and build info
  // Legal information (terms, privacy)
  // Contact support
}
```

#### 4.2 Help & Support
```typescript
// app/components/Settings/HelpSupportSection.tsx
export function HelpSupportSection() {
  // Tutorial/onboarding replay
  // FAQ section
  // Report bug functionality
}
```

## File Structure

```
app/
├── components/
│   ├── Settings/
│   │   ├── SettingsScreen.tsx           # Main settings modal
│   │   ├── AccountSection.tsx           # Account management
│   │   ├── NotificationSettings.tsx     # Notification preferences
│   │   ├── InterfaceSettings.tsx        # UI preferences
│   │   ├── AboutSection.tsx             # App information
│   │   ├── HelpSupportSection.tsx       # Help & support
│   │   ├── ChangeEmailModal.tsx         # Email change flow
│   │   ├── ChangePasswordModal.tsx      # Password change flow
│   │   ├── ProfileEditModal.tsx         # Profile editing
│   │   └── DeleteAccountModal.tsx       # Account deletion
│   └── SettingsButton.tsx               # Settings trigger button
├── hooks/
│   ├── useSettings.tsx                  # Settings context and hooks
├── utils/
│   ├── settingsStorage.ts               # Settings persistence
│   └── settingsValidation.ts            # Settings validation
└── types/
    └── settings.ts                      # Settings type definitions
```

## Implementation Timeline

### Week 1: Infrastructure
- [ ] Create settings context and state management
- [ ] Extend database schema for user settings
- [ ] Implement basic settings storage utilities
- [ ] Create main SettingsScreen component shell

### Week 2: Account Management
- [ ] Implement change email functionality
- [ ] Implement change password functionality
- [ ] Implement profile editing
- [ ] Add account deletion with confirmations

### Week 3: Preferences & App Info
- [ ] Build notification settings interface
- [ ] Implement interface preferences
- [ ] Add about section and help/support

### Week 4: Integration & Polish
- [ ] Integrate settings button in main header
- [ ] Add comprehensive error handling
- [ ] Implement loading states and animations
- [ ] Test all functionality and edge cases

## Testing Strategy

### Unit Tests
- [ ] Settings context functions
- [ ] Validation utilities
- [ ] Storage operations

### Integration Tests
- [ ] Settings modal interactions
- [ ] Account management flows
- [ ] Navigation integration

### User Acceptance Testing
- [ ] Settings accessibility
- [ ] Form validation feedback
- [ ] Error handling UX
- [ ] Performance on various devices

## Success Metrics

### Functionality
- [ ] All settings can be modified and persisted
- [ ] Account changes work without breaking authentication
- [ ] Settings sync properly across devices

### User Experience
- [ ] Settings screen feels integrated with app design
- [ ] All actions provide clear feedback
- [ ] Error states are handled gracefully
- [ ] Performance is smooth on target devices

### Security
- [ ] Sensitive operations require re-authentication
- [ ] User data is properly protected
- [ ] Account deletion completely removes data
- [ ] Input validation prevents malicious input

## Conclusion

This implementation plan provides a comprehensive settings system that enhances user control while maintaining the app's existing design patterns and architecture. The phased approach allows for iterative development and testing, ensuring a robust and user-friendly settings experience.

The settings screen will become a central hub for user account management and app customization, significantly improving the overall user experience of CalcReno while maintaining the high-quality design and functionality standards established in the current application. 