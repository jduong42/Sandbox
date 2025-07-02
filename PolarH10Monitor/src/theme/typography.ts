export const typography = {
  // Font sizes
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    huge: 32,
  },

  // Font weights
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },

  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },

  // Font families (you can customize these based on your app's fonts)
  families: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },

  // Pre-defined text styles
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 1.2,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 1.3,
  },
  h4: {
    fontSize: 20,
    fontWeight: '500' as const,
    lineHeight: 1.3,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 1.4,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 1.4,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 1.2,
  },
} as const;

export type Typography = typeof typography;
