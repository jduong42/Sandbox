/**
 * Jest mock for @op-engineering/op-sqlite
 *
 * Provides an in-memory SQLite-like interface so unit tests that import
 * DatabaseService / SessionRepository don't require the native module.
 */

const rows = {};
let nextId = 1;

function makeDb(name) {
  const store = {};

  return {
    execute: jest.fn(async (sql, params) => {
      // Minimal no-op stub — individual tests can override via .mockResolvedValue
      return { rows: [] };
    }),
    transaction: jest.fn(async fn => {
      const tx = {
        execute: jest.fn(async () => ({ rows: [] })),
      };
      await fn(tx);
    }),
    close: jest.fn(),
    attach: jest.fn(),
    detach: jest.fn(),
  };
}

module.exports = {
  OPSQLite: {
    open: jest.fn(opts => makeDb(opts.name)),
    isSQLCipher: jest.fn(() => true),
  },
  IOS_LIBRARY_PATH: '/tmp/ios',
  ANDROID_DATABASE_PATH: '/tmp/android',
};
