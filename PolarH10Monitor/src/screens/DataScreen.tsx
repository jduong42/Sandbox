import React from 'react';
import { View, Text, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme';
import { dataScreenStyles, settingsScreenStyles } from '../theme/styles';
import { useHeartRateMonitoring } from '../hooks';

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
    <ScrollView style={dataScreenStyles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />
      
      <Text style={dataScreenStyles.title}>Heart Rate Monitor</Text>

      {/* Connection Status */}
      <View style={settingsScreenStyles.settingCard}>
        <View style={settingsScreenStyles.settingHeader}>
          <Icon
            name={isConnected ? 'favorite' : 'heart-broken'}
            size={24}
            color={isConnected ? theme.colors.success : theme.colors.textSecondary}
            style={settingsScreenStyles.settingIcon}
          />
          <View style={settingsScreenStyles.settingTextContainer}>
            <Text style={settingsScreenStyles.settingTitle}>
              {isConnected ? `Connected to ${connectedDeviceName}` : 'Not Connected'}
            </Text>
            <Text style={settingsScreenStyles.settingDescription}>
              {isConnected ? 'Ready to monitor heart rate' : 'Connect to device in Settings'}
            </Text>
          </View>
        </View>
      </View>

      {/* Current Heart Rate */}
      {isMonitoring && (
        <View style={settingsScreenStyles.settingCard}>
          <View style={dataScreenStyles.heartRateDisplay}>
            <Text style={dataScreenStyles.heartRateValue}>
              {currentHeartRate || '--'}
            </Text>
            <Text style={dataScreenStyles.heartRateUnit}>BPM</Text>
          </View>
          <Text style={dataScreenStyles.heartRateStatus}>
            {currentHeartRate ? 'Live heart rate data' : 'Waiting for data...'}
          </Text>
        </View>
      )}

      {/* Controls */}
      <View style={settingsScreenStyles.settingCard}>
        <View style={dataScreenStyles.controlsContainer}>
          <TouchableOpacity
            style={[
              settingsScreenStyles.scanButton,
              !isConnected && settingsScreenStyles.scanButtonDisabled,
              isMonitoring && { backgroundColor: theme.colors.error }
            ]}
            onPress={isMonitoring ? stopMonitoring : startMonitoring}
            disabled={!isConnected}
          >
            <Text style={settingsScreenStyles.scanButtonText}>
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </Text>
          </TouchableOpacity>
          
          {readings.length > 0 && (
            <TouchableOpacity
              style={[settingsScreenStyles.scanButton, { backgroundColor: theme.colors.textSecondary }]}
              onPress={clearData}
            >
              <Text style={settingsScreenStyles.scanButtonText}>
                Clear Data
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Recent Readings */}
      {readings.length > 0 && (
        <View style={settingsScreenStyles.settingCard}>
          <View style={settingsScreenStyles.settingHeader}>
            <Icon
              name="timeline"
              size={24}
              color={theme.colors.textSecondary}
              style={settingsScreenStyles.settingIcon}
            />
            <View style={settingsScreenStyles.settingTextContainer}>
              <Text style={settingsScreenStyles.settingTitle}>
                Recent Readings ({readings.length})
              </Text>
              <Text style={settingsScreenStyles.settingDescription}>
                Last 20 heart rate measurements
              </Text>
            </View>
          </View>

          <View style={dataScreenStyles.readingsList}>
            {readings.slice().reverse().map((reading, index) => (
              <View key={`${reading.timestamp.getTime()}-${index}`} style={dataScreenStyles.readingItem}>
                <Text style={dataScreenStyles.readingTime}>
                  {reading.timestamp.toLocaleTimeString()}
                </Text>
                <Text style={dataScreenStyles.readingValue}>
                  {reading.heartRate} BPM
                </Text>
                {reading.rrIntervals.length > 0 && (
                  <Text style={dataScreenStyles.readingRR}>
                    RR: {reading.rrIntervals.length} intervals
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default DataScreen;
