import { StyleSheet } from 'react-native';
import { theme } from '.';

export const chartComponentStyles = StyleSheet.create({
  // HeartRateZonesChart styles
  chartContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },

  // Zone Detail Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalColorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: theme.spacing.md,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
  },
  modalRange: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  modalSection: {
    marginBottom: theme.spacing.lg,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  modalText: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: theme.spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  benefitBullet: {
    fontSize: 16,
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  benefitText: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    flex: 1,
  },
  closeButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  closeButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },

  // Improved Zone Bar styles
  improvedZoneContainer: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  improvedZoneLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  improvedZoneName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    includeFontPadding: false,
  },
  improvedBarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  improvedBarTrack: {
    flex: 1,
    height: 20,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.md,
    overflow: 'hidden',
  },
  improvedBar: {
    height: '100%',
    borderRadius: theme.borderRadius.sm,
    minWidth: 4,
  },
  improvedValueContainer: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  improvedTimeValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    includeFontPadding: false,
    marginBottom: 2,
  },
  improvedPercentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    includeFontPadding: false,
  },

  // Donut Chart styles
  donutContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  donutChartContainer: {
    marginBottom: theme.spacing.md,
  },
  donutLegend: {
    width: '100%',
  },
  donutLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  donutLegendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.sm,
  },
  donutLegendLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    flex: 1,
    includeFontPadding: false,
  },
  donutLegendValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    includeFontPadding: false,
  },

  // Chart component common styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
});
