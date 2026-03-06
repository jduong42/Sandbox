import { MD3DarkTheme } from 'react-native-paper';
import { darkColors } from './darkColors';

export const paperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkColors.primary,
    primaryContainer: darkColors.primaryDark,
    secondary: darkColors.secondary,
    secondaryContainer: darkColors.secondary + '20',
    tertiary: darkColors.success,
    surface: darkColors.surface,
    surfaceVariant: darkColors.surfaceVariant,
    background: darkColors.background,
    error: darkColors.error,
    errorContainer: darkColors.error + '20',
    onPrimary: darkColors.textOnPrimary,
    onSecondary: darkColors.text,
    onSurface: darkColors.text,
    onBackground: darkColors.text,
    outline: darkColors.border,
    outlineVariant: darkColors.borderLight,
    shadow: darkColors.shadow,
    scrim: darkColors.glassDark,
    inverseSurface: darkColors.white,
    inverseOnSurface: darkColors.black,
    inversePrimary: darkColors.primaryDark,
  },
  roundness: 12, // Modern rounded corners
};
