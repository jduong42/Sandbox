import { StyleSheet } from 'react-native';
import { figmaTheme as t } from './figmaTheme';

/**
 * Styles for FigmaStartSessionScreen.
 *
 * Note: scrollContent intentionally omits paddingBottom — apply
 * { paddingBottom: BOTTOM_INSET + 24 } inline at the call site to
 * account for the iOS home-indicator inset at runtime.
 */
export const figmaStartSessionStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: t.colors.surface,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(51,65,85,0.6)',
    borderRadius: t.radius.xl,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    color: t.colors.foreground,
    flex: 1,
    fontSize: 18,
    fontWeight: t.typography.weights.bold,
    textAlign: 'center',
  },
  scrollContent: {
    padding: t.spacing.xl,
    // paddingBottom applied inline: BOTTOM_INSET + 24
  },
  sectionLabel: {
    color: t.colors.muted,
    fontSize: t.typography.sizes.sm,
    fontWeight: t.typography.weights.semibold,
    letterSpacing: 0.8,
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    backgroundColor: t.colors.surface,
    borderColor: t.colors.accent,
    borderRadius: t.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  chipActive: {
    backgroundColor: '#7c3aed',
    borderColor: t.colors.primary,
  },
  chipText: {
    color: t.colors.muted,
    fontSize: t.typography.sizes.base,
    fontWeight: t.typography.weights.medium,
  },
  chipTextActive: {
    color: t.colors.foreground,
    fontWeight: t.typography.weights.semibold,
  },
  input: {
    backgroundColor: t.colors.surface,
    borderColor: t.colors.accent,
    borderRadius: t.radius.md,
    borderWidth: 1,
    color: t.colors.foreground,
    fontSize: 16,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: 14,
  },
  btnWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  btn: {
    alignItems: 'center',
    borderRadius: 14,
    height: 64,
    justifyContent: 'center',
  },
  btnText: {
    color: t.colors.foreground,
    fontSize: t.typography.sizes.base,
    fontWeight: t.typography.weights.bold,
  },
});
