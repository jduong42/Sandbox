// BLE Service UUIDs
export const BLE_SERVICES = {
  HEART_RATE: '0000180d-0000-1000-8000-00805f9b34fb',
  DEVICE_INFORMATION: '0000180a-0000-1000-8000-00805f9b34fb',
} as const;

// BLE Characteristics
export const BLE_CHARACTERISTICS = {
  HEART_RATE_MEASUREMENT: '00002a37-0000-1000-8000-00805f9b34fb',
  HEART_RATE_CONTROL_POINT: '00002a39-0000-1000-8000-00805f9b34fb',
  DEVICE_NAME: '00002a00-0000-1000-8000-00805f9b34fb',
  MANUFACTURER_NAME: '00002a29-0000-1000-8000-00805f9b34fb',
} as const;

// Scan settings
export const SCAN_SETTINGS = {
  DURATION_MS: 10000, // 10 seconds scan duration
  INITIALIZATION_DELAY_MS: 500, // Delay before starting scan
  ALLOW_DUPLICATES: false,
} as const;

// Connection settings
export const CONNECTION_SETTINGS = {
  STATUS_UPDATE_INTERVAL_MS: 3000, // Check connection status every 3 seconds
  RECONNECT_ATTEMPTS: 3,
  RECONNECT_DELAY_MS: 1000,
  MANAGER_READY_TIMEOUT_MS: 3000, // 3 seconds max wait for manager
  MANAGER_READY_CHECK_INTERVAL_MS: 100, // Check every 100ms
} as const;

// Heart rate settings
export const HEART_RATE_SETTINGS = {
  MAX_STORED_READINGS: 20,
  MIN_VALID_BPM: 30,
  MAX_VALID_BPM: 250,
  RR_INTERVAL_CONVERSION_FACTOR: 1024, // Convert 1/1024 seconds to milliseconds
  MILLISECONDS_PER_SECOND: 1000,
  SERVICE_DISCOVERY_TIMEOUT_MS: 5000, // 5 seconds to discover services
} as const;

// Heart Rate Data Validation
export const HEART_RATE_VALIDATION = {
  MAX_RR_INTERVALS_PER_READING: 10, // Reasonable limit for RR intervals
  MIN_RR_INTERVAL_MS: 200, // Minimum reasonable RR interval (300 BPM)
  MAX_RR_INTERVAL_MS: 2000, // Maximum reasonable RR interval (30 BPM)
} as const;
