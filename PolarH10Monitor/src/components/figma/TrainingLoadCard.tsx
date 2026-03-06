import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import {
  calculateACWR,
  DailyLoad,
  ACWRResult,
  ACWRRisk,
} from '../../utils/ACWRCalculator';
import { TrainingLoadModal } from './TrainingLoadModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SEEDED_SESSIONS_KEY } from '../../services/TrainingContextService';
import { AnalyticsService } from '../../services/AnalyticsService';
import { usePhysiologyStore } from '../../store/physiologyStore';
import type { TrainingSession } from '../../types/training';

const SESSIONS_HISTORY_KEY = 'sessions_history';

const RISK_COLOR: Record<ACWRRisk, string> = {
  detraining: '#60a5fa',
  optimal: '#4ade80',
  moderate_risk: '#fbbf24',
  high_risk: '#f87171',
  insufficient_data: '#94a3b8',
};

const RISK_LABEL: Record<ACWRRisk, string> = {
  detraining: 'Detraining',
  optimal: 'Optimal',
  moderate_risk: 'Moderate Risk',
  high_risk: 'High Risk',
  insufficient_data: 'Not Enough Data',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function TrainingLoadCard() {
  const { c } = useTheme();
  const [result, setResult] = useState<ACWRResult | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const physiology = usePhysiologyStore(s => s.settings);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [realRaw, seedRaw] = await Promise.all([
          AsyncStorage.getItem(SESSIONS_HISTORY_KEY),
          AsyncStorage.getItem(SEEDED_SESSIONS_KEY),
        ]);
        const real: TrainingSession[] = realRaw ? JSON.parse(realRaw) : [];
        const seeded: TrainingSession[] = seedRaw ? JSON.parse(seedRaw) : [];

        // Merge and deduplicate by id
        const seen = new Set<string>();
        const all = [...real, ...seeded].filter(s => {
          const key = String((s as any).id);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        // Enrich with TRIMP using current physiology profile
        const age = physiology?.ageYears ?? 30;
        const profile = {
          id: 'card',
          age,
          restingHeartRate: physiology?.restingHeartRate ?? 60,
          maxHeartRate:
            physiology?.maxHeartRate != null
              ? physiology.maxHeartRate
              : 220 - age,
          sex: physiology?.sex,
        };
        const enriched = AnalyticsService.enrichSessionsWithTRIMP(all, profile);

        // Build daily loads for ACWR
        const dailyLoads: DailyLoad[] = enriched.map(s => ({
          date: new Date((s as any).date ?? (s as any).startTime ?? Date.now()),
          trimp: (s as any).trimpScore ?? 0,
        }));

        if (active) {
          setResult(calculateACWR(dailyLoads));
        }
      } catch (e) {
        console.warn('[TrainingLoadCard] failed to load sessions', e);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [physiology]);

  // ── Render placeholder ──────────────────────────────────────────────────────
  if (!result || result.risk === 'insufficient_data') {
    return (
      <View
        style={[
          styles.card,
          { backgroundColor: c.surface, borderColor: c.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: c.foreground }]}>
          Training Load
        </Text>
        <Text style={[styles.placeholder, { color: c.muted }]}>
          Complete 3+ sessions to see your ACWR, monotony, and strain.
        </Text>
      </View>
    );
  }

  const riskColor = RISK_COLOR[result.risk];
  const riskLabel = RISK_LABEL[result.risk];

  return (
    <>
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: c.surface, borderColor: c.border },
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
        accessibilityLabel="View training load details"
      >
        {/* Row 1: title + tap hint */}
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: c.foreground }]}>
            Training Load
          </Text>
          <Text style={[styles.tapHint, { color: c.muted }]}>Details ›</Text>
        </View>

        {/* Row 2: ACWR value + badge */}
        <View style={styles.mainRow}>
          <View>
            <Text style={[styles.acwrLabel, { color: c.muted }]}>ACWR</Text>
            <Text style={[styles.acwrValue, { color: c.foreground }]}>
              {result.acwr?.toFixed(2) ?? '—'}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: riskColor + '22',
                borderColor: riskColor + '55',
              },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: riskColor }]} />
            <Text style={[styles.badgeText, { color: riskColor }]}>
              {riskLabel}
            </Text>
          </View>
        </View>

        {/* Row 3: Acute | Chronic | Monotony */}
        <View style={[styles.statsRow, { borderTopColor: c.border }]}>
          <StatItem
            label="Acute"
            value={String(result.acuteLoad)}
            sub="7 days"
            c={c}
          />
          <View style={[styles.divider, { backgroundColor: c.border }]} />
          <StatItem
            label="Chronic"
            value={String(result.chronicLoad)}
            sub="28 days"
            c={c}
          />
          <View style={[styles.divider, { backgroundColor: c.border }]} />
          <StatItem
            label="Monotony"
            value={result.monotony.toFixed(1)}
            sub="daily var."
            c={c}
          />
        </View>
      </TouchableOpacity>

      <TrainingLoadModal
        visible={modalVisible}
        result={result}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}

function StatItem({
  label,
  value,
  sub,
  c,
}: {
  label: string;
  value: string;
  sub: string;
  c: ReturnType<typeof useTheme>['c'];
}) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statLabel, { color: c.muted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: c.foreground }]}>{value}</Text>
      <Text style={[styles.statSub, { color: c.muted }]}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  tapHint: {
    fontSize: 13,
  },
  placeholder: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  acwrLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  acwrValue: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 40,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  divider: {
    width: 1,
    height: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statSub: {
    fontSize: 10,
  },
});
