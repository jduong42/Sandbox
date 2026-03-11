import { StyleSheet } from 'react-native';
import { figmaTheme as t } from './figmaTheme';

/**
 * Styles for FigmaStartWorkoutScreen.
 *
 * Dynamic colors (foreground, muted, surface, border) are applied inline via
 * the useTheme() hook — those properties are intentionally omitted from text
 * and container style entries here to avoid redundancy.
 */
export const figmaStartWorkoutStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: t.spacing.xl,
    paddingHorizontal: t.spacing.xl,
    paddingTop: t.spacing.xl,
  },
  title: {
    fontSize: t.typography.sizes.xxl,
    fontWeight: t.typography.weights.semibold,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: t.colors.primary,
    borderRadius: t.radius.xxl,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: t.typography.weights.semibold,
  },
  section: {
    marginBottom: t.spacing.xl,
    paddingHorizontal: t.spacing.xl,
  },
  sessionsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: t.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: t.typography.weights.semibold,
  },
  sessionsCount: {
    fontSize: 14,
  },
  sessionsList: {
    gap: t.spacing.md,
  },
  showMoreButton: {
    alignItems: 'center',
    borderRadius: t.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: t.spacing.sm,
    justifyContent: 'center',
    marginTop: t.spacing.lg,
    padding: t.spacing.lg,
    // backgroundColor and borderColor applied inline via c.surface / c.border
  },
  showMoreText: {
    fontSize: t.typography.sizes.base,
  },
  chevron: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    borderRadius: t.radius.lg,
    borderStyle: 'dashed',
    borderWidth: 1,
    padding: 20,
    // borderColor applied inline via c.border
  },
  emptyStateText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
