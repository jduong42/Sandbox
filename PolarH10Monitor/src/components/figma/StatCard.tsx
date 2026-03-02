import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  goal?: string;
  unit?: string;
  color: string;
}

export function StatCard({
  icon,
  label,
  value,
  goal,
  unit,
  color,
}: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        {goal && <Text style={styles.goal}>/{goal}</Text>}
      </View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit && <Text style={styles.unit}> {unit}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 20,
  },
  goal: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  label: {
    fontSize: 12,
    color: '#cbd5e1',
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  value: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  unit: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 3,
  },
});
