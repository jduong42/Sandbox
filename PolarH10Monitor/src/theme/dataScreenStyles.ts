import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './layout';

export const dataScreenStyles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  // Header
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },

  // Connection Status
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  // Heart Rate Display
  heartRateCard: {
    alignItems: 'center',
  },
  heartRateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heartRateDisplay: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heartRateValue: {
    fontSize: 64,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    lineHeight: 72,
  },
  heartRateUnit: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  heartRateStatus: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },

  // Summary
  summaryCard: {},
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Controls
  controlsCard: {},
  controlsContainer: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.md,
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.error,
  },
  disabledButton: {
    backgroundColor: colors.backgroundSecondary,
  },
  controlButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: 'white',
  },
  disabledText: {
    color: colors.textSecondary,
  },

  // Layout
  bottomSpacing: {
    height: 100,
  },
});
