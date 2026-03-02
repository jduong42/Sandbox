import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ActivityRing } from '../components/figma/ActivityRing';
import { StatCard } from '../components/figma/StatCard';
import { RecentActivity } from '../components/figma/RecentActivity';
import { useTheme } from '../theme/ThemeContext';

const ACTIVITIES = [
  {
    id: 1,
    name: 'Morning Run',
    time: '7:30 AM',
    duration: '32 min',
    calories: 245,
    icon: '🏃',
    color: '#3b82f6',
  },
  {
    id: 2,
    name: 'Evening Ride',
    time: 'Yesterday',
    duration: '45 min',
    calories: 312,
    icon: '🚴',
    color: '#22c55e',
  },
  {
    id: 3,
    name: 'HIIT Training',
    time: '2 days ago',
    duration: '28 min',
    calories: 198,
    icon: '❤️',
    color: '#ef4444',
  },
];

export function FigmaHomeScreen() {
  const { c } = useTheme();
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

  return (
    <LinearGradient colors={c.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: c.muted }]}>
                {greeting}
              </Text>
              <Text style={[styles.username, { color: c.foreground }]}>
                Alex
              </Text>
            </View>
            <TouchableOpacity style={styles.avatar}>
              <Text style={styles.avatarText}>A</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.date, { color: c.muted }]}>{today}</Text>

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
                  progress={75}
                  color="rgb(239, 68, 68)"
                  size={192}
                  strokeWidth={12}
                />
                <ActivityRing
                  progress={60}
                  color="rgb(34, 197, 94)"
                  size={168}
                  strokeWidth={12}
                />
                <ActivityRing
                  progress={85}
                  color="rgb(59, 130, 246)"
                  size={144}
                  strokeWidth={12}
                />
                {/* Center text */}
                <View style={styles.ringsCenter}>
                  <Text
                    style={[styles.ringsCenterValue, { color: c.foreground }]}
                  >
                    75%
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
                  450/600
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
                  18/30 min
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: '#3b82f6' }]}
                />
                <Text style={[styles.legendLabel, { color: c.muted }]}>
                  Stand
                </Text>
                <Text style={[styles.legendValue, { color: c.foreground }]}>
                  10/12 hrs
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.section}>
            <View style={styles.statsGrid}>
              <View style={styles.statsRow}>
                <StatCard
                  icon="👟"
                  label="Steps"
                  value="8,547"
                  goal="10,000"
                  color="#60a5fa"
                />
                <View style={styles.statsGap} />
                <StatCard
                  icon="🔥"
                  label="Calories"
                  value="450"
                  goal="600"
                  color="#fb923c"
                />
              </View>
              <View style={[styles.statsRow, { marginTop: 16 }]}>
                <StatCard
                  icon="📍"
                  label="Distance"
                  value="6.2"
                  unit="km"
                  color="#4ade80"
                />
                <View style={styles.statsGap} />
                <StatCard
                  icon="⏱"
                  label="Active Time"
                  value="1h 18m"
                  color="#c084fc"
                />
              </View>
            </View>
          </View>

          {/* Recent Activities */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.foreground }]}>
              Recent Activities
            </Text>
            <View style={styles.activitiesList}>
              {ACTIVITIES.map(activity => (
                <RecentActivity key={activity.id} {...activity} />
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
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
  activitiesList: {
    gap: 12,
  },
});
