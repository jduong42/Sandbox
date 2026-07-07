import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useRecordingStore } from '../../store/recordingStore';
import { HeartRateZoneCalculator } from '../../services/TRIMPCalculator';
import { ZONE_TEXT_COLOR_DARK, ZONE_TEXT_COLOR_LIGHT } from '../../theme/zoneColors';

interface LiveRecordingPanelProps {
  /** Start time of the active session, used to tick the elapsed timer. */
  startTime: Date;
}

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
  const sessionAvgHeartRate = useRecordingStore(s => s.sessionAvgHeartRate);
  const sessionPeakHeartRate = useRecordingStore(s => s.sessionPeakHeartRate);
  const currentTrimp = useRecordingStore(s => s.currentTrimp);
  const zoneDurations = useRecordingStore(s => s.zoneDurations);

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
  // "Zone N · Name" rather than just the name — the name alone doesn't tell
  // you where it falls on the 1-5 scale (e.g. is "Active Recovery" the top
  // or bottom zone?).
  const zoneLabel =
    currentZone != null && zoneName != null
      ? `Zone ${currentZone} · ${zoneName}`
      : null;
  const zoneTimeSeconds = currentZone != null ? zoneDurations[currentZone] : 0;
  const zoneBadgeLabel =
    zoneLabel != null && zoneTimeSeconds > 0
      ? `${zoneLabel} · ${formatElapsed(Math.round(zoneTimeSeconds))} in zone`
      : zoneLabel;

  const statsAccessibilityLabel =
    sessionAvgHeartRate != null
      ? `Session average ${sessionAvgHeartRate} beats per minute, peak ${sessionPeakHeartRate}, training impulse ${currentTrimp?.toFixed(1) ?? 0}`
      : undefined;

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
            <Text style={[styles.zoneText, { color: zoneColor }]}>
              {zoneBadgeLabel}
            </Text>
          </View>
        )}
      </View>

      <Text
        style={[styles.timer, { color: c.foreground }]}
        accessibilityLabel={`Elapsed time ${formatElapsed(elapsedSeconds)}`}
      >
        {formatElapsed(elapsedSeconds)}
      </Text>

      {sessionAvgHeartRate != null && (
        <View
          style={[styles.statsRow, { borderTopColor: c.border }]}
          accessible
          accessibilityLabel={statsAccessibilityLabel}
        >
          <StatItem label="Avg" value={`${sessionAvgHeartRate}`} c={c} />
          <View style={[styles.statDivider, { backgroundColor: c.border }]} />
          <StatItem label="Peak" value={`${sessionPeakHeartRate}`} c={c} />
          <View style={[styles.statDivider, { backgroundColor: c.border }]} />
          <StatItem label="TRIMP" value={(currentTrimp ?? 0).toFixed(1)} c={c} />
        </View>
      )}

      <Text style={[styles.signalStatus, { color: c.muted }]}>
        {pmdActive ? 'Motion tracking active' : 'Heart rate only'}
      </Text>
    </View>
  );
}

function StatItem({
  label,
  value,
  c,
}: {
  label: string;
  value: string;
  c: ReturnType<typeof useTheme>['c'];
}) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statLabel, { color: c.muted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: c.foreground }]}>{value}</Text>
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
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
    width: '100%',
    gap: 20,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  signalStatus: {
    fontSize: 13,
  },
});
