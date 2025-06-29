import { BleManager, Device, State } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';

class BLEService {
  private manager: BleManager;

  constructor() {
    this.manager = new BleManager();
  }

  // Request BLE permissions
  async requestBLEPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      // Android permissions
      const permissions = [
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
        PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE,
      ];

      try {
        const results = await Promise.all(
          permissions.map(permission => request(permission)),
        );

        const allGranted = results.every(result => result === RESULTS.GRANTED);
        return allGranted;
      } catch (error) {
        console.log('Error requesting BLE permissions:', error);
        return false;
      }
    } else if (Platform.OS === 'ios') {
      // iOS permissions are handled automatically by the BLE library
      return true;
    }

    return false;
  }

  // Check if Bluetooth is enabled
  async isBluetoothEnabled(): Promise<boolean> {
    const state = await this.manager.state();
    return state === State.PoweredOn;
  }

  // Start scanning for BLE devices
  async startScan(onDeviceFound: (device: Device) => void): Promise<void> {
    const hasPermissions = await this.requestBLEPermissions();

    if (!hasPermissions) {
      throw new Error('BLE permissions not granted');
    }

    const isEnabled = await this.isBluetoothEnabled();
    if (!isEnabled) {
      throw new Error('Bluetooth is not enabled');
    }

    console.log('Starting BLE scan...');

    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log('Scan error:', error);
        return;
      }

      if (device && device.name) {
        console.log('Found device:', device.name, device.id);
        onDeviceFound(device);
      }
    });
  }

  // Stop scanning
  stopScan(): void {
    this.manager.stopDeviceScan();
    console.log('BLE scan stopped');
  }

  // Connect to a device
  async connectToDevice(deviceId: string): Promise<Device> {
    try {
      const device = await this.manager.connectToDevice(deviceId);
      console.log('Connected to device:', device.name);
      return device;
    } catch (error) {
      console.log('Connection error:', error);
      throw error;
    }
  }

  // Disconnect from device
  async disconnectDevice(deviceId: string): Promise<void> {
    try {
      await this.manager.cancelDeviceConnection(deviceId);
      console.log('Disconnected from device');
    } catch (error) {
      console.log('Disconnect error:', error);
      throw error;
    }
  }

  // Destroy the manager
  destroy(): void {
    this.manager.destroy();
  }
}

export const bleService = new BLEService();
