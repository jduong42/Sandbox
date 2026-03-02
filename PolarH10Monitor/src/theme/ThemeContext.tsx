import React, { createContext, useContext, useState } from 'react';
import { figmaTheme as t } from './figmaTheme';

export const DARK_COLORS = {
  background: ['#0f172a', '#1e293b'] as [string, string],
  backgroundSolid: '#0f172a',
  surface: t.colors.surface,
  accent: t.colors.accent,
  border: t.colors.border,
  foreground: t.colors.foreground,
  muted: t.colors.muted,
  amberTint: t.colors.amberTint,
  connectedBg: 'rgba(34,197,94,0.1)',
  connectedBorder: 'rgba(34,197,94,0.3)',
  connectedText: '#86efac',
  statusBar: 'light-content' as const,
};

export const LIGHT_COLORS = {
  background: ['#f1f5f9', '#e2e8f0'] as [string, string],
  backgroundSolid: '#f1f5f9',
  surface: '#ffffff',
  accent: '#e2e8f0',
  border: 'rgba(0,0,0,0.09)',
  foreground: '#0f172a',
  muted: '#64748b',
  amberTint: 'rgba(245,158,11,0.15)',
  connectedBg: '#f0fdf4',
  connectedBorder: '#16a34a',
  connectedText: '#15803d',
  statusBar: 'dark-content' as const,
};

export type ThemeColors = {
  background: [string, string];
  backgroundSolid: string;
  surface: string;
  accent: string;
  border: string;
  foreground: string;
  muted: string;
  amberTint: string;
  connectedBg: string;
  connectedBorder: string;
  connectedText: string;
  statusBar: 'light-content' | 'dark-content';
};

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
  c: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: true,
  toggleTheme: () => {},
  c: DARK_COLORS,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  const toggleTheme = () => setIsDark(v => !v);
  const c = isDark ? DARK_COLORS : LIGHT_COLORS;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, c }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
