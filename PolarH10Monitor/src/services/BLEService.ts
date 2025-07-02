import { BleManager, Device, State } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { logger } from '../utils/logger';
import { CONNECTION_SETTINGS } from '../constants/ble';
import { deviceHistoryService } from './DeviceHistoryService';

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
    return new Promise<void>(resolve => {
      const subscription = this.manager.onStateChange(state => {
        logger.info('BLE State changed', { state });
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
    const maxAttempts =
      CONNECTION_SETTINGS.MANAGER_READY_TIMEOUT_MS /
      CONNECTION_SETTINGS.MANAGER_READY_CHECK_INTERVAL_MS;

    logger.debug('Waiting for BLE manager to be ready', { maxAttempts });

    while (!this.isManagerReady && attempts < maxAttempts) {
      await new Promise<void>(resolve =>
        setTimeout(
          resolve,
          CONNECTION_SETTINGS.MANAGER_READY_CHECK_INTERVAL_MS,
        ),
      );
      attempts++;
    }

    if (!this.isManagerReady) {
      const error = new Error(
        'BLE Manager failed to initialize within timeout',
      );
      logger.error('BLE Manager initialization timeout', {
        attempts,
        maxAttempts,
      });
      throw error;
    }

    logger.debug('BLE manager ready', { attempts });
  }

  // Request BLE permissions
  async requestBLEPermissions(): Promise<boolean> {
    logger.debug('Requesting BLE permissions', { platform: Platform.OS });

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

        logger.info('BLE permissions request completed', {
          allGranted,
          results: results.map((result, index) => ({
            permission: permissions[index],
            granted: result === RESULTS.GRANTED,
          })),
        });

        return allGranted;
      } catch (error) {
        logger.error('Error requesting BLE permissions', error);
        return false;
      }
    } else if (Platform.OS === 'ios') {
      // iOS permissions are handled automatically by the BLE library
      logger.debug('iOS BLE permissions handled automatically');
      return true;
    }

    logger.warn('Unsupported platform for BLE permissions', {
      platform: Platform.OS,
    });
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
    deviceName?: string | undefined;
    bluetoothEnabled: boolean;
  }> {
    try {
      // Check if device is still actually connected
      const isConnected = await this.isDeviceConnected();

      const status = {
        isConnected,
        deviceName: this.connectedDevice?.name ?? undefined,
        bluetoothEnabled: this.bluetoothState === State.PoweredOn,
      };

      logger.debug('Connection status retrieved', status);
      return status;
    } catch (error) {
      logger.error('Failed to get connection status', error);
      // Return safe defaults
      return {
        isConnected: false,
        deviceName: undefined,
        bluetoothEnabled: false,
      };
    }
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
      const isEnabled = state === State.PoweredOn;

      logger.debug('Bluetooth state checked', { state, isEnabled });
      return isEnabled;
    } catch (error) {
      logger.error('Error checking Bluetooth state', error);
      return false;
    }
  }

  // Start scanning for BLE devices
  async startScan(onDeviceFound: (device: Device) => void): Promise<void> {
    logger.info('Starting BLE device scan');

    try {
      // Ensure manager is ready
      await this.waitForManagerReady();

      // Request permissions first
      const hasPermissions = await this.requestBLEPermissions();
      if (!hasPermissions) {
        const error = new Error('BLE permissions not granted');
        logger.warn('BLE scan failed - permissions not granted');
        throw error;
      }

      // Check if Bluetooth is enabled
      const isEnabled = await this.isBluetoothEnabled();
      if (!isEnabled) {
        const error = new Error('Bluetooth is not enabled');
        logger.warn('BLE scan failed - Bluetooth disabled');
        throw error;
      }

      logger.debug('Starting device scan with callbacks');

      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          logger.error('Device scan error', error);
          return;
        }

        if (device && device.name) {
          logger.debug('Device found during scan', {
            name: device.name,
            id: device.id,
            rssi: device.rssi,
          });
          onDeviceFound(device);
        }
      });

      logger.info('BLE device scan started successfully');
    } catch (error) {
      logger.error('Failed to start BLE scan', error);
      throw error;
    }
  }

  // Stop scanning
  stopScan(): void {
    try {
      this.manager.stopDeviceScan();
      logger.info('BLE device scan stopped');
    } catch (error) {
      logger.error('Error stopping BLE scan', error);
    }
  }

  // Connect to a device
  async connectToDevice(deviceId: string): Promise<Device> {
    logger.info('Attempting to connect to device', { deviceId });

    try {
      const device = await this.manager.connectToDevice(deviceId);
      this.connectedDevice = device;

      // Add device to history
      logger.info('Attempting to add device to history', {
        deviceId: device.id,
        deviceName: device.name || 'NO_NAME',
        localName: device.localName || 'NO_LOCAL_NAME',
        hasName: !!device.name,
        hasLocalName: !!device.localName,
        hasManufacturerData: !!device.manufacturerData,
      });

      try {
        const deviceToStore: Omit<
          import('./DeviceHistoryService').StoredDevice,
          'lastConnected'
        > = {
          id: device.id,
          name: device.name || device.localName || `Device ${device.id.substring(0, 8)}`,
        };

        if (device.manufacturerData) {
          deviceToStore.manufacturerData = device.manufacturerData;
        }

        await deviceHistoryService.addDevice(deviceToStore);
        logger.info('Successfully added device to history', {
          deviceId: device.id,
          storedName: deviceToStore.name,
        });
      } catch (historyError) {
        logger.error('Failed to add device to history', {
          deviceId: device.id,
          error: historyError,
        });
        // Don't fail the connection if history fails
      }

      // Monitor connection state
      this.monitorConnection(device);

      logger.info('Successfully connected to device', {
        deviceId,
        deviceName: device.name,
      });
      return device;
    } catch (error) {
      logger.error('Failed to connect to device', { deviceId, error });
      throw error;
    }
  }

  // Monitor device connection state
  private monitorConnection(device: Device): void {
    logger.debug('Setting up connection monitoring', { deviceId: device.id });

    // Clean up any existing subscription
    if (this.connectionSubscription) {
      this.connectionSubscription.remove();
      logger.debug('Cleaned up existing connection subscription');
    }

    // Monitor device disconnection
    this.connectionSubscription = device.onDisconnected(
      (error, disconnectedDevice) => {
        const deviceName =
          this.connectedDevice?.name ||
          disconnectedDevice?.name ||
          'Unknown Device';

        logger.info('Device disconnected', {
          deviceName,
          deviceId: disconnectedDevice?.id,
          error: error?.message,
        });

        this.connectedDevice = null;

        // Notify the UI about disconnection
        if (this.onDisconnectedCallback) {
          try {
            this.onDisconnectedCallback(deviceName);
          } catch (callbackError) {
            logger.error('Error in disconnect callback', callbackError);
          }
        }

        if (this.connectionSubscription) {
          this.connectionSubscription.remove();
          this.connectionSubscription = null;
        }
      },
    );

    logger.debug('Connection monitoring established');
  }

  // Check if device is still connected
  async isDeviceConnected(): Promise<boolean> {
    if (!this.connectedDevice) {
      logger.debug('No connected device to check');
      return false;
    }

    try {
      const isConnected = await this.connectedDevice.isConnected();
      if (!isConnected) {
        logger.info('Device is no longer connected', {
          deviceId: this.connectedDevice.id,
        });
        this.connectedDevice = null;
      }
      return isConnected;
    } catch (error) {
      logger.error('Error checking device connection status', {
        deviceId: this.connectedDevice?.id,
        error,
      });
      this.connectedDevice = null;
      return false;
    }
  }

  // Disconnect from device
  async disconnectDevice(deviceId: string): Promise<void> {
    logger.info('Disconnecting from device', { deviceId });

    try {
      // Clean up connection monitoring
      if (this.connectionSubscription) {
        this.connectionSubscription.remove();
        this.connectionSubscription = null;
        logger.debug('Connection monitoring cleaned up');
      }

      await this.manager.cancelDeviceConnection(deviceId);
      this.connectedDevice = null;

      logger.info('Successfully disconnected from device', { deviceId });
    } catch (error) {
      logger.error('Error disconnecting from device', { deviceId, error });
      throw error;
    }
  }

  // Destroy the manager
  destroy(): void {
    logger.info('Destroying BLE service');

    try {
      // Clean up connection monitoring
      if (this.connectionSubscription) {
        this.connectionSubscription.remove();
        this.connectionSubscription = null;
        logger.debug('Connection subscription cleaned up');
      }

      // Clear callbacks
      this.onDisconnectedCallback = null;

      // Destroy the manager
      this.manager.destroy();
      this.connectedDevice = null;
      this.isManagerReady = false;

      logger.info('BLE service destroyed successfully');
    } catch (error) {
      logger.error('Error destroying BLE service', error);
    }
  }
}

export const bleService = new BLEService();
