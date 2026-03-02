/**
 * Design tokens matching the figmaMake design system.
 * Dark-only theme based on Tailwind slate palette + purple/pink accents.
 */
export const figmaTheme = {
  colors: {
    // Backgrounds
    background: '#0f172a', // slate-950
    surface: '#1e293b', // slate-800
    surfaceHover: '#243347',
    accent: '#334155', // slate-700
    accentHover: '#3d4f67',

    // Borders
    border: 'rgba(255,255,255,0.08)',

    // Text
    foreground: '#f1f5f9', // slate-100
    muted: '#94a3b8', // slate-400

    // Brand
    primary: '#a855f7', // purple-500
    primaryTo: '#ec4899', // pink-500
    primaryHover: '#9333ea', // purple-600
    primaryToHover: '#db2777', // pink-600

    // Semantic
    red: '#ef4444',
    redHover: '#dc2626',
    green: '#22c55e',
    blue: '#3b82f6',
    orange: '#fb923c',
    amber: '#f59e0b',

    // Tinted backgrounds (icon wells)
    blueTint: 'rgba(59,130,246,0.1)',
    blueTintBorder: 'rgba(59,130,246,0.2)',
    greenTint: 'rgba(34,197,94,0.1)',
    greenTintBorder: 'rgba(34,197,94,0.2)',
    redTint: 'rgba(239,68,68,0.1)',
    redTintBorder: 'rgba(239,68,68,0.2)',
    purpleTint: 'rgba(168,85,247,0.1)',
    purpleTintBorder: 'rgba(168,85,247,0.2)',
    amberTint: 'rgba(245,158,11,0.1)',
    amberTintBorder: 'rgba(245,158,11,0.2)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },
  typography: {
    sizes: {
      xs: 11,
      sm: 13,
      base: 15,
      lg: 17,
      xl: 20,
      xxl: 24,
      xxxl: 30,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },
} as const;

export type FigmaTheme = typeof figmaTheme;
