import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { bleService } from '../services';
import { logger } from '../utils/logger';
import { SCAN_SETTINGS, CONNECTION_SETTINGS } from '../constants/ble';

interface DiscoveredDevice {
  id: string;
  name: string;
  rssi?: number | undefined;
}

interface BLEScanningState {
  isScanning: boolean;
  isConnected: boolean;
  connectedDeviceName?: string | undefined;
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
  const [connectedDeviceName, setConnectedDeviceName] = useState<
    string | undefined
  >(undefined);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<
    DiscoveredDevice[]
  >([]);

  // Update status from BLE service
  const updateStatus = useCallback(async () => {
    try {
      const status = await bleService.getConnectionStatus();
      setIsConnected(status.isConnected);
      setConnectedDeviceName(status.deviceName);
      setBluetoothEnabled(status.bluetoothEnabled);
      logger.debug('BLE status updated', { status });
    } catch (error) {
      logger.error('Failed to update BLE status', error);
      // Don't throw here as this is a background operation
    }
  }, []);

  // Set up periodic status updates
  useEffect(() => {
    const checkInitialStatus = async () => {
      try {
        await updateStatus();
        const isEnabled = await bleService.isBluetoothEnabled();
        setBluetoothEnabled(isEnabled);
        logger.info('Initial BLE status check completed', { isEnabled });
      } catch (error) {
        logger.error('Failed to check initial BLE status', error);
      }
    };

    checkInitialStatus();

    // Update status every 3 seconds using constant
    const statusInterval = setInterval(async () => {
      await updateStatus();
    }, CONNECTION_SETTINGS.STATUS_UPDATE_INTERVAL_MS);

    return () => {
      clearInterval(statusInterval);
      logger.debug('BLE status monitoring stopped');
    };
  }, [updateStatus]);

  const startScan = useCallback(async () => {
    setIsScanning(true);
    logger.info('Starting BLE device scan');

    try {
      // Small delay to ensure BLE manager is ready (using constant)
      await new Promise<void>(resolve =>
        setTimeout(resolve, SCAN_SETTINGS.INITIALIZATION_DELAY_MS),
      );

      // Request BLE permissions
      const hasPermissions = await bleService.requestBLEPermissions();

      if (!hasPermissions) {
        logger.warn('BLE permissions not granted');
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
        logger.warn('Bluetooth is disabled');
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
        logger.debug('Found BLE device', {
          name: device.name,
          id: device.id,
          rssi: device.rssi,
        });

        // Collect all found devices with names
        if (device.name && !foundDevices.find(d => d.id === device.id)) {
          foundDevices.push({
            id: device.id,
            name: device.name,
            rssi: device.rssi ?? undefined,
          });
        }
      });

      // Stop scanning after configured duration
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

        logger.info('BLE scan completed', {
          foundCount: foundDevices.length,
          totalDevices: foundDevices.length,
        });

        Alert.alert(
          'Scan Complete',
          `Found ${foundDevices.length} device(s). Check the devices list below.`,
          [{ text: 'OK' }],
        );
      }, SCAN_SETTINGS.DURATION_MS);
    } catch (error) {
      logger.error('BLE scan failed', error);
      Alert.alert(
        'Bluetooth Error',
        'Failed to start Bluetooth scan. Please try again.',
        [{ text: 'OK' }],
      );
      setIsScanning(false);
    }
  }, []);

  const connectToDevice = useCallback(
    (deviceId: string, deviceName: string) => {
      logger.info('Attempting to connect to device', { deviceId, deviceName });

      Alert.alert(
        'Connect Device',
        `Would you like to connect to ${deviceName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Connect',
            onPress: async () => {
              try {
                logger.debug('Starting device connection', { deviceId });
                const device = await bleService.connectToDevice(deviceId);
                setIsConnected(true);
                setConnectedDeviceName(device.name || undefined);

                logger.info('Successfully connected to device', {
                  deviceId,
                  deviceName: device.name,
                });

                Alert.alert(
                  'Connected',
                  `Successfully connected to ${device.name || 'device'}!`,
                  [{ text: 'OK' }],
                );
              } catch (error) {
                logger.error('Device connection failed', { deviceId, error });
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
    },
    [],
  );

  const disconnectDevice = useCallback(async () => {
    const connectedDevice = bleService.getConnectedDevice();
    if (connectedDevice) {
      try {
        logger.info('Disconnecting from device', {
          deviceId: connectedDevice.id,
        });
        await bleService.disconnectDevice(connectedDevice.id);
        setIsConnected(false);
        setConnectedDeviceName(undefined);

        logger.info('Successfully disconnected from device');
        Alert.alert('Disconnected', 'Device disconnected successfully.', [
          { text: 'OK' },
        ]);
      } catch (error) {
        logger.error('Device disconnection failed', error);
        Alert.alert(
          'Disconnect Failed',
          'Failed to disconnect from the device.',
          [{ text: 'OK' }],
        );
      }
    } else {
      logger.warn('Attempted to disconnect but no device was connected');
    }
  }, []);

  const clearDevices = useCallback(() => {
    logger.debug('Clearing discovered devices list');
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
