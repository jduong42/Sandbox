import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../theme/ThemeContext';
import { RootStackParamList } from '../navigation/NavigationTypes';
import { sessionRepository } from '../services/SessionRepository';
import { sessionRecordingService } from '../services/SessionRecordingService';
import { HeartRateZoneCalculator } from '../services/TRIMPCalculator';
import { getZoneTextColor } from '../theme/zoneColors';
import type { TrainingSession } from '../types/training';

type Nav = StackNavigationProp<RootStackParamList, 'SessionDetail'>;
type DetailRoute = RouteProp<RootStackParamList, 'SessionDetail'>;

function formatType(type: string): string {
  return (type ?? 'Session')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, ch => ch.toUpperCase());
}

function formatFullDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function SessionDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<DetailRoute>();
  const { c, isDark } = useTheme();
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    sessionRepository.getByIds([route.params.sessionId]).then(results => {
      if (!cancelled) {
        setSession(results[0] ?? null);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [route.params.sessionId]);

  return (
    <LinearGradient colors={c.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.navHeader, { borderBottomColor: c.border }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={[styles.backBtnText, { color: c.foreground }]}>
              ← Back
            </Text>
          </TouchableOpacity>
          <Text style={[styles.navTitle, { color: c.foreground }]}>
            Session Details
          </Text>
          <View style={styles.navRight} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <Text style={[styles.emptyText, { color: c.muted }]}>
              Loading…
            </Text>
          ) : !session ? (
            <Text style={[styles.emptyText, { color: c.muted }]}>
              Session not found.
            </Text>
          ) : (
            <>
              {/* Header card */}
              <View
                style={[
                  styles.card,
                  { backgroundColor: c.surface, borderColor: c.border },
                ]}
              >
                <Text style={[styles.sessionName, { color: c.foreground }]}>
                  {session.title ?? formatType(session.type)}
                </Text>
                <Text style={[styles.sessionMeta, { color: c.muted }]}>
                  {formatFullDate(new Date(session.startTime))} ·{' '}
                  {formatType(session.type)}
                </Text>
              </View>

              {/* Stats grid */}
              <View
                style={[
                  styles.card,
                  styles.statsGrid,
                  { backgroundColor: c.surface, borderColor: c.border },
                ]}
              >
                <StatBlock
                  label="Duration"
                  value={sessionRecordingService.formatDuration(
                    session.duration * 1000,
                  )}
                  c={c}
                />
                <StatBlock label="Avg HR" value={`${session.averageHeartRate} bpm`} c={c} />
                <StatBlock label="Max HR" value={`${session.maxHeartRate} bpm`} c={c} />
                <StatBlock label="Min HR" value={`${session.minHeartRate} bpm`} c={c} />
                <StatBlock
                  label="Calories"
                  value={session.calories != null ? `${Math.round(session.calories)}` : '—'}
                  c={c}
                />
                <StatBlock
                  label="TRIMP"
                  value={session.trimpScore != null ? session.trimpScore.toFixed(1) : '—'}
                  c={c}
                />
              </View>

              {/* Zone breakdown */}
              {session.zoneSummary.length > 0 && (
                <View
                  style={[
                    styles.card,
                    { backgroundColor: c.surface, borderColor: c.border },
                  ]}
                >
                  <Text style={[styles.cardTitle, { color: c.foreground }]}>
                    Time in Zone
                  </Text>
                  <Text style={[styles.zoneCaption, { color: c.muted }]}>
                    Share of session time spent in each heart-rate zone,
                    based on your max HR. Zones you didn't reach aren't shown.
                  </Text>
                  {session.zoneSummary
                    .filter(z => z.timeInZone > 0)
                    .map(z => {
                      const info = HeartRateZoneCalculator.getZoneInfo()[z.zone];
                      const color = getZoneTextColor(z.zone, isDark);
                      return (
                        <View key={z.zone} style={styles.zoneRow}>
                          <View style={styles.zoneRowHeader}>
                            <View style={[styles.zoneDot, { backgroundColor: color }]} />
                            <Text style={[styles.zoneName, { color: c.foreground }]}>
                              Zone {z.zone} · {info.name}
                            </Text>
                            <Text style={[styles.zonePercentage, { color: c.muted }]}>
                              {Math.round(z.percentage)}%
                            </Text>
                          </View>
                          <View style={[styles.zoneBarTrack, { backgroundColor: c.border }]}>
                            <View
                              style={[
                                styles.zoneBarFill,
                                {
                                  backgroundColor: color,
                                  width: `${Math.min(100, z.percentage)}%`,
                                },
                              ]}
                            />
                          </View>
                        </View>
                      );
                    })}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function StatBlock({
  label,
  value,
  c,
}: {
  label: string;
  value: string;
  c: ReturnType<typeof useTheme>['c'];
}) {
  return (
    <View style={styles.statBlock}>
      <Text style={[styles.statLabel, { color: c.muted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: c.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },

  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { minWidth: 80 },
  backBtnText: { fontSize: 15 },
  navTitle: { fontSize: 17, fontWeight: '600' },
  navRight: { minWidth: 80 },

  scrollContent: { padding: 16, gap: 16 },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: 40 },

  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  zoneCaption: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  sessionName: {
    fontSize: 20,
    fontWeight: '700',
  },
  sessionMeta: {
    fontSize: 14,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statBlock: {
    minWidth: '28%',
    gap: 2,
  },
  statLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '700',
  },

  zoneRow: {
    gap: 6,
    marginBottom: 12,
  },
  zoneRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  zoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  zoneName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  zonePercentage: {
    fontSize: 13,
  },
  zoneBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  zoneBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
