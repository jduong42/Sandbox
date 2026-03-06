// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock EncryptedStorage (native module not available in Jest)
jest.mock('react-native-encrypted-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
  },
}));

// Mock react-native-ble-plx (BleManager uses NativeEventEmitter which isn't available in Jest)
jest.mock('react-native-ble-plx', () => ({
  BleManager: jest.fn().mockImplementation(() => ({
    startDeviceScan: jest.fn(),
    stopDeviceScan: jest.fn(),
    connectToDevice: jest.fn(),
    cancelDeviceConnection: jest.fn(),
    isDeviceConnected: jest.fn(() => Promise.resolve(false)),
    state: jest.fn(() => Promise.resolve('PoweredOn')),
    onStateChange: jest.fn(),
    destroy: jest.fn(),
  })),
  State: { PoweredOn: 'PoweredOn', PoweredOff: 'PoweredOff' },
  Device: jest.fn(),
  BleError: jest.fn(),
  BleErrorCode: {},
}));

// Mock react-native-permissions (native module not available in Jest)
jest.mock('react-native-permissions', () => ({
  PERMISSIONS: {},
  RESULTS: { GRANTED: 'granted', DENIED: 'denied', BLOCKED: 'blocked' },
  request: jest.fn(() => Promise.resolve('granted')),
  check: jest.fn(() => Promise.resolve('granted')),
}));

// Mock react-native-gesture-handler (TurboModule not available in Jest)
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: any) => children,
  Swipeable: ({ children }: any) => children,
  DrawerLayout: ({ children }: any) => children,
  State: {},
  PanGestureHandler: ({ children }: any) => children,
  BaseButton: ({ children }: any) => children,
  RectButton: ({ children }: any) => children,
  BorderlessButton: ({ children }: any) => children,
  FlatList: ({ children }: any) => children,
  ScrollView: ({ children }: any) => children,
  Slider: ({ children }: any) => children,
  Switch: ({ children }: any) => children,
  TextInput: ({ children }: any) => children,
  TouchableHighlight: ({ children }: any) => children,
  TouchableNativeFeedback: ({ children }: any) => children,
  TouchableOpacity: ({ children }: any) => children,
  TouchableWithoutFeedback: ({ children }: any) => children,
  createNativeWrapper: jest.fn(),
  Directions: {},
}));

// Mock react-native modules
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  __esModule: true,
  default: { alert: jest.fn() },
  alert: jest.fn(),
}));

// Mock logger
jest.mock('./src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
