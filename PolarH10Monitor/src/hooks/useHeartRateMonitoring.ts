import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { bleService, heartRateService, HeartRateReading } from '../services';
import { logger } from '../utils/logger';

interface HeartRateMonitoringState {
  isMonitoring: boolean;
  currentHeartRate: number | null;
  readings: HeartRateReading[];
  isConnected: boolean;
  connectedDeviceName: string;
}

interface HeartRateMonitoringActions {
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => void;
  clearData: () => void;
}

export const useHeartRateMonitoring = (): HeartRateMonitoringState &
  HeartRateMonitoringActions => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentHeartRate, setCurrentHeartRate] = useState<number | null>(null);
  const [readings, setReadings] = useState<HeartRateReading[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDeviceName, setConnectedDeviceName] = useState<string>('');

  // Check connection status periodically
  useEffect(() => {
    const checkConnection = async () => {
      const status = await bleService.getConnectionStatus();
      setIsConnected(status.isConnected);
      setConnectedDeviceName(status.deviceName || '');
    };

    checkConnection();

    // Only start interval if we're connected or monitoring
    const interval = setInterval(() => {
      if (isConnected || isMonitoring) {
        checkConnection();
      }
    }, 5000); // Check every 5 seconds when connected/monitoring

    return () => clearInterval(interval);
  }, [isConnected, isMonitoring]);

  const startMonitoring = useCallback(async () => {
    if (!isConnected) {
      Alert.alert(
        'Not Connected',
        'Please connect to a Polar H10 device first in Settings.',
      );
      return;
    }

    const connectedDevice = bleService.getConnectedDevice();
    if (!connectedDevice) {
      Alert.alert('Error', 'No connected device found.');
      return;
    }

    try {
      setIsMonitoring(true);

      await heartRateService.startMonitoring(
        connectedDevice,
        (reading: HeartRateReading) => {
          logger.info('Heart rate reading received', {
            heartRate: reading.heartRate,
            rrIntervals: reading.rrIntervals.length,
            sensorContact: reading.sensorContact,
          });

          setCurrentHeartRate(reading.heartRate);
          setReadings(prev => {
            const newReadings = [...prev, reading];
            // Keep only last 20 readings to prevent memory issues
            return newReadings.slice(-20);
          });
        },
      );

      Alert.alert('Success', 'Started heart rate monitoring!');
    } catch (error) {
      logger.error('Failed to start heart rate monitoring', { error });
      Alert.alert(
        'Error',
        'Failed to start heart rate monitoring. Make sure the device supports heart rate service.',
      );
      setIsMonitoring(false);
    }
  }, [isConnected]);

  const stopMonitoring = useCallback(() => {
    heartRateService.stopMonitoring();
    setIsMonitoring(false);
    Alert.alert('Stopped', 'Heart rate monitoring stopped.');
  }, []);

  const clearData = useCallback(() => {
    setReadings([]);
    setCurrentHeartRate(null);
  }, []);

  // Clean up monitoring when component unmounts
  useEffect(() => {
    return () => {
      if (isMonitoring) {
        heartRateService.stopMonitoring();
      }
    };
  }, [isMonitoring]);

  return {
    // State
    isMonitoring,
    currentHeartRate,
    readings,
    isConnected,
    connectedDeviceName,
    // Actions
    startMonitoring,
    stopMonitoring,
    clearData,
  };
};
