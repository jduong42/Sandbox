import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface RecentActivityProps {
  name: string;
  time: string;
  duration: string;
  calories: number;
  icon: string;
  color: string;
}

export function RecentActivity({
  name,
  time,
  duration,
  calories,
  icon,
  color,
}: RecentActivityProps) {
  const { c } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: c.surface, borderColor: c.border },
      ]}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: c.foreground }]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[styles.time, { color: c.muted }]}>{time}</Text>
      </View>
      <View style={styles.stats}>
        <Text style={[styles.duration, { color: c.foreground }]}>
          {duration}
        </Text>
        <Text style={[styles.calories, { color: c.muted }]}>
          {calories} cal
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: {
    fontSize: 22,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontWeight: '600',
    fontSize: 15,
  },
  time: {
    fontSize: 14,
    marginTop: 2,
  },
  stats: {
    alignItems: 'flex-end',
  },
  duration: {
    fontWeight: '600',
    fontSize: 14,
  },
  calories: {
    fontSize: 14,
    marginTop: 2,
  },
});
