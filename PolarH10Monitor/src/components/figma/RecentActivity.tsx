import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.time}>{time}</Text>
      </View>
      <View style={styles.stats}>
        <Text style={styles.duration}>{duration}</Text>
        <Text style={styles.calories}>{calories} cal</Text>
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
    color: '#ffffff',
    fontSize: 15,
  },
  time: {
    fontSize: 14,
    color: '#cbd5e1',
    marginTop: 2,
  },
  stats: {
    alignItems: 'flex-end',
  },
  duration: {
    fontWeight: '600',
    color: '#ffffff',
    fontSize: 14,
  },
  calories: {
    fontSize: 14,
    color: '#cbd5e1',
    marginTop: 2,
  },
});
