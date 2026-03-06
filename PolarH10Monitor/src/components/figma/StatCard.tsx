import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

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
  const { c } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.surface, borderColor: c.border },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        {goal && <Text style={[styles.goal, { color: c.muted }]}>/{goal}</Text>}
      </View>
      <Text style={[styles.label, { color: c.muted }]}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: c.foreground }]}>{value}</Text>
        {unit && <Text style={[styles.unit, { color: c.muted }]}> {unit}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
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
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  value: {
    fontSize: 24,
    fontWeight: '600',
  },
  unit: {
    fontSize: 14,
    marginBottom: 3,
  },
});
