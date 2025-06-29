import { StyleSheet } from 'react-native';
import { theme } from '../theme';

export const homeScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.xxxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight:
      theme.typography.sizes.xxxl * theme.typography.lineHeights.normal,
    marginBottom: theme.spacing.xl,
  },
  buttonContainer: {
    marginTop: theme.spacing.lg,
  },
});

export const bluetoothButtonStyles = StyleSheet.create({
  button: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    minWidth: 200,
    ...theme.shadows.medium,
  },
  buttonDefault: {
    backgroundColor: theme.colors.primary,
  },
  buttonConnected: {
    backgroundColor: theme.colors.success,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.backgroundSecondary,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  buttonText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    textAlign: 'center',
  },
});

export const bleStatusBarStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.lg,
    minHeight: 36,
  },
  icon: {
    marginRight: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.white,
    textAlign: 'center',
  },
});
