module.exports = {
  readFile: jest.fn(() => Promise.resolve('')),
  writeFile: jest.fn(() => Promise.resolve()),
  exists: jest.fn(() => Promise.resolve(false)),
  unlink: jest.fn(() => Promise.resolve()),
  mkdir: jest.fn(() => Promise.resolve()),
  readDir: jest.fn(() => Promise.resolve([])),
  DocumentDirectoryPath: '/mock/documents',
  LibraryDirectoryPath: '/mock/library',
  CachesDirectoryPath: '/mock/caches',
  MainBundlePath: '/mock/bundle',
};
