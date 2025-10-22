import React from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Surface } from 'react-native-paper';
import NativeIcon from '../components/common/NativeIcon';
import { AnimatedTabView } from '../components';
import { theme } from '../theme';
import { useHeartRateMonitoring } from '../hooks';

const { width } = Dimensions.get('window');

const DataScreen: React.FC = () => {
  const {
    isMonitoring,
    currentHeartRate,
    readings,
    isConnected,
    connectedDeviceName,
    startMonitoring,
    stopMonitoring,
    clearData,
  } = useHeartRateMonitoring();

  return (
    <AnimatedTabView>
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.background}
        />

        <LinearGradient
          colors={[theme.colors.background, theme.colors.backgroundSecondary]}
          style={styles.gradient}
        >
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>📊 Analytics Dashboard</Text>
              <Text style={styles.subtitle}>
                Real-time heart rate monitoring
              </Text>
            </View>

            {/* Connection Status Card */}
            <Surface style={styles.card} elevation={3}>
              <View style={styles.cardHeader}>
                <NativeIcon
                  name={
                    isConnected ? 'bluetooth-connected' : 'bluetooth-disabled'
                  }
                  size={28}
                  color={
                    isConnected ? theme.colors.success : theme.colors.error
                  }
                />
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>
                    {isConnected ? 'Device Connected' : 'No Connection'}
                  </Text>
                  <Text style={styles.cardDescription}>
                    {isConnected
                      ? `${connectedDeviceName || 'Polar Device'}`
                      : 'Connect your Polar H10 device'}
                  </Text>
                </View>
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
            </Surface>

            {/* Heart Rate Display Card */}
            <Surface style={styles.card} elevation={3}>
              <View style={styles.heartRateCard}>
                <View style={styles.heartRateHeader}>
                  <NativeIcon
                    name="heart"
                    size={24}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.cardTitle}>Current Heart Rate</Text>
                </View>
                <View style={styles.heartRateDisplay}>
                  <Text style={styles.heartRateValue}>
                    {currentHeartRate || '--'}
                  </Text>
                  <Text style={styles.heartRateUnit}>BPM</Text>
                </View>
                <Text style={styles.heartRateStatus}>
                  {isMonitoring
                    ? '🟢 Monitoring active'
                    : '🔴 Monitoring stopped'}
                </Text>
              </View>
            </Surface>

            {/* Data Summary Card */}
            <Surface style={styles.card} elevation={3}>
              <View style={styles.summaryCard}>
                <Text style={styles.cardTitle}>Session Summary</Text>
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItem}>
                    <NativeIcon
                      name="pulse"
                      size={20}
                      color={theme.colors.primary}
                    />
                    <Text style={styles.summaryValue}>{readings.length}</Text>
                    <Text style={styles.summaryLabel}>Readings</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <NativeIcon
                      name="timer"
                      size={20}
                      color={theme.colors.primary}
                    />
                    <Text style={styles.summaryValue}>
                      {isMonitoring ? 'Active' : 'Stopped'}
                    </Text>
                    <Text style={styles.summaryLabel}>Status</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <NativeIcon
                      name="trending-up"
                      size={20}
                      color={theme.colors.primary}
                    />
                    <Text style={styles.summaryValue}>
                      {readings.length > 0
                        ? Math.max(...readings.map(r => r.heartRate))
                        : '--'}
                    </Text>
                    <Text style={styles.summaryLabel}>Max BPM</Text>
                  </View>
                </View>
              </View>
            </Surface>

            {/* Controls Card */}
            <Surface style={styles.card} elevation={3}>
              <View style={styles.controlsCard}>
                <Text style={styles.cardTitle}>Monitor Controls</Text>
                <View style={styles.controlsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.controlButton,
                      styles.primaryButton,
                      !isConnected && styles.disabledButton,
                    ]}
                    onPress={isMonitoring ? stopMonitoring : startMonitoring}
                    disabled={!isConnected}
                  >
                    <NativeIcon
                      name={isMonitoring ? 'pause' : 'play'}
                      size={20}
                      color={
                        !isConnected ? theme.colors.textSecondary : 'white'
                      }
                    />
                    <Text
                      style={[
                        styles.controlButtonText,
                        !isConnected && styles.disabledText,
                      ]}
                    >
                      {isMonitoring ? 'Stop Monitor' : 'Start Monitor'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.controlButton, styles.secondaryButton]}
                    onPress={clearData}
                  >
                    <NativeIcon name="trash" size={20} color="white" />
                    <Text style={styles.controlButtonText}>Clear Data</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Surface>

            {/* Bottom spacing */}
            <View style={styles.bottomSpacing} />
          </ScrollView>
        </LinearGradient>
      </View>
    </AnimatedTabView>
  );
};

const styles = {
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    alignItems: 'center' as const,
  },
  title: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    textAlign: 'center' as const,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center' as const,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  cardDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  heartRateCard: {
    alignItems: 'center' as const,
  },
  heartRateHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.lg,
  },
  heartRateDisplay: {
    alignItems: 'center' as const,
    marginBottom: theme.spacing.md,
  },
  heartRateValue: {
    fontSize: 64,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    lineHeight: 72,
  },
  heartRateUnit: {
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  heartRateStatus: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
  },
  summaryCard: {},
  summaryGrid: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    marginTop: theme.spacing.md,
  },
  summaryItem: {
    alignItems: 'center' as const,
    flex: 1,
  },
  summaryValue: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  summaryLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center' as const,
  },
  controlsCard: {},
  controlsContainer: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  controlButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.error,
  },
  disabledButton: {
    backgroundColor: theme.colors.backgroundSecondary,
  },
  controlButtonText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: 'white',
  },
  disabledText: {
    color: theme.colors.textSecondary,
  },
  bottomSpacing: {
    height: 100,
  },
};

export default DataScreen;
