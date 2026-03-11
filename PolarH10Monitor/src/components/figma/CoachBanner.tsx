import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { useACWR } from '../../hooks/useACWR';
import { ACWRRisk } from '../../utils/ACWRCalculator';
import { calculateStreak } from '../../utils/StreakCalculator';

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
  const { result: acwrResult, enrichedSessions, reload } = useACWR(90);
  const [banner, setBanner] = useState<BannerState>({
    color: '#6366f1',
    icon: '💡',
    message: 'Loading your coaching summary…',
    suggestion: 'What should I do today?',
  });

  const updateBanner = useCallback(() => {
    try {
      const streakData = calculateStreak(enrichedSessions);
      setBanner(
        buildBannerState(
          acwrResult == null || acwrResult.risk === 'insufficient_data'
            ? null
            : acwrResult.risk,
          streakData.currentStreak,
          streakData.daysSinceLastSession,
          streakData.totalSessions,
        ),
      );
    } catch {
      // keep current banner on error
    }
  }, [acwrResult, enrichedSessions]);

  // Rebuild banner whenever ACWR result or sessions change
  useEffect(() => {
    updateBanner();
  }, [updateBanner]);

  // Reload data every time the screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
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
