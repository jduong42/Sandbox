import { StyleSheet, Dimensions } from 'react-native';
import { figmaTheme as t } from './figmaTheme';

const { width, height } = Dimensions.get('window');

/**
 * Splash renders before ThemeProvider mounts, so it can't read the user's
 * persisted light/dark choice without delaying first paint — it always
 * uses figmaTheme's dark palette (the app's default), matching what the
 * app itself renders in dark mode so there's no color flash on launch.
 */
export const splashScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  gradient: {
    flex: 1,
    width: width,
    height: height,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: t.spacing.xxl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: t.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: t.spacing.xxl * 1.5,
  },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: t.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoIcon: {
    fontSize: 50,
    zIndex: 2,
  },
  pulseRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: t.colors.primary,
    opacity: 0.3,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: t.spacing.xxl * 2,
  },
  appTitle: {
    fontSize: t.typography.sizes.xxxl,
    fontWeight: t.typography.weights.bold,
    color: t.colors.foreground,
    textAlign: 'center',
    marginBottom: t.spacing.sm,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: t.typography.sizes.base,
    color: t.colors.muted,
    textAlign: 'center',
    fontWeight: t.typography.weights.regular,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: t.spacing.xxl,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: t.spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: t.colors.primary,
    marginHorizontal: 4,
  },
  loadingText: {
    fontSize: t.typography.sizes.sm,
    color: t.colors.muted,
    fontWeight: t.typography.weights.medium,
  },
});
