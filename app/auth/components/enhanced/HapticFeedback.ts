import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export class HapticFeedback {
  // Platform-specific haptic availability check
  private static isHapticAvailable() {
    return Platform.OS === 'ios';
  }

  // Light impact for button presses
  static light() {
    if (this.isHapticAvailable()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  // Alias for light impact
  static lightImpact() {
    this.light();
  }

  // Medium impact for important actions
  static medium() {
    if (this.isHapticAvailable()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  // Heavy impact for errors or warnings
  static heavy() {
    if (this.isHapticAvailable()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }

  // Success notification
  static success() {
    if (this.isHapticAvailable()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  // Warning notification
  static warning() {
    if (this.isHapticAvailable()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }

  // Error notification
  static error() {
    if (this.isHapticAvailable()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  // Selection feedback
  static selection() {
    if (this.isHapticAvailable()) {
      Haptics.selectionAsync();
    }
  }

  // Enhanced custom patterns for specific interactions
  static customPattern() {
    if (this.isHapticAvailable()) {
      // Light -> Medium -> Light pattern
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 0);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 100);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 200);
    }
  }

  // Double tap pattern
  static doubleTap() {
    if (this.isHapticAvailable()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 100);
    }
  }

  // Long press pattern
  static longPress() {
    if (this.isHapticAvailable()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }

  // Swipe gesture pattern
  static swipe() {
    if (this.isHapticAvailable()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  // Form validation feedback
  static formValidation(isValid: boolean) {
    if (isValid) {
      this.success();
    } else {
      this.error();
    }
  }

  // Button press feedback
  static buttonPress() {
    this.light();
  }

  // Input focus feedback
  static inputFocus() {
    this.selection();
  }

  // Error state feedback
  static errorState() {
    this.error();
  }

  // Success state feedback
  static successState() {
    this.success();
  }

  // Navigation feedback
  static navigation() {
    this.light();
  }

  // Toggle feedback
  static toggle() {
    this.light();
  }

  // Form submission feedback
  static formSubmit() {
    this.medium();
  }
}
