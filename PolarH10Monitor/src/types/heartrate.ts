export interface HeartRateReading {
  id: string;
  timestamp: Date;
  heartRate: number;
  rrIntervals: number[];
  deviceId: string;
  sensorContact?: boolean;
  quality?: 'good' | 'fair' | 'poor';
}

export interface HeartRateStatistics {
  average: number;
  min: number;
  max: number;
  count: number;
  hrVariability?: number;
  trend?: 'increasing' | 'decreasing' | 'stable';
}

export interface HeartRateMonitoringConfig {
  maxReadings: number;
  minValidBPM: number;
  maxValidBPM: number;
  enableRRIntervals: boolean;
}

export interface HeartRateZone {
  name: string;
  minBPM: number;
  maxBPM: number;
  color: string;
}
