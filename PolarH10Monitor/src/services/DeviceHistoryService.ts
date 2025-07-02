import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

export interface StoredDevice {
  id: string;
  name: string;
  lastConnected: string; // ISO date string
  manufacturerData?: string;
}

class DeviceHistoryService {
  private static readonly STORAGE_KEY = '@device_history';
  private static readonly MAX_DEVICES = 50; // Reasonable limit to prevent storage bloat

  /**
   * Add a device to the connection history
   */
  async addDevice(device: Omit<StoredDevice, 'lastConnected'>): Promise<void> {
    try {
      logger.info('DeviceHistoryService: addDevice called', {
        deviceId: device.id,
        deviceName: device.name || 'NO_NAME_PROVIDED',
        hasName: !!device.name,
        deviceKeys: Object.keys(device),
      });

      const devices = await this.getDevices();
      const existingIndex = devices.findIndex(d => d.id === device.id);

      const updatedDevice: StoredDevice = {
        ...device,
        lastConnected: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        // Update existing device
        devices[existingIndex] = updatedDevice;
        logger.info('Updated device in history', {
          deviceId: device.id,
          deviceName: device.name,
        });
      } else {
        // Add new device to the beginning of the array
        devices.unshift(updatedDevice);
        logger.info('Added new device to history', {
          deviceId: device.id,
          deviceName: device.name,
        });
      }

      // Keep only the most recent devices (though no hard limit as requested)
      // But we'll still have a reasonable max to prevent storage issues
      const trimmedDevices = devices.slice(0, DeviceHistoryService.MAX_DEVICES);

      await AsyncStorage.setItem(
        DeviceHistoryService.STORAGE_KEY,
        JSON.stringify(trimmedDevices),
      );

      logger.info('DeviceHistoryService: Successfully saved to AsyncStorage', {
        deviceCount: trimmedDevices.length,
        storageKey: DeviceHistoryService.STORAGE_KEY,
      });
    } catch (error) {
      logger.error('Failed to add device to history', {
        error,
        deviceId: device.id,
      });
      throw error;
    }
  }

  /**
   * Get all stored devices, sorted by last connected (most recent first)
   */
  async getDevices(): Promise<StoredDevice[]> {
    try {
      const storedData = await AsyncStorage.getItem(
        DeviceHistoryService.STORAGE_KEY,
      );
      if (!storedData) {
        logger.info('DeviceHistoryService: No stored data found');
        return [];
      }

      const devices: StoredDevice[] = JSON.parse(storedData);
      
      logger.info('DeviceHistoryService: Retrieved devices from storage', {
        deviceCount: devices.length,
        deviceNames: devices.map(d => ({ id: d.id.substring(0, 8), name: d.name || 'NO_NAME' })),
      });

      // Sort by last connected date (most recent first)
      return devices.sort(
        (a, b) =>
          new Date(b.lastConnected).getTime() -
          new Date(a.lastConnected).getTime(),
      );
    } catch (error) {
      logger.error('Failed to get device history', { error });
      return [];
    }
  }

  /**
   * Remove a device from history
   */
  async removeDevice(deviceId: string): Promise<void> {
    try {
      const devices = await this.getDevices();
      const filteredDevices = devices.filter(d => d.id !== deviceId);

      await AsyncStorage.setItem(
        DeviceHistoryService.STORAGE_KEY,
        JSON.stringify(filteredDevices),
      );

      logger.info('Removed device from history', { deviceId });
    } catch (error) {
      logger.error('Failed to remove device from history', { error, deviceId });
      throw error;
    }
  }

  /**
   * Clear all device history
   */
  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(DeviceHistoryService.STORAGE_KEY);
      logger.info('Cleared all device history');
    } catch (error) {
      logger.error('Failed to clear device history', { error });
      throw error;
    }
  }

  /**
   * Get a specific device by ID
   */
  async getDevice(deviceId: string): Promise<StoredDevice | null> {
    try {
      const devices = await this.getDevices();
      return devices.find(d => d.id === deviceId) || null;
    } catch (error) {
      logger.error('Failed to get device', { error, deviceId });
      return null;
    }
  }

  /**
   * Get formatted last connected time for display
   */
  getFormattedLastConnected(lastConnected: string): string {
    try {
      const date = new Date(lastConnected);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
      } else {
        return 'Just now';
      }
    } catch (error) {
      logger.error('Failed to format last connected time', {
        error,
        lastConnected,
      });
      return 'Unknown';
    }
  }
}

export const deviceHistoryService = new DeviceHistoryService();
