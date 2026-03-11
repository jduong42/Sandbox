import { colors } from './colors';
import { darkColors } from './darkColors';
import { spacing, borderRadius, shadows } from './layout';
import { typography } from './typography';
import { paperTheme } from './paperTheme';
import {
  homeScreenStyles,
  bluetoothButtonStyles,
  settingsScreenStyles,
  trainingScreenStyles,
} from './styles';
import { llamaTestScreenStyles } from './llamaTestScreen';
import { splashScreenStyles } from './splashScreen';
import { nativeIconStyles } from './nativeIcon';
import { errorBoundaryStyles } from './errorBoundary';
import { logViewerScreenStyles } from './logViewerScreen';
import { detailScreenStyles } from './detailScreen';
import { modelSwitcherStyles } from './modelSwitcher';
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

// Export component styles for convenience
export {
  homeScreenStyles,
  bluetoothButtonStyles,
  settingsScreenStyles,
  trainingScreenStyles,
  llamaTestScreenStyles,
  splashScreenStyles,
  nativeIconStyles,
  errorBoundaryStyles,
  logViewerScreenStyles,
  detailScreenStyles,
  modelSwitcherStyles,
  figmaStartSessionStyles,
  figmaStartWorkoutStyles,
};

// Export types
export type { Colors } from './colors';
export type { DarkColors } from './darkColors';
export type { Spacing, BorderRadius, Shadows } from './layout';
export type { Typography } from './typography';
