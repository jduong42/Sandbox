import React, { useState, useEffect } from 'react';
import { View, ScrollView, StatusBar, RefreshControl } from 'react-native';
import { Divider } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { HeartRateMonitor } from '../components/fitness';
import { BLEStatusBar, AnimatedTabView } from '../components';
import { homeScreenStyles } from '../theme/homeScreenStyles';
import { theme } from '../theme';
import {
  HomeHeader,
  HomeStatsGrid,
  QuickActionsSection,
} from '../components/home';

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
      <View style={homeScreenStyles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.background}
        />

        <LinearGradient
          colors={[theme.colors.background, theme.colors.backgroundSecondary]}
          style={homeScreenStyles.gradient}
        >
          <ScrollView
            style={homeScreenStyles.scrollView}
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
            <HomeHeader
              welcomeText="Welcome back"
              titleText="Fitness Dashboard"
            />

            <BLEStatusBar
              isConnected={isConnected}
              {...(isConnected && { deviceName: 'Polar H10' })}
              bluetoothEnabled={bluetoothEnabled}
            />

            <HeartRateMonitor
              bpm={currentBPM}
              isConnected={isConnected}
              style={homeScreenStyles.heartRateMonitor}
            />

            <HomeStatsGrid fitnessData={fitnessData} />

            <Divider style={homeScreenStyles.divider} />

            <QuickActionsSection
              isConnected={isConnected}
              onConnectDevice={handleConnectDevice}
              onStartWorkout={handleStartWorkout}
              onViewData={handleViewData}
              onSettings={handleSettings}
            />

            <View style={homeScreenStyles.bottomSpacing} />
          </ScrollView>
        </LinearGradient>
      </View>
    </AnimatedTabView>
  );
};

export default HomeScreen;
