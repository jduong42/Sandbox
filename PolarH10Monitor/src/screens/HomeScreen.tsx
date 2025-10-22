import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Surface, Divider } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {
  FitnessCard,
  HeartRateMonitor,
  QuickActionButton,
  TransitionCard,
} from '../components/fitness';
import { BLEStatusBar, AnimatedTabView } from '../components';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [currentBPM, setCurrentBPM] = useState<number>(72);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [bluetoothEnabled, setBluetoothEnabled] = useState<boolean>(true);

  // Mock data - replace with real data from your BLE service
  const [fitnessData, setFitnessData] = useState({
    steps: 8432,
    calories: 432,
    distance: 6.2,
    activeMinutes: 45,
    maxHR: 185,
    avgHR: 142,
    workoutTime: '45:30',
  });

  useEffect(() => {
    // Simulate heart rate changes for demo
    const interval = setInterval(() => {
      if (isConnected) {
        setCurrentBPM(prev => prev + Math.floor(Math.random() * 6) - 3);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleConnectDevice = () => {
    // TODO: Implement BLE connection logic
    setIsConnected(!isConnected);
  };

  const handleStartWorkout = () => {
    // TODO: Navigate to workout screen
    console.log('Starting workout...');
  };

  const handleViewData = () => {
    // TODO: Navigate to data screen
    console.log('Viewing data...');
  };

  const handleSettings = () => {
    // TODO: Navigate to settings screen
    console.log('Opening settings...');
  };

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
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <Surface style={styles.header} elevation={2}>
              <Text style={styles.welcomeText}>Welcome back</Text>
              <Text style={styles.titleText}>Fitness Dashboard</Text>
            </Surface>

            {/* BLE Status */}
            <BLEStatusBar
              isConnected={isConnected}
              {...(isConnected && { deviceName: 'Polar H10' })}
              bluetoothEnabled={bluetoothEnabled}
            />

            {/* Heart Rate Monitor */}
            <HeartRateMonitor
              bpm={currentBPM}
              isConnected={isConnected}
              style={styles.heartRateMonitor}
            />

            {/* Fitness Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statsRow}>
                <TransitionCard
                  title="Steps"
                  value={fitnessData.steps.toLocaleString()}
                  subtitle="Daily goal: 10,000"
                  style={styles.statCard}
                  icon={<Text style={styles.cardIcon}>👣</Text>}
                  onPress={() => navigation.navigate('Detail' as never)}
                />
                <TransitionCard
                  title="Calories"
                  value={fitnessData.calories}
                  unit="kcal"
                  subtitle="Burned today"
                  style={styles.statCard}
                  icon={<Text style={styles.cardIcon}>🔥</Text>}
                  onPress={() => navigation.navigate('Detail' as never)}
                />
              </View>

              <View style={styles.statsRow}>
                <FitnessCard
                  title="Distance"
                  value={fitnessData.distance}
                  unit="km"
                  subtitle="Total distance"
                  style={styles.statCard}
                  icon={<Text style={styles.cardIcon}>📍</Text>}
                />
                <FitnessCard
                  title="Active"
                  value={fitnessData.activeMinutes}
                  unit="min"
                  subtitle="Active minutes"
                  style={styles.statCard}
                  icon={<Text style={styles.cardIcon}>⏱️</Text>}
                />
              </View>

              <View style={styles.statsRow}>
                <FitnessCard
                  title="Max HR"
                  value={fitnessData.maxHR}
                  unit="bpm"
                  subtitle="Today's max"
                  style={styles.statCard}
                  backgroundColor={theme.colors.hrZone5 + '20'}
                  textColor={theme.colors.hrZone5}
                />
                <FitnessCard
                  title="Avg HR"
                  value={fitnessData.avgHR}
                  unit="bpm"
                  subtitle="Session average"
                  style={styles.statCard}
                  backgroundColor={theme.colors.hrZone3 + '20'}
                  textColor={theme.colors.hrZone3}
                />
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>

              <QuickActionButton
                title="Connect Device"
                subtitle={
                  isConnected ? 'Disconnect Polar H10' : 'Connect to Polar H10'
                }
                icon={<Text style={styles.actionIcon}>🔗</Text>}
                onPress={handleConnectDevice}
                variant={isConnected ? 'success' : 'primary'}
              />

              <QuickActionButton
                title="Start Workout"
                subtitle="Begin new training session"
                icon={<Text style={styles.actionIcon}>💪</Text>}
                onPress={handleStartWorkout}
                variant="secondary"
                disabled={!isConnected}
              />

              <QuickActionButton
                title="View Analytics"
                subtitle="Detailed performance data"
                icon={<Text style={styles.actionIcon}>📊</Text>}
                onPress={handleViewData}
                variant="warning"
              />

              <QuickActionButton
                title="Settings"
                subtitle="Configure app preferences"
                icon={<Text style={styles.actionIcon}>⚙️</Text>}
                onPress={handleSettings}
                variant="primary"
              />
            </View>

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
    backgroundColor: theme.colors.background,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  welcomeText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  titleText: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },
  heartRateMonitor: {
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  cardIcon: {
    fontSize: 20,
  },
  divider: {
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.xl,
  },
  quickActions: {
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  actionIcon: {
    fontSize: 24,
  },
  bottomSpacing: {
    height: 100,
  },
};

export default HomeScreen;
