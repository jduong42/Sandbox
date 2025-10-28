import React from 'react';
import { View, StatusBar, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AnimatedTabView } from '../components';
import { dataScreenStyles } from '../theme/dataScreenStyles';
import { theme } from '../theme';
import { useHeartRateMonitoring } from '../hooks';
import {
  DataScreenHeader,
  ConnectionStatusCard,
  HeartRateDisplayCard,
  DataSummaryCard,
  MonitorControlsCard,
} from '../components/data';

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
      <View style={dataScreenStyles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.background}
        />

        <LinearGradient
          colors={[theme.colors.background, theme.colors.backgroundSecondary]}
          style={dataScreenStyles.gradient}
        >
          <ScrollView
            style={dataScreenStyles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <DataScreenHeader
              title="📊 Analytics Dashboard"
              subtitle="Real-time heart rate monitoring"
            />

            <ConnectionStatusCard
              isConnected={isConnected}
              connectedDeviceName={connectedDeviceName}
            />

            <HeartRateDisplayCard
              currentHeartRate={currentHeartRate}
              isMonitoring={isMonitoring}
            />

            <DataSummaryCard readings={readings} isMonitoring={isMonitoring} />

            <MonitorControlsCard
              isMonitoring={isMonitoring}
              isConnected={isConnected}
              onStartMonitoring={startMonitoring}
              onStopMonitoring={stopMonitoring}
              onClearData={clearData}
            />

            <View style={dataScreenStyles.bottomSpacing} />
          </ScrollView>
        </LinearGradient>
      </View>
    </AnimatedTabView>
  );
};

export default DataScreen;
