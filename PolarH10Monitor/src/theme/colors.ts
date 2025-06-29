export const colors = {
  // Primary colors
  primary: '#007AFF',
  primaryDark: '#0056CC',
  primaryLight: '#5AC8FA',

  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',
  backgroundTertiary: '#F9F9F9',

  // Text colors
  text: '#000000',
  textSecondary: '#6D6D70',
  textTertiary: '#C7C7CC',

  // Status colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',

  // Border colors
  border: '#C6C6C8',
  borderLight: '#E5E5EA',

  // System colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type Colors = typeof colors;
