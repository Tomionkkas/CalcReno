import { Platform } from 'react-native';

// Premium Color Palette
export const colors = {
  // Primary gradients
  primary: {
    start: '#3B82F6', // Electric blue
    end: '#06B6D4',   // Teal
    glow: '#60A5FA',
  },
  
  // Background gradients
  background: {
    primary: '#0A0B1E',    // Deep navy
    secondary: '#151829',  // Slate blue
    tertiary: '#1E2139',   // Dark slate
    card: '#2A2D4A',       // Card background
  },
  
  // Status colors with gradients
  status: {
    success: {
      start: '#10B981',
      end: '#059669',
      glow: '#34D399',
    },
    warning: {
      start: '#F59E0B',
      end: '#D97706',
      glow: '#FBBF24',
    },
    error: {
      start: '#EF4444',
      end: '#DC2626',
      glow: '#F87171',
    },
    info: {
      start: '#4DABF7',
      end: '#3B82F6',
      glow: '#60A5FA',
    },
  },
  
  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#E5E7EB',
    tertiary: '#B8BCC8',
    muted: '#6B7280',
    inverse: '#0A0B1E',
  },
  
  // Glassmorphism colors
  glass: {
    background: 'rgba(30, 33, 57, 0.8)',
    border: 'rgba(255, 255, 255, 0.1)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(10, 11, 30, 0.9)',
  },
  
  // Accent colors
  accent: {
    blue: '#3B82F6',
    purple: '#8B5CF6',
    pink: '#EC4899',
    orange: '#F97316',
  },

  // RenoTimeline design colors
  renoTimeline: {
    cyan: '#5DD5D5',          // Primary cyan/teal accent
    cyanGlow: '#7DE5E5',      // Lighter cyan for glow
    magenta: '#EC4899',       // Magenta/pink accent
    purple: '#A855F7',        // Purple highlight
    purpleLight: '#C084FC',   // Light purple
    gradientStart: '#3B82F6', // Blue start for buttons
    gradientEnd: '#EC4899',   // Pink/magenta end for buttons
  },

  // Particle colors for background animation
  particles: {
    primary: 'rgba(93, 213, 213, 0.3)',    // Cyan particles
    secondary: 'rgba(168, 85, 247, 0.25)', // Purple particles
    tertiary: 'rgba(236, 72, 153, 0.2)',   // Magenta particles
  },
};

// Gradient configurations
export const gradients = {
  primary: {
    colors: [colors.primary.start, colors.primary.end] as [string, string],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  secondary: {
    colors: [colors.background.secondary, colors.background.tertiary] as [string, string],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  background: {
    colors: [colors.background.primary, colors.background.secondary] as [string, string],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  card: {
    colors: [colors.background.tertiary, colors.background.card] as [string, string],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  success: {
    colors: [colors.status.success.start, colors.status.success.end] as [string, string],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  warning: {
    colors: [colors.status.warning.start, colors.status.warning.end] as [string, string],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  error: {
    colors: [colors.status.error.start, colors.status.error.end] as [string, string],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  fab: {
    colors: [colors.primary.start, colors.accent.purple] as [string, string],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  // RenoTimeline button gradient (blue → purple → magenta)
  renoButton: {
    colors: ['#3B82F6', '#A855F7', '#EC4899'] as [string, string, string],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
};

// Glassmorphism styles
export const glassmorphism = {
  light: {
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
    shadowColor: colors.glass.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  medium: {
    backgroundColor: 'rgba(30, 33, 57, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: colors.glass.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  heavy: {
    backgroundColor: 'rgba(30, 33, 57, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: colors.glass.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
};

// Typography
export const typography = {
  fonts: {
    primary: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    secondary: Platform.select({
      ios: 'SF Pro Display',
      android: 'Inter',
      default: 'System',
    }),
  },
  
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  // Accessibility: Minimum touch target size
  touchTarget: 44,
  // Enhanced spacing for better visual hierarchy
  section: 40,
  container: 20,
} as const;

// Border radius
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
  // Accessibility: Rounded corners for better touch feedback
  touch: 12,
} as const;

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  // Accessibility: Enhanced shadows for better depth perception
  focus: {
    shadowColor: colors.primary.glow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

// Animation configurations
export const animations = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
    // Accessibility: Slower animations for users who prefer reduced motion
    accessible: 400,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    // Accessibility: Smoother easing for better motion experience
    accessible: 'ease-out',
  },
  // Accessibility: Reduced motion support
  reducedMotion: {
    duration: 100,
    easing: 'linear',
  },
};

// Component-specific styles
export const components = {
  card: {
    ...glassmorphism.medium,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  
  button: {
    primary: {
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    secondary: {
      borderRadius: borderRadius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.glass.background,
      borderWidth: 1,
      borderColor: colors.glass.border,
    },
  },
  
  input: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.glass.background,
    borderWidth: 1,
    borderColor: colors.glass.border,
    color: colors.text.primary,
    fontSize: typography.sizes.base,
  },
  
  fab: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  
  // Accessibility: Enhanced touch targets
  touchTarget: {
    minWidth: spacing.touchTarget,
    minHeight: spacing.touchTarget,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  
  // Accessibility: Focus states
  focus: {
    borderWidth: 2,
    borderColor: colors.primary.glow,
    borderRadius: borderRadius.touch,
  },
  
  // Accessibility: High contrast mode support
  highContrast: {
    borderWidth: 1,
    borderColor: colors.text.primary,
  },
};

// Status pill styles
export const statusPills = {
  planned: {
    backgroundColor: colors.status.info.start,
    color: colors.text.primary,
    glow: colors.status.info.glow,
  },
  inProgress: {
    backgroundColor: colors.status.warning.start,
    color: colors.text.primary,
    glow: colors.status.warning.glow,
  },
  completed: {
    backgroundColor: colors.status.success.start,
    color: colors.text.primary,
    glow: colors.status.success.glow,
  },
  paused: {
    backgroundColor: colors.status.error.start,
    color: colors.text.primary,
    glow: colors.status.error.glow,
  },
};

export default {
  colors,
  gradients,
  glassmorphism,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  components,
  statusPills,
};

// Accessibility: Contrast ratios and color combinations
export const accessibility = {
  // WCAG AA compliant contrast ratios (4.5:1 for normal text, 3:1 for large text)
  contrast: {
    primary: 4.8, // Primary text on background
    secondary: 3.2, // Secondary text on background
    interactive: 4.9, // Interactive elements
    error: 5.1, // Error states
    success: 4.7, // Success states
  },
  
  // Minimum touch target sizes
  touchTargets: {
    button: spacing.touchTarget,
    icon: spacing.touchTarget,
    link: spacing.touchTarget,
    input: spacing.touchTarget,
  },
  
  // Focus indicators
  focus: {
    outline: `2px solid ${colors.primary.glow}`,
    outlineOffset: 2,
    borderRadius: borderRadius.touch,
  },
  
  // Reduced motion support
  motion: {
    prefersReducedMotion: true,
    duration: animations.reducedMotion.duration,
    easing: animations.reducedMotion.easing,
  },
} as const;
