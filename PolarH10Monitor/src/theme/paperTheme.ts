import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { figmaTheme as t } from './figmaTheme';
import type { ThemeColors } from './ThemeContext';

/**
 * Builds a react-native-paper theme from the app's actual current colors
 * (figmaTheme brand tokens + ThemeContext's light/dark `c`), so the handful
 * of Paper components in the app (PaperProvider wrapper, Surface elevation
 * on the splash screen) never fall out of sync with the rest of the UI.
 */
export function buildPaperTheme(c: ThemeColors, isDark: boolean) {
  const base = isDark ? MD3DarkTheme : MD3LightTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: t.colors.primary,
      primaryContainer: t.colors.primaryHover,
      secondary: t.colors.primaryTo,
      secondaryContainer: t.colors.primaryToHover,
      tertiary: t.colors.green,
      surface: c.surface,
      surfaceVariant: c.accent,
      background: c.backgroundSolid,
      error: t.colors.red,
      errorContainer: t.colors.redTint,
      onPrimary: '#ffffff',
      onSecondary: '#ffffff',
      onSurface: c.foreground,
      onBackground: c.foreground,
      outline: c.border,
      outlineVariant: c.border,
      inverseSurface: c.foreground,
      inverseOnSurface: c.backgroundSolid,
      inversePrimary: t.colors.primaryHover,
    },
    roundness: 12,
  };
}
