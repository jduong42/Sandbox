import { useState, useEffect, useCallback } from 'react';
import {
  deviceHistoryService,
  StoredDevice,
} from '../services/DeviceHistoryService';
import { logger } from '../utils/logger';

interface DeviceHistoryState {
  devices: StoredDevice[];
  loading: boolean;
  error: string | null;
}

interface DeviceHistoryActions {
  refreshDevices: () => Promise<void>;
  removeDevice: (deviceId: string) => Promise<void>;
  clearAllDevices: () => Promise<void>;
  addDevice: (device: Omit<StoredDevice, 'lastConnected'>) => Promise<void>;
}

export const useDeviceHistory = (): DeviceHistoryState &
  DeviceHistoryActions => {
  const [devices, setDevices] = useState<StoredDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshDevices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      logger.info('useDeviceHistory: Refreshing devices...');
      const storedDevices = await deviceHistoryService.getDevices();
      setDevices(storedDevices);
      logger.info('useDeviceHistory: Devices refreshed', { 
        deviceCount: storedDevices.length,
        devices: storedDevices.map(d => ({ id: d.id.substring(0, 8), name: d.name || 'NO_NAME' })),
      });
      logger.debug('Device history refreshed', {
        deviceCount: storedDevices.length,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load device history';
      setError(errorMessage);
      logger.error('useDeviceHistory: Failed to refresh', { error: err });
      logger.error('Failed to refresh device history', { error: err });
    } finally {
      setLoading(false);
    }
  }, []);

  const removeDevice = useCallback(
    async (deviceId: string) => {
      try {
        setError(null);
        await deviceHistoryService.removeDevice(deviceId);
        // Remove from local state immediately for better UX
        setDevices(prev => prev.filter(device => device.id !== deviceId));
        logger.info('Device removed from history', { deviceId });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to remove device';
        setError(errorMessage);
        logger.error('Failed to remove device from history', {
          error: err,
          deviceId,
        });
        // Refresh devices to ensure state is consistent
        refreshDevices();
      }
    },
    [refreshDevices],
  );

  const clearAllDevices = useCallback(async () => {
    try {
      setError(null);
      await deviceHistoryService.clearHistory();
      setDevices([]);
      logger.info('All devices cleared from history');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to clear device history';
      setError(errorMessage);
      logger.error('Failed to clear device history', { error: err });
      // Refresh devices to ensure state is consistent
      refreshDevices();
    }
  }, [refreshDevices]);

  const addDevice = useCallback(
    async (device: Omit<StoredDevice, 'lastConnected'>) => {
      try {
        setError(null);
        await deviceHistoryService.addDevice(device);
        // Refresh devices to get updated list with proper sorting
        await refreshDevices();
        logger.info('Device added to history', {
          deviceId: device.id,
          deviceName: device.name,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to add device to history';
        setError(errorMessage);
        logger.error('Failed to add device to history', {
          error: err,
          deviceId: device.id,
        });
      }
    },
    [refreshDevices],
  );

  // Load devices on mount
  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  return {
    // State
    devices,
    loading,
    error,
    // Actions
    refreshDevices,
    removeDevice,
    clearAllDevices,
    addDevice,
  };
};
