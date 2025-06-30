import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { bleService } from '../services';

interface DiscoveredDevice {
  id: string;
  name: string;
  rssi?: number;
}

interface BLEScanningState {
  isScanning: boolean;
  isConnected: boolean;
  connectedDeviceName?: string;
  bluetoothEnabled: boolean;
  discoveredDevices: DiscoveredDevice[];
}

interface BLEScanningActions {
  startScan: () => Promise<void>;
  connectToDevice: (deviceId: string, deviceName: string) => void;
  disconnectDevice: () => Promise<void>;
  clearDevices: () => void;
}

export const useBLEScanning = (): BLEScanningState & BLEScanningActions => {
  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDeviceName, setConnectedDeviceName] = useState<string | undefined>(undefined);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredDevice[]>([]);

  // Update status from BLE service
  const updateStatus = useCallback(async () => {
    const status = await bleService.getConnectionStatus();
    setIsConnected(status.isConnected);
    setConnectedDeviceName(status.deviceName);
    setBluetoothEnabled(status.bluetoothEnabled);
  }, []);

  // Set up periodic status updates
  useEffect(() => {
    const checkInitialStatus = async () => {
      await updateStatus();
      const isEnabled = await bleService.isBluetoothEnabled();
      setBluetoothEnabled(isEnabled);
    };

    checkInitialStatus();

    // Update status every 3 seconds
    const statusInterval = setInterval(async () => {
      await updateStatus();
    }, 3000);

    return () => {
      clearInterval(statusInterval);
    };
  }, [updateStatus]);

  const startScan = useCallback(async () => {
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
  }, []);

  const connectToDevice = useCallback((deviceId: string, deviceName: string) => {
    Alert.alert(
      'Connect Device',
      `Would you like to connect to ${deviceName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Connect',
          onPress: async () => {
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
          },
        },
      ],
    );
  }, []);

  const disconnectDevice = useCallback(async () => {
    const connectedDevice = bleService.getConnectedDevice();
    if (connectedDevice) {
      try {
        await bleService.disconnectDevice(connectedDevice.id);
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
  }, []);

  const clearDevices = useCallback(() => {
    setDiscoveredDevices([]);
  }, []);

  return {
    // State
    isScanning,
    isConnected,
    connectedDeviceName,
    bluetoothEnabled,
    discoveredDevices,
    // Actions
    startScan,
    connectToDevice,
    disconnectDevice,
    clearDevices,
  };
};
