import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ActivityRing } from '../components/figma/ActivityRing';
import { StatCard } from '../components/figma/StatCard';
import { RecentActivity } from '../components/figma/RecentActivity';
import { TrainingLoadCard } from '../components/figma/TrainingLoadCard';
import { CoachBanner } from '../components/figma/CoachBanner';
import { StreakCard } from '../components/figma/StreakCard';
import { useTheme } from '../theme/ThemeContext';
import { getRestingCaloriesToday, getTDEE } from '../utils/CalorieCalculator';
import { ProfileModal } from '../components/figma/ProfileModal';
import { useAuth } from '../context/AuthContext';
import { useAICoachStore } from '../store/aiCoachStore';
import {
  usePhysiologyStore,
  isPhysiologyComplete,
  toUserProfile,
} from '../store/physiologyStore';
import { sessionRepository } from '../services/SessionRepository';
import { calculateStreak } from '../utils/StreakCalculator';
import type { StreakData } from '../utils/StreakCalculator';

// Icon + colour by TrainingType string
function activityMeta(type: string): { icon: string; color: string } {
  switch (type) {
    case 'running':
      return { icon: '🏃', color: '#3b82f6' };
    case 'cycling':
      return { icon: '🚴', color: '#22c55e' };
    case 'hiit':
      return { icon: '❤️', color: '#ef4444' };
    case 'swimming':
      return { icon: '🏊', color: '#06b6d4' };
    case 'strength':
      return { icon: '🏋️', color: '#a855f7' };
    case 'yoga':
      return { icon: '🧘', color: '#14b8a6' };
    default:
      return { icon: '🏃', color: '#6366f1' };
  }
}

function formatSessionTime(date: Date | string | undefined): string {
  if (!date) return '';
  const d = new Date(date as string);
  const now = new Date();
  const diffDays = Math.floor(
    (now.setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0)) / 86_400_000,
  );
  if (diffDays === 0)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

