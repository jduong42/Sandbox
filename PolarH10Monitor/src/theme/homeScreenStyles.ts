import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './layout';

export const homeScreenStyles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },

  // Header
  header: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  welcomeText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  titleText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },

  // Heart Rate Monitor
  heartRateMonitor: {
    marginBottom: spacing.md,
  },

  // Stats Grid
  statsGrid: {
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  statCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  cardIcon: {
    fontSize: 20,
  },

  // Divider
  divider: {
    backgroundColor: colors.border,
    marginVertical: spacing.md,
    marginHorizontal: spacing.xl,
  },

  // Quick Actions
  quickActions: {
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  actionIcon: {
    fontSize: 24,
  },

  // Layout
  bottomSpacing: {
    height: 100,
  },
});
