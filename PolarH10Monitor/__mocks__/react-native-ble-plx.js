const BleManager = jest.fn().mockImplementation(() => ({
  startDeviceScan: jest.fn(),
  stopDeviceScan: jest.fn(),
  connectToDevice: jest.fn(() => Promise.resolve({})),
  cancelDeviceConnection: jest.fn(() => Promise.resolve()),
  isDeviceConnected: jest.fn(() => Promise.resolve(false)),
  onStateChange: jest.fn(() => ({ remove: jest.fn() })),
  state: jest.fn(() => Promise.resolve('PoweredOn')),
  readCharacteristicForDevice: jest.fn(),
  monitorCharacteristicForDevice: jest.fn(() => ({ remove: jest.fn() })),
  destroy: jest.fn(),
}));

const State = {
  PoweredOn: 'PoweredOn',
  PoweredOff: 'PoweredOff',
  Unauthorized: 'Unauthorized',
  Unsupported: 'Unsupported',
  Resetting: 'Resetting',
  Unknown: 'Unknown',
};

module.exports = { BleManager, State };
