import { StyleSheet } from 'react-native';
import { figmaTheme as t } from './figmaTheme';

/**
 * Layout-only styles for FigmaStartSessionScreen — colors are applied
 * inline at the call site via useTheme()'s `c.*`, following the same
 * pattern as SessionDetailScreen/FigmaSettingsScreen, so this screen
 * follows the app's light/dark toggle instead of being hardcoded dark.
 *
 * The two exceptions are the brand purple/pink CTA gradient and the
 * "active chip" state: both use a fixed brand-purple background regardless
 * of app theme, so their text colors are fixed light literals too (not
 * `c.foreground`, which would turn near-black in light mode and become
 * unreadable against that fixed purple background).
 *
 * Note: scrollContent intentionally omits paddingBottom — apply
 * { paddingBottom: BOTTOM_INSET + 24 } inline at the call site to
 * account for the iOS home-indicator inset at runtime.
 */
export const figmaStartSessionStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    alignItems: 'center',
    borderRadius: t.radius.xl,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerSpacer: {
    width: 40,
  },
  title: {
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
    fontSize: t.typography.sizes.base,
    fontWeight: t.typography.weights.medium,
  },
  chipTextActive: {
    // Fixed light literal, not theme-following — see file header note.
    color: '#f1f5f9',
    fontWeight: t.typography.weights.semibold,
  },
  input: {
    borderRadius: t.radius.md,
    borderWidth: 1,
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
    // Fixed light literal, not theme-following — see file header note.
    color: '#f1f5f9',
    fontSize: t.typography.sizes.base,
    fontWeight: t.typography.weights.bold,
  },
});
