import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme';
import { settingsScreenStyles } from '../theme/styles';
import { bleService } from '../services/BLEService';

interface DiscoveredDevice {
  id: string;
  name: string;
  rssi?: number;
}

const SettingsScreen: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDeviceName, setConnectedDeviceName] = useState<
    string | undefined
  >(undefined);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<
    DiscoveredDevice[]
  >([]);

  // Update status from BLE service
  const updateStatus = async () => {
    const status = await bleService.getConnectionStatus();
    setIsConnected(status.isConnected);
    setConnectedDeviceName(status.deviceName);
    setBluetoothEnabled(status.bluetoothEnabled);
  };

  // Check initial status and set up periodic updates
  useEffect(() => {
    const checkStatus = async () => {
      await updateStatus();
      const isEnabled = await bleService.isBluetoothEnabled();
      setBluetoothEnabled(isEnabled);
    };

    checkStatus();

    // Update status every 3 seconds
    const statusInterval = setInterval(async () => {
      await updateStatus();
    }, 3000);

    return () => {
      clearInterval(statusInterval);
    };
  }, []);

  const handleScan = async () => {
    setIsScanning(true);

    try {
      // Small delay to ensure BLE manager is ready
      await new Promise(resolve => setTimeout(resolve, 500));

      // Request BLE permissions
      const hasPermissions = await bleService.requestBLEPermissions();

      if (!hasPermissions) {
        Alert.alert(
          'Permissions Required',
          'Please grant Bluetooth and location permissions to scan for devices.',
          [{ text: 'OK' }],
        );
        setIsScanning(false);
        return;
      }

      // Check if Bluetooth is enabled
      const isEnabled = await bleService.isBluetoothEnabled();

      if (!isEnabled) {
        Alert.alert(
          'Bluetooth Disabled',
          'Please enable Bluetooth to scan for devices.',
          [{ text: 'OK' }],
        );
        setIsScanning(false);
        return;
      }

      // Start scanning for BLE devices
      const foundDevices: DiscoveredDevice[] = [];

      await bleService.startScan(device => {
        console.log('Found BLE device:', device.name, device.id);

        // Collect all found devices with names
        if (device.name && !foundDevices.find(d => d.id === device.id)) {
          foundDevices.push({
            id: device.id,
            name: device.name,
            rssi: device.rssi || undefined,
          });
        }
      });

      // Stop scanning after 10 seconds
      setTimeout(() => {
        bleService.stopScan();
        setIsScanning(false);

        // Update discovered devices list
        setDiscoveredDevices(prevDevices => {
          const updatedDevices = [...prevDevices];
          foundDevices.forEach(newDevice => {
            if (!updatedDevices.find(d => d.id === newDevice.id)) {
              updatedDevices.push(newDevice);
            }
          });
          return updatedDevices;
        });

        Alert.alert(
          'Scan Complete',
          `Found ${foundDevices.length} device(s). Check the devices list below.`,
          [{ text: 'OK' }],
        );
      }, 10000);
    } catch (error) {
      console.error('Bluetooth error:', error);
      Alert.alert(
        'Bluetooth Error',
        'Failed to start Bluetooth scan. Please try again.',
        [{ text: 'OK' }],
      );
      setIsScanning(false);
    }
  };

  const connectToDevice = async (deviceId: string) => {
    try {
      const device = await bleService.connectToDevice(deviceId);
      setIsConnected(true);
      setConnectedDeviceName(device.name || undefined);

      Alert.alert(
        'Connected',
        `Successfully connected to ${device.name || 'device'}!`,
        [{ text: 'OK' }],
      );
    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert(
        'Connection Failed',
        'Failed to connect to the device. Please try again.',
        [{ text: 'OK' }],
      );
    }
  };

  const handleDeviceConnect = (deviceId: string, deviceName: string) => {
    Alert.alert(
      'Connect Device',
      `Would you like to connect to ${deviceName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Connect',
          onPress: () => connectToDevice(deviceId),
        },
      ],
    );
  };

  const handleDisconnect = async () => {
    if (bleService.getConnectedDevice()) {
      try {
        await bleService.disconnectDevice(bleService.getConnectedDevice()!.id);
        setIsConnected(false);
        setConnectedDeviceName(undefined);

        Alert.alert('Disconnected', 'Device disconnected successfully.', [
          { text: 'OK' },
        ]);
      } catch (error) {
        console.error('Disconnect error:', error);
        Alert.alert(
          'Disconnect Failed',
          'Failed to disconnect from the device.',
          [{ text: 'OK' }],
        );
      }
    }
  };

  return (
    <ScrollView style={settingsScreenStyles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />

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
            onPress={handleDisconnect}
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
          onPress={handleScan}
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
