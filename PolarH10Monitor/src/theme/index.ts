import { colors } from './colors';
import { spacing, borderRadius, shadows } from './layout';
import { typography } from './typography';

export const theme = {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
} as const;

export type Theme = typeof theme;

// Export individual theme parts for convenience
export { colors, spacing, borderRadius, shadows, typography };

// Export types
export type { Colors } from './colors';
export type { Spacing, BorderRadius, Shadows } from './layout';
export type { Typography } from './typography';
