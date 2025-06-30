import { BleManager, Device, State } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';

class BLEService {
  private manager: BleManager;
  private isManagerReady: boolean = false;
  private connectedDevice: Device | null = null;
  private bluetoothState: State = State.Unknown;
  private connectionSubscription: any = null;
  private onDisconnectedCallback: ((deviceName: string) => void) | null = null;

  constructor() {
    this.manager = new BleManager();
    this.initializeManager();
  }

  // Initialize BLE manager and wait for it to be ready
  private async initializeManager(): Promise<void> {
    return new Promise(resolve => {
      const subscription = this.manager.onStateChange(state => {
        console.log('BLE State changed to:', state);
        this.bluetoothState = state;
        if (state === State.PoweredOn || state === State.PoweredOff) {
          this.isManagerReady = true;
          subscription.remove();
          resolve();
        }
      }, true);
    });
  }

  // Wait for manager to be ready
  private async waitForManagerReady(): Promise<void> {
    if (this.isManagerReady) return;

    let attempts = 0;
    const maxAttempts = 30; // 3 seconds max wait

    while (!this.isManagerReady && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!this.isManagerReady) {
      throw new Error('BLE Manager failed to initialize');
    }
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

  // Set callback for disconnection events
  setOnDisconnectedCallback(callback: (deviceName: string) => void): void {
    this.onDisconnectedCallback = callback;
  }

  // Clear disconnection callback
  clearOnDisconnectedCallback(): void {
    this.onDisconnectedCallback = null;
  }

  // Get current connection status
  async getConnectionStatus(): Promise<{
    isConnected: boolean;
    deviceName?: string;
    bluetoothEnabled: boolean;
  }> {
    // Check if device is still actually connected
    const isConnected = await this.isDeviceConnected();

    return {
      isConnected,
      deviceName: this.connectedDevice?.name || undefined,
      bluetoothEnabled: this.bluetoothState === State.PoweredOn,
    };
  }

  // Get connected device
  getConnectedDevice(): Device | null {
    return this.connectedDevice;
  }

  // Check if Bluetooth is enabled
  async isBluetoothEnabled(): Promise<boolean> {
    try {
      await this.waitForManagerReady();
      const state = await this.manager.state();
      console.log('Current BLE state:', state);
      return state === State.PoweredOn;
    } catch (error) {
      console.log('Error checking Bluetooth state:', error);
      return false;
    }
  }

  // Start scanning for BLE devices
  async startScan(onDeviceFound: (device: Device) => void): Promise<void> {
    try {
      // Ensure manager is ready
      await this.waitForManagerReady();

      // Request permissions first
      const hasPermissions = await this.requestBLEPermissions();
      if (!hasPermissions) {
        throw new Error('BLE permissions not granted');
      }

      // Check if Bluetooth is enabled
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
    } catch (error) {
      console.log('Error in startScan:', error);
      throw error;
    }
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
      this.connectedDevice = device;

      // Monitor connection state
      this.monitorConnection(device);

      console.log('Connected to device:', device.name);
      return device;
    } catch (error) {
      console.log('Connection error:', error);
      throw error;
    }
  }

  // Monitor device connection state
  private monitorConnection(device: Device): void {
    // Clean up any existing subscription
    if (this.connectionSubscription) {
      this.connectionSubscription.remove();
    }

    // Monitor device disconnection
    this.connectionSubscription = device.onDisconnected(
      (error, disconnectedDevice) => {
        console.log('Device disconnected:', disconnectedDevice?.name, error);

        const deviceName =
          this.connectedDevice?.name ||
          disconnectedDevice?.name ||
          'Unknown Device';
        this.connectedDevice = null;

        // Notify the UI about disconnection
        if (this.onDisconnectedCallback) {
          this.onDisconnectedCallback(deviceName);
        }

        if (this.connectionSubscription) {
          this.connectionSubscription.remove();
          this.connectionSubscription = null;
        }
      },
    );
  }

  // Check if device is still connected
  async isDeviceConnected(): Promise<boolean> {
    if (!this.connectedDevice) {
      return false;
    }

    try {
      const isConnected = await this.connectedDevice.isConnected();
      if (!isConnected) {
        this.connectedDevice = null;
      }
      return isConnected;
    } catch (error) {
      console.log('Error checking device connection:', error);
      this.connectedDevice = null;
      return false;
    }
  }

  // Disconnect from device
  async disconnectDevice(deviceId: string): Promise<void> {
    try {
      // Clean up connection monitoring
      if (this.connectionSubscription) {
        this.connectionSubscription.remove();
        this.connectionSubscription = null;
      }

      await this.manager.cancelDeviceConnection(deviceId);
      this.connectedDevice = null;
      console.log('Disconnected from device');
    } catch (error) {
      console.log('Disconnect error:', error);
      throw error;
    }
  }

  // Destroy the manager
  destroy(): void {
    // Clean up connection monitoring
    if (this.connectionSubscription) {
      this.connectionSubscription.remove();
      this.connectionSubscription = null;
    }

    this.manager.destroy();
  }
}

export const bleService = new BLEService();
