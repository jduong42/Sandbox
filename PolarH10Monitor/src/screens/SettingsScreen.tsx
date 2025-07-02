import React, { useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme';
import { settingsScreenStyles } from '../theme/styles';
import { useBLEScanning, useDeviceHistory } from '../hooks';
import { DeviceHistoryCard } from '../components/ble/SimpleDeviceHistoryCard';
import { StoredDevice, deviceHistoryService } from '../services';
import { logger } from '../utils/logger';

const SettingsScreen: React.FC = () => {
  const {
    isScanning,
    isConnected,
    connectedDeviceName,
    bluetoothEnabled,
    discoveredDevices,
    startScan,
    connectToDevice,
    disconnectDevice,
  } = useBLEScanning();

  const {
    devices: deviceHistory,
    loading: historyLoading,
    error: historyError,
    refreshDevices,
    removeDevice,
    clearAllDevices,
  } = useDeviceHistory();

  // Refresh device history when connection status changes
  useEffect(() => {
    if (isConnected) {
      // Small delay to ensure the device has been added to history
      const timer = setTimeout(() => {
        refreshDevices();
      }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isConnected, refreshDevices]);

  const handleHistoryDeviceSelect = async (device: StoredDevice) => {
    try {
      if (isConnected) {
        Alert.alert(
          'Already Connected',
          'You are already connected to a device. Would you like to disconnect and connect to this device?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Connect',
              onPress: async () => {
                await disconnectDevice();
                await connectToDevice(device.id, device.name);
                // Refresh device history after connection
                setTimeout(() => refreshDevices(), 1500);
              },
            },
          ],
        );
      } else {
        await connectToDevice(device.id, device.name);
        // Refresh device history after connection
        setTimeout(() => refreshDevices(), 1500);
      }
    } catch (error) {
      Alert.alert(
        'Connection Failed',
        'Could not connect to the device. Please make sure it is nearby and powered on.',
        [{ text: 'OK' }],
      );
    }
  };

  const handleDeviceConnect = async (deviceId: string, deviceName: string) => {
    try {
      await connectToDevice(deviceId, deviceName);
      // Refresh device history after connection
      setTimeout(() => refreshDevices(), 1500);
    } catch (error) {
      // Error handling is already done in the connectToDevice function
    }
  };

  // Debug function to test device history manually
  const testDeviceHistory = async () => {
    try {
      logger.info('Testing device history manually...');
      
      // Add a test device
      await deviceHistoryService.addDevice({
        id: 'test-device-123',
        name: 'Test Polar H10',
      });
      
      // Refresh the list
      await refreshDevices();
      
      Alert.alert('Test', 'Added test device to history');
    } catch (error) {
      logger.error('Test failed', { error });
      Alert.alert('Test Failed', 'Could not add test device');
    }
  };

  // Debug function to clear all history
  const clearTestHistory = async () => {
    try {
      logger.info('Clearing all device history...');
      await clearAllDevices();
      Alert.alert('Cleared', 'All device history cleared');
    } catch (error) {
      logger.error('Clear failed', { error });
      Alert.alert('Clear Failed', 'Could not clear device history');
    }
  };

  return (
    <ScrollView style={settingsScreenStyles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />

      {/* Device History Card */}
      <DeviceHistoryCard
        devices={deviceHistory}
        loading={historyLoading}
        error={historyError}
        onDeviceSelect={handleHistoryDeviceSelect}
        onDeviceRemove={removeDevice}
        onClearAll={clearAllDevices}
        onRefresh={refreshDevices}
      />

      {/* Temporary Debug Buttons */}
      <View style={{ flexDirection: 'row', margin: 16, gap: 8 }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#FF6B6B',
            padding: 16,
            borderRadius: 8,
            alignItems: 'center',
            flex: 1,
          }}
          onPress={testDeviceHistory}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            🧪 Test Add
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{
            backgroundColor: '#FF9500',
            padding: 16,
            borderRadius: 8,
            alignItems: 'center',
            flex: 1,
          }}
          onPress={clearTestHistory}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            🗑️ Clear All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Connection Status Card */}
      <View style={settingsScreenStyles.settingCard}>
        <View style={settingsScreenStyles.settingHeader}>
          <Icon
            name={isConnected ? 'bluetooth-connected' : 'bluetooth'}
            size={24}
            color={
              isConnected ? theme.colors.success : theme.colors.textSecondary
            }
            style={settingsScreenStyles.settingIcon}
          />
          <View style={settingsScreenStyles.settingTextContainer}>
            <Text style={settingsScreenStyles.settingTitle}>
              Connection Status
            </Text>
            <Text style={settingsScreenStyles.settingDescription}>
              {isConnected
                ? `Connected to ${connectedDeviceName || 'Unknown Device'}`
                : bluetoothEnabled
                ? 'Ready to connect'
                : 'Bluetooth disabled'}
            </Text>
          </View>
        </View>

        {isConnected && (
          <TouchableOpacity
            style={settingsScreenStyles.disconnectButton}
            onPress={disconnectDevice}
          >
            <Text style={settingsScreenStyles.disconnectButtonText}>
              Disconnect
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Scan for Devices Card */}
      <View style={settingsScreenStyles.settingCard}>
        <View style={settingsScreenStyles.settingHeader}>
          <Icon
            name="settings"
            size={24}
            color={theme.colors.textSecondary}
            style={settingsScreenStyles.settingIcon}
          />
          <View style={settingsScreenStyles.settingTextContainer}>
            <Text style={settingsScreenStyles.settingTitle}>
              Scan for BLE Devices
            </Text>
            <Text style={settingsScreenStyles.settingDescription}>
              Pressing scan to start scanning{'\n'}BLE Devices at your vicinity.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            settingsScreenStyles.scanButton,
            isScanning && settingsScreenStyles.scanButtonDisabled,
          ]}
          onPress={startScan}
          disabled={isScanning}
        >
          <Text style={settingsScreenStyles.scanButtonText}>
            {isScanning ? 'Scanning...' : 'Scan'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Known Devices Card */}
      {discoveredDevices.length > 0 && (
        <View style={settingsScreenStyles.settingCard}>
          <View style={settingsScreenStyles.settingHeader}>
            <Icon
              name="devices"
              size={24}
              color={theme.colors.textSecondary}
              style={settingsScreenStyles.settingIcon}
            />
            <View style={settingsScreenStyles.settingTextContainer}>
              <Text style={settingsScreenStyles.settingTitle}>
                Discovered Devices ({discoveredDevices.length})
              </Text>
              <Text style={settingsScreenStyles.settingDescription}>
                Tap on a device to connect
              </Text>
            </View>
          </View>

          <View style={settingsScreenStyles.devicesList}>
            {discoveredDevices.map((device, index) => (
              <TouchableOpacity
                key={device.id}
                style={[
                  settingsScreenStyles.deviceItem,
                  index === discoveredDevices.length - 1 &&
                    settingsScreenStyles.deviceItemLast,
                ]}
                onPress={() => handleDeviceConnect(device.id, device.name)}
              >
                <View style={settingsScreenStyles.deviceInfo}>
                  <Text style={settingsScreenStyles.deviceName}>
                    {device.name}
                  </Text>
                  <Text style={settingsScreenStyles.deviceId}>{device.id}</Text>
                </View>
                <Icon
                  name="chevron-right"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default SettingsScreen;
