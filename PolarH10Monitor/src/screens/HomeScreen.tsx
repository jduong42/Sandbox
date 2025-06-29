import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar, Alert } from 'react-native';
import { homeScreenStyles } from '../theme/styles';
import { theme } from '../theme';
import { BluetoothButton, BLEStatusBar } from '../components';
import { bleService } from '../services/BLEService';

const HomeScreen: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [deviceName, setDeviceName] = useState<string | undefined>(undefined);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Update status from BLE service
  const updateStatus = async () => {
    const status = await bleService.getConnectionStatus();
    setIsConnected(status.isConnected);
    setDeviceName(status.deviceName);
    setBluetoothEnabled(status.bluetoothEnabled);
  };

  // Check initial status and set up periodic updates
  useEffect(() => {
    const checkStatus = async () => {
      // Initial status check
      await updateStatus();
      
      // Check Bluetooth state
      const isEnabled = await bleService.isBluetoothEnabled();
      setBluetoothEnabled(isEnabled);
    };

    checkStatus();

    // Set up disconnection callback
    bleService.setOnDisconnectedCallback((deviceName: string) => {
      setIsConnected(false);
      setDeviceName(undefined);
      setIsConnecting(false);
      setIsScanning(false);
      
      Alert.alert(
        'Device Disconnected',
        `Lost connection to ${deviceName}. The device may be out of range or powered off.`,
        [{ text: 'OK' }],
      );
    });

    // Update status every 2 seconds
    const statusInterval = setInterval(async () => {
      await updateStatus();
    }, 2000);

    return () => {
      clearInterval(statusInterval);
      bleService.clearOnDisconnectedCallback();
    };
  }, []);

  const handleBluetoothPress = async () => {
    setIsConnecting(true);
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
        setIsConnecting(false);
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
        setIsConnecting(false);
        setIsScanning(false);
        return;
      }

      // Start scanning for BLE devices
      await bleService.startScan(device => {
        console.log('Found BLE device:', device.name, device.id);

        // Look for Polar devices specifically
        if (device.name?.toLowerCase().includes('polar')) {
          Alert.alert(
            'Device Found',
            `Found ${device.name}. Would you like to connect?`,
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Connect',
                onPress: () => connectToDevice(device.id),
              },
            ],
          );
          bleService.stopScan();
        }
      });

      // Stop scanning after 10 seconds
      setTimeout(() => {
        bleService.stopScan();
        setIsConnecting(false);
        setIsScanning(false);

        if (!isConnected) {
          Alert.alert(
            'Scan Complete',
            'No Polar devices found. Make sure your device is nearby and in pairing mode.',
            [{ text: 'OK' }],
          );
        }
      }, 10000);
    } catch (error) {
      console.error('Bluetooth error:', error);
      Alert.alert(
        'Bluetooth Error',
        'Failed to start Bluetooth scan. Please try again.',
        [{ text: 'OK' }],
      );
      setIsConnecting(false);
      setIsScanning(false);
    }
  };

  const connectToDevice = async (deviceId: string) => {
    try {
      const device = await bleService.connectToDevice(deviceId);
      setIsConnected(true);
      setDeviceName(device.name || undefined);
      setIsConnecting(false);
      setIsScanning(false);

      Alert.alert('Connected', 'Successfully connected to your Polar device!', [
        { text: 'OK' },
      ]);
    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert(
        'Connection Failed',
        'Failed to connect to the device. Please try again.',
        [{ text: 'OK' }],
      );
      setIsConnecting(false);
      setIsScanning(false);
    }
  };

  const handleDisconnect = async () => {
    if (bleService.getConnectedDevice()) {
      try {
        await bleService.disconnectDevice(bleService.getConnectedDevice()!.id);
        setIsConnected(false);
        setDeviceName(undefined);
        
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
    <View style={homeScreenStyles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />
      <Text style={homeScreenStyles.title}>PolarH10Monitor Application</Text>

      <BLEStatusBar
        isConnected={isConnected}
        deviceName={deviceName}
        isScanning={isScanning}
        bluetoothEnabled={bluetoothEnabled}
      />

      <View style={homeScreenStyles.buttonContainer}>
        <BluetoothButton
          onPress={isConnected ? handleDisconnect : handleBluetoothPress}
          title={
            isConnected 
              ? `Disconnect from ${deviceName || 'Device'}` 
              : 'Scan for Polar Devices'
          }
          loading={isConnecting}
          connected={isConnected}
        />
      </View>
    </View>
  );
};

export default HomeScreen;
