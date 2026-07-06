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

// Polar PMD (Measurement Data) service — ECG/ACC streaming, hidden from GATT
// discovery until the strap detects skin contact (wet electrodes, worn snug).
export const PMD_SERVICE = 'fb005c80-02e7-f387-1cad-8acd2d8df0c8';

export const PMD_CHARACTERISTICS = {
  CONTROL: 'fb005c81-02e7-f387-1cad-8acd2d8df0c8', // write + indicate
  DATA: 'fb005c82-02e7-f387-1cad-8acd2d8df0c8', // notify
} as const;

// PMD control opcodes / measurement type
export const PMD_OPCODE = {
  REQUEST_MEASUREMENT_START: 0x02,
  REQUEST_MEASUREMENT_STOP: 0x03,
} as const;

export const PMD_MEASUREMENT_TYPE = {
  ECG: 0x00,
  ACC: 0x02,
} as const;

// PMD control response error codes (byte 3 of the [0xF0, opCode, type, error] ack)
export const PMD_ERROR_CODE = {
  SUCCESS: 0,
  NOT_SUPPORTED: 3,
  INVALID_PARAMETER: 5,
  ALREADY_IN_STATE: 6,
  INVALID_SAMPLE_RATE: 8,
  INVALID_RANGE: 9,
  SERVICE_NOT_RUNNING: 12,
} as const;

export const PMD_ACC_SETTINGS = {
  SAMPLE_RATE_HZ: 50, // valid set: 25 / 50 / 100 / 200 only
  RESOLUTION_BITS: 16,
  RANGE_G: 8,
  // RMS deviation from the resting 1000 mG gravity baseline, within a ±500ms
  // window around an HR reading, above which that reading is treated as
  // motion-corrupted and excluded from the session average.
  // Placeholder — an engineering estimate, not a cited figure. Must be tuned
  // against real on-device logs before being trusted (see verification plan).
  MOTION_ARTIFACT_THRESHOLD_MG: 300,
  // Half-width of the alignment window (ms) used to match ACC samples to a
  // given HR reading's wall-clock timestamp.
  QUALITY_WINDOW_HALF_WIDTH_MS: 500,
} as const;

// Timing/ack settings for the PMD control handshake
export const PMD_CONTROL_SETTINGS = {
  ACK_TIMEOUT_MS: 4000, // max wait for a control-characteristic ack
} as const;
