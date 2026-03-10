import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import type { StreakData } from '../../utils/StreakCalculator';

interface StreakCardProps {
  data: StreakData;
}

export function StreakCard({ data }: StreakCardProps) {
  const { c } = useTheme();

  const hasStreak = data.currentStreak > 0;

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      {/* Latest milestone badge */}
      {data.latestMilestone && (
        <View style={[styles.milestoneBadge, { backgroundColor: '#f59e0b22', borderColor: '#f59e0b55' }]}>
          <Text style={styles.milestoneIcon}>{data.latestMilestone.icon}</Text>
          <Text style={[styles.milestoneLabel, { color: '#f59e0b' }]}>
            {data.latestMilestone.label}
          </Text>
          <Text style={[styles.milestoneDesc, { color: c.muted }]}>
            {data.latestMilestone.description}
          </Text>
        </View>
      )}

      {/* Main streak display */}
      <View style={styles.streakRow}>
        <View style={styles.streakMain}>
          <Text style={styles.streakFire}>{hasStreak ? '🔥' : '💤'}</Text>
          <View>
            <Text style={[styles.streakNumber, { color: c.foreground }]}>
              {data.currentStreak}
            </Text>
            <Text style={[styles.streakSub, { color: c.muted }]}>
              {data.currentStreak === 1 ? 'day streak' : 'day streak'}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: c.border }]} />

        {/* Stats */}
        <View style={styles.statsCol}>
          <StatRow
            label="Best streak"
            value={`${data.longestStreak}d`}
            c={c}
          />
          <StatRow
            label="Total sessions"
            value={String(data.totalSessions)}
            c={c}
          />
          {data.daysSinceLastSession !== null && (
            <StatRow
              label="Last session"
              value={
                data.daysSinceLastSession === 0
                  ? 'Today'
                  : data.daysSinceLastSession === 1
                  ? 'Yesterday'
                  : `${data.daysSinceLastSession}d ago`
              }
              c={c}
            />
          )}
        </View>
      </View>

      {/* Milestone progress dots */}
      {data.totalSessions > 0 && (
        <View style={styles.dotsRow}>
          {[1, 5, 10, 25, 50, 100].map(threshold => {
            const reached = data.totalSessions >= threshold;
            return (
              <View
                key={threshold}
                style={[
                  styles.dot,
                  {
                    backgroundColor: reached ? '#f59e0b' : c.border,
                    borderColor: reached ? '#f59e0b' : c.border,
                  },
                ]}
              />
            );
          })}
          <Text style={[styles.dotsLabel, { color: c.muted }]}>
            {data.totalSessions} / 100 sessions
          </Text>
        </View>
      )}
    </View>
  );
}

function StatRow({
  label,
  value,
  c,
}: {
  label: string;
  value: string;
  c: ReturnType<typeof useTheme>['c'];
}) {
  return (
    <View style={styles.statRow}>
      <Text style={[styles.statLabel, { color: c.muted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: c.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  milestoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  milestoneIcon: {
    fontSize: 18,
  },
  milestoneLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  milestoneDesc: {
    fontSize: 12,
    flex: 1,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  streakMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 90,
  },
  streakFire: {
    fontSize: 32,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 40,
  },
  streakSub: {
    fontSize: 12,
  },
  divider: {
    width: 1,
    alignSelf: 'stretch',
  },
  statsCol: {
    flex: 1,
    gap: 6,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
  dotsLabel: {
    fontSize: 11,
    marginLeft: 4,
  },
});
