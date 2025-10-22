import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { Surface } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../theme';

interface HeartRateMonitorProps {
  bpm: number;
  isConnected: boolean;
  style?: ViewStyle;
}

const HeartRateMonitor: React.FC<HeartRateMonitorProps> = ({
  bpm,
  isConnected,
  style,
}) => {
  const getHRZoneColor = () => {
    if (bpm < 100) return theme.colors.hrZone1;
    if (bpm < 120) return theme.colors.hrZone2;
    if (bpm < 140) return theme.colors.hrZone3;
    if (bpm < 160) return theme.colors.hrZone4;
    return theme.colors.hrZone5;
  };

  const getHRZoneName = () => {
    if (bpm < 100) return 'Recovery';
    if (bpm < 120) return 'Aerobic Base';
    if (bpm < 140) return 'Aerobic';
    if (bpm < 160) return 'Threshold';
    return 'VO2 Max';
  };

  const hrColor = isConnected ? getHRZoneColor() : theme.colors.textTertiary;

  return (
    <Surface style={[styles.container, style]} elevation={4}>
      <LinearGradient
        colors={[theme.colors.surface, theme.colors.backgroundTertiary]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Heart Rate</Text>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isConnected
                    ? theme.colors.success
                    : theme.colors.error,
                },
              ]}
            />
          </View>

          <View style={styles.heartContainer}>
            <Text style={styles.heartIcon}>❤️</Text>
            <View style={styles.bpmContainer}>
              <Text style={[styles.bpmValue, { color: hrColor }]}>
                {isConnected ? bpm : '--'}
              </Text>
              <Text style={styles.bpmUnit}>BPM</Text>
            </View>
          </View>

          {isConnected && bpm > 0 && (
            <View style={styles.zoneContainer}>
              <View
                style={[styles.zoneIndicator, { backgroundColor: hrColor }]}
              />
              <Text style={[styles.zoneText, { color: hrColor }]}>
                {getHRZoneName()}
              </Text>
            </View>
          )}

          <Text style={styles.status}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      </LinearGradient>
    </Surface>
  );
};

const styles = {
  container: {
    borderRadius: theme.borderRadius.xl,
    margin: theme.spacing.sm,
    overflow: 'hidden' as const,
  },
  gradient: {
    padding: theme.spacing.lg,
  },
  content: {
    alignItems: 'center' as const,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  heartContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.md,
  },
  heartIcon: {
    fontSize: 40,
    marginRight: theme.spacing.md,
  },
  bpmContainer: {
    alignItems: 'center' as const,
  },
  bpmValue: {
    fontSize: 48,
    fontWeight: theme.typography.weights.bold,
    lineHeight: 52,
  },
  bpmUnit: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  zoneContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.sm,
  },
  zoneIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.xs,
  },
  zoneText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
  },
  status: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
};

export default HeartRateMonitor;
