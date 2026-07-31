import { figmaTheme } from './figmaTheme';
import { buildPaperTheme } from './paperTheme';
import { splashScreenStyles } from './splashScreen';
import { nativeIconStyles } from './nativeIcon';
import { figmaStartSessionStyles } from './figmaStartSessionScreen';
import { figmaStartWorkoutStyles } from './figmaStartWorkoutScreen';

// Export theme parts for convenience
export { figmaTheme, buildPaperTheme };

// Export component styles
export {
  splashScreenStyles,
  nativeIconStyles,
  figmaStartSessionStyles,
  figmaStartWorkoutStyles,
};

// Export types
export type { FigmaTheme } from './figmaTheme';
export type { ThemeColors } from './ThemeContext';
