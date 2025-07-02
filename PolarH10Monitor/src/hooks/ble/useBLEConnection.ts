import { useState, useEffect, useCallback, useRef } from 'react';
import { bleService } from '../../services';
import { BLEConnectionStatus } from '../../types/ble';
import { CONNECTION_SETTINGS } from '../../constants/ble';
import { logger } from '../../utils/logger';

export const useBLEConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<BLEConnectionStatus>(
    {
      isConnected: false,
      bluetoothEnabled: false,
    },
  );

  const lastDisconnectedCheckRef = useRef<number>(0);

  const updateConnectionStatus = useCallback(async () => {
    try {
      const status = await bleService.getConnectionStatus();

      // Map the service response to our interface type
      const mappedStatus: BLEConnectionStatus = {
        isConnected: status.isConnected,
        deviceName: status.deviceName,
        bluetoothEnabled: status.bluetoothEnabled,
      };

      setConnectionStatus(mappedStatus);

      // Only log when there's something meaningful to report
      if (mappedStatus.isConnected) {
        logger.debug('Connection status retrieved', {
          isConnected: mappedStatus.isConnected,
          deviceName: mappedStatus.deviceName,
          bluetoothEnabled: mappedStatus.bluetoothEnabled,
        });
      }
    } catch (error) {
      logger.error('Failed to update connection status', error);
    }
  }, []);

  useEffect(() => {
    updateConnectionStatus();

    const interval = setInterval(() => {
      const now = Date.now();

      if (connectionStatus.isConnected) {
        // If connected, check frequently to detect disconnections
        updateConnectionStatus();
      } else {
        // If disconnected, check less frequently (every 10 seconds) to save resources
        if (now - lastDisconnectedCheckRef.current > 10000) {
          updateConnectionStatus();
          lastDisconnectedCheckRef.current = now;
        }
      }
    }, CONNECTION_SETTINGS.STATUS_UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [updateConnectionStatus, connectionStatus.isConnected]);

  const connectToDevice = useCallback(
    async (deviceId: string) => {
      try {
        const device = await bleService.connectToDevice(deviceId);
        await updateConnectionStatus();
        return device;
      } catch (error) {
        logger.error('Failed to connect to device', { deviceId, error });
        throw error;
      }
    },
    [updateConnectionStatus],
  );

  const disconnectDevice = useCallback(async () => {
    try {
      const connectedDevice = bleService.getConnectedDevice();
      if (connectedDevice) {
        await bleService.disconnectDevice(connectedDevice.id);
        await updateConnectionStatus();
      }
    } catch (error) {
      logger.error('Failed to disconnect device', error);
      throw error;
    }
  }, [updateConnectionStatus]);

  return {
    connectionStatus,
    connectToDevice,
    disconnectDevice,
    refreshStatus: updateConnectionStatus,
  };
};
