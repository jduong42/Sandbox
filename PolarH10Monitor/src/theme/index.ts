import { colors } from './colors';
import { darkColors } from './darkColors';
import { spacing, borderRadius, shadows } from './layout';
import { typography } from './typography';
import { paperTheme } from './paperTheme';
import { splashScreenStyles } from './splashScreen';
import { nativeIconStyles } from './nativeIcon';
import { errorBoundaryStyles } from './errorBoundary';
import { figmaStartSessionStyles } from './figmaStartSessionScreen';
import { figmaStartWorkoutStyles } from './figmaStartWorkoutScreen';

export const theme = {
  colors,
  darkColors,
  spacing,
  borderRadius,
  shadows,
  typography,
  paper: paperTheme,
} as const;

export type Theme = typeof theme;

// Export individual theme parts for convenience
export {
  colors,
  darkColors,
  spacing,
  borderRadius,
  shadows,
  typography,
  paperTheme,
};

// Export component styles
export {
  splashScreenStyles,
  nativeIconStyles,
  errorBoundaryStyles,
  figmaStartSessionStyles,
  figmaStartWorkoutStyles,
};

// Export types
export type { Colors } from './colors';
export type { DarkColors } from './darkColors';
export type { Spacing, BorderRadius, Shadows } from './layout';
export type { Typography } from './typography';
