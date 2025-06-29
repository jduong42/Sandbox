import React, { useState } from 'react';
import { View, Text, StatusBar, Alert } from 'react-native';
import { homeScreenStyles } from '../theme/styles';
import { theme } from '../theme';
import { BluetoothButton } from '../components';
import { bleService } from '../services/BLEService';

const HomeScreen: React.FC = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleBluetoothPress = async () => {
    setIsConnecting(true);

    try {
      // Request BLE permissions
      const hasPermissions = await bleService.requestBLEPermissions();

      if (!hasPermissions) {
        Alert.alert(
          'Permissions Required',
          'Please grant Bluetooth and location permissions to scan for devices.',
          [{ text: 'OK' }],
        );
        setIsConnecting(false);
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
    }
  };

  const connectToDevice = async (deviceId: string) => {
    try {
      await bleService.connectToDevice(deviceId);
      setIsConnected(true);
      setIsConnecting(false);

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
    }
  };

  return (
    <View style={homeScreenStyles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />
      <Text style={homeScreenStyles.title}>PolarH10Monitor Application</Text>

      <View style={homeScreenStyles.buttonContainer}>
        <BluetoothButton
          onPress={handleBluetoothPress}
          title={isConnected ? 'Connected to Polar' : 'Scan for Polar Devices'}
          loading={isConnecting}
          connected={isConnected}
        />
      </View>
    </View>
  );
};

export default HomeScreen;
