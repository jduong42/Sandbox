import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import NativeIcon from '../common/NativeIcon';

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
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{session.name}</Text>
          <Text style={styles.date}>{session.date}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statEmoji}>⏱</Text>
          <Text style={styles.statText}>{session.duration}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={styles.statText}>{session.calories} cal</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statEmoji}>❤️</Text>
          <Text style={styles.statText}>{session.heartRate} bpm</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  name: {
    fontWeight: '600',
    fontSize: 18,
    color: '#ffffff',
  },
  date: {
    fontSize: 14,
    color: '#cbd5e1',
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
    color: '#e2e8f0',
  },
});
