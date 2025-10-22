export const darkColors = {
  // Primary colors - Modern fitness theme
  primary: '#00D4FF', // Cyan blue - modern fitness accent
  primaryDark: '#0099CC',
  primaryLight: '#33DDFF',
  secondary: '#FF6B35', // Orange accent for secondary actions

  // Background colors - Deep black theme
  background: '#0A0A0A', // Almost pure black
  backgroundSecondary: '#1A1A1A', // Slightly lighter for cards
  backgroundTertiary: '#2A2A2A', // For elevated surfaces
  surface: '#1E1E1E', // Card surfaces
  surfaceVariant: '#2D2D2D', // Alternative surface

  // Text colors
  text: '#FFFFFF', // Pure white for primary text
  textSecondary: '#B3B3B3', // Light gray for secondary text
  textTertiary: '#666666', // Darker gray for tertiary text
  textOnPrimary: '#000000', // Black text on primary colors

  // Status colors - Fitness themed
  success: '#00FF88', // Bright green for achievements
  warning: '#FFB800', // Amber for warnings
  error: '#FF4444', // Red for errors/danger zones
  info: '#00D4FF', // Same as primary

  // Heart rate zones - Professional fitness colors
  hrZone1: '#4CAF50', // Green - Recovery/Easy
  hrZone2: '#8BC34A', // Light Green - Aerobic Base
  hrZone3: '#FFC107', // Yellow - Aerobic
  hrZone4: '#FF9800', // Orange - Threshold
  hrZone5: '#F44336', // Red - VO2 Max/Anaerobic

  // Border colors
  border: '#333333',
  borderLight: '#404040',
  borderAccent: '#00D4FF',

  // System colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Glass morphism effects
  glassDark: 'rgba(0, 0, 0, 0.7)',
  glassLight: 'rgba(255, 255, 255, 0.1)',

  // Gradient colors
  gradientStart: '#0A0A0A',
  gradientEnd: '#1A1A1A',
  primaryGradientStart: '#00D4FF',
  primaryGradientEnd: '#0099CC',

  // Shadow colors
  shadow: 'rgba(0, 212, 255, 0.3)', // Cyan glow
  shadowDark: 'rgba(0, 0, 0, 0.8)',

  // Chart colors
  chartPrimary: '#00D4FF',
  chartSecondary: '#FF6B35',
  chartTertiary: '#00FF88',
  chartGrid: '#333333',
} as const;

export type DarkColors = typeof darkColors;
