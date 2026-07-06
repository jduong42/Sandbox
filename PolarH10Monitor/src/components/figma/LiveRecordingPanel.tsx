import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useRecordingStore } from '../../store/recordingStore';
import { HeartRateZoneCalculator } from '../../services/TRIMPCalculator';
import { HeartRateZone } from '../../types/training';

interface LiveRecordingPanelProps {
  /** Start time of the active session, used to tick the elapsed timer. */
  startTime: Date;
}

// Per-theme zone colors, chosen to meet WCAG 2.2 AA (4.5:1) as *text* color
// against each theme's surface — the original HeartRateZoneCalculator
// palette was tuned for the dark theme only and fails on white (verified:
// only 1/5 cleared 3:1, none cleared 4.5:1 against #ffffff).
const ZONE_TEXT_COLOR_DARK: Record<HeartRateZone, string> = {
  [HeartRateZone.ZONE_1]: '#4CAF50',
  [HeartRateZone.ZONE_2]: '#8BC34A',
  [HeartRateZone.ZONE_3]: '#FFC107',
  [HeartRateZone.ZONE_4]: '#FF9800',
  [HeartRateZone.ZONE_5]: '#f87171', // brighter than the base palette's
  // #F44336 (3.97:1 on dark surface) so it clears the 4.5:1 AA minimum too.
};

const ZONE_TEXT_COLOR_LIGHT: Record<HeartRateZone, string> = {
  [HeartRateZone.ZONE_1]: '#15803d',
  [HeartRateZone.ZONE_2]: '#4d7c0f',
  [HeartRateZone.ZONE_3]: '#b45309',
  [HeartRateZone.ZONE_4]: '#c2410c',
  [HeartRateZone.ZONE_5]: '#b91c1c',
};

function formatElapsed(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function LiveRecordingPanel({ startTime }: LiveRecordingPanelProps) {
  const { c, isDark } = useTheme();
  const currentHeartRate = useRecordingStore(s => s.currentHeartRate);
  const currentZone = useRecordingStore(s => s.currentZone);
  const pmdActive = useRecordingStore(s => s.pmdActive);

  const [elapsedSeconds, setElapsedSeconds] = useState(() =>
    Math.floor((Date.now() - startTime.getTime()) / 1000),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const zoneColors = isDark ? ZONE_TEXT_COLOR_DARK : ZONE_TEXT_COLOR_LIGHT;
  const zoneColor = currentZone != null ? zoneColors[currentZone] : c.muted;
  const zoneName =
    currentZone != null
      ? HeartRateZoneCalculator.getZoneInfo()[currentZone].name
      : null;

  // One combined, coherent phrase for screen readers rather than three
  // fragmented labels — and deliberately not auto-announced every second
  // (that would itself be a bad screen-reader experience for a once-a-second
  // value); it's exposed as a normal on-demand focusable element instead.
  const accessibilityLabel =
    currentHeartRate == null
      ? 'Waiting for heart rate signal'
      : `Heart rate ${currentHeartRate} beats per minute${
          zoneName ? `, zone ${currentZone} ${zoneName}` : ''
        }`;

  return (
    <View
      style={[styles.container, { backgroundColor: c.surface, borderColor: c.border }]}
    >
      <View accessible accessibilityLabel={accessibilityLabel}>
        {currentHeartRate == null ? (
          <Text style={[styles.waiting, { color: c.muted }]}>
            Waiting for signal…
          </Text>
        ) : (
          <View style={styles.bpmRow}>
            <Text
              style={[styles.bpmValue, { color: c.foreground }]}
              importantForAccessibility="no-hide-descendants"
            >
              {currentHeartRate}
            </Text>
            <Text
              style={[styles.bpmUnit, { color: c.muted }]}
              importantForAccessibility="no-hide-descendants"
            >
              BPM
            </Text>
          </View>
        )}

        {zoneName != null && (
          <View
            style={[
              styles.zoneBadge,
              { backgroundColor: zoneColor + '22', borderColor: zoneColor + '55' },
            ]}
            importantForAccessibility="no-hide-descendants"
          >
            <View style={[styles.zoneDot, { backgroundColor: zoneColor }]} />
            <Text style={[styles.zoneText, { color: zoneColor }]}>{zoneName}</Text>
          </View>
        )}
      </View>

      <Text
        style={[styles.timer, { color: c.foreground }]}
        accessibilityLabel={`Elapsed time ${formatElapsed(elapsedSeconds)}`}
      >
        {formatElapsed(elapsedSeconds)}
      </Text>

      <Text style={[styles.signalStatus, { color: c.muted }]}>
        {pmdActive ? 'Motion tracking active' : 'Heart rate only'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 12,
  },
  waiting: {
    fontSize: 17,
    fontWeight: '600',
    paddingVertical: 20,
  },
  bpmRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 8,
  },
  bpmValue: {
    fontSize: 72,
    fontWeight: '700',
    lineHeight: 78,
  },
  bpmUnit: {
    fontSize: 17,
    fontWeight: '600',
  },
  zoneBadge: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'center',
  },
  zoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  zoneText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timer: {
    fontSize: 20,
    fontWeight: '600',
  },
  signalStatus: {
    fontSize: 13,
  },
});
