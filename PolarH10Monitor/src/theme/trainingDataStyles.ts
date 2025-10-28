import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './layout';

export const trainingDataStyles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flex: 1,
    padding: spacing.md,
  },

  // Connection Status
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  connectionStatusConnected: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.success,
  },
  connectionStatusDisconnected: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.error,
  },
  connectionStatusText: {
    ...typography.body,
    marginLeft: spacing.sm,
    flex: 1,
  },
  connectionStatusTextConnected: {
    color: colors.success,
  },
  connectionStatusTextDisconnected: {
    color: colors.error,
  },

  // Active Recording Card
  activeRecordingCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activeRecordingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
    marginRight: spacing.sm,
  },
  activeRecordingTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },

  // Recording Details
  recordingDetails: {
    marginBottom: spacing.md,
  },
  recordingDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  recordingDetailLabel: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  recordingDetailValue: {
    ...typography.body,
    color: colors.text,
  },

  // Stop Button
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    borderRadius: 8,
    padding: spacing.md,
  },
  stopButtonText: {
    ...typography.button,
    color: colors.surface,
    marginLeft: spacing.sm,
  },

  // Recording Card
  recordingCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recordingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  recordingIcon: {
    marginRight: spacing.sm,
  },
  recordingTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  recordingSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },

  // Session Input
  sessionInputContainer: {
    marginBottom: spacing.md,
  },
  sessionInputLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  sessionInput: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  sessionInputFocused: {
    borderColor: colors.primary,
  },

  // Recording Button
  recordingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
  },
  recordingButtonDisabled: {
    backgroundColor: colors.backgroundTertiary,
  },
  recordingButtonText: {
    ...typography.button,
    color: colors.surface,
    marginLeft: spacing.sm,
  },
  recordingButtonTextDisabled: {
    color: colors.textSecondary,
  },

  // History Card
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  historyTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  historyEmpty: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: spacing.lg,
  },

  // History Items
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyItemLast: {
    borderBottomWidth: 0,
  },
  historyItemLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  historyItemName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  historyItemDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  historyItemDuration: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500',
  },

  // Helper styles
  emergencyButton: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    alignItems: 'center',
  },
  emergencyButtonText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
  quickStartButton: {
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  quickStartButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});
