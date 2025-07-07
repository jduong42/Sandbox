import React, { useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import NativeIcon from '../components/common/NativeIcon';
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

      {/* Connection Status Card */}
      <View style={settingsScreenStyles.settingCard}>
        <View style={settingsScreenStyles.settingHeader}>
          <NativeIcon
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
          <NativeIcon
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
            <NativeIcon
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
                <NativeIcon
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
