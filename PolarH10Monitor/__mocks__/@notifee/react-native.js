const notifee = {
  requestPermission: jest.fn(() => Promise.resolve({ authorizationStatus: 1 })),
  createChannel: jest.fn(() => Promise.resolve('default')),
  displayNotification: jest.fn(() => Promise.resolve('notification-id')),
};

const AuthorizationStatus = {
  NOT_DETERMINED: -1,
  DENIED: 0,
  AUTHORIZED: 1,
  PROVISIONAL: 2,
};

const AndroidImportance = {
  NONE: 0,
  MIN: 1,
  LOW: 2,
  DEFAULT: 3,
  HIGH: 4,
};

module.exports = { __esModule: true, default: notifee, AuthorizationStatus, AndroidImportance };
