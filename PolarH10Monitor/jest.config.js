module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@react-native-async-storage|react-native-encrypted-storage|react-native-ble-plx|react-native-gesture-handler|react-native-reanimated|react-native-linear-gradient|react-native-permissions|react-native-fs)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^react-native-ble-plx$': '<rootDir>/__mocks__/react-native-ble-plx.js',
    '^llama\\.rn$': '<rootDir>/__mocks__/llama.rn.js',
    '^react-native-fs$': '<rootDir>/__mocks__/react-native-fs.js',
    '^@op-engineering/op-sqlite$':
      '<rootDir>/__mocks__/@op-engineering/op-sqlite.js',
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/android/',
    '<rootDir>/ios/',
  ],
};
