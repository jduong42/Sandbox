// Global type definitions for BLE operations
export interface BLEDevice {
  id: string;
  name: string;
  rssi?: number;
  isConnectable?: boolean;
  manufacturerData?: string;
}

export interface BLEConnectionStatus {
  isConnected: boolean;
  deviceName?: string | undefined;
  deviceId?: string | undefined;
  bluetoothEnabled: boolean;
  connectionStrength?: number | undefined;
}

export interface BLEPermissions {
  location: boolean;
  bluetooth: boolean;
  bluetoothScan: boolean;
  bluetoothConnect: boolean;
}

export interface BLEScanOptions {
  duration: number;
  allowDuplicates: boolean;
  services?: string[];
}

export interface BLEError {
  code: string;
  message: string;
  nativeError?: unknown;
}
