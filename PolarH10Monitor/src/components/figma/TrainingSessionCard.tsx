import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import NativeIcon from '../common/NativeIcon';
import { useTheme } from '../../theme/ThemeContext';

export interface TrainingSession {
  id: number;
  name: string;
  date: string;
  duration: string;
  calories: number;
  heartRate: number;
}

interface TrainingSessionCardProps {
  session: TrainingSession;
}

export function TrainingSessionCard({ session }: TrainingSessionCardProps) {
  const { c } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: c.surface, borderColor: c.border },
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.name, { color: c.foreground }]}>
            {session.name}
          </Text>
          <Text style={[styles.date, { color: c.muted }]}>{session.date}</Text>
        </View>
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
    marginBottom: 12,
  },
  name: {
    fontWeight: '600',
    fontSize: 18,
  },
  date: {
    fontSize: 14,
    marginTop: 2,
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
