import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import NativeIcon from '../common/NativeIcon';
import { useTheme } from '../../theme/ThemeContext';

export interface TrainingSession {
  id: string | number;
  name: string;
  date: string;
  duration: string;
  calories: number;
  heartRate: number;
  /** Optional TRIMP score — displayed as a coloured load badge */
  trimpScore?: number;
}

type LoadLevel = { label: string; color: string };

function getLoadLevel(trimp: number): LoadLevel {
  if (trimp < 40) return { label: 'Easy', color: '#4CAF50' };
  if (trimp < 80) return { label: 'Moderate', color: '#FFC107' };
  if (trimp < 120) return { label: 'Hard', color: '#FF9800' };
  return { label: 'Intense', color: '#F44336' };
}

interface TrainingSessionCardProps {
  session: TrainingSession;
  onPress?: () => void;
}

export function TrainingSessionCard({ session, onPress }: TrainingSessionCardProps) {
  const { c } = useTheme();
  const load =
    session.trimpScore != null ? getLoadLevel(session.trimpScore) : null;
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: c.surface, borderColor: c.border },
      ]}
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${session.name}`}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.name, { color: c.foreground }]}>
            {session.name}
          </Text>
          <Text style={[styles.date, { color: c.muted }]}>{session.date}</Text>
        </View>
        {load && (
          <View
            style={[
              styles.loadBadge,
              {
                backgroundColor: load.color + '22',
                borderColor: load.color + '66',
              },
            ]}
          >
            <View style={[styles.loadDot, { backgroundColor: load.color }]} />
            <Text style={[styles.loadLabel, { color: load.color }]}>
              {load.label}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statEmoji}>⏱</Text>
          <Text style={[styles.statText, { color: c.foreground }]}>
            {session.duration}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={[styles.statText, { color: c.foreground }]}>
            {session.calories} cal
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statEmoji}>❤️</Text>
          <Text style={[styles.statText, { color: c.foreground }]}>
            {session.heartRate} bpm
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontWeight: '600',
    fontSize: 18,
  },
  date: {
    fontSize: 14,
    marginTop: 2,
  },
  loadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  loadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  loadLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statEmoji: {
    fontSize: 14,
  },
  statText: {
    fontSize: 14,
  },
});
