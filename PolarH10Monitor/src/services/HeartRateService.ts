import { Device } from 'react-native-ble-plx';

// Heart Rate Service UUIDs
export const HEART_RATE_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
export const HEART_RATE_MEASUREMENT = '00002a37-0000-1000-8000-00805f9b34fb';

// Heart rate data interfaces
export interface HeartRateReading {
  timestamp: Date;
  heartRate: number;
  rrIntervals: number[];
  deviceId: string;
  sensorContact?: boolean;
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

  // Start heart rate monitoring on a connected device
  async startMonitoring(device: Device, callback: HeartRateCallback): Promise<void> {
    if (!device) {
      throw new Error('No device provided');
    }

    try {
      // Discover services first
      await device.discoverAllServicesAndCharacteristics();
      
      this.onHeartRateCallback = callback;

      // Subscribe to heart rate measurements
      this.heartRateSubscription = device.monitorCharacteristicForService(
        HEART_RATE_SERVICE,
        HEART_RATE_MEASUREMENT,
        (error, characteristic) => {
          if (error) {
            console.error('Heart rate monitoring error:', error);
            return;
          }

          if (characteristic?.value) {
            const reading = this.parseHeartRateData(characteristic.value, characteristic.deviceID);
            if (reading && this.onHeartRateCallback) {
              this.onHeartRateCallback(reading);
            }
          }
        }
      );

      console.log('Started heart rate monitoring');
    } catch (error) {
      console.error('Failed to start heart rate monitoring:', error);
      throw error;
    }
  }

  // Stop heart rate monitoring
  stopMonitoring(): void {
    if (this.heartRateSubscription) {
      this.heartRateSubscription.remove();
      this.heartRateSubscription = null;
    }
    this.onHeartRateCallback = null;
    console.log('Stopped heart rate monitoring');
  }

  // Check if currently monitoring
  isMonitoring(): boolean {
    return this.heartRateSubscription !== null;
  }

  // Parse heart rate data from BLE characteristic
  private parseHeartRateData(base64Data: string, deviceId: string): HeartRateReading | null {
    try {
      // Decode base64 to binary
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const dataView = new DataView(bytes.buffer);
      
      // Parse flags byte
      const flags = dataView.getUint8(0);
      const heartRateFormat = flags & 0x01; // 0 = 8-bit, 1 = 16-bit
      const sensorContactSupported = (flags & 0x04) !== 0;
      const sensorContactDetected = (flags & 0x02) !== 0;
      
      let heartRate: number;
      let offset = 1;
      
      if (heartRateFormat === 0) {
        // 8-bit heart rate value
        heartRate = dataView.getUint8(1);
        offset = 2;
      } else {
        // 16-bit heart rate value
        heartRate = dataView.getUint16(1, true); // little-endian
        offset = 3;
      }
      
      // Parse RR intervals if present
      const rrIntervals: number[] = [];
      while (offset < dataView.byteLength - 1) {
        const rrInterval = dataView.getUint16(offset, true); // little-endian
        // Convert from 1/1024 seconds to milliseconds
        const rrMs = (rrInterval / 1024) * 1000;
        rrIntervals.push(rrMs);
        offset += 2;
      }
      
      return {
        timestamp: new Date(),
        heartRate,
        rrIntervals,
        deviceId,
        sensorContact: sensorContactSupported ? sensorContactDetected : undefined
      };
    } catch (error) {
      console.error('Error parsing heart rate data:', error);
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
      return { average: 0, min: 0, max: 0, count: 0 };
    }

    const heartRates = readings.map(r => r.heartRate);
    const average = Math.round(heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length);
    const min = Math.min(...heartRates);
    const max = Math.max(...heartRates);

    // Calculate HRV (RMSSD) if RR intervals are available
    let hrVariability: number | undefined;
    const allRRIntervals = readings.flatMap(r => r.rrIntervals);
    if (allRRIntervals.length > 1) {
      const rrDifferences = [];
      for (let i = 1; i < allRRIntervals.length; i++) {
        rrDifferences.push(Math.pow(allRRIntervals[i] - allRRIntervals[i - 1], 2));
      }
      const meanSquaredDiff = rrDifferences.reduce((sum, diff) => sum + diff, 0) / rrDifferences.length;
      hrVariability = Math.round(Math.sqrt(meanSquaredDiff));
    }

    return {
      average,
      min,
      max,
      count: readings.length,
      hrVariability
    };
  }
}

export const heartRateService = new HeartRateService();
