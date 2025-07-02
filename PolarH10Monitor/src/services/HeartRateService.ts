import { Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { logger } from '../utils/logger';
import { HEART_RATE_SETTINGS, HEART_RATE_VALIDATION } from '../constants/ble';

// Heart Rate Service UUIDs
export const HEART_RATE_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
export const HEART_RATE_MEASUREMENT = '00002a37-0000-1000-8000-00805f9b34fb';

// Heart rate data interfaces
export interface HeartRateReading {
  timestamp: Date;
  heartRate: number;
  rrIntervals: number[];
  deviceId: string;
  sensorContact?: boolean | undefined;
}

export type HeartRateCallback = (reading: HeartRateReading) => void;

export interface HeartRateServiceInterface {
  startMonitoring(device: Device, callback: HeartRateCallback): Promise<void>;
  stopMonitoring(): void;
  isMonitoring(): boolean;
}

class HeartRateService implements HeartRateServiceInterface {
  private heartRateSubscription: any = null;
  private onHeartRateCallback: HeartRateCallback | null = null;
  private monitoringDeviceId: string | null = null;

  constructor() {
    logger.info('HeartRateService initialized', {
      timestamp: new Date().toISOString(),
      version: '2.0.0-refactored',
    });
  }

  // Start heart rate monitoring on a connected device
  async startMonitoring(
    device: Device,
    callback: HeartRateCallback,
  ): Promise<void> {
    if (!device) {
      const error = new Error('No device provided for heart rate monitoring');
      logger.error('Heart rate monitoring failed - no device', { device });
      throw error;
    }

    if (!callback) {
      const error = new Error('No callback provided for heart rate monitoring');
      logger.error('Heart rate monitoring failed - no callback');
      throw error;
    }

    logger.info('Starting heart rate monitoring', {
      deviceId: device.id,
      deviceName: device.name,
    });

    try {
      // Discover services first with timeout
      logger.debug('Discovering device services and characteristics');
      await device.discoverAllServicesAndCharacteristics();

      // Store the callback and device info
      this.onHeartRateCallback = callback;
      this.monitoringDeviceId = device.id;

      // Subscribe to heart rate measurements
      this.heartRateSubscription = device.monitorCharacteristicForService(
        HEART_RATE_SERVICE,
        HEART_RATE_MEASUREMENT,
        (error, characteristic) => {
          if (error) {
            logger.error('Heart rate monitoring error', {
              deviceId: device.id,
              error: error.message,
            });
            return;
          }

          if (characteristic?.value) {
            try {
              const reading = this.parseHeartRateData(
                characteristic.value,
                characteristic.deviceID,
              );
              if (reading && this.onHeartRateCallback) {
                // Validate the reading before passing to callback
                if (this.validateHeartRateReading(reading)) {
                  this.onHeartRateCallback(reading);
                  logger.debug('Heart rate reading processed', {
                    heartRate: reading.heartRate,
                    rrIntervals: reading.rrIntervals.length,
                    deviceId: reading.deviceId,
                  });
                } else {
                  logger.warn('Invalid heart rate reading discarded', reading);
                }
              }
            } catch (callbackError) {
              logger.error('Error in heart rate callback', {
                deviceId: device.id,
                error: callbackError,
              });
            }
          }
        },
      );

      logger.info('Heart rate monitoring started successfully', {
        deviceId: device.id,
        service: HEART_RATE_SERVICE,
        characteristic: HEART_RATE_MEASUREMENT,
      });
    } catch (error) {
      logger.error('Failed to start heart rate monitoring', {
        deviceId: device.id,
        error,
      });
      // Clean up on failure
      this.stopMonitoring();
      throw error;
    }
  }

  // Stop heart rate monitoring
  stopMonitoring(): void {
    if (this.heartRateSubscription) {
      try {
        this.heartRateSubscription.remove();
      } catch (error) {
        logger.warn('Error removing heart rate subscription', { error });
      }
      this.heartRateSubscription = null;
    }

    this.onHeartRateCallback = null;
    this.monitoringDeviceId = null;

    logger.info('Heart rate monitoring stopped');
  }

  // Check if currently monitoring
  isMonitoring(): boolean {
    return this.heartRateSubscription !== null;
  }

  // Validate heart rate reading before processing
  private validateHeartRateReading(reading: HeartRateReading): boolean {
    if (!reading) {
      logger.warn('Heart rate reading is null or undefined');
      return false;
    }

    // Validate heart rate value
    if (
      typeof reading.heartRate !== 'number' ||
      reading.heartRate < HEART_RATE_SETTINGS.MIN_VALID_BPM ||
      reading.heartRate > HEART_RATE_SETTINGS.MAX_VALID_BPM
    ) {
      logger.warn('Invalid heart rate value', {
        heartRate: reading.heartRate,
        minValid: HEART_RATE_SETTINGS.MIN_VALID_BPM,
        maxValid: HEART_RATE_SETTINGS.MAX_VALID_BPM,
      });
      return false;
    }

    // Validate RR intervals
    if (!Array.isArray(reading.rrIntervals)) {
      logger.warn('RR intervals is not an array', {
        rrIntervals: reading.rrIntervals,
      });
      return false;
    }

    // Check for reasonable number of RR intervals
    if (
      reading.rrIntervals.length >
      HEART_RATE_VALIDATION.MAX_RR_INTERVALS_PER_READING
    ) {
      logger.warn('Too many RR intervals in reading', {
        count: reading.rrIntervals.length,
        maxAllowed: HEART_RATE_VALIDATION.MAX_RR_INTERVALS_PER_READING,
      });
      return false;
    }

    // Validate individual RR interval values
    for (const rrInterval of reading.rrIntervals) {
      if (
        typeof rrInterval !== 'number' ||
        rrInterval < HEART_RATE_VALIDATION.MIN_RR_INTERVAL_MS ||
        rrInterval > HEART_RATE_VALIDATION.MAX_RR_INTERVAL_MS
      ) {
        logger.warn('Invalid RR interval value', {
          rrInterval,
          minValid: HEART_RATE_VALIDATION.MIN_RR_INTERVAL_MS,
          maxValid: HEART_RATE_VALIDATION.MAX_RR_INTERVAL_MS,
        });
        return false;
      }
    }

    // Validate device ID
    if (!reading.deviceId || typeof reading.deviceId !== 'string') {
      logger.warn('Invalid device ID', { deviceId: reading.deviceId });
      return false;
    }

    // Validate timestamp
    if (
      !(reading.timestamp instanceof Date) ||
      isNaN(reading.timestamp.getTime())
    ) {
      logger.warn('Invalid timestamp', { timestamp: reading.timestamp });
      return false;
    }

    return true;
  }

  // Parse heart rate data from BLE characteristic
  private parseHeartRateData(
    base64Data: string,
    deviceId: string,
  ): HeartRateReading | null {
    try {
      logger.debug('Parsing heart rate data', {
        deviceId,
        dataLength: base64Data.length,
      });

      // Decode base64 to binary using Buffer (React Native compatible)
      const buffer = Buffer.from(base64Data, 'base64');
      const bytes = new Uint8Array(buffer);
      const dataView = new DataView(bytes.buffer);

      if (bytes.length === 0) {
        logger.warn('Empty heart rate data received', { deviceId });
        return null;
      }

      // Parse flags byte
      const flags = dataView.getUint8(0);
      const heartRateFormat = flags & 0x01; // 0 = 8-bit, 1 = 16-bit
      const sensorContactSupported = (flags & 0x04) !== 0;
      const sensorContactDetected = (flags & 0x02) !== 0;

      let heartRate: number;
      let offset = 1;

      if (heartRateFormat === 0) {
        // 8-bit heart rate value
        if (bytes.length < 2) {
          logger.warn('Insufficient data for 8-bit heart rate', {
            deviceId,
            length: bytes.length,
          });
          return null;
        }
        heartRate = dataView.getUint8(1);
        offset = 2;
      } else {
        // 16-bit heart rate value
        if (bytes.length < 3) {
          logger.warn('Insufficient data for 16-bit heart rate', {
            deviceId,
            length: bytes.length,
          });
          return null;
        }
        heartRate = dataView.getUint16(1, true); // little-endian
        offset = 3;
      }

      // Parse RR intervals if present
      const rrIntervals: number[] = [];
      while (offset < dataView.byteLength - 1) {
        if (offset + 1 >= dataView.byteLength) {
          break; // Not enough data for complete RR interval
        }

        const rrInterval = dataView.getUint16(offset, true); // little-endian
        // Convert from 1/1024 seconds to milliseconds
        const rrMs =
          (rrInterval / HEART_RATE_SETTINGS.RR_INTERVAL_CONVERSION_FACTOR) *
          HEART_RATE_SETTINGS.MILLISECONDS_PER_SECOND;
        rrIntervals.push(Math.round(rrMs * 100) / 100); // Round to 2 decimal places
        offset += 2;
      }

      const reading: HeartRateReading = {
        timestamp: new Date(),
        heartRate,
        rrIntervals,
        deviceId,
        sensorContact: sensorContactSupported
          ? sensorContactDetected
          : undefined,
      };

      logger.debug('Heart rate data parsed successfully', {
        deviceId,
        heartRate,
        rrIntervalsCount: rrIntervals.length,
        sensorContact: reading.sensorContact,
      });

      return reading;
    } catch (error) {
      logger.error('Error parsing heart rate data', {
        deviceId,
        error: error instanceof Error ? error.message : String(error),
        dataLength: base64Data.length,
      });
      return null;
    }
  }

  // Calculate heart rate statistics from readings
  static calculateStatistics(readings: HeartRateReading[]): {
    average: number;
    min: number;
    max: number;
    count: number;
    hrVariability?: number;
  } {
    if (readings.length === 0) {
      logger.warn('No readings provided for statistics calculation');
      return { average: 0, min: 0, max: 0, count: 0 };
    }

    try {
      const heartRates = readings.map(r => r.heartRate);
      const average = Math.round(
        heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length,
      );
      const min = Math.min(...heartRates);
      const max = Math.max(...heartRates);

      // Calculate HRV (RMSSD) if RR intervals are available
      const allRRIntervals = readings.flatMap(r => r.rrIntervals);

      if (allRRIntervals.length > 1) {
        const rrDifferences: number[] = [];

        for (let i = 1; i < allRRIntervals.length; i++) {
          const current = allRRIntervals[i];
          const previous = allRRIntervals[i - 1];

          // Type guard to ensure values are defined
          if (typeof current === 'number' && typeof previous === 'number') {
            rrDifferences.push(Math.pow(current - previous, 2));
          }
        }

        if (rrDifferences.length > 0) {
          const meanSquaredDiff =
            rrDifferences.reduce((sum, diff) => sum + diff, 0) /
            rrDifferences.length;
          const hrVariability = Math.round(Math.sqrt(meanSquaredDiff));

          logger.debug('HRV calculated', {
            rrIntervalsCount: allRRIntervals.length,
            hrVariability,
            readingsCount: readings.length,
          });

          return {
            average,
            min,
            max,
            count: readings.length,
            hrVariability,
          };
        }
      }

      logger.debug('Statistics calculated without HRV', {
        average,
        min,
        max,
        count: readings.length,
        rrIntervalsTotal: allRRIntervals.length,
      });

      return {
        average,
        min,
        max,
        count: readings.length,
        // Explicitly omit hrVariability rather than setting to undefined
      };
    } catch (error) {
      logger.error('Error calculating heart rate statistics', {
        error: error instanceof Error ? error.message : String(error),
        readingsCount: readings.length,
      });
      return { average: 0, min: 0, max: 0, count: 0 };
    }
  }
}

export const heartRateService = new HeartRateService();
