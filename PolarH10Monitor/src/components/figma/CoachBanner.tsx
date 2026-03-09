import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { secureRead } from '../../utils/secureStorage';
import { SEEDED_SESSIONS_KEY } from '../../services/TrainingContextService';
import { AnalyticsService } from '../../services/AnalyticsService';
import { calculateACWR, DailyLoad, ACWRRisk } from '../../utils/ACWRCalculator';
import { calculateStreak } from '../../utils/StreakCalculator';
import { usePhysiologyStore } from '../../store/physiologyStore';
import type { TrainingSession } from '../../types/training';

const SESSIONS_HISTORY_KEY = 'sessions_history';

// ─── Message logic ────────────────────────────────────────────────────────────

interface BannerState {
  color: string;
  icon: string;
  message: string;
  suggestion: string;
}

function buildBannerState(
  risk: ACWRRisk | null,
  currentStreak: number,
  daysSinceLast: number | null,
  totalSessions: number,
): BannerState {
  // No data at all
  if (totalSessions === 0) {
    return {
      color: '#6366f1',
      icon: '👋',
      message:
        'Welcome! Log your first session to unlock personalised coaching.',
      suggestion: 'How do I get started?',
    };
  }

  // Been away too long
  if (daysSinceLast !== null && daysSinceLast >= 7) {
    return {
      color: '#94a3b8',
      icon: '🌱',
      message: `It's been ${daysSinceLast} days since your last session. Even a 20-minute walk helps you pick back up.`,
      suggestion: "I've been away — where should I start?",
    };
  }

  // Celebrate streak
  if (currentStreak >= 7) {
    return {
      color: '#f59e0b',
      icon: '🔥',
      message: `${currentStreak}-day streak! Consistency is the most valuable thing you can build.`,
      suggestion: 'How do I keep this streak going?',
    };
  }

  // ACWR-based advice
  switch (risk) {
    case 'high_risk':
      return {
        color: '#f87171',
        icon: '🛑',
        message:
          'Your training has spiked this week. A rest day or easy walk will actually make you stronger.',
        suggestion: 'Should I take a rest day today?',
      };
    case 'moderate_risk':
      return {
        color: '#fbbf24',
        icon: '⚠️',
        message:
          "You've been pushing hard lately. Mixing in an easy session this week helps you absorb the work.",
        suggestion: "What's a good easy session for today?",
      };
    case 'optimal':
      return {
        color: '#4ade80',
        icon: '✅',
        message:
          currentStreak >= 3
            ? `${currentStreak}-day streak and in the optimal zone — you're nailing it.`
            : "You're in the optimal training zone. Keep this rhythm going.",
        suggestion: 'Am I making progress?',
      };
    case 'detraining':
      return {
        color: '#60a5fa',
        icon: '📉',
        message:
          'Your load has dropped this week — your body has recovered and is ready for more when you are.',
        suggestion: 'What should I do today?',
      };
    default:
      return {
        color: '#6366f1',
        icon: '💡',
        message: 'Keep logging sessions to get personalised training advice.',
        suggestion: 'Help me plan this week',
      };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CoachBanner() {
  const { c } = useTheme();
  const navigation = useNavigation<any>();
  const physiology = usePhysiologyStore(s => s.settings);
  const [banner, setBanner] = useState<BannerState>({
    color: '#6366f1',
    icon: '💡',
    message: 'Loading your coaching summary…',
    suggestion: 'What should I do today?',
  });

  const loadBanner = useCallback(async () => {
    try {
      const [real, seeded] = await Promise.all([
        secureRead<TrainingSession[]>(SESSIONS_HISTORY_KEY).then(v => v ?? []),
        secureRead<TrainingSession[]>(SEEDED_SESSIONS_KEY).then(v => v ?? []),
      ]);

      // Merge + deduplicate
      const seen = new Set<string>();
      const all = [...real, ...seeded].filter(s => {
        const key = String((s as any).id);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Enrich TRIMP
      const age = physiology?.ageYears ?? 30;
      const userProfile = {
        id: 'banner',
        age,
        restingHeartRate: physiology?.restingHeartRate ?? 60,
        maxHeartRate: physiology?.maxHeartRate ?? 220 - age,
        sex: physiology?.sex,
      };
      const enriched = AnalyticsService.enrichSessionsWithTRIMP(
        all,
        userProfile,
      );

      // ACWR
      const dailyLoads: DailyLoad[] = enriched.map(s => ({
        date: new Date((s as any).date ?? (s as any).startTime ?? Date.now()),
        trimp: (s as any).trimpScore ?? 0,
      }));
      const acwrResult = calculateACWR(dailyLoads);

      // Streak
      const streakData = calculateStreak(
        enriched as unknown as TrainingSession[],
      );

      setBanner(
        buildBannerState(
          acwrResult.risk === 'insufficient_data' ? null : acwrResult.risk,
          streakData.currentStreak,
          streakData.daysSinceLastSession,
          streakData.totalSessions,
        ),
      );
    } catch (e) {
      console.error('[CoachBanner] load failed', e);
      setBanner({
        color: '#6366f1',
        icon: '💡',
        message: 'Keep logging sessions to get personalised training advice.',
        suggestion: 'Help me plan this week',
      });
    }
  }, [physiology]);

  // Initial load + reload when physiology changes
  useEffect(() => {
    loadBanner();
  }, [loadBanner]);

  // Reload every time the screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      loadBanner();
    }, [loadBanner]),
  );

  const handleAskCoach = () => {
    navigation.navigate('FigmaAIChat', { prefill: banner.suggestion });
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: c.surface, borderColor: c.border },
      ]}
      onPress={handleAskCoach}
      activeOpacity={0.85}
      accessibilityLabel="Open coach chat"
    >
      <View style={[styles.strip, { backgroundColor: banner.color }]} />
      <View style={styles.body}>
        <Text style={styles.icon}>{banner.icon}</Text>
        <View style={styles.textBlock}>
          <Text style={[styles.message, { color: c.foreground }]}>
            {banner.message}
          </Text>
          <Text style={[styles.cta, { color: banner.color }]}>
            Ask coach: "{banner.suggestion}" ›
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    minHeight: 72,
  },
  strip: {
    width: 5,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  icon: {
    fontSize: 26,
    lineHeight: 32,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  cta: {
    fontSize: 12,
    fontWeight: '600',
  },
});