export function FigmaHomeScreen() {
  const { c } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const isGenerating = useAICoachStore(s => s.isGenerating);
  const stopGeneration = useAICoachStore(s => s.stopGeneration);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { settings, isLoaded, initialize } = usePhysiologyStore();
  const [recentActivities, setRecentActivities] = useState<
    {
      id: string;
      name: string;
      time: string;
      duration: string;
      calories: number;
      icon: string;
      color: string;
    }[]
  >([]);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [exerciseMinutes, setExerciseMinutes] = useState(0);
  const [weeklySessionCount, setWeeklySessionCount] = useState(0);

  const loadRecentActivities = useCallback(async () => {
    try {
      // Fetch enough sessions to cover the activity list AND today's total
      const all = await sessionRepository.getRecent(20);

      // Compute today's active exercise minutes from sessions dated today
      const todayStr = new Date().toDateString();
      const todayMins = all
        .filter(
          s => new Date(s.date ?? s.startTime).toDateString() === todayStr,
        )
        .reduce((sum, s) => sum + (s.duration ?? 0), 0);
      setExerciseMinutes(Math.round(todayMins / 60));

      // Count sessions this calendar week (Mon–Sun) for the weekly ring
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
      weekStart.setHours(0, 0, 0, 0);
      setWeeklySessionCount(
        all.filter(s => new Date(s.date ?? s.startTime) >= weekStart).length,
      );

      // Show the 5 most recent for the activity list
      setRecentActivities(
        all.slice(0, 5).map(s => {
          const meta = activityMeta(s.type ?? '');
          const durationSec: number = s.duration ?? 0;
          const durationMin = Math.round(durationSec / 60);
          return {
            id: s.id,
            name: s.title ?? s.type ?? 'Session',
            time: formatSessionTime(s.date ?? s.startTime),
            duration: durationMin > 0 ? `${durationMin} min` : '--',
            calories: Math.round(s.calories ?? 0),
            icon: meta.icon,
            color: meta.color,
          };
        }),
      );

      // Streak data from loaded sessions
      setStreakData(calculateStreak(all));
    } catch (e) {
      console.warn('[FigmaHomeScreen] failed to load sessions', e);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload sessions every time this tab comes into focus
  useFocusEffect(
    useCallback(() => {
      loadRecentActivities();
    }, [loadRecentActivities]),
  );

  const userProfile = useMemo(() => toUserProfile(settings), [settings]);
  const profileComplete = isPhysiologyComplete(settings);

  // Computed from Mifflin-St Jeor BMR prorated to the current time of day.
  // Uses stored physiology if complete, falls back to population defaults.
  const restingCalories = useMemo(
    () => getRestingCaloriesToday(userProfile),
    [userProfile],
  );
  const tdee = useMemo(() => Math.round(getTDEE(userProfile)), [userProfile]);
  // Move ring goal = TDEE; progress = resting calories so far today
  const moveProgress = Math.min(
    100,
    Math.round((restingCalories / tdee) * 100),
  );
  // Exercise ring: total active session minutes today (30 min = full ring)
  const exerciseProgress = Math.round((exerciseMinutes / 30) * 100);
  // Weekly sessions ring: goal of 5 sessions/week
  const weeklyProgress = Math.min(
    100,
    Math.round((weeklySessionCount / 5) * 100),
  );
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Good Morning'
      : currentHour < 18
      ? 'Good Afternoon'
      : 'Good Evening';
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const handleDeepLink = useCallback(
    (prefill: string) => {
      if (isGenerating) {
        Alert.alert(
          'Trainer is busy',
          'The AI is currently typing a response. Do you want to stop it and ask about this metric instead?',
          [
            { text: 'Wait', style: 'cancel' },
            {
              text: 'Interrupt',
              style: 'destructive',
              onPress: () => {
                stopGeneration();
                navigation.navigate('FigmaAIChat', { prefill });
              },
            },
          ],
        );
        return;
      }

      navigation.navigate('FigmaAIChat', { prefill });
    },
    [isGenerating, stopGeneration, navigation],
  );

  return (
    <LinearGradient colors={c.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: c.muted }]}>
                {greeting},
              </Text>
              <Text style={[styles.username, { color: c.foreground }]}>
                {user?.name ?? 'Alex'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.avatar}
              onPress={() => setShowProfileModal(true)}
              accessibilityLabel="Open profile"
            >
              <Text style={styles.avatarText}>{user?.avatar ?? 'A'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.date, { color: c.muted }]}>{today}</Text>

          {/* Coach Banner */}
          <View style={[styles.section, { marginTop: 8 }]}>
            <Text
              style={[
                styles.sectionTitle,
                { color: c.foreground, marginBottom: 10 },
              ]}
            >
              Today's Coaching
            </Text>
            <CoachBanner />
          </View>
          {/* Calorie disclaimer — visible when physiology profile is incomplete */}
          {!profileComplete && (
            <TouchableOpacity
              style={[
                styles.disclaimer,
                {
                  backgroundColor: c.amberTint,
                  borderColor: 'rgba(245,158,11,0.4)',
                },
              ]}
              onPress={() => setShowProfileModal(true)}
              accessibilityLabel="Set up profile for accurate calories"
            >
              <Text style={styles.disclaimerIcon}>⚠️</Text>
              <View style={styles.disclaimerBody}>
                <Text style={[styles.disclaimerTitle, { color: c.foreground }]}>
                  Estimates based on placeholder data
                </Text>
                <Text style={[styles.disclaimerSub, { color: c.muted }]}>
                  Complete your profile for personalised calorie calculations
                </Text>
              </View>
              <Text style={[styles.disclaimerArrow, { color: c.muted }]}>
                ›
              </Text>
            </TouchableOpacity>
          )}

          {/* Activity Rings */}
          <View
            style={[
              styles.ringsCard,
              { backgroundColor: c.surface, borderColor: c.border },
            ]}
          >
            <View style={styles.ringsContainer}>
              {/* Rings are stacked: largest at bottom, smallest on top */}
              <View style={styles.ringsWrapper}>
                <ActivityRing
                  progress={moveProgress}
                  color="rgb(239, 68, 68)"
                  size={192}
                  strokeWidth={12}
                />
                <ActivityRing
                  progress={exerciseProgress}
                  color="rgb(34, 197, 94)"
                  size={168}
                  strokeWidth={12}
                />
                <ActivityRing
                  progress={weeklyProgress}
                  color="rgb(59, 130, 246)"
                  size={144}
                  strokeWidth={12}
                />
                {/* Center text */}
                <View style={styles.ringsCenter}>
                  <Text
                    style={[styles.ringsCenterValue, { color: c.foreground }]}
                  >
                    {moveProgress}%
                  </Text>
                  <Text style={[styles.ringsCenterLabel, { color: c.muted }]}>
                    Daily Goal
                  </Text>
                </View>
              </View>
            </View>

            {/* Ring Legend */}
            <View style={styles.ringLegend}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: '#ef4444' }]}
                />
                <Text style={[styles.legendLabel, { color: c.muted }]}>
                  Move
                </Text>
                <Text style={[styles.legendValue, { color: c.foreground }]}>
                  {restingCalories}/{tdee}
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: '#22c55e' }]}
                />
                <Text style={[styles.legendLabel, { color: c.muted }]}>
                  Exercise
                </Text>
                <Text style={[styles.legendValue, { color: c.foreground }]}>
                  {exerciseMinutes}/30 min
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: '#3b82f6' }]}
                />
                <Text style={[styles.legendLabel, { color: c.muted }]}>
                  Weekly
                </Text>
                <Text style={[styles.legendValue, { color: c.foreground }]}>
                  {weeklySessionCount}/5 sessions
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.section}>
            <View style={styles.statsGrid}>
              <View style={styles.statsRow}>
                <StatCard
                  icon="🔥"
                  label="Calories"
                  value={String(restingCalories)}
                  goal={String(tdee)}
                  color="#fb923c"
                  onPress={() =>
                    handleDeepLink(
                      `I have burned ${restingCalories} out of ${tdee} calories today. How should I adjust my nutrition?`,
                    )
                  }
                />
                <View style={styles.statsGap} />
                <StatCard
                  icon="⏱"
                  label="Active Time"
                  value={exerciseMinutes > 0 ? `${exerciseMinutes}m` : '--'}
                  color="#c084fc"
                  onPress={() =>
                    handleDeepLink(
                      `My active time today is ${exerciseMinutes} minutes. Is this a good amount for active recovery?`,
                    )
                  }
                />
              </View>
            </View>
          </View>

          {/* Streak & Milestones */}
          {streakData && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: c.foreground }]}>
                Consistency
              </Text>
              <StreakCard data={streakData} />
            </View>
          )}

          {/* Training Load */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.foreground }]}>
              Training Load
            </Text>
            <TrainingLoadCard />
          </View>

          {/* Recent Activities */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.foreground }]}>
              Recent Activities
            </Text>
            {recentActivities.length === 0 ? (
              <View
                style={[
                  styles.emptyActivities,
                  { backgroundColor: c.surface, borderColor: c.border },
                ]}
              >
                <Text style={[styles.emptyActivitiesText, { color: c.muted }]}>
                  No sessions yet — record your first workout to see it here.
                </Text>
              </View>
            ) : (
              <View style={styles.activitiesList}>
                {recentActivities.map(activity => (
                  <RecentActivity key={activity.id} {...activity} />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 32,
  },
  greeting: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  username: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#a855f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  date: {
    fontSize: 14,
    color: '#cbd5e1',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  ringsCard: {
    marginHorizontal: 24,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    marginBottom: 32,
  },
  ringsContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ringsWrapper: {
    width: 192,
    height: 192,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringsCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringsCenterValue: {
    fontSize: 30,
    fontWeight: '700',
    color: '#ffffff',
  },
  ringsCenterLabel: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  ringLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  legendLabel: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  statsGrid: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statsGap: {
    width: 16,
  },
  // Disclaimer banner
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  disclaimerIcon: { fontSize: 18 },
  disclaimerBody: { flex: 1 },
  disclaimerTitle: { fontSize: 13, fontWeight: '600' },
  disclaimerSub: { fontSize: 12, marginTop: 2 },
  disclaimerArrow: { fontSize: 22, fontWeight: '300' },
  activitiesList: {
    gap: 12,
  },
  emptyActivities: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyActivitiesText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
